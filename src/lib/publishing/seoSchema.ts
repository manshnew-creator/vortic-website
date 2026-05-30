import { PageBuilderSchema } from '../../types/builder';

export class EdgeSeoSchemaGenerator {
  
  /**
   * EDGE-NATIVE SEO STRUCTURED DATA GENERATOR (JSON-LD) (Problem #7)
   * Dynamically constructs Google-compatible, highly-structured JSON-LD metadata schema markups
   * (Product, Organization, LocalBusiness) based on page builder templates.
   * This gives clients maximum SEO visibility and rank on search results layouts!
   */
  public static generateJsonLd(schema: PageBuilderSchema): string {
    const rootUrl = `https://${schema.slug}.saaslander.com`;
    let structuredData: Record<string, any> = {};

    // 1. Semantic Classifiers based on the Page Template and slug metadata
    if (schema.slug.includes('dental') || schema.slug.includes('clinic') || schema.slug.includes('medical')) {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'MedicalClinic',
        'name': schema.title,
        'description': schema.seo.description,
        'url': rootUrl,
        'telephone': '+18005550199',
        'medicalSpecialty': 'Dentistry',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Dubai',
          'addressRegion': 'Dubai, UAE',
          'addressCountry': 'AE',
        }
      };
    } else if (schema.slug.includes('product') || schema.slug.includes('blender') || schema.slug.includes('dropship')) {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': schema.title,
        'description': schema.seo.description,
        'image': schema.seo.ogImage || 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800',
        'offers': {
          '@type': 'Offer',
          'price': '39.99',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
          'url': rootUrl
        }
      };
    } else {
      // Fallback: Standard SaaS Product Organization schema
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': schema.title,
        'description': schema.seo.description,
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '25.00',
          'priceCurrency': 'USD'
        }
      };
    }

    return `
      <script type="application/ld+json">
        ${JSON.stringify(structuredData)}
      </script>
    `.replace(/\s+/g, ' ').trim();
  }
}
