import React from 'react';
import { PremiumNavbar } from '../../components/layout/PremiumNavbar';
import { PremiumFooter } from '../../components/layout/PremiumFooter';

const entries = [
  ['2026-05-31', 'Global homepage, navbar, footer, dashboard, onboarding, auth UI, analytics, marketplace, and 165 templates added.'],
  ['2026-05-31', 'Security hardening: sanitizer, safe URLs, schema validation, analytics fallback, and API preview modes.'],
  ['2026-05-31', 'Next.js 16 compatibility, proxy routing, production build verification, and zero production vulnerabilities.'],
];

export const metadata = { title: 'Changelog | Vortic.website' };

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PremiumNavbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-4xl">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Product updates</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">Changelog</h1>
          <div className="mt-10 space-y-4">
            {entries.map(([date, text]) => (
              <article key={text} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <p className="text-xs font-black uppercase tracking-wider text-indigo-300">{date}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
