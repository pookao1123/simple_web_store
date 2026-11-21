import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCartWithItems } from "@/lib/cart";
import { CheckoutForm } from "@/components/CheckoutForm";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | Aura Store",
  description: "Secure checkout powered by Stripe and Upstash Redis.",
};

export default async function CheckoutPage() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get("aura_cart_session")?.value;
  const cart = await getCartWithItems(undefined, sessionId);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal > 150 ? 0 : 15.0;
  const total = subtotal + tax + shipping;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground">Complete your shipping details to proceed</p>
      </div>

      <CheckoutForm
        items={cart.items}
        subtotal={subtotal}
        tax={tax}
        shipping={shipping}
        total={total}
      />
    </div>
  );
}
