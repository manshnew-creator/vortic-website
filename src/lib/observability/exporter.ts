import { TelemetryMetrics, TelemetryHub } from './telemetry';

export class OpenTelemetryExporter {
  private static endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://otlp.collector.saaslander.com/v1/traces';
  private static apiKey = process.env.OTEL_EXPORTER_OTLP_HEADERS || '';

  /**
   * Translates local TelemetryMetrics buffered structures into standard OpenTelemetry (OTLP) Spans.
   * Ships logs and tracing telemetry to Datadog/NewRelic/Sentry backends.
   */
  public static async exportMetricsBatch(batch: TelemetryMetrics[]): Promise<boolean> {
    if (batch.length === 0) return true;

    // Map metrics format to standard OpenTelemetry span JSON protocol
    const otlpSpansPayload = {
      resourceSpans: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'saas-landing-builder' } },
              { key: 'deployment.environment', value: { stringValue: process.env.NODE_ENV || 'production' } },
            ],
          },
          scopeSpans: [
            {
              scope: { name: 'publishing-pipeline-tracer', version: '1.0.0' },
              spans: batch.map((metric) => ({
                traceId: this.generateUuidHex(), // Correlation ID
                spanId: this.generateUuidHex().substring(0, 16),
                name: metric.eventName,
                kind: 1, // SPAN_KIND_INTERNAL
                startTimeUnixNano: (metric.timestamp * 1000000).toString(),
                endTimeUnixNano: ((metric.timestamp + 50) * 1000000).toString(), // mock execution span
                attributes: Object.entries(metric.metadata).map(([k, v]) => ({
                  key: k,
                  value: { stringValue: typeof v === 'object' ? JSON.stringify(v) : String(v) },
                })),
              })),
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(otlpSpansPayload),
      });

      return response.ok;
    } catch (err: any) {
      console.warn('[OpenTelemetry Exporter] Failed to ship trace spans batch to endpoint:', err.message);
      return false;
    }
  }

  /**
   * Helper to generate standard trace parent UUIDs
   */
  private static generateUuidHex(): string {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}
