import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redis, redisKeys } from "@/lib/redis";

const CART_COOKIE_NAME = "aura_cart_session";
const INVENTORY_HOLD_SECONDS = 15 * 60; // 15 minutes

export async function getOrCreateCartSession(): Promise<string> {
  const cookieStore = cookies();
  let sessionToken = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!sessionToken) {
    sessionToken = `guest_${crypto.randomUUID()}`;
    cookieStore.set(CART_COOKIE_NAME, sessionToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return sessionToken;
}

export async function getCartWithItems(userId?: string, sessionId?: string) {
  if (!userId && !sessionId) return null;

  const cart = await prisma.cart.findFirst({
    where: {
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(sessionId ? [{ sessionId }] : []),
      ],
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return cart;
}

/**
 * Merge guest cart items into authenticated user cart upon login
 */
export async function mergeGuestCartIntoUserCart(userId: string, guestSessionId: string) {
  if (!userId || !guestSessionId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: guestSessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!userCart) {
    // If user cart doesn't exist, simply assign the guest cart to user
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: { userId, sessionId: null },
    });
    return;
  }

  // Otherwise merge items
  for (const item of guestCart.items) {
    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: userCart.id,
          variantId: item.variantId,
        },
      },
      update: {
        quantity: { increment: item.quantity },
      },
      create: {
        cartId: userCart.id,
        variantId: item.variantId,
        quantity: item.quantity,
      },
    });
  }

  // Delete guest cart
  await prisma.cart.delete({
    where: { id: guestCart.id },
  });
}

/**
 * Two-phase inventory reservation:
 * Phase 1: Soft-lock / reservation in Redis (TTL: 15 min)
 */
export async function reserveInventoryHold(
  items: { variantId: string; quantity: number }[]
): Promise<{ success: boolean; error?: string; lockedItems: { variantId: string; quantity: number }[] }> {
  const locked: { variantId: string; quantity: number }[] = [];

  for (const item of items) {
    // Check available database stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      select: { stock: true, sku: true, name: true },
    });

    if (!variant) {
      // Rollback any acquired locks
      await releaseInventoryHolds(locked);
      return { success: false, error: `Variant ${item.variantId} not found`, lockedItems: [] };
    }

    const holdKey = redisKeys.inventoryLock(item.variantId);
    const existingHold = (await redis.get<number>(holdKey)) || 0;
    const availableStock = variant.stock - Number(existingHold);

    if (availableStock < item.quantity) {
      await releaseInventoryHolds(locked);
      return {
        success: false,
        error: `Insufficient stock for SKU ${variant.sku} (${variant.name}). Only ${Math.max(0, availableStock)} available.`,
        lockedItems: [],
      };
    }

    // Increment hold counter in Redis with 15-min TTL
    const newHold = await redis.incrby(holdKey, item.quantity);
    // Refresh expiration
    await redis.set(holdKey, newHold, { ex: INVENTORY_HOLD_SECONDS });

    locked.push({ variantId: item.variantId, quantity: item.quantity });
  }

  return { success: true, lockedItems: locked };
}

/**
 * Release inventory holds in Redis (e.g. on checkout failure or cancellation)
 */
export async function releaseInventoryHolds(items: { variantId: string; quantity: number }[]) {
  for (const item of items) {
    const holdKey = redisKeys.inventoryLock(item.variantId);
    const current = (await redis.get<number>(holdKey)) || 0;
    const remaining = Math.max(0, Number(current) - item.quantity);
    if (remaining <= 0) {
      await redis.del(holdKey);
    } else {
      await redis.set(holdKey, remaining, { ex: INVENTORY_HOLD_SECONDS });
    }
  }
}
