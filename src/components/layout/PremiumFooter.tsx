import React from 'react';

const footerGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Visual Editor', href: '/editor' },
      { label: 'Templates Marketplace', href: '/templates' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Support Desk', href: '/contact' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Vext™ Compiler', href: '/#features' },
      { label: 'Edge Publishing', href: '/#features' },
      { label: 'Secure Forms', href: '/contact' },
      { label: 'Analytics Runtime', href: '/#features' },
    ],
  },
  {
    title: 'Trust & Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Paddle Billing', href: 'https://paddle.com' },
    ],
  },
];

const trustBadges = ['Edge compiled', 'XSS hardened', 'GDPR ready', 'Paddle MoR', 'Redis fallback', '165 templates'];

function VorticMark() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 shadow-2xl shadow-indigo-950/50 ring-1 ring-white/10">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-rose-500 opacity-35 blur" />
      <svg className="relative h-8 w-8" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="footer-vortex-a" x1="0" x2="100" y1="0" y2="100">
            <stop stopColor="#818cf8" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="footer-vortex-b" x1="100" x2="0" y1="0" y2="100">
            <stop stopColor="#fb7185" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path d="M50 9C72.6 9 91 27.4 91 50c0 12.2-5.4 23.7-14.7 31.5" stroke="url(#footer-vortex-a)" strokeWidth="8" strokeLinecap="round" />
        <path d="M50 91C27.4 91 9 72.6 9 50c0-10.8 4.2-21 11.7-28.7" stroke="url(#footer-vortex-b)" strokeWidth="8" strokeLinecap="round" />
        <path d="M50 26c13.3 0 24 10.7 24 24 0 7-3 13.3-7.8 17.7" stroke="url(#footer-vortex-b)" strokeWidth="6" strokeLinecap="round" />
        <path d="M50 74c-13.3 0-24-10.7-24-24 0-5.7 2-11 5.4-15.1" stroke="url(#footer-vortex-a)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="50" cy="50" r="8" fill="white" />
      </svg>
    </div>
  );
}

export function PremiumFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-900 bg-slate-950 text-slate-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.18),transparent_34rem),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.12),transparent_28rem)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-14 md:py-18">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="flex flex-col gap-5 text-left sm:flex-row sm:items-center">
              <VorticMark />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Vortic.website · Vext™ Engine</p>
                <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-tight text-white md:text-3xl">
                  Build, adapt, and publish conversion-grade websites at edge speed.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  A no-code website operating system with a visual editor, 165 professional templates, secure forms, analytics ingestion, and an edge-native publishing pipeline.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <a href="/editor" className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-indigo-100">
                Open Editor
              </a>
              <a href="/templates" className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:border-indigo-400/60 hover:bg-indigo-500/10">
                View Templates
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3">
              <VorticMark />
              <div>
                <p className="text-lg font-black text-white">vortic</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-400">Website OS</p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-400">
              Vortic turns block schemas into fast, secure, multi-tenant landing pages. Designed for founders, agencies, creators, local businesses, and performance marketers.
            </p>
            <div className="grid max-w-md grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-lg font-black text-white">165</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">Templates</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-lg font-black text-white">0</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">Audit vulns</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-lg font-black text-white">10ms</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">Edge goal</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={group.title} className="text-left">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm font-semibold text-slate-300 transition hover:text-white"
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="border-y border-slate-900 py-6">
          <div className="flex flex-wrap items-center gap-2">
            {trustBadges.map((badge) => (
              <span key={badge} className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-[11px] text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Vortic.website. All rights reserved. Vext™ is a trademark of Vortic.</p>
          <p className="max-w-2xl leading-6 md:text-right">
            Billing is processed by Paddle.com as Merchant of Record. Do not submit secrets or private credentials through public forms.
          </p>
        </div>
      </div>
    </footer>
  );
}
