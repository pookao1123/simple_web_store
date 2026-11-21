import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string | { toString(): string },
  options: {
    currency?: "USD" | "EUR" | "GBP";
    notation?: Intl.NumberFormatOptions["notation"];
  } = {}
) {
  const { currency = "USD", notation = "standard" } = options;
  const numericPrice = typeof price === "string" ? parseFloat(price) : Number(price);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation,
  }).format(numericPrice);
}
