import prisma from '../db/prisma';
import { TelemetryHub } from '../observability/telemetry';
import { generateSecureId } from './uuid';

export interface ViralReferral {
  referralId: string;
  referrerUserId: string;
  refereeUserId: string;
  rewardClaimed: boolean;
  createdAt: number;
}

export class SaaSReferralEngine {
  
  /**
   * 1. VIRAL ATTRIBUTION TRACKER (Stage 7)
   * Tracks and attributes viral signups originating from the "Made with [Platform]" badges
   * embedded on all published client landing pages.
   * This is the single most powerful self-sustaining organic growth engine (PLG Loop)!
   */
  public static async trackBadgeClick(
    visitorId: string,
    originWebsiteId: string
  ): Promise<void> {
    TelemetryHub.trackEvent('VIRAL_BADGE_CLICKED', {
      visitorId,
      originWebsiteId,
      timestamp: Date.now(),
    });
  }

  /**
   * 2. AUTOMATED REWARD DISPATCHER
   * Processes a new user registration via a referral token.
   * Automatically grants rewards (e.g. 1 month of free PRO subscription)
   * to both the referrer and the referee, updating the database records via centralized Prisma client.
   */
  public static async processReferralSignup(
    newUserId: string,
    referralToken: string // The unique referral code containing the referrer's ID
  ): Promise<{ success: boolean; rewardedReferrerId?: string }> {
    
    try {
      // Decode the referral token (for simplicity, we assume token is "ref_[referrerUserId]")
      if (!referralToken.startsWith('ref_')) {
        return { success: false };
      }

      const referrerUserId = referralToken.replace('ref_', '');

      // Check if referrer exists to prevent fraud
      const referrer = await prisma.userProfile.findUnique({
        where: { id: referrerUserId },
      });

      if (!referrer) {
        return { success: false };
      }

      const referralId = generateSecureId('ref_log');

      // 3. SECURE TRANSACTIONAL REWARDS ALLOCATION
      // Extends the subscription period of BOTH users inside a safe DB Transaction
      await prisma.$transaction(async (tx) => {
        
        // A. Extend Referrer's subscription by 30 days
        const referrerCurrentEnd = referrer.currentPeriodEnd || new Date();
        const nextReferrerPeriodEnd = new Date(referrerCurrentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);

        await tx.userProfile.update({
          where: { id: referrerUserId },
          data: {
            currentPeriodEnd: nextReferrerPeriodEnd,
            plan: 'PRO', // Upgrade to PRO as a loyalty reward
          },
        });

        // B. Extend Referee's (new user's) subscription by 30 days as a signup incentive
        const nextRefereePeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await tx.userProfile.update({
          where: { id: newUserId },
          data: {
            currentPeriodEnd: nextRefereePeriodEnd,
            plan: 'PRO',
          },
        });
      });

      TelemetryHub.trackEvent('REFERRAL_SIGNUP_SUCCESSFUL', { 
        referralId, 
        referrerUserId, 
        refereeUserId: newUserId 
      });

      return {
        success: true,
        rewardedReferrerId: referrerUserId,
      };

    } catch (err: any) {
      TelemetryHub.logError('REFERRAL_SIGNUP_PROCESSING_FAILED', err, { refereeUserId: newUserId, referralToken });
      return { success: false };
    }
  }

  /**
   * Generates a unique referral link for a user
   */
  public static generateReferralLink(userId: string): string {
    return `https://saaslander.com/signup?ref=ref_${userId}`;
  }
}
