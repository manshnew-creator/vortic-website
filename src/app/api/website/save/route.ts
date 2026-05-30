import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db/prisma';
import { DistributedRateLimiter } from '../../../../lib/security/rateLimit';

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

    // 2. Update Draft page in database using the centralized Prisma singleton (Optimization #3)
    const updatedPage = await prisma.page.update({
      where: {
        id: schema.pageId,
      },
      data: {
        title: schema.title || 'Untitled Page',
        content: schema,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Draft schema saved successfully to PostgreSQL.', 
      updatedAt: updatedPage.updatedAt 
    });

  } catch (error: any) {
    console.error('[Autosave Route Error]', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}
