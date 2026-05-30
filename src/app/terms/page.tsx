import React from 'react';

/**
 * VORTIC TERMS OF SERVICE PAGE (Next.js App Router)
 * Legal-grade Terms of Service meeting all Merchant of Record (Paddle) onboarding guidelines.
 */
export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 text-left">
        
        <div className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
          <p className="text-xs text-slate-500">Last updated: May 30, 2026</p>
        </div>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">1. Agreement to Terms</h2>
          <p>
            By accessing and utilizing Vortic.website (the "Platform" or "Service"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you are prohibited from using the Service and must discontinue access immediately.
          </p>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">2. Intellectual Property & Templates</h2>
          <p>
            Vortic.website grants you a limited, non-exclusive, non-transferable, revocable license to access our prebuilt verticalized templates and compiler engine solely to design, build, and publish your own website pages.
          </p>
          <p>
            You retain complete intellectual property ownership of the custom content, images, and copy you upload to your pages. You are strictly prohibited from copying, scraping, or reselling our visual builder editor's core code, templates schemas, or proprietary compilation mechanisms.
          </p>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">3. Merchant of Record (Paddle)</h2>
          <p>
            Vortic.website utilizes Paddle.com as its authorized Merchant of Record. By subscribing to any premium plan (Pro, Enterprise) on our Platform, you agree to comply with Paddle’s Terms of Use, checkout procedures, and payment processing rules.
          </p>
          <p>
            Paddle manages billing issues, taxes, currency conversions, and payment failures on our behalf, ensuring compliance with global financial regulations.
          </p>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">4. User Content & Prohibited Conduct</h2>
          <p>
            You are solely responsible for the content and sites you publish under your subdomains (e.g. *.vortic.website) or custom domains. You agree not to publish any illegal content, malware, phishing traps, copyright-infringing assets, or scam landing pages. Vortic reserves the complete right to terminate accounts and suspend sites violating these clauses instantly.
          </p>
        </section>

        <section className="space-y-4 text-xs leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">5. Limitation of Liability</h2>
          <p>
            Vortic.website is provided on an "as-is" and "as-available" basis. In no event shall Vortic, its directors, employees, or partners be liable for any indirect, incidental, special, or consequential damages resulting from server downtimes, compilation anomalies, or lost conversion revenues.
          </p>
        </section>

      </div>
    </div>
  );
}
