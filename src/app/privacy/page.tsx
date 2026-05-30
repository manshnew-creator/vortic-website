import React from 'react';

/**
 * VORTIC COMPLIANT PRIVACY POLICY PAGE (Next.js App Router)
 * Legal-grade, fully customized to meet GDPR, CCPA, and Paddle merchant onboarding guidelines.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 text-left">
        
        <div className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-500">Last updated: May 30, 2026</p>
        </div>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on Vortic.website, express an interest in obtaining information about us or our products, or when you contact us.
          </p>
          <p>
            The personal information we collect may include: names, email addresses, passwords, billing addresses, and payment details. All payment processing is securely managed by our merchant of record, Paddle.com, and we do not store raw credit card details on our servers.
          </p>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">2. How We Use Your Information</h2>
          <p>We process your personal information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent.</p>
          <p>Specifically, we use information to: facilitate account creation and logon, deliver static hosting deployments, collect batched website analytics statistics, and manage billing transactions via Paddle.</p>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">3. Third-Party Payment Processor (Paddle)</h2>
          <p>
            Our order process is conducted by our online reseller and Merchant of Record, Paddle.com. Paddle.com is the authorized merchant of record for all our billing transactions and subscription updates. Paddle manages your data in compliance with PCI-DSS standards.
          </p>
          <p>
            You can view Paddle’s complete privacy statement and terms directly on their official portal at <a href="https://paddle.com" target="_blank" rel="noreferrer" className="underline text-indigo-400">Paddle.com</a>.
          </p>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">4. Cookies & Analytics Tracking</h2>
          <p>
            We use lightweight, privacy-friendly tracking cookies and in-memory analytics logs to track aggregate unique page views, conversion actions, and CTR. We do not track cross-site behaviors or sell user behavioral data to third-party ad brokers.
          </p>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">5. GDPR & CCPA Data Rights</h2>
          <p>
            If you reside in the European Union (EEA) or California, you possess specific statutory rights regarding your personal information, including the right to request access, correction, transfer, or complete deletion of your personal account files. To exercise these rights, please contact our support at <span className="text-indigo-400">support@vortic.website</span>.
          </p>
        </section>

      </div>
    </div>
  );
}
