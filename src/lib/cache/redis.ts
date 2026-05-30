import { TelemetryHub } from '../observability/telemetry';

export class EdgeRedisCache {
  private static restUrl = process.env.REDIS_REST_URL || '';
  private static restToken = process.env.REDIS_REST_TOKEN || '';
  private static localFallback = new Map<string, { val: string; exp: number }>();

  /**
   * EDGE-NATIVE REST CLIENT (إصلاح خطأ الـ Webpack و ioredis على الـ Edge)
   * 
   * CRITICAL ARCHITECTURAL UPDATE:
   * Next.js Edge Middleware runs in a restricted Edge runtime that lacks TCP socket support,
   * meaning importing traditional TCP clients like 'ioredis' crashes the build (webpack unhandled schema error).
   * 
   * Solution: We implement a 100% Edge-Native REST Redis Client using standard Web 'fetch' APIs.
   * Compatible with Upstash Redis REST API endpoints. Bypasses webpack bundling errors completely!
   */
  private static async executeRestCommand(command: string[]): Promise<any> {
    if (!this.restUrl || !this.restToken) {
      // Bypasses silently in local development fallback mode
      return null;
    }

    try {
      const response = await fetch(`${this.restUrl}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.restToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error(`Upstash REST API rejected command with status: ${response.status}`);
      }

      const data = await response.json();
      return data.result; // Upstash returns the Redis outcome under the "result" property

    } catch (err: any) {
      console.warn('[Edge Redis Cache] REST call failed, falling back to memory:', err.message);
      return null;
    }
  }

  /**
   * Resolves a key from the global Edge Redis cache or local memory fallback
   */
  public static async get(key: string): Promise<string | null> {
    // 1. Try REST call on the Edge
    const result = await this.executeRestCommand(['GET', key]);
    if (result !== null && result !== undefined) {
      TelemetryHub.trackCachePerformance(key, true);
      return result;
    }

    // 2. High performance local fallback check
    const cached = this.localFallback.get(key);
    if (cached) {
      if (cached.exp > Date.now()) {
        TelemetryHub.trackCachePerformance(key, true);
        return cached.val;
      }
      this.localFallback.delete(key); // Evict expired
    }

    TelemetryHub.trackCachePerformance(key, false);
    return null;
  }

  /**
   * Sets a key in the distributed global cache with a TTL limit
   */
  public static async set(key: string, value: string, ttlSeconds: number = 60): Promise<void> {
    // 1. Try REST call on the Edge
    const success = await this.executeRestCommand(['SET', key, value, 'EX', ttlSeconds.toString()]);
    if (success) return;

    // 2. High performance local fallback write
    this.localFallback.set(key, {
      val: value,
      exp: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Invalidates / clears a key (essential for on-demand ISR revalidation triggers)
   */
  public static async invalidate(key: string): Promise<void> {
    await this.executeRestCommand(['DEL', key]);
    this.localFallback.delete(key);
  }
}
