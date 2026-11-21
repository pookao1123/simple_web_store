import { z } from "zod";

export const addToCartSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(99, "Quantity cannot exceed 99"),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1, "Cart Item ID is required"),
  quantity: z.number().int().min(0, "Quantity cannot be negative").max(99, "Quantity cannot exceed 99"),
});

export const removeCartItemSchema = z.object({
  cartItemId: z.string().min(1, "Cart Item ID is required"),
});

export const checkoutSchema = z.object({
  email: z.string().email("Valid email is required"),
  fullName: z.string().min(2, "Full name is required"),
  streetLine1: z.string().min(3, "Street address is required"),
  streetLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  postalCode: z.string().min(3, "Postal/ZIP code is required"),
  country: z.string().min(2).default("US"),
  phone: z.string().optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
