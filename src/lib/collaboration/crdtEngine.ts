import IORedis from 'ioredis';
import { PageBuilderSchema } from '../../types/builder';
import { TelemetryHub } from '../observability/telemetry';

export interface VectorClock {
  [actorId: string]: number; // Logical sequence clock per peer actor
}

export interface PeerAwarenessState {
  actorId: string;
  userName: string;
  color: string;
  cursor: { x: number; y: number };
  activeBlockId: string | null;
  lastUpdated: number;
}

export interface CompactCRDTOperation {
  blockId: string;
  field: string;
  value: any;
  timestamp: number; // Physical unix epoch timestamp
  clock: VectorClock; // Logical Lamport Vector clock
  actorId: string;
}

export class CRDTEngine {
  private static redisClient: IORedis | null = null;

  // Redis Key naming conventions
  private static CLOCKS_PREFIX = 'saas:crdt:clocks:';
  private static OFFLINE_LOGS_PREFIX = 'saas:crdt:offlinelogs:';
  private static AWARENESS_HASH_KEY = 'saas:crdt:awareness';

  // Resilient local memory fallbacks for serverless environments when Redis is offline
  private static localClocksFallback = new Map<string, Record<string, VectorClock>>();
  private static localOfflineLogsFallback: CompactCRDTOperation[] = [];
  private static localAwarenessFallback = new Map<string, PeerAwarenessState>();

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
      console.warn('[CRDT Redis] Initialization failed, operating in memory fallback:', err);
      return null;
    }
  }

  /**
   * 1. AWARENESS PROTOCOL (Serverless & Distributed Safe)
   * Broadcasts and registers peer state (presence, mouse cursor, typing, selection) in shared Redis
   */
  public static async updatePeerAwareness(actorId: string, state: Omit<PeerAwarenessState, 'lastUpdated'>): Promise<void> {
    const redis = this.getRedis();
    const node: PeerAwarenessState = {
      ...state,
      lastUpdated: Date.now(),
    };

    if (redis) {
      try {
        await redis.hset(this.AWARENESS_HASH_KEY, actorId, JSON.stringify(node));
        return;
      } catch (err) {
        console.warn('[CRDT Awareness] Redis write failed, checking local memory:', err);
      }
    }

    this.localAwarenessFallback.set(actorId, node);
  }

  /**
   * Retrieves all active collaborators across all distributed stateless servers
   */
  public static async getActiveAwarenessList(): Promise<PeerAwarenessState[]> {
    const redis = this.getRedis();
    const now = Date.now();
    const active: PeerAwarenessState[] = [];

    if (redis) {
      try {
        const rawList = await redis.hgetall(this.AWARENESS_HASH_KEY);
        for (const [actorId, rawData] of Object.entries(rawList)) {
          const state: PeerAwarenessState = JSON.parse(rawData);
          // Heartbeat check: Keep only active peers within last 10 seconds
          if (now - state.lastUpdated < 10000) {
            active.push(state);
          } else {
            await redis.hdel(this.AWARENESS_HASH_KEY, actorId); // Evict stale peer node
          }
        }
        return active;
      } catch (err) {
        console.warn('[CRDT Awareness] Redis fetch failed, checking local fallback:', err);
      }
    }

    for (const [actorId, state] of this.localAwarenessFallback.entries()) {
      if (now - state.lastUpdated < 10000) {
        active.push(state);
      } else {
        this.localAwarenessFallback.delete(actorId);
      }
    }

    return active;
  }

  /**
   * 2. SLIDING-WINDOW OPERATION COMPRESSION
   * Compresses consecutive, redundant updates to the exact same block field (e.g. cursor dragging coordinates)
   * into a single compact state update, avoiding network pipeline congestion.
   */
  public static compressOperations(ops: CompactCRDTOperation[]): CompactCRDTOperation[] {
    const compressedMap = new Map<string, CompactCRDTOperation>();

    ops.forEach((op) => {
      const uniqueKey = `${op.blockId}:${op.field}:${op.actorId}`;
      const existing = compressedMap.get(uniqueKey);

      if (!existing) {
        compressedMap.set(uniqueKey, op);
      } else {
        const clockComparison = this.compareVectorClocks(op.clock, existing.clock);
        
        if (clockComparison === 'DOMINATES' || (clockComparison === 'CONCURRENT' && op.timestamp > existing.timestamp)) {
          compressedMap.set(uniqueKey, op);
        }
      }
    });

    return Array.from(compressedMap.values());
  }

  /**
   * 3. STATEFUL DISTRIBUTED CONFLICT RESOLUTION (Redis Persisted)
   * Resolves concurrent edits using Lamport Vector Clocks and Last-Write-Wins (LWW).
   * Persists the logical clocks state to Redis to survive stateless serverless shutdowns.
   */
  public static async reconcileOperation(
    schema: PageBuilderSchema,
    op: CompactCRDTOperation
  ): Promise<{ schema: PageBuilderSchema; applied: boolean }> {
    const { blockId, field, value, clock, timestamp } = op;
    const block = schema.blocks[blockId];
    if (!block) return { schema, applied: false };

    const redis = this.getRedis();
    let currentClocksMap: Record<string, VectorClock> = {};

    // Retrieve previous clocks from Redis
    if (redis) {
      try {
        const cachedClocks = await redis.hget(`${this.CLOCKS_PREFIX}${blockId}`, field);
        if (cachedClocks) {
          currentClocksMap[field] = JSON.parse(cachedClocks);
        }
      } catch (err) {
        console.warn('[CRDT Reconcile] Redis read failed, checking memory fallback:', err);
      }
    }

    // Fall back to local memory clock if Redis went down or is offline
    if (!currentClocksMap[field]) {
      const memClocks = this.localClocksFallback.get(blockId) || {};
      currentClocksMap[field] = memClocks[field] || {};
    }

    const currentClock = currentClocksMap[field] || {};
    const clockRelation = this.compareVectorClocks(clock, currentClock);

    // If incoming vector clock dominates, or if concurrent and incoming physical timestamp is newer:
    const lastTimestamp = (currentClock as any)._timestamp || 0;
    if (clockRelation === 'DOMINATES' || (clockRelation === 'CONCURRENT' && timestamp > lastTimestamp)) {
      // Apply modification
      (block as any)[field] = JSON.parse(JSON.stringify(value));
      
      const nextClockState = { ...clock, _timestamp: timestamp };

      // Persist clocks to Redis
      if (redis) {
        try {
          await redis.hset(`${this.CLOCKS_PREFIX}${blockId}`, field, JSON.stringify(nextClockState));
        } catch (err) {
          console.warn('[CRDT Reconcile] Redis write failed:', err);
        }
      }

      // Sync local fallback cache
      const memClocks = this.localClocksFallback.get(blockId) || {};
      memClocks[field] = nextClockState as any;
      this.localClocksFallback.set(blockId, memClocks);

      return { schema, applied: true };
    }

    return { schema, applied: false };
  }

  /**
   * 4. OFFLINE SYNC RECONCILIATION
   * Reconciles locally buffered offline changes once connection is restored,
   * compressing operations and executing them sequentially in chronological order.
   */
  public static async syncOfflineLogs(
    schema: PageBuilderSchema,
    remoteLogs: CompactCRDTOperation[]
  ): Promise<PageBuilderSchema> {
    const redis = this.getRedis();
    let localLogs: CompactCRDTOperation[] = [];

    // Pull local pending offline logs from Redis list
    if (redis) {
      try {
        const redisLogs = await redis.lrange(`${this.OFFLINE_LOGS_PREFIX}${schema.pageId}`, 0, -1);
        localLogs = redisLogs.map((l) => JSON.parse(l));
      } catch (err) {
        console.warn('[CRDT Sync] Redis logs fetch failed, checking local memory fallback:', err);
      }
    }

    if (localLogs.length === 0) {
      localLogs = [...this.localOfflineLogsFallback];
    }

    const unifiedLogs = [...localLogs, ...remoteLogs];
    const compressedLogs = this.compressOperations(unifiedLogs);

    let reconciledSchema = { ...schema };

    // Apply operations sequentially
    compressedLogs.sort((a, b) => a.timestamp - b.timestamp);
    for (const op of compressedLogs) {
      const result = await this.reconcileOperation(reconciledSchema, op);
      reconciledSchema = result.schema;
    }

    // Clear resolved logs
    if (redis) {
      try {
        await redis.del(`${this.OFFLINE_LOGS_PREFIX}${schema.pageId}`);
      } catch (err) {
        console.warn('[CRDT Sync] Redis clean failed:', err);
      }
    }
    this.localOfflineLogsFallback = [];

    return reconciledSchema;
  }

  /**
   * Buffers local modifications to the offline queue
   */
  public static async bufferOfflineOperation(pageId: string, op: CompactCRDTOperation): Promise<void> {
    const redis = this.getRedis();
    if (redis) {
      try {
        await redis.lpush(`${this.OFFLINE_LOGS_PREFIX}${pageId}`, JSON.stringify(op));
        return;
      } catch (err) {
        console.warn('[CRDT Buffer] Redis write failed, checking local fallback:', err);
      }
    }

    this.localOfflineLogsFallback.push(op);
  }

  /**
   * Vector Clock comparator utility
   */
  private static compareVectorClocks(
    clockA: VectorClock,
    clockB: VectorClock
  ): 'DOMINATES' | 'SUBMISSIVE' | 'CONCURRENT' {
    let aGreater = false;
    let bGreater = false;

    const keysA = Object.keys(clockA).filter((k) => k !== '_timestamp');
    const keysB = Object.keys(clockB).filter((k) => k !== '_timestamp');
    const allKeys = new Set([...keysA, ...keysB]);

    for (const key of allKeys) {
      const valA = clockA[key] || 0;
      const valB = clockB[key] || 0;

      if (valA > valB) aGreater = true;
      if (valB > valA) bGreater = true;
    }

    if (aGreater && !bGreater) return 'DOMINATES';
    if (bGreater && !aGreater) return 'SUBMISSIVE';
    return 'CONCURRENT';
  }
}
