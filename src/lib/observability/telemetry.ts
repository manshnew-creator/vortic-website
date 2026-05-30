export interface TelemetryMetrics {
  eventName: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export class TelemetryHub {
  private static metricsBuffer: TelemetryMetrics[] = [];
  private static maxBufferSize = 50;

  /**
   * Logs a general platform lifecycle event (OpenTelemetry standard compatible)
   */
  public static trackEvent(eventName: string, metadata: Record<string, any> = {}): void {
    const logEntry: TelemetryMetrics = {
      eventName,
      timestamp: Date.now(),
      metadata,
    };

    this.metricsBuffer.push(logEntry);
    
    // Console log telemetry in development for supreme operator visibility
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📡 [Telemetry: ${eventName}]`, JSON.stringify(metadata));
    }

    if (this.metricsBuffer.length >= this.maxBufferSize) {
      this.flushMetrics();
    }
  }

  /**
   * Specialized telemetry metric to track compiler and build execution durations
   */
  public static trackBuildDuration(pageId: string, durationMs: number, compiledSizeBytes: number): void {
    this.trackEvent('BUILD_PERFORMANCE_METRIC', {
      pageId,
      durationMs,
      compiledSizeBytes,
      speedKbPerSecond: parseFloat(((compiledSizeBytes / 1024) / (durationMs / 1000)).toFixed(2)),
    });
  }

  /**
   * Specialized telemetry metric to track distributed cache hit/miss rates
   */
  public static trackCachePerformance(key: string, hit: boolean): void {
    this.trackEvent('CACHE_PERFORMANCE_METRIC', {
      key,
      hit,
      status: hit ? 'HIT' : 'MISS',
    });
  }

  /**
   * High performance, structured error logging (Sentry-compatible)
   */
  public static logError(context: string, error: Error, metadata: Record<string, any> = {}): void {
    const errorPayload = {
      context,
      errorMessage: error.message,
      errorStack: error.stack,
      ...metadata,
    };

    console.error(`🚨 [Telemetry ERROR: ${context}]`, JSON.stringify(errorPayload));
    
    this.trackEvent('SYSTEM_EXCEPTION_LOGGED', {
      context,
      errorMessage: error.message,
    });

    // In production, dispatch directly to Sentry SDK / Datadog
    // Sentry.captureException(error, { tags: { context, ...metadata } });
  }

  /**
   * Flushes collected telemetry metrics to your monitoring backend (Datadog/NewRelic/InfluxDB)
   */
  private static flushMetrics(): void {
    const batch = [...this.metricsBuffer];
    this.metricsBuffer = [];
    
    // Simulate async shipping to logging serverless ingestion
    if (batch.length > 0) {
      // fetch('https://telemetry-ingest.saaslander.com', { method: 'POST', body: JSON.stringify(batch) }).catch(() => {});
    }
  }
}
