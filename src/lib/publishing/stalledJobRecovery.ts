import IORedis from 'ioredis';
import { EnterpriseJob, HardenedQueueSystem } from './queue';
import { TelemetryHub } from '../observability/telemetry';

export class StalledJobRecoveryManager {
  private static redisClient: IORedis | null = null;
  
  // Visibility Timeout: Max 60 seconds allowed for a worker to compile a page before being marked as stalled
  private static VISIBILITY_TIMEOUT_MS = 60 * 1000;
  private static ACTIVE_JOBS_HASH = 'saas:jobs:status';

  private static getRedis(): IORedis | null {
    if (this.redisClient) return this.redisClient;
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return null;

    this.redisClient = new IORedis(redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
    });
    return this.redisClient;
  }

  /**
   * Scans active jobs and automatically recovers orphaned, stalled, or crashed worker jobs
   */
  public static async scanAndRecoverStalledJobs(): Promise<void> {
    const redis = this.getRedis();
    if (!redis) return;

    try {
      // 1. Fetch all tracking jobs from Redis centralized hashmap
      const allJobsRaw = await redis.hgetall(this.ACTIVE_JOBS_HASH);
      const now = Date.now();

      for (const [jobId, rawData] of Object.entries(allJobsRaw)) {
        const job: EnterpriseJob = JSON.parse(rawData);

        // 2. Identify jobs stuck in 'PROCESSING' state beyond the visibility timeout lease
        if (job.status === 'PROCESSING' && job.lockedAt && (now - job.lockedAt > this.VISIBILITY_TIMEOUT_MS)) {
          
          TelemetryHub.trackEvent('STALLED_JOB_DETECTED', { 
            jobId, 
            pageId: job.pageId, 
            processingDurationMs: now - job.lockedAt 
          });

          // Break the stale distributed lock
          await HardenedQueueSystem.releaseJobLock(jobId);

          if (job.attempts >= job.maxAttempts) {
            // Exceeded maximum attempts during previous worker crashes, route to Dead-Letter Queue
            await HardenedQueueSystem.routeToDeadLetterQueue(
              job, 
              `Stalled job execution visibility timeout exceeded ${job.maxAttempts} times.`
            );
          } else {
            // 3. Resubmit/recover job: Increment attempts, reset status, and re-enqueue
            job.status = 'PENDING';
            job.errorLog?.push(`[Recovery] ${now}: Detected stalled job (Worker died). Re-enqueuing task.`);
            
            // Save updated job state
            await redis.hset(this.ACTIVE_JOBS_HASH, jobId, JSON.stringify(job));
            
            // Re-inject back to its target priority queue
            const queueKey = HardenedQueueSystem.getQueueKey(job.priority);
            await redis.lpush(queueKey, jobId);

            TelemetryHub.trackEvent('JOB_RECOVERY_SUCCESSFUL', { jobId, pageId: job.pageId });
          }
        }
      }
    } catch (err: any) {
      TelemetryHub.logError('STALLED_JOB_RECOVERY_CRASH', err);
    }
  }

  /**
   * Starts a background daemon loop that checks for crashed worker jobs periodically
   */
  public static startDaemon(intervalMs: number = 15000): void {
    console.log(`🛡️ [Recovery Daemon] Stalled Job Recovery monitor started. Scanning every ${intervalMs / 1000}s`);
    
    setInterval(async () => {
      await this.scanAndRecoverStalledJobs();
    }, intervalMs);
  }
}
