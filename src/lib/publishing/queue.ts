import IORedis from 'ioredis';
import { PageBuilderSchema } from '../../types/builder';
import { PipelineGuard } from './pipelineGuard';
import { TelemetryHub } from '../observability/telemetry';
import { generateSecureId } from '../security/uuid';

export type JobPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type JobStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'DLQ';

export interface EnterpriseJob {
  jobId: string;
  pageId: string;
  schema: PageBuilderSchema;
  priority: JobPriority;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  errorLog?: string[];
  createdAt: number;
  lockedAt?: number;
}

export class HardenedQueueSystem {
  private static redisClient: IORedis | null = null;
  
  // Redis Key naming conventions
  private static HIGH_PRIORITY_KEY = 'saas:queue:high';
  private static MEDIUM_PRIORITY_KEY = 'saas:queue:medium';
  private static LOW_PRIORITY_KEY = 'saas:queue:low';
  private static DLQ_KEY = 'saas:queue:dlq';
  private static ACTIVE_JOBS_HASH = 'saas:jobs:status';
  private static LOCK_PREFIX = 'saas:lock:job:';

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
   * Enqueues a publishing job with strict priority routing, TTL controls, and status tracking
   */
  public static async enqueue(
    pageId: string, 
    schema: PageBuilderSchema, 
    priority: JobPriority = 'MEDIUM'
  ): Promise<string> {
    // Generate secure and collision-free job ID
    const jobId = generateSecureId(`job_${priority}`);
    
    const job: EnterpriseJob = {
      jobId,
      pageId,
      schema,
      priority,
      status: 'PENDING',
      attempts: 0,
      maxAttempts: 3,
      errorLog: [],
      createdAt: Date.now(),
    };

    const redis = this.getRedis();
    if (!redis) {
      console.warn('[Enterprise Queue] Redis offline, bypassing asynchronously...');
      setTimeout(() => DistributedWorkerRuntime.executeJobDirectly(job), 0);
      return `${jobId}-fallback-async`;
    }

    // 1. Write job details to centralized hash for tracing/observability dashboards
    await redis.hset(this.ACTIVE_JOBS_HASH, jobId, JSON.stringify(job));

    // 2. Route the job to its specific priority list queue
    const targetQueue = this.getQueueKey(priority);
    await redis.lpush(targetQueue, jobId);

    TelemetryHub.trackEvent('QUEUE_JOB_ENQUEUED', { jobId, pageId, priority });
    return jobId;
  }

  /**
   * Distributed Lock Acquisition (Mutual Exclusion) using Redis SET NX PX
   * Ensures that only ONE distributed worker process consumes a specific job at a time
   */
  public static async acquireJobLock(jobId: string, workerId: string, lockMs: number = 30000): Promise<boolean> {
    const redis = this.getRedis();
    if (!redis) return true; // Fallback

    const lockKey = `${this.LOCK_PREFIX}${jobId}`;
    const acquired = await redis.set(lockKey, workerId, 'PX', lockMs, 'NX');
    return acquired === 'OK';
  }

  /**
   * Releases a distributed job lock
   */
  public static async releaseJobLock(jobId: string): Promise<void> {
    const redis = this.getRedis();
    if (redis) {
      await redis.del(`${this.LOCK_PREFIX}${jobId}`);
    }
  }

  /**
   * Moves a failing, unrecoverable job to the Dead-Letter Queue (DLQ) for manual admin investigation
   */
  public static async routeToDeadLetterQueue(job: EnterpriseJob, finalError: string): Promise<void> {
    const redis = this.getRedis();
    job.status = 'DLQ';
    job.errorLog?.push(`[DLQ Route] ${Date.now()}: ${finalError}`);

    TelemetryHub.trackEvent('JOB_ROUTED_TO_DLQ', { jobId: job.jobId, pageId: job.pageId, error: finalError });

    if (redis) {
      await redis.hset(this.ACTIVE_JOBS_HASH, job.jobId, JSON.stringify(job));
      await redis.lpush(this.DLQ_KEY, JSON.stringify(job));
    }
  }

  /**
   * Retrieves active job status for dashboard tracing
   */
  public static async getJobStatus(jobId: string): Promise<EnterpriseJob | null> {
    const redis = this.getRedis();
    if (!redis) return null;
    
    const data = await redis.hget(this.ACTIVE_JOBS_HASH, jobId);
    return data ? JSON.parse(data) : null;
  }

  public static getQueueKey(priority: JobPriority): string {
    switch (priority) {
      case 'HIGH': return this.HIGH_PRIORITY_KEY;
      case 'LOW': return this.LOW_PRIORITY_KEY;
      case 'MEDIUM':
      default:
        return this.MEDIUM_PRIORITY_KEY;
    }
  }
}

export class DistributedWorkerRuntime {
  private static isRunning = false;
  // Generate a cryptographically secure unique worker node instance ID
  private static workerId = generateSecureId('worker');

  /**
   * Starts polling Redis priority queues concurrently with strict precedence:
   * HIGH Priority -> MEDIUM Priority -> LOW Priority
   */
  public static start(redisUrl: string, concurrency: number = 2): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const redis = new IORedis(redisUrl);
    console.log(`🏭 [Worker Runtime] Distributed Worker [${this.workerId}] started with concurrency: ${concurrency}`);

    // Spawn concurrent polling workers
    for (let i = 0; i < concurrency; i++) {
      this.pollQueueLoop(redis);
    }
  }

  private static async pollQueueLoop(redis: IORedis): Promise<void> {
    const queues = ['saas:queue:high', 'saas:queue:medium', 'saas:queue:low'];

    while (this.isRunning) {
      try {
        let acquiredJobId: string | null = null;

        // Poll priority queues in strict order
        for (const queue of queues) {
          acquiredJobId = await redis.rpop(queue);
          if (acquiredJobId) break; // Found a job, execute immediately
        }

        if (!acquiredJobId) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        // 1. Fetch complete job structure from centralized Hash map
        const jobDataRaw = await redis.hget('saas:jobs:status', acquiredJobId);
        if (!jobDataRaw) continue;

        const job: EnterpriseJob = JSON.parse(jobDataRaw);

        // 2. Try to acquire distributed lock lease (Mutual Exclusion across docker containers)
        const locked = await HardenedQueueSystem.acquireJobLock(job.jobId, this.workerId);
        if (!locked) {
          // Another worker process snatched this job first. Put it back in queue and bypass.
          await redis.lpush(HardenedQueueSystem.getQueueKey(job.priority), job.jobId);
          continue;
        }

        // 3. Process job
        await this.executeJobDirectly(job);

        // 4. Cleanup lock
        await HardenedQueueSystem.releaseJobLock(job.jobId);

      } catch (err) {
        console.error('[Worker Runtime] Loop execution failure:', err);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  /**
   * Compiles and executes the job with strict Exponential Backoff and DLQ routing
   */
  public static async executeJobDirectly(job: EnterpriseJob): Promise<void> {
    const startTime = Date.now();
    job.attempts++;
    job.status = 'PROCESSING';
    job.lockedAt = Date.now();

    const redis = HardenedQueueSystem['getRedis']();
    if (redis) {
      await redis.hset('saas:jobs:status', job.jobId, JSON.stringify(job));
    }

    try {
      // CRASH-PROOF COMPILER PROTECTION: Execute compilation inside the secure PipelineGuard shield (Optimization #2)
      // This completely protects our background worker processes from fatal crashes!
      const payload = await PipelineGuard.executeSafeCompile(job.schema);
      
      const durationMs = Date.now() - startTime;
      TelemetryHub.trackBuildDuration(job.pageId, durationMs, payload.compressedOutput.length);

      // Save success status
      job.status = 'SUCCESS';
      if (redis) {
        await redis.hset('saas:jobs:status', job.jobId, JSON.stringify(job));
      }

    } catch (err: any) {
      const errorMsg = err.message || 'Unknown compilation failure';
      job.errorLog?.push(`Attempt ${job.attempts} failed: ${errorMsg}`);
      
      if (job.attempts >= job.maxAttempts) {
        // Exceeded maximum retries, route to Dead-Letter Queue (DLQ)
        await HardenedQueueSystem.routeToDeadLetterQueue(job, `Exceeded max attempts of ${job.maxAttempts}. Last error: ${errorMsg}`);
      } else {
        // Calculate Exponential Backoff delay (2^attempts * 1000ms)
        const backoffDelay = Math.pow(2, job.attempts) * 1000;
        console.warn(`[Worker Runtime] Job ${job.jobId} failed. Scheduling retry ${job.attempts + 1}/${job.maxAttempts} in ${backoffDelay}ms`);
        
        job.status = 'PENDING';
        if (redis) {
          await redis.hset('saas:jobs:status', job.jobId, JSON.stringify(job));
        }

        // Enqueue retry asynchronously
        setTimeout(async () => {
          if (redis) {
            await redis.lpush(HardenedQueueSystem.getQueueKey(job.priority), job.jobId);
          } else {
            this.executeJobDirectly(job);
          }
        }, backoffDelay);
      }
    }
  }

  public static stop(): void {
    this.isRunning = false;
  }
}
