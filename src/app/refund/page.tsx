import React from 'react';

/**
 * VORTIC COMPLIANT REFUND POLICY PAGE (Next.js App Router)
 * Clean, legal-grade refund policy required by Paddle onboarding audits.
 */
export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 text-left">
        
        <div className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold text-white">Refund Policy</h1>
          <p className="text-xs text-slate-500">Last updated: May 30, 2026</p>
        </div>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">1. 14-Day Money-Back Guarantee</h2>
          <p>
            We want you to be completely satisfied with Vortic.website. We offer a **14-Day Money-Back Guarantee** on all our premium subscription plans (Pro, Enterprise).
          </p>
          <p>
            If you are not entirely satisfied with your subscription, you may request a full refund within 14 calendar days of your initial purchase. No questions asked.
          </p>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">2. Refund Processing via Paddle</h2>
          <p>
            Since Paddle.com is our official Merchant of Record, all payments, invoices, billing disputes, and refunds are managed directly by Paddle.
          </p>
          <p>
            To request a refund within your 14-day window:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-4">
            <li>You can contact Vortic support directly at <span className="text-indigo-400">support@vortic.website</span>.</li>
            <li>Alternatively, you can contact Paddle Customer Support directly via your purchase invoice email or by visiting <a href="https://paddle.com" target="_blank" rel="noreferrer" className="underline text-indigo-400">Paddle.com</a>.</li>
          </ul>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">3. Cancellation of Subscriptions</h2>
          <p>
            You may cancel your premium subscription at any time. Upon cancellation, your plan will remain active until the end of your current paid billing period (monthly or yearly), and you will not be billed again. No partial or prorated refunds are issued for cancellations requested after the 14-day window.
          </p>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">4. Abuse of Refund Policy</h2>
          <p>
            Vortic reserves the right to deny refund requests if we identify clear patterns of account abuse, fraudulent refund exploitation, or violations of our Terms of Service.
          </p>
        </section>

      </div>
    </div>
  );
}
