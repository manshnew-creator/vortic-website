import IORedis from 'ioredis';

export class EdgeRedisCache {
  private static client: IORedis | null = null;
  private static localFallback = new Map<string, { val: string; exp: number }>();

  private static getClient(): IORedis | null {
    if (this.client) return this.client;
    
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.warn('[Redis Cache] REDIS_URL not configured. Operating in high-performance local fallback mode.');
      return null;
    }

    try {
      this.client = new IORedis(redisUrl, {
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
        lazyConnect: true,
      });
      return this.client;
    } catch (err) {
      console.error('[Redis Cache] Connection initialization failed:', err);
      return null;
    }
  }

  /**
   * Resolves a key from the edge cache, checking global Redis or local edge-replica memory fallback
   */
  public static async get(key: string): Promise<string | null> {
    const client = this.getClient();
    
    if (client) {
      try {
        return await client.get(key);
      } catch (err) {
        console.warn('[Redis Cache] Fetch failed, checking local edge fallback:', err);
      }
    }

    // High performance local fallback checks
    const cached = this.localFallback.get(key);
    if (cached) {
      if (cached.exp > Date.now()) {
        return cached.val;
      }
      this.localFallback.delete(key); // Evict expired
    }

    return null;
  }

  /**
   * Sets a key in the distributed global cache with a Time-To-Live (TTL) limit
   */
  public static async set(key: string, value: string, ttlSeconds: number = 60): Promise<void> {
    const client = this.getClient();

    if (client) {
      try {
        await client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err) {
        console.warn('[Redis Cache] Write failed, falling back to local memory:', err);
      }
    }

    // High performance local fallback writes
    this.localFallback.set(key, {
      val: value,
      exp: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Invalidates / clears a key (essential for on-demand ISR revalidation triggers on publish)
   */
  public static async invalidate(key: string): Promise<void> {
    const client = this.getClient();
    if (client) {
      try {
        await client.del(key);
      } catch (err) {
        console.warn('[Redis Cache] Invalidation failed:', err);
      }
    }
    this.localFallback.delete(key);
  }
}
