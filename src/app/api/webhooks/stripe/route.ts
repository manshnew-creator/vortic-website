import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../../lib/db/prisma';
import { TelemetryHub } from '../../../../lib/observability/telemetry';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('stripe-signature');
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing Stripe signature or webhook secret.' }, { status: 400 });
    }

    const payloadRaw = await req.text();

    // 1. SECURE STRIPE SIGNATURE VERIFICATION (Problem #3)
    // Manually constructs and verifies the Stripe Webhook signature using HMAC-SHA256
    // to secure the API against spoofing attacks on Edge and Serverless runtimes.
    const parts = signature.split(',');
    const timestampPart = parts.find((p) => p.startsWith('t='));
    const signaturePart = parts.find((p) => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) {
      return NextResponse.json({ error: 'Invalid Stripe signature format.' }, { status: 400 });
    }

    const timestamp = timestampPart.split('=')[1];
    const expectedSignature = signaturePart.split('=')[1];

    const signedPayload = `${timestamp}.${payloadRaw}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload);
    const computedSignature = hmac.digest('hex');

    // Secure constant-time signature comparison to prevent timing attacks
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(computedSignature)
    );

    if (!isSignatureValid) {
      console.warn('⚠️ [Stripe Webhook] Signature verification failed!');
      return NextResponse.json({ error: 'Stripe webhook signature mismatch.' }, { status: 401 });
    }

    const event = JSON.parse(payloadRaw);
    TelemetryHub.trackEvent('STRIPE_WEBHOOK_RECEIVED', { eventType: event.type, eventId: event.id });

    const subscription = event.data.object;
    const stripeCustomerId = subscription.customer;

    // 2. REAL DATABASE SYNCHRONIZATION VIA CENTRAL PRISMA SINGLETON
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userEmail = session.customer_details?.email;
        const subscriptionId = session.subscription;

        if (userEmail) {
          // Upgrade user subscription status to PRO plan instantly
          await prisma.userProfile.update({
            where: { email: userEmail },
            data: {
              plan: 'PRO',
              subscriptionStatus: 'ACTIVE',
              subscriptionId: subscriptionId,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days lease
            },
          });
          TelemetryHub.trackEvent('USER_UPGRADED_VIA_STRIPE', { email: userEmail, subscriptionId });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscriptionId = subscription.id;
        const status = subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE';

        // Update database plan status in PostgreSQL
        await prisma.userProfile.updateMany({
          where: { subscriptionId: subscriptionId },
          data: {
            subscriptionStatus: status as any,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionId = subscription.id;

        // Downgrade user back to FREE plan on subscription deletion/cancellation
        await prisma.userProfile.updateMany({
          where: { subscriptionId: subscriptionId },
          data: {
            plan: 'FREE',
            subscriptionStatus: 'CANCELED',
            usageStorageBytes: 0, // Reset storage quota limits
          },
        });
        TelemetryHub.trackEvent('USER_DOWNGRADED_CANCELED', { subscriptionId });
        break;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('[Stripe Webhook Ingestion Failed]', error);
    return NextResponse.json({ 
      error: 'Webhook handler execution crash.', 
      details: error.message 
    }, { status: 500 });
  }
}
