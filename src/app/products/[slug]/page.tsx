import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductVariantSelector } from "@/components/ProductVariantSelector";
import { Metadata } from "next";
import { ArrowLeft, Shield, Truck, RefreshCcw } from "lucide-react";

export const revalidate = 60; // ISR cache revalidation every 60s

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    return { title: "Product Not Found | Aura Store" };
  }

  return {
    title: `${product.name} | Aura Store`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      variants: {
        orderBy: { price: "asc" },
      },
    },
  });

  if (!product || !product.isPublished) {
    notFound();
  }

  const primaryImage = product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery / Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden border bg-muted">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <div key={i} className="aspect-square rounded-lg border overflow-hidden bg-muted">
                  <img src={img} alt={`${product.name} thumbnail ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{product.name}</h1>
          </div>

          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
            {product.description}
          </p>

          <div className="border-t pt-6">
            <ProductVariantSelector variants={product.variants} />
          </div>

          {/* Guarantees / Badges */}
          <div className="border-t pt-6 grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
            <div className="space-y-1 flex flex-col items-center">
              <Truck className="w-5 h-5 text-foreground" />
              <span className="font-medium text-foreground">Free Express Shipping</span>
              <span>On orders over $150</span>
            </div>
            <div className="space-y-1 flex flex-col items-center">
              <Shield className="w-5 h-5 text-foreground" />
              <span className="font-medium text-foreground">2-Year Warranty</span>
              <span>100% genuine guaranteed</span>
            </div>
            <div className="space-y-1 flex flex-col items-center">
              <RefreshCcw className="w-5 h-5 text-foreground" />
              <span className="font-medium text-foreground">30-Day Returns</span>
              <span>Hassle-free guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
