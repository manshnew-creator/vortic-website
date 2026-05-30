import IORedis from 'ioredis';

export class DistributedRateLimiter {
  private static redisClient: IORedis | null = null;
  private static localFallbackStore = new Map<string, number[]>();
  
  // Rate limit constraints: Max 100 requests per 60 seconds (1 minute window)
  private static LIMIT = 100;
  private static WINDOW_MS = 60 * 1000;

  private static getRedis(): IORedis | null {
    if (this.redisClient) return this.redisClient;
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return null;

    try {
      this.redisClient = new IORedis(redisUrl, {
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
      });
      return this.redisClient;
    } catch (err) {
      console.warn('[Rate Limiter Redis] Connection failed, using resilient local fallback:', err);
      return null;
    }
  }

  /**
   * DISTRIBUTED SLIDING-WINDOW RATE LIMITER (Problem #5)
   * Resolves request rate limits across distributed, stateless serverless nodes.
   * Utilizes Redis Sorted Sets (ZSET) to implement a precise sliding-window algorithm.
   * 
   * How it works in Redis:
   * 1. Multi-transaction wraps operations.
   * 2. Evicts all timestamps older than the window (ZREMRANGEBYSCORE).
   * 3. Counts remaining active logs (ZCARD).
   * 4. If under limit, appends current timestamp (ZADD) and sets TTL.
   */
  public static async isAllowed(ip: string): Promise<boolean> {
    const redis = this.getRedis();
    const now = Date.now();
    const key = `rate:limit:${ip}`;

    if (redis) {
      try {
        const pipeline = redis.pipeline();
        
        // Remove timestamps older than the sliding window boundary
        const windowBoundary = now - this.WINDOW_MS;
        pipeline.zremrangebyscore(key, 0, windowBoundary);
        
        // Count active requests in current window
        pipeline.zcard(key);
        
        // Add current request timestamp to sorted set
        pipeline.zadd(key, now, now.toString());
        
        // Renew key expiration TTL (safety cleanup)
        pipeline.pexpire(key, this.WINDOW_MS);

        const results = await pipeline.exec();
        if (results && results[1]) {
          const [, activeRequestsCount] = results[1] as [Error | null, number];
          
          if (activeRequestsCount > this.LIMIT) {
            // Rate limit exceeded! Remove the newly added timestamp to be precise
            await redis.zrem(key, now.toString());
            return false;
          }
          return true;
        }
      } catch (err) {
        console.warn('[Rate Limiter Redis] Transaction failed, falling back to local memory:', err);
      }
    }

    // High performance local fallback sliding-window algorithm (In-memory)
    const record = this.localFallbackStore.get(ip) || [];
    const activeTimestamps = record.filter((ts) => now - ts < this.WINDOW_MS);

    if (activeTimestamps.length >= this.LIMIT) {
      this.localFallbackStore.set(ip, activeTimestamps);
      return false;
    }

    activeTimestamps.push(now);
    this.localFallbackStore.set(ip, activeTimestamps);
    return true;
  }

  /**
   * Housekeeping utility to clear expired fallback memory records
   */
  public static cleanUpFallbackStore(): void {
    const now = Date.now();
    for (const [ip, timestamps] of this.localFallbackStore.entries()) {
      const active = timestamps.filter((ts) => now - ts < this.WINDOW_MS);
      if (active.length === 0) {
        this.localFallbackStore.delete(ip);
      } else {
        this.localFallbackStore.set(ip, active);
      }
    }
  }
}

// Trigger automatic memory cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    DistributedRateLimiter.cleanUpFallbackStore();
  }, 5 * 60 * 1000);
}
