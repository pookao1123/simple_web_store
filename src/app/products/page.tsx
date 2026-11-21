import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Metadata } from "next";

export const revalidate = 60; // ISR cache revalidation every 60 seconds

export const metadata: Metadata = {
  title: "Catalog | Aura Store",
  description: "Browse our premium collection of audio hardware, wearables, and desk gear.",
};

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, search } = searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.product.findMany({
      where: {
        isPublished: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        category: {
          select: { name: true, slug: true },
        },
        variants: {
          select: { id: true, stock: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <CatalogFilters
            categories={categories}
            currentCategory={category}
            currentSearch={search}
          />
        </aside>

        {/* Product Grid */}
        <section className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {category
                ? categories.find((c) => c.slug === category)?.name || "Products"
                : "All Products"}
            </h1>
            <span className="text-sm text-muted-foreground">
              Showing {products.length} {products.length === 1 ? "item" : "items"}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-card space-y-3">
              <p className="text-lg font-medium text-foreground">No products match your criteria.</p>
              <p className="text-sm text-muted-foreground">Try clearing your search query or selecting another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
