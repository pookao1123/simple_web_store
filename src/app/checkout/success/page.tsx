import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, ArrowRight, PackageCheck } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmed | Aura Store",
  description: "Your order has been received and processed successfully.",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string; session_id?: string; mock?: string };
}) {
  const { orderId } = searchParams;

  let order = null;
  if (orderId) {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center space-y-8">
      <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Payment Succeeded!</h1>
        <p className="text-muted-foreground text-sm">
          Thank you for your purchase. We have received your order and sent a confirmation email to{" "}
          <span className="font-semibold text-foreground">{order?.guestEmail || "your email"}</span>.
        </p>
      </div>

      {order && (
        <div className="p-6 rounded-xl border bg-card text-left space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <div className="text-xs text-muted-foreground">Order Reference</div>
              <div className="font-bold text-base">{order.orderNumber}</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
              {order.status}
            </span>
          </div>

          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between text-sm">
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.variantName} &times; {item.quantity}
                  </div>
                </div>
                <div className="font-semibold">{formatPrice(item.subtotal)}</div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 flex justify-between font-bold text-base">
            <span>Total Paid</span>
            <span className="text-primary">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      )}

      <div className="pt-4 flex justify-center gap-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition shadow-sm"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
