"use client";

import { useState } from "react";
import { createCheckoutSessionAction } from "@/app/actions/checkout";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, Lock, Loader2, ArrowRight } from "lucide-react";

interface CheckoutFormProps {
  items: {
    id: string;
    quantity: number;
    variant: {
      name: string;
      price: any;
      product: { name: string };
    };
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export function CheckoutForm({ items, subtotal, tax, shipping, total }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "customer@example.com",
    fullName: "Jane Doe",
    streetLine1: "123 Market St",
    streetLine2: "",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "US",
    phone: "555-0199",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createCheckoutSessionAction(formData);

      if (!res.success) {
        setError(res.error || "Failed to start checkout");
        setLoading(false);
        return;
      }

      if (res.url) {
        // Redirect directly to Stripe Checkout
        window.location.href = res.url;
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Checkout Input Form */}
      <div className="lg:col-span-7 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span>
              Shipping Destination
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Street Address</label>
                <input
                  type="text"
                  name="streetLine1"
                  required
                  value={formData.streetLine1}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Apartment, suite, etc. (Optional)</label>
                <input
                  type="text"
                  name="streetLine2"
                  value={formData.streetLine2}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold">Postal / ZIP Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">3</span>
              Payment Security
            </h2>
            <div className="p-4 rounded-lg bg-muted/60 text-xs text-muted-foreground space-y-2 border">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                <span>PCI-DSS SAQ A Compliant Hosted Checkout</span>
              </div>
              <p>
                Payment details will be processed securely on Stripe's encrypted infrastructure. Sensitive cardholder data never touches our application servers.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Reserving Inventory & Redirecting...
              </>
            ) : (
              <>
                Proceed to Stripe Payment <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Order Summary & Line Items */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 rounded-xl border bg-card space-y-6">
          <h3 className="font-bold text-lg border-b pb-3">Order Summary</h3>

          <div className="divide-y max-h-80 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium text-foreground">{item.variant.product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.variant.name} &times; {item.quantity}
                  </div>
                </div>
                <div className="font-semibold">
                  {formatPrice(Number(item.variant.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-base font-bold">
              <span>Total Due</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span>Two-phase Redis inventory reservation active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
