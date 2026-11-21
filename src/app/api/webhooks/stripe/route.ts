import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { redis, redisKeys } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    if (webhookSecret && signature && !webhookSecret.includes("whsec_placeholder")) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In dev/mock mode if secret is placeholder, parse JSON directly
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  // Idempotency check via Redis
  const eventId = event.id;
  if (eventId) {
    const idempotencyKey = redisKeys.idempotency(eventId);
    const alreadyProcessed = await redis.get(idempotencyKey);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, note: "Already processed event" });
    }
    await redis.set(idempotencyKey, "1", { ex: 60 * 60 * 24 }); // 24 hour TTL
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await completeOrderPayment(orderId, session.payment_intent as string, session);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await completeOrderPayment(orderId, paymentIntent.id, paymentIntent);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await failOrderPayment(orderId, paymentIntent.id, paymentIntent.last_payment_error?.message);
        }
        break;
      }

      default:
        // Other events ignored
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

/**
 * Phase 2: Atomic state transition upon payment success
 * 1. Decrement actual database stock (`stock = stock - quantity`)
 * 2. Release temporary Redis lock
 * 3. Update Order status PENDING -> PAID
 * 4. Record Payment record
 */
async function completeOrderPayment(orderId: string, paymentIntentId: string, rawDetails: any) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      console.warn(`Order ${orderId} not found during payment completion`);
      return;
    }

    // Guard: already processed
    if (order.status === "PAID" || order.status === "PROCESSING" || order.status === "SHIPPED") {
      return;
    }

    // 1. Decrement PostgreSQL variant inventory
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // 2. Clear Redis inventory hold
        const holdKey = redisKeys.inventoryLock(item.variantId);
        const currentHold = (await redis.get<number>(holdKey)) || 0;
        const remainingHold = Math.max(0, Number(currentHold) - item.quantity);
        if (remainingHold <= 0) {
          await redis.del(holdKey);
        } else {
          await redis.set(holdKey, remainingHold, { ex: 60 * 15 });
        }
      }
    }

    // 3. Update order state machine to PAID
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
      },
    });

    // 4. Record/update payment record
    const existingPayment = await tx.payment.findFirst({
      where: { orderId },
    });

    if (existingPayment) {
      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "SUCCEEDED",
          stripePaymentIntentId: paymentIntentId,
          rawDetails: rawDetails as any,
        },
      });
    } else {
      await tx.payment.create({
        data: {
          orderId,
          stripePaymentIntentId: paymentIntentId,
          amount: order.totalAmount,
          currency: "usd",
          status: "SUCCEEDED",
          rawDetails: rawDetails as any,
        },
      });
    }
  });
}

/**
 * Handle payment failure
 */
async function failOrderPayment(orderId: string, paymentIntentId: string, failureReason?: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.status === "PAID") return;

    // Release Redis holds
    for (const item of order.items) {
      if (item.variantId) {
        const holdKey = redisKeys.inventoryLock(item.variantId);
        const currentHold = (await redis.get<number>(holdKey)) || 0;
        const remainingHold = Math.max(0, Number(currentHold) - item.quantity);
        if (remainingHold <= 0) {
          await redis.del(holdKey);
        } else {
          await redis.set(holdKey, remainingHold, { ex: 60 * 15 });
        }
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    const existingPayment = await tx.payment.findFirst({
      where: { orderId },
    });

    if (existingPayment) {
      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "FAILED",
          rawDetails: { failureReason },
        },
      });
    } else {
      await tx.payment.create({
        data: {
          orderId,
          stripePaymentIntentId: paymentIntentId,
          amount: order.totalAmount,
          currency: "usd",
          status: "FAILED",
          rawDetails: { failureReason },
        },
      });
    }
  });
}
