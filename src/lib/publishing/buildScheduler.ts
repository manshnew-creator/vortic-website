import { PageBuilderSchema } from '../../types/builder';
import { HardenedQueueSystem, JobPriority } from './queue';
import { TelemetryHub } from '../observability/telemetry';
import { IncrementalGraphCompiler } from './incrementalCompiler';

interface CoalescedBuildRequest {
  pageId: string;
  schema: PageBuilderSchema;
  priority: JobPriority;
  scheduledAt: number;
  timerId: NodeJS.Timeout;
}

export class SmartBuildScheduler {
  private static coalescedRequests = new Map<string, CoalescedBuildRequest>();
  private static lastSpeculativeBuildTime = new Map<string, number>();

  /**
   * GRAPH COST HEURISTICS: Dynamically estimates the CPU and memory compile weight of a block tree.
   * Returns a cost coefficient (in ms) to adjust queue priority and debounce coalescing delay.
   */
  public static calculateGraphCost(schema: PageBuilderSchema): number {
    let cost = 0;

    Object.values(schema.blocks).forEach((block) => {
      cost += 10; // Base compilation cost per node

      // Add penalty weight for complex or dense nodes
      if (block.type === 'grid') cost += 25;
      if (block.type === 'form') cost += 40;
      if (block.type === 'video') cost += 15;
      
      if (block.children && block.children.length > 8) {
        cost += block.children.length * 5; // Penalty for heavily nested structures
      }
    });

    return cost;
  }

  /**
   * PREDICTIVE INVALIDATION & SPECULATIVE BUILDS: Monitors active user canvas modifications.
   * If the designer pauses editing for over 3 seconds, it speculatively triggers a background, 
   * partial incremental compile of mutated nodes *before* they click Publish, so the final build is instant!
   */
  public static triggerSpeculativeBuild(pageId: string, schema: PageBuilderSchema): void {
    const lastBuild = this.lastSpeculativeBuildTime.get(pageId) || 0;
    
    // Throttle speculative builds to run at most once every 10 seconds to save server CPU
    if (Date.now() - lastBuild < 10000) return;

    this.lastSpeculativeBuildTime.set(pageId, Date.now());

    // Execute partial incremental compile asynchronously in background thread
    setTimeout(() => {
      const startTime = Date.now();
      const report = IncrementalGraphCompiler.compileIncremental(schema);
      
      TelemetryHub.trackEvent('SPECULATIVE_BUILD_EXECUTED', {
        pageId,
        rebuiltNodesCount: report.rebuiltCount,
        durationMs: Date.now() - startTime,
      });
    }, 0);
  }

  /**
   * Schedules a static compilation build, implementing dynamic Build Coalescing and Deduplication.
   * Adjusts debounce window dynamically based on Graph Cost Heuristics.
   */
  public static scheduleBuild(pageId: string, schema: PageBuilderSchema, priority: JobPriority = 'MEDIUM'): Promise<string> {
    return new Promise((resolve) => {
      
      // Calculate dynamic coalescing delay based on graph weight
      const graphCost = this.calculateGraphCost(schema);
      const dynamicDebounceMs = Math.min(10000, Math.max(3000, graphCost * 15));

      const existingRequest = this.coalescedRequests.get(pageId);
      if (existingRequest) {
        // DEDUPLICATION: Clear previous scheduled build timer
        clearTimeout(existingRequest.timerId);
        
        TelemetryHub.trackEvent('BUILD_COALESCED_DEDUPLICATED', { 
          pageId, 
          priority, 
          canceledAt: existingRequest.scheduledAt 
        });
      }

      const timerId = setTimeout(async () => {
        this.coalescedRequests.delete(pageId);

        // Dispatch to queue
        const jobId = await HardenedQueueSystem.enqueue(pageId, schema, priority);
        
        TelemetryHub.trackEvent('BUILD_DISPATCHED_FROM_SCHEDULER', { pageId, jobId, priority, dynamicDebounceMs });
        resolve(jobId);

      }, dynamicDebounceMs);

      this.coalescedRequests.set(pageId, {
        pageId,
        schema,
        priority,
        scheduledAt: Date.now(),
        timerId,
      });
    });
  }

  /**
   * Immediately flushes and dispatches a scheduled build bypassing the coalescing window
   */
  public static async forceFlushBuild(pageId: string): Promise<string | null> {
    const request = this.coalescedRequests.get(pageId);
    if (!request) return null;

    clearTimeout(request.timerId);
    this.coalescedRequests.delete(pageId);

    const jobId = await HardenedQueueSystem.enqueue(pageId, request.schema, request.priority);
    TelemetryHub.trackEvent('BUILD_FORCED_FLUSHED', { pageId, jobId });
    
    return jobId;
  }
}
