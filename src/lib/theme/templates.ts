import { PageBuilderSchema } from '../../types/builder';
import { saasLanderTemplate } from './templates/saas';
import { dropshippingLanderTemplate } from './templates/dropshipping';
import { realEstateTemplate } from './templates/realestate';
import { medicalTemplate } from './templates/medical';
import { onlineCourseTemplate } from './templates/course';
import { localServicesTemplate } from './templates/local';
import { fitnessTemplate } from './templates/fitness';
import { restaurantTemplate } from './templates/restaurant';
import { agencyTemplate } from './templates/agency';
import { creatorTemplate } from './templates/creator';
import { professionalTemplatePack } from './templates/professionalPack';
import { eliteTemplateExpansionPack } from './templates/eliteExpansionPack';

export interface LandingPageTemplate {
  templateId: string;
  name: string;
  description: string;
  category: 
    | 'SAAS' 
    | 'DROPSHIPPING' 
    | 'REAL_ESTATE' 
    | 'MEDICAL' 
    | 'ONLINE_COURSE' 
    | 'LOCAL_SERVICES' 
    | 'FITNESS' 
    | 'RESTAURANT' 
    | 'AGENCY' 
    | 'CREATOR_BIO';
  schema: PageBuilderSchema;
}

/**
 * VORTIC TEMPLATE REGISTRY
 *
 * Contains the original niche templates plus two premium generated packs:
 * - professionalTemplatePack: 50 polished conversion templates.
 * - eliteTemplateExpansionPack: 105 additional industry-specific templates.
 *
 * Total registry size: 165 templates, all exposed through the same API contract.
 */
export const TEMPLATES_REGISTRY: Record<string, LandingPageTemplate> = {
  // 1. SaaS Premium Dark Mode (Chunked)
  saas_lander: saasLanderTemplate,

  // 2. Dropshipping Single-Product Funnel (Chunked)
  dropshipping_lander: dropshippingLanderTemplate,

  // 3. Luxury Real Estate (Chunked)
  real_estate: realEstateTemplate,

  // 4. Medical Booking Page (Chunked)
  medical_clinic: medicalTemplate,

  // 5. Online Courses & Academies (Chunked)
  online_course: onlineCourseTemplate,

  // 6. Local Services & Trades (Chunked)
  local_services: localServicesTemplate,

  // 7. Fitness & Personal Trainers (Chunked)
  fitness_trainer: fitnessTemplate,

  // 8. Restaurant & Food Delivery (Chunked)
  restaurant_menu: restaurantTemplate,

  // 9. Agency & Consulting (Chunked)
  agency_consulting: agencyTemplate,

  // 10. Creator Links in Bio (Chunked)
  creator_bio: creatorTemplate,

  // 50. Additional professional conversion templates generated from a premium schema factory
  ...professionalTemplatePack,

  // 105. Elite expansion templates for more industries, offers, and conversion funnels
  ...eliteTemplateExpansionPack,
};
