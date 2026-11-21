import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, RefreshCw } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <span>Production Ready E-Commerce Platform</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Modern, Performant & Resilient Commerce
        </h1>
        <p className="text-lg text-muted-foreground">
          Built on Next.js 14 App Router, PostgreSQL with Prisma ORM, atomic Upstash Redis holds, and PCI-DSS compliant Stripe checkout.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
          >
            Browse Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Value Props */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-t">
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-3">
          <Zap className="w-8 h-8 text-primary" />
          <h3 className="font-semibold text-lg">Sub-100ms Performance</h3>
          <p className="text-sm text-muted-foreground">
            Leveraging Next.js Server Components, ISR caching, and edge-ready API routes.
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-3">
          <RefreshCw className="w-8 h-8 text-primary" />
          <h3 className="font-semibold text-lg">Two-Phase Inventory Locks</h3>
          <p className="text-sm text-muted-foreground">
            Atomic Redis holds prevent checkout overselling and race conditions under peak traffic.
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h3 className="font-semibold text-lg">PCI-DSS SAQ A Security</h3>
          <p className="text-sm text-muted-foreground">
            Stripe tokenization guarantees sensitive card data never touches the application backend.
          </p>
        </div>
      </section>
    </div>
  );
}
