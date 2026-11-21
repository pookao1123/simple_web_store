"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateCartSession } from "@/lib/cart";
import { addToCartSchema, updateCartItemSchema, removeCartItemSchema } from "@/lib/validations";

export async function addToCartAction(formData: FormData | { variantId: string; quantity: number }) {
  try {
    const rawData =
      formData instanceof FormData
        ? {
            variantId: formData.get("variantId"),
            quantity: Number(formData.get("quantity") || 1),
          }
        : formData;

    const validated = addToCartSchema.parse(rawData);
    const sessionId = await getOrCreateCartSession();

    // Verify variant existence and stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: validated.variantId },
    });

    if (!variant) {
      return { success: false, error: "Product variant not found" };
    }

    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
      });
    }

    // Upsert CartItem
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: validated.variantId,
        },
      },
    });

    const newQuantity = (existingItem?.quantity ?? 0) + validated.quantity;

    if (newQuantity > variant.stock) {
      return {
        success: false,
        error: `Cannot add ${validated.quantity} items. Only ${variant.stock} units in stock.`,
      };
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: validated.variantId,
        },
      },
      update: {
        quantity: newQuantity,
      },
      create: {
        cartId: cart.id,
        variantId: validated.variantId,
        quantity: validated.quantity,
      },
    });

    revalidatePath("/cart");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add to cart" };
  }
}

export async function updateCartItemQuantityAction(formData: FormData | { cartItemId: string; quantity: number }) {
  try {
    const rawData =
      formData instanceof FormData
        ? {
            cartItemId: formData.get("cartItemId"),
            quantity: Number(formData.get("quantity")),
          }
        : formData;

    const validated = updateCartItemSchema.parse(rawData);

    if (validated.quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: validated.cartItemId },
      });
    } else {
      const item = await prisma.cartItem.findUnique({
        where: { id: validated.cartItemId },
        include: { variant: true },
      });

      if (!item) {
        return { success: false, error: "Cart item not found" };
      }

      if (validated.quantity > item.variant.stock) {
        return {
          success: false,
          error: `Only ${item.variant.stock} units available in stock.`,
        };
      }

      await prisma.cartItem.update({
        where: { id: validated.cartItemId },
        data: { quantity: validated.quantity },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update cart" };
  }
}

export async function removeCartItemAction(cartItemId: string) {
  try {
    const validated = removeCartItemSchema.parse({ cartItemId });

    await prisma.cartItem.delete({
      where: { id: validated.cartItemId },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to remove item" };
  }
}
