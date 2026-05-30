import prisma from '../../lib/db/prisma';
import { TelemetryHub } from '../observability/telemetry';
import { PageBuilderSchema } from '../../types/builder';

export class VersionRollbackEngine {
  /**
   * ROLLBACK & REVERT ENGINE (Problem #1)
   * Restores a previously published or drafted page version from the PageVersion history log.
   * Fetches the historical JSON schema, updates the Page content, and increments the Page's optimistic lock.
   */
  public static async rollbackPageToVersion(
    pageId: string,
    versionNumber: number,
    actorUserId: string
  ): Promise<{ success: boolean; rolledBackVersion: number; nextOptimisticVersion: number; schema: PageBuilderSchema }> {
    
    try {
      // 1. Fetch the target historical version log inside PostgreSQL (Optimization #3)
      const historicalVersion = await prisma.pageVersion.findFirst({
        where: {
          pageId: pageId,
          version: versionNumber,
        },
        include: {
          page: true,
        }
      });

      if (!historicalVersion) {
        throw new Error(`Page version ${versionNumber} not found in the historical logs.`);
      }

      // 2. Enforce Tenant isolation
      const website = await prisma.website.findUnique({
        where: { id: historicalVersion.page.websiteId }
      });

      if (!website || website.userId !== actorUserId) {
        throw new Error('Unauthorized rollback attempt. Tenant isolation violation.');
      }

      const rolledBackSchema = historicalVersion.content as unknown as PageBuilderSchema;
      const nextOptimisticLockVersion = historicalVersion.page.version + 1;

      // 3. Perform atomic Database Transaction to execute rollback safely via single Prisma client
      await prisma.$transaction(async (tx) => {
        await tx.page.update({
          where: { id: pageId },
          data: {
            content: historicalVersion.content as any,
            title: historicalVersion.page.title,
            version: nextOptimisticLockVersion,
            updatedAt: new Date(),
          }
        });

        await tx.pageVersion.create({
          data: {
            pageId: pageId,
            content: historicalVersion.content as any,
            version: nextOptimisticLockVersion,
            createdBy: `ROLLBACK_ACTOR_${actorUserId}`,
          }
        });
      });

      TelemetryHub.trackEvent('PAGE_VERSION_ROLLBACK_SUCCESSFUL', { pageId, versionNumber, nextOptimisticLockVersion });

      return {
        success: true,
        rolledBackVersion: versionNumber,
        nextOptimisticVersion: nextOptimisticLockVersion,
        schema: rolledBackSchema,
      };

    } catch (err: any) {
      TelemetryHub.logError('PAGE_VERSION_ROLLBACK_FAILED', err, { pageId, versionNumber });
      throw err;
    }
  }
}
