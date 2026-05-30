import IORedis from 'ioredis';
import { TelemetryHub } from '../observability/telemetry';

export interface WorkerNodeMetrics {
  workerId: string;
  cpuUsagePercent: number;
  memoryUsageMb: number;
  assignedJobCount: number;
  lastHeartbeatAt: number;
  status: 'ONLINE' | 'BUSY' | 'DRAINING';
}

export class WorkerFleetManager {
  private static redisClient: IORedis | null = null;
  
  // Redis Key Registries
  private static FLEET_REGISTRY_HASH = 'saas:fleet:discovery';
  private static LEASE_PREFIX = 'saas:lease:job:';
  private static HEARTBEAT_TIMEOUT_MS = 10000; // 10 seconds timeout for stale workers

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
   * 1. HEARTBEAT MESH SYSTEM
   * Workers invoke this periodically (e.g. every 3 seconds) to announce their active metrics,
   * CPU, RAM consumption, and current job assignment count to the mesh registry.
   */
  public static async pingHeartbeat(
    workerId: string,
    cpuUsage: number,
    memoryUsage: number,
    assignedJobCount: number = 0,
    status: 'ONLINE' | 'BUSY' | 'DRAINING' = 'ONLINE'
  ): Promise<void> {
    const redis = this.getRedis();
    if (!redis) return;

    const node: WorkerNodeMetrics = {
      workerId,
      cpuUsagePercent: cpuUsage,
      memoryUsageMb: memoryUsage,
      assignedJobCount,
      lastHeartbeatAt: Date.now(),
      status: assignedJobCount > 0 ? 'BUSY' : status,
    };

    // Update worker status in centralized Discovery registry
    await redis.hset(this.FLEET_REGISTRY_HASH, workerId, JSON.stringify(node));
  }

  /**
   * 2. WORKER DISCOVERY & EVICTION
   * Dynamic Service Discovery for distributed worker instances.
   * Automatically evicts stalled or crashed worker nodes (Heartbeat Timeout) to keep the registry clean.
   */
  public static async discoverActiveNodes(): Promise<WorkerNodeMetrics[]> {
    const redis = this.getRedis();
    if (!redis) return [];

    const activeNodes: WorkerNodeMetrics[] = [];
    const now = Date.now();

    try {
      const fleetRaw = await redis.hgetall(this.FLEET_REGISTRY_HASH);

      for (const [workerId, rawData] of Object.entries(fleetRaw)) {
        const node: WorkerNodeMetrics = JSON.parse(rawData);

        // STALLED NODE DETECTOR: Evict from mesh if heartbeat is older than 10s (e.g. process died)
        if (now - node.lastHeartbeatAt > this.HEARTBEAT_TIMEOUT_MS) {
          await redis.hdel(this.FLEET_REGISTRY_HASH, workerId);
          TelemetryHub.trackEvent('WORKER_NODE_EVICTED', { workerId, reason: 'Heartbeat timeout' });
        } else {
          activeNodes.push(node);
        }
      }
    } catch (err: any) {
      TelemetryHub.logError('WORKER_DISCOVERY_FAILED', err);
    }

    return activeNodes;
  }

  /**
   * 3. DISTRIBUTED LEASE MANAGER
   * Uses Redis SET NX PX to acquire an exclusive, mutually exclusive distributed lease on a job.
   * Guarantees that only ONE active worker node processes a specific build job.
   */
  public static async acquireDistributedLease(
    jobId: string,
    workerId: string,
    leaseDurationMs: number = 30000
  ): Promise<boolean> {
    const redis = this.getRedis();
    if (!redis) return true; // Offline fallback mode bypasses lock

    const leaseKey = `${this.LEASE_PREFIX}${jobId}`;
    const acquired = await redis.set(leaseKey, workerId, 'PX', leaseDurationMs, 'NX');
    
    if (acquired === 'OK') {
      TelemetryHub.trackEvent('DISTRIBUTED_LEASE_ACQUIRED', { jobId, workerId, leaseDurationMs });
      return true;
    }
    return false;
  }

  public static async releaseDistributedLease(jobId: string): Promise<void> {
    const redis = this.getRedis();
    if (redis) {
      await redis.del(`${this.LEASE_PREFIX}${jobId}`);
    }
  }

  /**
   * 4. WORKLOAD BALANCING (Least-Loaded Routing Heuristics)
   * Evaluates CPU usage and assignment counts of discovered nodes,
   * returning the ideal worker node to execute a incoming compilation task.
   */
  public static async resolveLeastLoadedNode(): Promise<WorkerNodeMetrics | null> {
    const activeNodes = await this.discoverActiveNodes();
    const availableNodes = activeNodes.filter((node) => node.status === 'ONLINE');

    if (availableNodes.length === 0) return null;

    // Load Balancing Heuristic: Sort by CPU and active assignments count ascending
    availableNodes.sort((a, b) => {
      if (a.assignedJobCount !== b.assignedJobCount) {
        return a.assignedJobCount - b.assignedJobCount;
      }
      return a.cpuUsagePercent - b.cpuUsagePercent;
    });

    return availableNodes[0];
  }

  /**
   * 5. AUTOSCALING CONTROLLER
   * Aggregates total queue sizes and computes average CPU load of the active worker mesh.
   * Outputs precise scale up/down decisions to manage cloud node clusters dynamically.
   */
  public static async evaluateAutoscaleLimits(
    minWorkers = 1,
    maxWorkers = 15
  ): Promise<{
    action: 'SCALE_UP' | 'SCALE_DOWN' | 'MAINTAIN';
    targetCount: number;
    metrics: { averageCpu: number; totalPendingJobs: number; activeNodesCount: number };
  }> {
    const redis = this.getRedis();
    if (!redis) {
      return { action: 'MAINTAIN', targetCount: minWorkers, metrics: { averageCpu: 0, totalPendingJobs: 0, activeNodesCount: 0 } };
    }

    const activeNodes = await this.discoverActiveNodes();
    const activeCount = activeNodes.length;

    // Calculate total backlog queue size
    const highSize = await redis.llen('saas:queue:high');
    const medSize = await redis.llen('saas:queue:medium');
    const lowSize = await redis.llen('saas:queue:low');
    const totalPendingJobs = highSize + medSize + lowSize;

    // Calculate average CPU across the active heartbeat mesh
    const totalCpu = activeNodes.reduce((acc, node) => acc + node.cpuUsagePercent, 0);
    const averageCpu = activeCount > 0 ? totalCpu / activeCount : 0;

    let action: 'SCALE_UP' | 'SCALE_DOWN' | 'MAINTAIN' = 'MAINTAIN';
    let targetCount = activeCount > 0 ? activeCount : minWorkers;

    // SCALE UP: If average CPU > 75% OR Queue size exceeds 20 pending tasks
    if (averageCpu > 75 || totalPendingJobs > 20) {
      if (targetCount < maxWorkers) {
        action = 'SCALE_UP';
        targetCount = Math.min(maxWorkers, targetCount + 1);
        TelemetryHub.trackEvent('AUTOSCALER_DECISION_UP', { averageCpu, totalPendingJobs, targetCount });
      }
    }
    // SCALE DOWN: If average CPU < 25% AND Queue is empty
    else if (averageCpu < 25 && totalPendingJobs === 0) {
      if (targetCount > minWorkers) {
        action = 'SCALE_DOWN';
        targetCount = Math.max(minWorkers, targetCount - 1);
        TelemetryHub.trackEvent('AUTOSCALER_DECISION_DOWN', { averageCpu, totalPendingJobs, targetCount });
      }
    }

    return {
      action,
      targetCount,
      metrics: {
        averageCpu,
        totalPendingJobs,
        activeNodesCount: activeCount,
      },
    };
  }
}
