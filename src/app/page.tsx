import React from 'react';
import { PremiumFooter } from '../components/layout/PremiumFooter';
import { PremiumNavbar } from '../components/layout/PremiumNavbar';

const infrastructure = ['Next.js 16', 'Prisma', 'PostgreSQL', 'Redis', 'Supabase-ready', 'Vercel-ready'];

const templateHighlights = [
  ['AI Startup OS', 'Investor-grade SaaS hero, proof, benefits, and lead capture.', 'ai_startup_os'],
  ['Luxury Real Estate', 'Premium development showcase for private tour bookings.', 'realestate_luxury_condo'],
  ['Medical Clinic', 'Trust-first patient booking flow with secure form capture.', 'medical_clinic'],
  ['Local Services', 'Quote-ready funnels for contractors, clinics, and trades.', 'roofing_contractor'],
  ['Creator Media Kit', 'Sponsor-ready creator and podcast landing page structure.', 'podcaster_media'],
  ['Restaurant Launch', 'Menu-first hospitality page for bookings and orders.', 'restaurant_menu'],
];

const useCases = [
  { icon: '🚀', title: 'SaaS launches', text: 'Ship product pages, waitlists, demo funnels, and feature explainers without waiting on engineering.' },
  { icon: '🛒', title: 'Performance ecommerce', text: 'Create product funnels with proof, benefits, urgency, and lead/order capture for paid traffic.' },
  { icon: '🏢', title: 'Agencies & consultants', text: 'Package service offers, case narratives, and intake flows into polished client-winning pages.' },
  { icon: '📍', title: 'Local businesses', text: 'Convert high-intent visitors into calls, bookings, quotes, and consultations.' },
];

const faqs = [
  ['Can I start from a template?', 'Yes. The marketplace includes 165 professional schemas and the editor can open any template directly with /editor?template=template_id.'],
  ['Does it work without a database locally?', 'Yes. Critical APIs include preview fallback behavior, while durable persistence requires PostgreSQL and Redis.'],
  ['Is custom HTML safe?', 'User-authored HTML is sanitized, unsafe URL schemes are blocked, and sandboxed embeds are isolated from the parent application.'],
  ['What makes Vext™ different?', 'Vext™ treats visual pages as schema-driven AST documents that can be rendered, optimized, published, and measured consistently.'],
];

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-center shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-5">
      <p className="text-2xl font-black text-white sm:text-3xl">{value}</p>
      <p className="mt-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 sm:mt-2 sm:text-[10px] sm:tracking-[0.2em]">{label}</p>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto mt-10 max-w-6xl px-0 sm:mt-12 sm:px-4">
      <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-tr from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20 blur-3xl" />
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/50 sm:rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Vortic Visual Workspace</p>
        </div>
        <div className="grid min-h-[420px] lg:grid-cols-[250px_1fr_280px]">
          <aside className="hidden border-r border-white/10 bg-slate-950/80 p-4 lg:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Elements</p>
            {['Hero Section', 'Grid', 'Lead Form', 'CTA Button', 'Template Library'].map((item) => (
              <div key={item} className="mt-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-xs font-bold text-slate-300">{item}</div>
            ))}
          </aside>
          <section className="bg-[radial-gradient(#1e293b_1px,transparent_1px)] p-5 [background-size:24px_24px]">
            <div className="mx-auto max-w-2xl rounded-[1.6rem] border border-white/10 bg-white p-8 text-slate-950 shadow-2xl">
              <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">Template applied</div>
              <h3 className="mt-5 text-4xl font-black tracking-tight">Launch pages that feel custom-built.</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">Choose a premium schema, edit visually, capture leads, and publish a polished page with responsive sections already included.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {['Proof', 'Benefits', 'Form'].map((item) => <div key={item} className="rounded-2xl bg-slate-100 p-4 text-xs font-black text-slate-600">{item}</div>)}
              </div>
            </div>
          </section>
          <aside className="hidden border-l border-white/10 bg-slate-950/80 p-4 lg:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Inspector</p>
            {['Typography', 'Spacing', 'Visibility', 'Actions'].map((item) => (
              <div key={item} className="mt-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-xs font-bold text-slate-300">{item}</div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function PublicHomepage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <PremiumNavbar />

      <main>
        <section className="relative isolate overflow-hidden px-5 pb-14 pt-24 text-center sm:pt-28 md:px-6 md:pb-20 md:pt-40">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[#050716]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.30),transparent_30rem),radial-gradient(circle_at_85%_16%,rgba(34,211,238,0.16),transparent_24rem),radial-gradient(circle_at_15%_20%,rgba(168,85,247,0.16),transparent_24rem)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-indigo-500/10 to-transparent" />
          <div className="relative z-10 mx-auto max-w-5xl">
            <div className="mx-auto inline-flex max-w-[92vw] items-center justify-center gap-2 rounded-full border border-indigo-300/25 bg-white/[0.075] px-3.5 py-2 text-[9px] font-black uppercase leading-relaxed tracking-[0.12em] text-indigo-100 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.22em]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <span className="max-w-[72vw] sm:max-w-none">165 templates · Visual editor · Edge publishing</span>
            </div>
            <h1 className="mx-auto mt-6 max-w-4xl text-[2.6rem] font-black leading-[1.02] tracking-[-0.06em] text-white drop-shadow-[0_10px_40px_rgba(99,102,241,0.28)] min-[390px]:text-5xl sm:mt-7 sm:text-6xl md:text-7xl md:leading-[0.95]">
              Build professional landing pages at global product quality.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-8 text-slate-300 sm:text-base md:text-lg md:leading-9">
              Vortic is a no-code website operating system for launching premium pages from templates, editing them visually, securing every submission, and publishing with the Vext™ compiler workflow.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row">
              <a href="/editor" className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-7 py-4 text-xs font-black uppercase tracking-wider text-white shadow-2xl shadow-indigo-500/25 transition hover:scale-[1.01] hover:brightness-110 sm:w-auto">
                Open Visual Editor
              </a>
              <a href="/templates" className="w-full rounded-2xl border border-white/15 bg-white/[0.08] px-7 py-4 text-xs font-black uppercase tracking-wider text-white shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:border-cyan-300/60 hover:bg-white/[0.12] sm:w-auto">
                Browse Templates
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 md:mt-10 md:gap-4">
              <Metric value="165" label="Professional templates" />
              <Metric value="0" label="Production audit vulns" />
              <Metric value="1" label="Unified builder OS" />
            </div>
          </div>
          <ProductPreview />
        </section>

        <section className="border-y border-slate-900 bg-slate-950 px-6 py-7 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-600">Built with modern infrastructure</p>
          <div className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
            {infrastructure.map((item) => <span key={item} className="rounded-full border border-slate-900 bg-slate-900/50 px-4 py-2">{item}</span>)}
          </div>
        </section>

        <section id="product" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Product system</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Everything needed to move from idea to published page.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">A complete workflow: choose a template, customize sections, inspect styles, capture leads, track analytics, and publish safely.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                ['Visual Builder', 'Schema-driven canvas with blocks, responsive controls, undo/redo, and local draft recovery.'],
                ['Vext™ Runtime', 'Publishing, minification, analytics ingestion, Redis fallback, and hardened rendering paths.'],
                ['Template OS', '165 ready-to-use templates mapped to real industries, offers, and conversion flows.'],
              ].map(([title, text]) => (
                <article key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-black/10 transition hover:border-indigo-500/50">
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900/20 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Template showcase</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Start from a page that already knows the market.</h2>
              </div>
              <a href="/templates" className="rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-indigo-100">View all templates</a>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {templateHighlights.map(([title, text, id]) => (
                <a key={id} href={`/editor?template=${id}`} className="group rounded-[2rem] border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-black/10 transition hover:-translate-y-1 hover:border-indigo-500/60">
                  <div className="h-28 rounded-3xl bg-gradient-to-tr from-indigo-500/25 via-fuchsia-500/15 to-cyan-500/20 ring-1 ring-white/10" />
                  <h3 className="mt-5 text-lg font-black text-white group-hover:text-indigo-200">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{text}</p>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-indigo-400">Use template →</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="use-cases" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Use cases</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Built for teams that need speed and trust.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {useCases.map((item) => (
                <article key={item.title} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
                  <p className="text-3xl">{item.icon}</p>
                  <h3 className="mt-4 text-base font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900/20 px-6 py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Security & performance</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">A serious foundation for public pages.</h2>
              <p className="mt-5 text-sm leading-8 text-slate-400">Vortic includes schema sanitization, HTML hardening, safe URL validation, rate limiting, honeypot protection, analytics fallback, and published-page responsive rendering.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {['XSS sanitizer', 'Safe URL validation', 'Rate limiting', 'Honeypot forms', 'Preview fallbacks', 'Responsive renderer'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm font-black text-slate-200">✅ {item}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">FAQ</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Questions teams ask before building.</h2>
            </div>
            <div className="mt-10 space-y-4">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-left">
                  <summary className="cursor-pointer list-none text-base font-black text-white">{question}</summary>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-indigo-400/20 bg-gradient-to-tr from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20 p-8 text-center shadow-2xl shadow-indigo-950/20 md:p-12">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-200">Ready to build?</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Pick a template, customize visually, and publish faster.</h2>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="/templates" className="rounded-2xl bg-white px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-indigo-100">Browse templates</a>
              <a href="/editor" className="rounded-2xl border border-white/10 bg-slate-950 px-6 py-4 text-xs font-black uppercase tracking-wider text-white transition hover:border-white/30">Open editor</a>
            </div>
          </div>
        </section>
      </main>

      <PremiumFooter />
    </div>
  );
}
