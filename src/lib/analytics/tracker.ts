import { UAParser } from 'ua-parser-js'; // mock parsing logic or direct user agent details

export interface AnalyticsPayload {
  websiteId: string;
  pageSlug: string;
  visitorId: string;
  userAgent: string;
  referrer: string;
  eventType: 'PAGE_VIEW' | 'CLICK' | 'CONVERSION';
  eventMetadata?: Record<string, any>;
}

export class AnalyticsTracker {
  private static eventQueue: AnalyticsPayload[] = [];
  private static batchLimit = 10;
  private static flushInterval = 5000; // in milliseconds (5 seconds)
  private static timer: NodeJS.Timeout | null = null;

  /**
   * Tracks a page view or click event and queues it for batching.
   */
  public static track(payload: AnalyticsPayload) {
    this.eventQueue.push(payload);
    
    // Auto-flush when batch limit is reached
    if (this.eventQueue.length >= this.batchLimit) {
      this.flush();
    } else {
      this.startTimer();
    }
  }

  /**
   * Periodically flushes buffered batch events to DB
   */
  private static startTimer() {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Flushes queue contents, pushing them to the backend API route securely
   */
  public static async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.eventQueue.length === 0) return;

    const batch = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Send events to API in a single optimized payload
      await fetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      });
    } catch (error) {
      console.error('[Analytics] Failed to flush tracker events batch', error);
      // Re-add back to queue to retry on next cycle
      this.eventQueue.unshift(...batch);
    }
  }

  /**
   * Helper to parse user agent strings on server-side securely
   */
  public static parseUserAgent(uaString: string) {
    const parser = new UAParser(uaString);
    return {
      browser: parser.getBrowser().name || 'Unknown',
      os: parser.getOS().name || 'Unknown',
      device: parser.getDevice().type || 'desktop', // desktop, mobile, tablet
    };
  }
}
