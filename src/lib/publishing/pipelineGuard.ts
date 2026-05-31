import { PageBuilderSchema } from '../../types/builder';
import { PublishingPipeline, PublishedPayload } from './pipeline';
import { TelemetryHub } from '../observability/telemetry';
import { HtmlXssSanitizer } from '../security/sanitizer';

export class PipelineGuard {
  private static failureCountMap = new Map<string, number>();
  private static CIRCUIT_BREAKER_THRESHOLD = 3;

  /**
   * 1. CYCLIC REFERENCE & ORPHAN RESOLVER
   */
  public static sanitizeSchema(schema: PageBuilderSchema): PageBuilderSchema {
    const sanitized = JSON.parse(JSON.stringify(schema)) as PageBuilderSchema;
    const visited = new Set<string>();

    const checkAndPrune = (blockId: string, parentId: string | null): void => {
      if (visited.has(blockId)) {
        console.warn(`🚨 [Pipeline Guard: Cyclic Loop Detected] Pruning block node "${blockId}" from parent "${parentId}" to prevent Stack Overflow!`);
        
        if (parentId && sanitized.blocks[parentId]) {
          sanitized.blocks[parentId].children = sanitized.blocks[parentId].children.filter((id) => id !== blockId);
        }
        return;
      }

      visited.add(blockId);
      const block = sanitized.blocks[blockId];
      
      if (block && block.children) {
        block.children.forEach((childId) => {
          checkAndPrune(childId, blockId);
        });
      }

      visited.delete(blockId);
    };

    if (sanitized.rootBlockId && sanitized.blocks[sanitized.rootBlockId]) {
      checkAndPrune(sanitized.rootBlockId, null);
    }

    return sanitized;
  }

  /**
   * 2. CRASH-PROOF COMPILER ISOLATION, CIRCUIT BREAKER, & XSS SANITIZATION
   * Executes page compilation within a strict, crash-proof boundary.
   * - Prevents unexpected exceptions from killing the Node process.
   * - Activates a "Circuit Breaker" to pause builds for a page if it crashes 3 consecutive times.
   * - GRACEFUL XSS SANITIZATION (Problem #5): Sanitizes final compiled htmlBody using our edge-safe sanitizer!
   */
  public static async executeSafeCompile(schema: PageBuilderSchema): Promise<PublishedPayload> {
    const pageId = schema.pageId;
    const currentFailures = this.failureCountMap.get(pageId) || 0;

    if (currentFailures >= this.CIRCUIT_BREAKER_THRESHOLD) {
      TelemetryHub.trackEvent('CIRCUIT_BREAKER_ACTIVE', { pageId, currentFailures });
      return this.generateSafeModeFallbackPayload(schema, `Compilation suspended due to recurring failures (${currentFailures}/${this.CIRCUIT_BREAKER_THRESHOLD}). Please inspect page block nodes.`);
    }

    try {
      const cleanSchema = this.sanitizeSchema(schema);

      // Execute compilation
      const payload = await PublishingPipeline.compile(cleanSchema);

      // XSS SANITIZATION INJECTION: Secure html body nodes recursively (Problem #5)
      const sanitizedHtmlBody = HtmlXssSanitizer.sanitize(payload.html);

      // Re-compile finalized sanitized standalone package
      const finalizedPayload: PublishedPayload = {
        ...payload,
        html: sanitizedHtmlBody,
        compressedOutput: payload.compressedOutput.replace(payload.html, sanitizedHtmlBody),
      };

      this.failureCountMap.set(pageId, 0);
      return finalizedPayload;

    } catch (error: any) {
      const nextFailures = currentFailures + 1;
      this.failureCountMap.set(pageId, nextFailures);

      TelemetryHub.logError('PIPELINE_COMPILATION_CRASH', error, { pageId, attemptCount: nextFailures });

      return this.generateSafeModeFallbackPayload(
        schema, 
        `We experienced an unexpected compilation anomaly. Our systems are recovering. Last error: ${error.message}`
      );
    }
  }

  /**
   * Generates a lightweight, high-performance "Safe-Mode" fallback payload
   */
  private static generateSafeModeFallbackPayload(schema: PageBuilderSchema, message: string): PublishedPayload {
    const fallbackHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maintenance | ${schema.title}</title>
        <!-- Tailwind CDN removed -->
        <style>
          body { font-family: sans-serif; background: #0f172a; color: #f8fafc; }
        </style>
      </head>
      <body class="min-h-screen flex items-center justify-center p-6 text-center">
        <div class="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-4">
          <span class="text-4xl animate-pulse block">🛠️</span>
          <h1 className="text-xl font-bold text-white">Temporary Site Maintenance</h1>
          <p class="text-xs text-slate-400 leading-normal">${message}</p>
          <div class="text-[10px] text-slate-500 font-mono">Status: Code compilation safeguarded</div>
        </div>
      </body>
      </html>
    `.replace(/\s+/g, ' ').trim();

    return {
      html: '<!-- Safe-Mode Fallback -->',
      css: '',
      js: '',
      seoMetadata: {
        title: `Maintenance | ${schema.title}`,
        description: 'Temporary site maintenance.',
        keywords: 'maintenance',
        ogImage: '',
      },
      compressedOutput: fallbackHtml,
    };
  }

  /**
   * Manually resets the circuit breaker for a specific page
   */
  public static resetCircuitBreaker(pageId: string): void {
    this.failureCountMap.set(pageId, 0);
  }
}
