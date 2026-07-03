interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number = 60000): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  startCleanup(intervalMs: number = 60000): void {
    if (this.cleanupInterval) return;
    this.cleanupInterval = setInterval(() => this.cleanup(), intervalMs);
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  get size(): number {
    return this.store.size;
  }
}

declare global {
  var _cache: Cache | undefined;
}

export const cache = global._cache || (global._cache = new Cache());
cache.startCleanup();

export function cacheKey(...parts: string[]): string {
  return parts.join(":");
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  factory: () => Promise<T>
): Promise<T> {
  const existing = cache.get<T>(key);
  if (existing !== null) return existing;

  const value = await factory();
  cache.set(key, value, ttlMs);
  return value;
}
