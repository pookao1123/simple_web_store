"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart";
import { formatPrice } from "@/lib/utils";
import { Check, ShoppingBag, Loader2 } from "lucide-react";

interface Variant {
  id: string;
  sku: string;
  name: string;
  price: any;
  stock: number;
  attributes: any;
}

export function ProductVariantSelector({ variants }: { variants: Variant[] }) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await addToCartAction({
        variantId: selectedVariant.id,
        quantity,
      });

      if (!res.success) {
        setError(res.error || "Failed to add to cart");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Display */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold">
          {formatPrice(selectedVariant?.price || 0)}
        </span>
        <span className="text-xs text-muted-foreground">Taxes & shipping calculated at checkout</span>
      </div>

      {/* Variant Selection Buttons */}
      {variants.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold">Options / Variants:</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariantId;
              const unavailable = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  disabled={unavailable}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-4 py-2 rounded-lg text-sm border font-medium transition ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : unavailable
                      ? "opacity-40 line-through cursor-not-allowed bg-muted"
                      : "hover:border-foreground/40 bg-card"
                  }`}
                >
                  {v.name}
                  {unavailable && " (Out of stock)"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Stock Availability */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold">Quantity:</span>
          <span className={`text-xs ${isOutOfStock ? "text-destructive" : "text-muted-foreground"}`}>
            {isOutOfStock ? "Out of Stock" : `${selectedVariant.stock} units available`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={isOutOfStock || loading}
            aria-label="Quantity"
            className="px-3 py-2 border rounded-lg bg-background text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
          >
            {Array.from({ length: Math.min(10, selectedVariant?.stock || 1) }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || loading}
            className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition shadow-sm ${
              isOutOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : success
                ? "bg-green-600 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Adding...
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4" /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}
    </div>
  );
}
