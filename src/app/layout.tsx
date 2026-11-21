import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ShoppingBag, Search, User } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aura Store | Premium Electronics & Lifestyle",
  description: "Next-generation e-commerce storefront built with Next.js, PostgreSQL, Upstash Redis & Stripe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg">
                    A
                  </span>
                  <span>AURA</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                  <Link href="/products" className="transition-colors hover:text-primary">
                    All Products
                  </Link>
                  <Link href="/categories" className="transition-colors hover:text-primary">
                    Categories
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/cart"
                  className="relative p-2 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t py-8 bg-muted/40 text-sm text-muted-foreground">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <p>&copy; {new Date().getFullYear()} Aura Commerce. Enterprise Ready.</p>
              <div className="flex items-center gap-6">
                <Link href="/terms" className="hover:underline">Terms</Link>
                <Link href="/privacy" className="hover:underline">Privacy</Link>
                <Link href="/security" className="hover:underline">PCI-DSS SAQ A</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
