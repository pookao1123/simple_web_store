"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateCartItemQuantityAction, removeCartItemAction } from "@/app/actions/cart";
import { formatPrice } from "@/lib/utils";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";

interface CartViewProps {
  cart: {
    id: string;
    items: {
      id: string;
      quantity: number;
      variant: {
        id: string;
        name: string;
        price: any;
        sku: string;
        stock: number;
        product: {
          name: string;
          slug: string;
          images: string[];
        };
      };
    }[];
  } | null;
}

export function CartView({ cart }: CartViewProps) {
  const router = useRouter();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const items = cart?.items || [];

  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.variant.price) * item.quantity;
  }, 0);

  const estimatedTax = subtotal * 0.08;
  const estimatedShipping = subtotal > 150 || subtotal === 0 ? 0 : 15.0;
  const total = subtotal + estimatedTax + estimatedShipping;

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    setLoadingItemId(itemId);
    try {
      await updateCartItemQuantityAction({
        cartItemId: itemId,
        quantity: newQty,
      });
      router.refresh();
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setLoadingItemId(itemId);
    try {
      await removeCartItemAction(itemId);
      router.refresh();
    } finally {
      setLoadingItemId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 border rounded-2xl bg-card space-y-4 max-w-xl mx-auto my-12 px-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
        <p className="text-muted-foreground text-sm">
          Discover our curated selection of high-performance gear and add items to your cart.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Item List */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => {
          const product = item.variant.product;
          const isBusy = loadingItemId === item.id;
          const image = product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border bg-card flex gap-4 items-center transition ${
                isBusy ? "opacity-60" : ""
              }`}
            >
              <Link href={`/products/${product.slug}`} className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              </Link>

              <div className="flex-1 space-y-1">
                <Link
                  href={`/products/${product.slug}`}
                  className="font-semibold text-sm sm:text-base hover:text-primary transition line-clamp-1"
                >
                  {product.name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  Option: <span className="font-medium text-foreground">{item.variant.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">SKU: {item.variant.sku}</div>
                <div className="font-semibold text-sm pt-1">
                  {formatPrice(item.variant.price)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={isBusy}
                  className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  disabled={isBusy || item.quantity >= item.variant.stock}
                  className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted transition disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.id)}
                disabled={isBusy}
                className="p-2 text-muted-foreground hover:text-destructive transition ml-2"
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Order Summary */}
      <div className="p-6 rounded-xl border bg-card h-fit space-y-6">
        <h3 className="font-bold text-lg border-b pb-3">Order Summary</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Tax (8%)</span>
            <span className="font-medium">{formatPrice(estimatedTax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">
              {estimatedShipping === 0 ? "Free" : formatPrice(estimatedShipping)}
            </span>
          </div>
          <div className="border-t pt-3 flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <Link
          href="/checkout"
          className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-sm"
        >
          Proceed to Checkout <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="text-[11px] text-center text-muted-foreground">
          Inventory reserved for 15 minutes during checkout.
        </p>
      </div>
    </div>
  );
}
