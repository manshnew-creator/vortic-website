import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db/prisma';
import { RedisAnalyticsBuffer } from '../../../../lib/analytics/ingestor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events = body.events ? body.events : [body];

    if (!events || events.length === 0) {
      return NextResponse.json({ error: 'No analytics events received.' }, { status: 400 });
    }

    let bufferedCount = 0;
    let dbFallbackData: any[] = [];

    // 1. HIGH-SPEED REDIS-BUFFERED INGESTION (Optimization #4)
    // Attempt to buffer analytics events to fast Redis queue in sub-1ms.
    // If Redis is offline, gracefully degrade and push to DB fallback arrays.
    for (const event of events) {
      const success = await RedisAnalyticsBuffer.enqueueEvent(event);
      if (success) {
        bufferedCount++;
      } else {
        dbFallbackData.push(event);
      }
    }

    // 2. RESILIENT FALLBACK: Direct DB Bulk insert only if Redis queue is offline
    if (dbFallbackData.length > 0) {
      const parsedRecords = dbFallbackData.map((event: any) => ({
        websiteId: event.websiteId,
        pageSlug: event.pageSlug || '/',
        visitorId: event.visitorId || 'anonymous',
        userAgent: event.userAgent || '',
        deviceType: 'desktop',
        browser: 'Unknown',
        os: 'Unknown',
        referrer: event.referrer || '',
        eventType: event.eventType || 'PAGE_VIEW',
        utmSource: event.eventMetadata?.utmSource || null,
        utmMedium: event.eventMetadata?.utmMedium || null,
        utmCampaign: event.eventMetadata?.utmCampaign || null,
        eventMetadata: event.eventMetadata ? event.eventMetadata : {},
      }));

      await prisma.analyticsRecord.createMany({
        data: parsedRecords,
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ 
      success: true, 
      bufferedCount,
      dbFallbackCount: dbFallbackData.length,
      message: 'Analytics events processed successfully with Redis buffering and db fallback.'
    });

  } catch (error: any) {
    console.error('[Analytics Collection Route Error]', error);
    return NextResponse.json({ 
      error: 'Failed to log analytics events.', 
      details: error.message 
    }, { status: 500 });
  }
}
