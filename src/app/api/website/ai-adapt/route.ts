import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db/prisma';
import { AIAuthoringEngine } from '../../../../lib/ai/authoring';
import { DistributedRateLimiter } from '../../../../lib/security/rateLimit';
import { EdgeSessionValidator } from '../../../../lib/security/session';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting protection (Anti-Spam filter) via Distributed Redis limiter (Problem #5)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!await DistributedRateLimiter.isAllowed(ip)) {
      return NextResponse.json({ error: 'Too many AI generation requests. Please wait 1 minute.' }, { status: 429 });
    }

    // 2. Secure distributed session validation
    const session = await EdgeSessionValidator.verifySession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized access. Valid session token required.' }, { status: 401 });
    }

    const body = await req.json();
    const { pageId, prompt } = body;

    if (!pageId || !prompt) {
      return NextResponse.json({ error: 'Missing required parameters: pageId or prompt string.' }, { status: 400 });
    }

    // 3. Fetch active page schema with website relations
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        website: true,
      }
    });

    if (!page) {
      return NextResponse.json({ error: 'Target page schema not found.' }, { status: 404 });
    }

    // 4. Tenant isolation check
    if (page.website.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden. You do not own the website containing this page.' }, { status: 403 });
    }

    // 5. Run autonomous AI workflow orchestrator (autocorrects, adapts copywriting/colors/SEO)
    const workflowResult = AIAuthoringEngine.orchestrateAiWorkflow(prompt);

    if (!workflowResult.success) {
      return NextResponse.json({ 
        success: false, 
        warning: workflowResult.warning || 'Failed to execute AI workflow.' 
      }, { status: 400 });
    }

    // 6. Update database with adapted schema via centralized Prisma singleton
    const nextOptimisticVersion = page.version + 1;

    await prisma.page.update({
      where: { id: pageId },
      data: {
        content: workflowResult.schema as any,
        title: workflowResult.schema.title,
        version: nextOptimisticVersion,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Autonomous AI Landing Page workflow executed successfully.',
      selectedTemplateId: workflowResult.selectedTemplateId,
      autocorrectedPrompt: workflowResult.autocorrectedPrompt,
      nextVersion: nextOptimisticVersion,
      schema: workflowResult.schema,
    });

  } catch (error: any) {
    console.error('[AI Workflow API Route Error]', error);
    return NextResponse.json({ 
      error: 'Internal Server Error during AI workflow orchestration.', 
      details: error.message 
    }, { status: 500 });
  }
}
