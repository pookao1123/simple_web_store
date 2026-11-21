import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const revalidate = 300; // 5 min ISR

export const metadata: Metadata = {
  title: "Categories | Aura Store",
  description: "Explore product categories and collections at Aura Store.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Browse items by category designed for modern creators, remote workers, and tech enthusiasts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group relative rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-64"
          >
            {category.imageUrl && (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 absolute inset-0"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative mt-auto p-6 text-white space-y-1">
              <h2 className="text-xl font-bold">{category.name}</h2>
              <p className="text-xs text-zinc-300 line-clamp-2">{category.description}</p>
              <div className="pt-2 text-xs font-semibold text-primary-foreground underline underline-offset-4">
                {category._count.products} products &rarr;
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
