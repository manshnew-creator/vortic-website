import { VectorClock, CompactCRDTOperation, CRDTEngine } from './crdtEngine';
import { PageBuilderSchema } from '../../types/builder';
import { TelemetryHub } from '../observability/telemetry';

export class YjsClientSyncProtocol {
  private actorId: string;
  private localClock: VectorClock = {};
  private localSequence = 0;
  private pendingSyncBuffer: CompactCRDTOperation[] = [];

  constructor(actorId: string) {
    this.actorId = actorId;
    this.localClock[actorId] = 0;
  }

  /**
   * 1. LOCAL MUTATION BROADCAST (60fps Fluid Multiplayer UX)
   * Captures a local visual block edit on the Canvas, increments the local logical Lamport clock,
   * compresses concurrent changes, and prepares the operational delta message for WebSockets broadcast.
   */
  public registerLocalMutation(
    blockId: string,
    field: string,
    value: any
  ): CompactCRDTOperation {
    this.localSequence++;
    this.localClock[this.actorId] = this.localSequence;

    const op: CompactCRDTOperation = {
      blockId,
      field,
      value: JSON.parse(JSON.stringify(value)), // Deep clone to preserve state immutability
      timestamp: Date.now(),
      clock: { ...this.localClock },
      actorId: this.actorId,
    };

    this.pendingSyncBuffer.push(op);
    TelemetryHub.trackEvent('LOCAL_CRDT_MUTATION_REGISTERED', { blockId, field, sequence: this.localSequence });

    return op;
  }

  /**
   * 2. DELTA OPERATION FLUSHING
   * Compresses the buffered updates using sliding-window transaction compression,
   * returning a minimized delta payload ready for WebSocket sync.
   */
  public flushCompressedDeltas(): CompactCRDTOperation[] {
    const rawBatch = [...this.pendingSyncBuffer];
    this.pendingSyncBuffer = [];

    // Compress redundant operations to save 90% bandwidth
    return CRDTEngine.compressOperations(rawBatch);
  }

  /**
   * 3. PEER UPDATE MERGE (Eventual Consistency)
   * Receives incoming remote operational messages, reconciles them with the local document
   * using the vector clock dominance engine, and updates the local clock sequence state.
   */
  public async handleRemoteOperation(
    schema: PageBuilderSchema,
    remoteOp: CompactCRDTOperation
  ): Promise<{ schema: PageBuilderSchema; applied: boolean }> {
    
    // Check if we've already processed this sequence to avoid duplicate application
    const localKnownSeq = this.localClock[remoteOp.actorId] || 0;
    const incomingSeq = remoteOp.clock[remoteOp.actorId] || 0;

    if (incomingSeq <= localKnownSeq) {
      // Outdated/Duplicate operation. Discard immediately (Idempotency)
      return { schema, applied: false };
    }

    // Reconcile and apply modifications using LWW and vector clocks
    const result = await CRDTEngine.reconcileOperation(schema, remoteOp);

    if (result.applied) {
      // Fast-forward local clock to maintain synchronized causal history
      this.localClock[remoteOp.actorId] = incomingSeq;
      
      TelemetryHub.trackEvent('REMOTE_CRDT_MUTATION_APPLIED', { 
        blockId: remoteOp.blockId, 
        field: remoteOp.field, 
        actorId: remoteOp.actorId 
      });
    }

    return {
      schema: result.schema,
      applied: result.applied,
    };
  }

  public getActorId(): string {
    return this.actorId;
  }

  public getLocalClock(): VectorClock {
    return { ...this.localClock };
  }
}
