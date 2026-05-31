import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db/prisma';
import { HardenedQueueSystem } from '../../../../lib/publishing/queue';
import { sanitizePageSchema } from '../../../../lib/website/schemaSafety';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId, content } = body;

    if (!pageId || !content) {
      return NextResponse.json({ error: 'Missing required parameters: pageId or content schema.' }, { status: 400 });
    }

    const safeContent = sanitizePageSchema(content);

    try {
      // 1. Dispatch publishing task to background Queue
      const jobId = await HardenedQueueSystem.enqueue(pageId, safeContent, 'MEDIUM');

      // 2. Update page status in PostgreSQL database using centralized Prisma singleton
      const updatedPage = await prisma.page.update({
        where: { id: pageId },
        data: {
          publishedContent: safeContent as any,
          publishStatus: 'PUBLISHED',
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        persisted: true,
        message: 'Publishing task dispatched successfully to background processing queue.',
        jobId: jobId,
        pageId: pageId,
        dispatchedAt: updatedPage.updatedAt,
        workerStatus: 'PENDING_PROCESSING'
      });
    } catch (dbError) {
      console.warn('[Publishing Dispatcher] Storage/queue unavailable; returning preview publish fallback.', dbError);
      return NextResponse.json({
        success: true,
        persisted: false,
        message: 'Preview publish completed. Configure DATABASE_URL/REDIS_URL for durable production deployment.',
        jobId: `preview_${Date.now()}`,
        pageId,
        dispatchedAt: new Date().toISOString(),
        workerStatus: 'PREVIEW_FALLBACK'
      }, { status: 202 });
    }

  } catch (error: any) {
    console.error('[Publishing Dispatcher Route Error]', error);
    return NextResponse.json({ 
      error: 'Failed to queue the publishing operation.', 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Unexpected publishing failure.' 
    }, { status: 500 });
  }
}
