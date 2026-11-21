"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

export function CatalogFilters({
  categories,
  currentCategory,
  currentSearch,
}: {
  categories: { id: string; name: string; slug: string }[];
  currentCategory?: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(currentSearch || "");
  const [isPending, startTransition] = useTransition();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleCategoryChange = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by title..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
      </form>

      {/* Category List */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold tracking-wide text-foreground">Categories</h4>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
              !currentCategory
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                currentCategory === cat.slug
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
