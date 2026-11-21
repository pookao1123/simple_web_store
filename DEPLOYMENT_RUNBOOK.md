# Production Deployment Runbook: Lean PaaS (Next.js + Supabase + Upstash + Vercel + Stripe)

## 1. Architecture Overview
- **Storefront & Edge Routing:** Next.js 14 (App Router, React Server Components) on **Vercel**.
- **Relational Database & Auth:** **Supabase PostgreSQL** via Prisma ORM with connection pooling.
- **Two-Phase Inventory Lock & Cache:** **Upstash Serverless Redis** (atomic `DECRBY`/`INCRBY` holds with 15-min TTL).
- **Payment Processing:** **Stripe Checkout / Elements** (PCI-DSS SAQ A compliance).

---

## 2. Environment Variables Checklist

Configure these in the Vercel Project Settings (`Environment Variables`):

| Variable | Environment | Description |
|---|---|---|
| `DATABASE_URL` | Production / Preview | Supabase Transaction Pooler URL (`postgresql://...:6543/postgres?pgbouncer=true`) |
| `DIRECT_URL` | Production / Preview | Supabase Direct Session URL (`postgresql://...:5432/postgres`) |
| `STRIPE_SECRET_KEY` | Production | Stripe live secret key (`sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Production / Client | Stripe live publishable key (`pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Production | Stripe live webhook signing secret (`whsec_...`) |
| `UPSTASH_REDIS_REST_URL` | Production / Preview | Upstash Redis REST endpoint (`https://...upstash.io`) |
| `UPSTASH_REDIS_REST_TOKEN` | Production / Preview | Upstash Redis REST bearer token |
| `NEXT_PUBLIC_APP_URL` | Production | Canonical public URL (e.g. `https://yourdomain.com`) |

---

## 3. Step-by-Step Deployment Guide

### Step 1: Database Setup (Supabase)
1. Create a project in [Supabase](https://supabase.com).
2. Retrieve the Database connection string from **Project Settings > Database**.
3. Run initial migrations / push schema from local or CI:
   ```bash
   npx prisma db push
   node prisma/seed.mjs
   ```

### Step 2: Redis Setup (Upstash)
1. Create a Redis database in [Upstash Console](https://console.upstash.com).
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### Step 3: Stripe Configuration
1. Obtain API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys).
2. Set up Webhook Endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the Signing Secret to `STRIPE_WEBHOOK_SECRET`.

### Step 4: Vercel Deployment
1. Connect Git repository to [Vercel](https://vercel.com).
2. Confirm the build settings configured in `vercel.json`:
   - Framework Preset: `Next.js`
   - Build Command: `prisma generate && next build`
3. Enter the environment variables listed in Section 2.
4. Trigger production deploy.

---

## 4. Verification & Health Check Checklist
- [x] **Catalog Browsing:** `/`, `/products`, `/categories`, and `/products/[slug]` render statically / server-side.
- [x] **Cart Management:** Add to cart, adjust quantities, local and session synchronization.
- [x] **Checkout & Two-Phase Hold:** Server action validates payload with Zod, sets 15-min Redis atomic reservation hold.
- [x] **Stripe Webhook Processing:** Cryptographic signature verification, idempotent event recording in Redis (24-hr TTL), atomic DB inventory deduction & order transition to `PAID`.
- [x] **Security Hardening:** Strict CSP, HSTS, X-Frame-Options, no sensitive cardholder data captured (SAQ A compliance).
