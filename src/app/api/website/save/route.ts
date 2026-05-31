import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db/prisma';
import { DistributedRateLimiter } from '../../../../lib/security/rateLimit';
import { sanitizePageSchema } from '../../../../lib/website/schemaSafety';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting protection (Anti-Spam Filter) via Distributed Redis limiter (Problem #5)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!await DistributedRateLimiter.isAllowed(ip)) {
      return NextResponse.json({ error: 'Too many requests. Slow down.' }, { status: 429 });
    }

    const body = await req.json();
    const { schema } = body;

    if (!schema || !schema.pageId) {
      return NextResponse.json({ error: 'Missing schema or page configuration parameters.' }, { status: 400 });
    }

    const safeSchema = sanitizePageSchema(schema);

    // 2. Update Draft page in database using the centralized Prisma singleton (Optimization #3)
    try {
      const updatedPage = await prisma.page.update({
        where: {
          id: safeSchema.pageId,
        },
        data: {
          title: safeSchema.title || 'Untitled Page',
          content: safeSchema as any,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ 
        success: true, 
        persisted: true,
        message: 'Draft schema saved successfully to PostgreSQL.', 
        updatedAt: updatedPage.updatedAt 
      });
    } catch (dbError) {
      console.warn('[Autosave Route] Database unavailable; accepted draft in preview fallback mode.', dbError);
      return NextResponse.json({
        success: true,
        persisted: false,
        message: 'Draft accepted in preview fallback mode. Configure DATABASE_URL to persist it permanently.',
        updatedAt: new Date().toISOString(),
      }, { status: 202 });
    }

  } catch (error: any) {
    console.error('[Autosave Route Error]', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Unexpected autosave failure.' 
    }, { status: 500 });
  }
}
