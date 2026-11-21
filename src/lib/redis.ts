import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client configured for Lean PaaS.
 * Provides fallback mock in development/test if credentials are not configured.
 */
const hasUpstashConfig =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN) &&
  !process.env.UPSTASH_REDIS_REST_URL?.includes("example.upstash.io");

const memoryStore = new Map<string, { value: unknown; expiry?: number }>();

const mockRedis = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const item = memoryStore.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      memoryStore.delete(key);
      return null;
    }
    return item.value as T;
  },
  async set(key: string, value: unknown, options?: { ex?: number }): Promise<"OK"> {
    const expiry = options?.ex ? Date.now() + options.ex * 1000 : undefined;
    memoryStore.set(key, { value, expiry });
    return "OK";
  },
  async del(key: string): Promise<number> {
    const existed = memoryStore.delete(key);
    return existed ? 1 : 0;
  },
  async decrby(key: string, amount: number): Promise<number> {
    const current = (await mockRedis.get<number>(key)) ?? 0;
    const updated = current - amount;
    await mockRedis.set(key, updated);
    return updated;
  },
  async incrby(key: string, amount: number): Promise<number> {
    const current = (await mockRedis.get<number>(key)) ?? 0;
    const updated = current + amount;
    await mockRedis.set(key, updated);
    return updated;
  },
};

export const redis: Redis = hasUpstashConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : (mockRedis as unknown as Redis);

/**
 * Two-phase inventory reservation helper keys
 */
export const redisKeys = {
  inventoryLock: (variantId: string) => `stock:hold:${variantId}`,
  productCache: (slug: string) => `cache:product:${slug}`,
  catalogCache: (category?: string) => `cache:catalog:${category ?? "all"}`,
  rateLimit: (ip: string) => `ratelimit:${ip}`,
  idempotency: (key: string) => `idempotency:${key}`,
};
