import { DistributedWorkerRuntime } from './lib/publishing/queue';
import { StalledJobRecoveryManager } from './lib/publishing/stalledJobRecovery';
import { WorkerFleetManager } from './lib/publishing/workerFleet';
import { TelemetryHub } from './lib/observability/telemetry';

/**
 * 🎪 ENTERPRISE SAAS SYSTEM BOOTSTRAPPER (المحرك الرئيسي والمنظم الموزع للمنصة)
 * 
 * This is the central execution file that boots up the distributed background infrastructure:
 * 1. Spawns the Concurrent Background Workers (to compile JSON -> AST -> HTML/CSS).
 * 2. Spawns the Stalled Job Recovery Daemon (to automatically recover crashed worker jobs).
 * 3. Starts the Distributed Worker Heartbeat System (for auto-discovery and node balancing).
 * 4. Begins the Automated Autoscaler Evaluator loop.
 */
async function bootstrap() {
  console.log('🏁 Starting Enterprise SaaS Landing Page Builder Platform Core...');

  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  const workerId = `node_worker_container_${Math.floor(Math.random() * 1000)}`;

  // 1. Start the Distributed Worker Fleet Heartbeat Loop (Registers this container to the cluster)
  console.log(`📡 Registering distributed node heartbeat for: ${workerId}`);
  setInterval(async () => {
    // Simulate reading current CPU & Memory stats
    const mockCpu = Math.floor(Math.random() * 40) + 10; // 10% - 50% CPU
    const mockMemory = Math.floor(Math.random() * 200) + 150; // 150MB - 350MB Ram
    
    // Call the correct heartbeat registration method of our updated Fleet Manager
    await WorkerFleetManager.pingHeartbeat(workerId, mockCpu, mockMemory, 0, 'ONLINE');
  }, 3000); // Send heartbeat every 3 seconds

  // 2. Start the Distributed Job Recovery Daemon (Visibility Timeout Guard)
  // Automatically detects and recovers crashed workers every 15 seconds
  StalledJobRecoveryManager.startDaemon(15000);

  // 3. Start the Dedicated Worker Fleet Autoscaling Evaluation Loop
  setInterval(async () => {
    const scaleReport = await WorkerFleetManager.evaluateAutoscaleLimits();
    if (scaleReport.action !== 'MAINTAIN') {
      console.log(`📈 [Autoscaler Action] Triggered: ${scaleReport.action} | Target Node Count: ${scaleReport.targetCount} | CPU Average: ${scaleReport.metrics.averageCpu}% | Backlog Queue: ${scaleReport.metrics.totalPendingJobs}`);
    }
  }, 10000); // Check autoscaling metrics every 10 seconds

  // 4. Spawn Concurrent Background Workers to pop and process publishing jobs
  // Concurrency: 2 simultaneous worker threads per container
  DistributedWorkerRuntime.start(REDIS_URL, 2);

  TelemetryHub.trackEvent('PLATFORM_BOOTSTRAP_SUCCESSFUL', {
    nodeId: workerId,
    redisTarget: REDIS_URL,
    concurrencyPerNode: 2,
    heartbeatIntervalMs: 3000,
    recoveryIntervalMs: 15000,
  });

  console.log('🚀 Platform core successfully initialized and listening for event queue requests.');
}

bootstrap().catch((err) => {
  console.error('❌ Critical system failure during platform bootstrap:', err);
  process.exit(1);
});
