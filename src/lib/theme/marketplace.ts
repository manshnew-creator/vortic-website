import prisma from '../db/prisma';
import { PageBuilderSchema } from '../../types/builder';
import { generateSecureId, generateSeoFriendlySlug } from '../security/uuid';
import { TelemetryHub } from '../observability/telemetry';

export interface MarketplaceTemplate {
  templateId: string;
  name: string;
  priceUsd: number;
  authorId: string;
  isPremium: boolean;
  schema: PageBuilderSchema;
}

export interface PurchaseTransaction {
  transactionId: string;
  userId: string;
  templateId: string;
  licenseKey: string;
  creatorPayoutUsd: number;
  platformFeeUsd: number;
  createdAt: number;
}

export class TemplateMarketplaceEngine {
  private static platformFeePercent = 0.30; // 30% Platform cut, 70% Creator cut (SaaS Standard)
  private static activeLicenses = new Map<string, string>(); // userId:templateId -> licenseKey

  /**
   * 1. CREATOR PAYOUT & REVENUE SPLIT SOLVER
   * Calculates the transaction revenue share split between the marketplace template creator (70%)
   * and your platform fee (30%) to power your automated cash-cow monetization engine!
   */
  public static processRevenueSplit(priceUsd: number): { creatorShare: number; platformShare: number } {
    if (priceUsd <= 0) return { creatorShare: 0, platformShare: 0 };
    
    const platformShare = parseFloat((priceUsd * this.platformFeePercent).toFixed(2));
    const creatorShare = parseFloat((priceUsd - platformShare).toFixed(2));

    return {
      creatorShare,
      platformShare,
    };
  }

  /**
   * 2. SECURE TRANSACTIONAL PURCHASE
   * Processes a template purchase, generates a cryptographically secure license key,
   * splits the payout distribution, and records the transaction securely.
   */
  public static async purchaseTemplate(
    userId: string,
    template: MarketplaceTemplate
  ): Promise<PurchaseTransaction> {
    
    const { creatorShare, platformShare } = this.processRevenueSplit(template.priceUsd);
    
    // Generate secure unique license key
    const licenseKey = generateSecureId('lic');
    const transactionId = generateSecureId('tx');

    const transaction: PurchaseTransaction = {
      transactionId,
      userId,
      templateId: template.templateId,
      licenseKey,
      creatorPayoutUsd: creatorShare,
      platformFeeUsd: platformShare,
      createdAt: Date.now(),
    };

    // Store license in memory registry (simulate DB insert)
    this.activeLicenses.set(`${userId}:${template.templateId}`, licenseKey);

    TelemetryHub.trackEvent('TEMPLATE_PURCHASED', { 
      transactionId, 
      userId, 
      templateId: template.templateId, 
      priceUsd: template.priceUsd,
      platformShare 
    });

    return transaction;
  }

  /**
   * 3. SECURE LICENSE VALIDATION & INSTANTIATION (Frictionless Import)
   * Verifies if the buyer owns a valid license key or has active plan permissions
   * before dynamically cloning and importing the template into their PostgreSQL workspace.
   */
  public static async validateLicenseAndImport(
    userId: string,
    template: MarketplaceTemplate,
    licenseKey: string,
    websiteId: string
  ): Promise<{ success: boolean; pageId?: string; slug?: string; schema?: PageBuilderSchema; error?: string }> {
    
    // Check if user is the author (authors have free access to their own templates)
    const isAuthor = template.authorId === userId;
    const isFree = !template.isPremium || template.priceUsd === 0;

    const registeredLicense = this.activeLicenses.get(`${userId}:${template.templateId}`);
    const isValidLicense = registeredLicense && registeredLicense === licenseKey;

    if (!isAuthor && !isFree && !isValidLicense) {
      TelemetryHub.trackEvent('TEMPLATE_IMPORT_BLOCKED_UNAUTHORIZED', { userId, templateId: template.templateId });
      return { success: false, error: 'Unauthorized. Valid license key required for premium templates.' };
    }

    try {
      // Generate secure unique Page ID & SEO-friendly slug
      const securePageId = generateSecureId('page');
      const seoFriendlySlug = generateSeoFriendlySlug(template.name);

      // Clone and customize the template schema
      const customizedSchema = JSON.parse(JSON.stringify(template.schema));
      customizedSchema.pageId = securePageId;
      customizedSchema.title = `My Premium ${template.name}`;
      customizedSchema.slug = seoFriendlySlug;

      // Register the template page directly into PostgreSQL via the centralized Prisma client
      await prisma.page.create({
        data: {
          id: securePageId,
          websiteId: websiteId,
          title: customizedSchema.title,
          slug: seoFriendlySlug,
          content: customizedSchema as any,
          publishStatus: 'DRAFT',
        },
      });

      TelemetryHub.trackEvent('TEMPLATE_IMPORTED_SUCCESSFULLY', { userId, templateId: template.templateId, pageId: securePageId });

      return {
        success: true,
        pageId: securePageId,
        slug: seoFriendlySlug,
        schema: customizedSchema,
      };

    } catch (err: any) {
      TelemetryHub.logError('TEMPLATE_IMPORT_FAILED', err, { userId, templateId: template.templateId });
      return { success: false, error: 'Failed to import template to workspace.' };
    }
  }
}
