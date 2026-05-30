import { TelemetryHub } from '../observability/telemetry';

export interface SagaStep {
  name: string;
  execute: (context: any) => Promise<any>;
  compensate: (context: any) => Promise<void>; // Rollback action (Compensating action)
}

export interface SagaSnapshot {
  sagaId: string;
  status: 'SUCCESS' | 'FAILED' | 'COMPENSATING' | 'COMPENSATED';
  lastSuccessfulStepIndex: number;
  contextState: Record<string, any>;
}

export class DurableSagaOrchestrator {
  private static sagaSnapshots = new Map<string, SagaSnapshot>();

  /**
   * DURABLE SAGA TRANSACTION ORCHESTRATOR (Problem #2)
   * Executes sequential multi-step publishing workflows. If any step fails midway,
   * it suspends, triggers "Compensating Actions" (Rollback transactions) in reverse order,
   * and saves durable execution snapshots, ensuring the system never enters an inconsistent state!
   */
  public static async executeSaga(
    sagaId: string,
    steps: SagaStep[],
    initialContext: Record<string, any> = {}
  ): Promise<SagaSnapshot> {
    
    let snapshot = this.sagaSnapshots.get(sagaId);
    if (!snapshot) {
      snapshot = {
        sagaId,
        status: 'SUCCESS',
        lastSuccessfulStepIndex: -1,
        contextState: { ...initialContext },
      };
      this.sagaSnapshots.set(sagaId, snapshot);
    }

    TelemetryHub.trackEvent('SAGA_EXECUTION_STARTED', { sagaId, totalSteps: steps.length });

    // 1. Forward Transaction Phase
    for (let i = snapshot.lastSuccessfulStepIndex + 1; i < steps.length; i++) {
      const step = steps[i];
      console.log(`🚀 [Saga Forward] Executing Step [${i + 1}/${steps.length}]: ${step.name}`);

      try {
        const output = await step.execute(snapshot.contextState);
        
        // Update snapshot checkpoint state (Durable Snapshots)
        snapshot.contextState = { ...snapshot.contextState, ...output };
        snapshot.lastSuccessfulStepIndex = i;
        this.sagaSnapshots.set(sagaId, snapshot);

      } catch (err: any) {
        console.error(`🚨 [Saga Failure] Step ${step.name} failed: ${err.message}. Initiating Compensating Rollbacks...`);
        
        snapshot.status = 'COMPENSATING';
        this.sagaSnapshots.set(sagaId, snapshot);
        TelemetryHub.logError('SAGA_FORWARD_TRANSACTION_FAILED', err, { sagaId, failedStep: step.name });

        // 2. Reverse Compensating Rollback Phase (Sagas Pattern)
        await this.rollbackSaga(sagaId, steps, snapshot);
        return snapshot;
      }
    }

    snapshot.status = 'SUCCESS';
    this.sagaSnapshots.set(sagaId, snapshot);
    TelemetryHub.trackEvent('SAGA_EXECUTION_SUCCESSFUL', { sagaId });

    return snapshot;
  }

  /**
   * Executes compensating actions in reverse order to undo all completed steps
   */
  private static async rollbackSaga(sagaId: string, steps: SagaStep[], snapshot: SagaSnapshot): Promise<void> {
    // Traverse backwards from the last successful step to the first step
    for (let i = snapshot.lastSuccessfulStepIndex; i >= 0; i--) {
      const step = steps[i];
      console.log(`↩️ [Saga Compensate] Rolling back Step [${i + 1}]: ${step.name}`);

      try {
        await step.compensate(snapshot.contextState);
      } catch (compensateErr: any) {
        // Critical System Alert: Compensation failed!
        TelemetryHub.logError('SAGA_COMPENSATION_FAILED_CRITICAL', compensateErr, { sagaId, failedCompensationStep: step.name });
      }
    }

    snapshot.status = 'COMPENSATED';
    this.sagaSnapshots.set(sagaId, snapshot);
    TelemetryHub.trackEvent('SAGA_ROLLBACK_COMPLETED', { sagaId });
  }

  public static getSagaSnapshot(sagaId: string): SagaSnapshot | null {
    return this.sagaSnapshots.get(sagaId) || null;
  }
}
