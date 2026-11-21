import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: any;
    images: string[];
    category?: {
      name: string;
      slug: string;
    };
    variants?: {
      id: string;
      stock: number;
    }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 1;
  const isOutOfStock = totalStock <= 0;
  const imageUrl = product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

  return (
    <div className="group relative rounded-xl border bg-card text-card-foreground overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {isOutOfStock && (
          <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
            Sold Out
          </span>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
          )}
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-lg font-bold">
            {formatPrice(product.basePrice)}
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
