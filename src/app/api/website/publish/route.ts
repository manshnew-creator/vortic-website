import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db/prisma';
import { HardenedQueueSystem } from '../../../../lib/publishing/queue';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId, content } = body;

    if (!pageId || !content) {
      return NextResponse.json({ error: 'Missing required parameters: pageId or content schema.' }, { status: 400 });
    }

    // 1. Dispatch publishing task to background Queue
    const jobId = await HardenedQueueSystem.enqueue(pageId, content, 'MEDIUM');

    // 2. Update page status in PostgreSQL database using centralized Prisma singleton
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        publishStatus: 'PUBLISHED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Publishing task dispatched successfully to background processing queue.',
      jobId: jobId,
      pageId: pageId,
      dispatchedAt: updatedPage.updatedAt,
      workerStatus: 'PENDING_PROCESSING'
    });

  } catch (error: any) {
    console.error('[Publishing Dispatcher Route Error]', error);
    return NextResponse.json({ 
      error: 'Failed to queue the publishing operation.', 
      details: error.message 
    }, { status: 500 });
  }
}
