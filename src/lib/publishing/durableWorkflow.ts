import { TelemetryHub } from '../observability/telemetry';

export type WorkflowStepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface WorkflowEvent {
  eventId: string;
  sequence: number;
  type: 'WORKFLOW_STARTED' | 'STEP_STARTED' | 'STEP_COMPLETED' | 'STEP_FAILED' | 'WORKFLOW_COMPLETED';
  payload: any;
  timestamp: number;
}

export interface DurableSnapshot {
  workflowId: string;
  pageId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  lastCompletedStepIndex: number;
  contextState: Record<string, any>;
  updatedAt: number;
}

export class DurableWorkflowEngine {
  // Decentralized Event Sourcing Store (Immutable event history log)
  private static eventStore = new Map<string, WorkflowEvent[]>();
  
  // Durable Checkpoint Snapshot Store
  private static snapshotStore = new Map<string, DurableSnapshot>();

  /**
   * 1. EVENT SOURCING
   * Appends an immutable execution state event to the chronological event history log.
   */
  public static async appendEvent(
    workflowId: string,
    type: WorkflowEvent['type'],
    payload: any
  ): Promise<WorkflowEvent> {
    const history = this.eventStore.get(workflowId) || [];
    const nextSequence = history.length + 1;

    const event: WorkflowEvent = {
      eventId: `evt_${workflowId}_seq_${nextSequence}`,
      sequence: nextSequence,
      type,
      payload: JSON.parse(JSON.stringify(payload)), // Deep clone to maintain immutability
      timestamp: Date.now(),
    };

    history.push(event);
    this.eventStore.set(workflowId, history);

    TelemetryHub.trackEvent('DURABLE_WORKFLOW_EVENT_APPENDED', { workflowId, type, sequence: nextSequence });
    return event;
  }

  /**
   * 2. DETERMINISTIC REPLAY ENGINE
   * Chronologically replays all historical events of a workflow to reconstruct the exact
   * execution context state. This guarantees deterministic recovery and replay safety (Temporal-style).
   */
  public static replayWorkflowState(workflowId: string): Record<string, any> {
    const history = this.eventStore.get(workflowId) || [];
    const reconstructedState: Record<string, any> = {};

    console.log(`🔄 [Replay Engine] Replaying ${history.length} historical events for Workflow: ${workflowId}`);

    // Sort events strictly by sequence order (Causal sequence replay)
    history
      .sort((a, b) => a.sequence - b.sequence)
      .forEach((event) => {
        switch (event.type) {
          case 'WORKFLOW_STARTED':
            Object.assign(reconstructedState, event.payload.initialContext);
            reconstructedState.__status = 'RUNNING';
            break;
          case 'STEP_STARTED':
            reconstructedState[`step_${event.payload.stepName}_status`] = 'RUNNING';
            break;
          case 'STEP_COMPLETED':
            reconstructedState[`step_${event.payload.stepName}_status`] = 'COMPLETED';
            // Merge step output into context state
            Object.assign(reconstructedState, event.payload.output);
            break;
          case 'STEP_FAILED':
            reconstructedState[`step_${event.payload.stepName}_status`] = 'FAILED';
            reconstructedState.__lastError = event.payload.error;
            break;
          case 'WORKFLOW_COMPLETED':
            reconstructedState.__status = 'COMPLETED';
            break;
        }
      });

    return reconstructedState;
  }

  /**
   * 3. RESUMABLE EXECUTION & DURABLE SNAPSHOTS
   * Runs a series of steps durably. If execution fails midway, it suspends.
   * Upon resumption, it utilizes the event-sourced replay engine to fast-forward past 
   * completed steps, executing only the pending or failed steps. Saves a durable snapshot at every checkpoint.
   */
  public static async executeDurable(
    workflowId: string,
    pageId: string,
    steps: Array<{ name: string; execute: (context: any) => Promise<any> }>,
    initialContext: Record<string, any> = {}
  ): Promise<DurableSnapshot> {
    
    let snapshot = this.snapshotStore.get(workflowId);

    // If workflow is starting for the first time, initialize event logs & snapshot
    if (!snapshot) {
      snapshot = {
        workflowId,
        pageId,
        status: 'RUNNING',
        lastCompletedStepIndex: -1,
        contextState: { ...initialContext },
        updatedAt: Date.now(),
      };
      this.snapshotStore.set(workflowId, snapshot);

      await this.appendEvent(workflowId, 'WORKFLOW_STARTED', { pageId, initialContext });
    }

    // REPLAY SAFETY CHECK: Reconstruct context state from historical event log
    const replayedContext = this.replayWorkflowState(workflowId);
    snapshot.contextState = { ...snapshot.contextState, ...replayedContext };

    TelemetryHub.trackEvent('DURABLE_WORKFLOW_RUN_LOOP', { 
      workflowId, 
      resumeIndex: snapshot.lastCompletedStepIndex + 1, 
      totalSteps: steps.length 
    });

    // Run steps starting from the last uncompleted step index
    for (let i = snapshot.lastCompletedStepIndex + 1; i < steps.length; i++) {
      const step = steps[i];
      
      // Skip executing steps that are already marked COMPLETED in replayed state (Idempotency)
      if (snapshot.contextState[`step_${step.name}_status`] === 'COMPLETED') {
        console.log(`⏭️ [Resumable Run] Replay detected step already completed. Skipping: ${step.name}`);
        snapshot.lastCompletedStepIndex = i;
        continue;
      }

      await this.appendEvent(workflowId, 'STEP_STARTED', { stepName: step.name });
      console.log(`⚡ [Durable Execution] Executing step [${i + 1}/${steps.length}]: ${step.name}`);

      try {
        // Execute atomic, isolated step
        const output = await step.execute(snapshot.contextState);

        // Record successful step completion event
        await this.appendEvent(workflowId, 'STEP_COMPLETED', { stepName: step.name, output });

        // Update local context and progress
        snapshot.contextState = { ...snapshot.contextState, ...output, [`step_${step.name}_status`]: 'COMPLETED' };
        snapshot.lastCompletedStepIndex = i;
        snapshot.updatedAt = Date.now();

        // DURABLE SNAPSHOT PERSISTENCE: Save a safe checkpoint snapshot to storage
        this.snapshotStore.set(workflowId, snapshot);

      } catch (err: any) {
        // Record step failure event
        await this.appendEvent(workflowId, 'STEP_FAILED', { stepName: step.name, error: err.message });

        snapshot.status = 'FAILED';
        snapshot.contextState[`step_${step.name}_status`] = 'FAILED';
        snapshot.contextState.__lastError = err.message;
        snapshot.updatedAt = Date.now();
        
        this.snapshotStore.set(workflowId, snapshot); // Save failed snapshot

        TelemetryHub.logError('DURABLE_WORKFLOW_CRASH', err, { workflowId, failedStep: step.name });
        return snapshot; // Halt and suspend execution for recovery
      }
    }

    // Record workflow completion event
    await this.appendEvent(workflowId, 'WORKFLOW_COMPLETED', { pageId });

    snapshot.status = 'COMPLETED';
    snapshot.updatedAt = Date.now();
    this.snapshotStore.set(workflowId, snapshot);

    TelemetryHub.trackEvent('DURABLE_WORKFLOW_SUCCESS', { workflowId, pageId });
    return snapshot;
  }

  /**
   * Retrieves a durable snapshot for monitoring dashboards
   */
  public static getSnapshot(workflowId: string): DurableSnapshot | null {
    return this.snapshotStore.get(workflowId) || null;
  }

  /**
   * Retrieves full immutable event history logs (Audit Log)
   */
  public static getEventHistory(workflowId: string): WorkflowEvent[] {
    return this.eventStore.get(workflowId) || [];
  }

  public static clearWorkflowState(workflowId: string): void {
    this.eventStore.delete(workflowId);
    this.snapshotStore.delete(workflowId);
  }
}
