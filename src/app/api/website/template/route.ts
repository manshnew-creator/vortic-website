import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db/prisma';
import { TEMPLATES_REGISTRY } from '../../../../lib/theme/templates';
import { generateSecureId, generateSeoFriendlySlug } from '../../../../lib/security/uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateId, websiteId } = body;

    if (!templateId || !websiteId) {
      return NextResponse.json({ error: 'Missing required parameters: templateId or websiteId.' }, { status: 400 });
    }

    // 1. Fetch template from registry
    const template = TEMPLATES_REGISTRY[templateId];
    if (!template) {
      return NextResponse.json({ error: 'Template not found in the registry.' }, { status: 404 });
    }

    // 2. Generate secure unique page ID & SEO-friendly slug
    const securePageId = generateSecureId('page');
    const seoFriendlySlug = generateSeoFriendlySlug(template.name);

    // Clone and customize the template schema
    const customizedSchema = JSON.parse(JSON.stringify(template.schema));
    customizedSchema.pageId = securePageId;
    customizedSchema.title = `My ${template.name}`;
    customizedSchema.slug = seoFriendlySlug;

    // 3. Register the new page inside PostgreSQL Database via centralized Prisma singleton
    const createdPage = await prisma.page.create({
      data: {
        id: securePageId,
        websiteId: websiteId,
        title: customizedSchema.title,
        slug: seoFriendlySlug,
        content: customizedSchema,
        publishStatus: 'DRAFT',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Template instantiated and registered successfully with SEO friendly slug.',
      pageId: createdPage.id,
      slug: createdPage.slug,
      schema: customizedSchema,
    });

  } catch (error: any) {
    console.error('[Template Instantiation API Error]', error);
    return NextResponse.json({ 
      error: 'Failed to instantiate template.', 
      details: error.message 
    }, { status: 500 });
  }
}
