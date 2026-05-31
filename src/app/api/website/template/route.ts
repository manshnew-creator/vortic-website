import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db/prisma';
import { TEMPLATES_REGISTRY } from '../../../../lib/theme/templates';
import { generateSecureId, generateSeoFriendlySlug } from '../../../../lib/security/uuid';

export async function GET(req: NextRequest) {
  const templateId = req.nextUrl.searchParams.get('templateId');

  if (templateId) {
    const template = TEMPLATES_REGISTRY[templateId];
    if (!template) {
      return NextResponse.json({ error: 'Template not found in the registry.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        previewImage: `/api/website/template/preview?templateId=${encodeURIComponent(template.templateId)}`,
        previewPage: `/templates/preview/${encodeURIComponent(template.templateId)}`,
      },
    });
  }

  const templates = Object.values(TEMPLATES_REGISTRY).map((template) => ({
    templateId: template.templateId,
    name: template.name,
    description: template.description,
    category: template.category,
    previewImage: `/api/website/template/preview?templateId=${encodeURIComponent(template.templateId)}`,
    previewPage: `/templates/preview/${encodeURIComponent(template.templateId)}`,
  }));

  return NextResponse.json({
    success: true,
    count: templates.length,
    categories: Array.from(new Set(templates.map((template) => template.category))).sort(),
    templates,
  });
}

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
    try {
      const createdPage = await prisma.page.create({
        data: {
          id: securePageId,
          websiteId: websiteId,
          title: customizedSchema.title,
          slug: seoFriendlySlug,
          content: customizedSchema as any,
          publishStatus: 'DRAFT',
        },
      });

      return NextResponse.json({
        success: true,
        persisted: true,
        message: 'Template instantiated and registered successfully with SEO friendly slug.',
        pageId: createdPage.id,
        slug: createdPage.slug,
        schema: customizedSchema,
      });
    } catch (dbError) {
      console.warn('[Template Instantiation] Database unavailable; returning preview template payload.', dbError);
      return NextResponse.json({
        success: true,
        persisted: false,
        message: 'Template instantiated in preview fallback mode. Configure DATABASE_URL to persist it.',
        pageId: securePageId,
        slug: seoFriendlySlug,
        schema: customizedSchema,
      }, { status: 202 });
    }

  } catch (error: any) {
    console.error('[Template Instantiation API Error]', error);
    return NextResponse.json({ 
      error: 'Failed to instantiate template.', 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Unexpected template instantiation failure.' 
    }, { status: 500 });
  }
}
