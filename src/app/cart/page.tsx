import { cookies } from "next/headers";
import { getCartWithItems } from "@/lib/cart";
import { CartView } from "@/components/CartView";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shopping Cart | Aura Store",
  description: "View and manage items in your shopping cart.",
};

export default async function CartPage() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get("aura_cart_session")?.value;
  const cart = await getCartWithItems(undefined, sessionId);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
        <p className="text-sm text-muted-foreground">Review your items before proceeding to checkout</p>
      </div>

      <CartView cart={cart} />
    </div>
  );
}
