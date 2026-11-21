"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

export function CartNavButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative p-2 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
      aria-label="Shopping Cart"
    >
      <ShoppingBag className="w-5 h-5" />
    </Link>
  );
}
