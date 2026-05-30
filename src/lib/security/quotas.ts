import { Plan } from '@prisma/client';
import prisma from '../../lib/db/prisma';
import { TelemetryHub } from '../observability/telemetry';

export interface PlanLimits {
  maxWebsites: number;
  maxStorageBytes: number;
}

export const PLAN_LIMITS_MAP: Record<Plan, PlanLimits> = {
  FREE: {
    maxWebsites: 1,
    maxStorageBytes: 10 * 1024 * 1024,
  },
  PRO: {
    maxWebsites: 10,
    maxStorageBytes: 1 * 1024 * 1024 * 1024,
  },
  ENTERPRISE: {
    maxWebsites: 9999,
    maxStorageBytes: 100 * 1024 * 1024 * 1024,
  },
};

export class SubscriptionQuotaGuard {
  /**
   * SUBSCRIPTION PLAN QUOTA GUARD (Problem #2)
   * Verifies if a user has exceeded their plan's limits (websites count or asset storage size)
   * before allowing new resource allocations, protecting the infrastructure from abuse.
   */
  public static async verifyWebsiteQuota(userId: string): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
    try {
      // 1. Fetch user's subscription profile via single Prisma client (Optimization #3)
      const profile = await prisma.userProfile.findUnique({
        where: { id: userId },
      });

      if (!profile) {
        return { allowed: false, currentCount: 0, limit: 0 };
      }

      // 2. Count current active websites
      const currentCount = await prisma.website.count({
        where: { userId: userId },
      });

      const limits = PLAN_LIMITS_MAP[profile.plan];

      if (currentCount >= limits.maxWebsites) {
        TelemetryHub.trackEvent('SUBSCRIPTION_QUOTA_EXCEEDED', { userId, plan: profile.plan, currentCount, limit: limits.maxWebsites });
        return { allowed: false, currentCount, limit: limits.maxWebsites };
      }

      return { allowed: true, currentCount, limit: limits.maxWebsites };

    } catch (err: any) {
      TelemetryHub.logError('QUOTA_GUARD_VERIFICATION_FAILED', err, { userId });
      return { allowed: false, currentCount: 0, limit: 0 };
    }
  }

  /**
   * Verifies if a user has enough storage bytes left under their plan for an asset upload
   */
  public static async verifyStorageQuota(userId: string, incomingAssetSizeBytes: number): Promise<{ allowed: boolean; currentBytes: bigint; limitBytes: number }> {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { id: userId },
      });

      if (!profile) {
        return { allowed: false, currentBytes: BigInt(0), limitBytes: 0 };
      }

      const limits = PLAN_LIMITS_MAP[profile.plan];
      const currentStorageUsed = profile.usageStorageBytes;

      const projectedTotalBytes = currentStorageUsed + BigInt(incomingAssetSizeBytes);

      if (projectedTotalBytes > BigInt(limits.maxStorageBytes)) {
        TelemetryHub.trackEvent('STORAGE_QUOTA_EXCEEDED', { userId, plan: profile.plan, currentStorage: currentStorageUsed.toString(), limit: limits.maxStorageBytes });
        return { allowed: false, currentBytes: currentStorageUsed, limitBytes: limits.maxStorageBytes };
      }

      return { allowed: true, currentBytes: currentStorageUsed, limitBytes: limits.maxStorageBytes };

    } catch (err: any) {
      TelemetryHub.logError('STORAGE_QUOTA_GUARD_FAILED', err, { userId });
      return { allowed: false, currentBytes: BigInt(0), limitBytes: 0 };
    }
  }
}
