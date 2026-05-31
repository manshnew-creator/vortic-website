import React from 'react';
import { TEMPLATES_REGISTRY } from '../../lib/theme/templates';
import { PremiumFooter } from '../../components/layout/PremiumFooter';

const categoryLabels: Record<string, string> = {
  SAAS: 'SaaS',
  DROPSHIPPING: 'Ecommerce',
  REAL_ESTATE: 'Real Estate',
  MEDICAL: 'Medical',
  ONLINE_COURSE: 'Courses',
  LOCAL_SERVICES: 'Local Services',
  FITNESS: 'Fitness',
  RESTAURANT: 'Food & Hospitality',
  AGENCY: 'Agency',
  CREATOR_BIO: 'Creators',
};

export const metadata = {
  title: 'Vortic Templates Marketplace | 165 Professional Landing Pages',
  description: 'Browse 165 professional Vortic landing page templates for SaaS, ecommerce, medical, real estate, creators, agencies, local services, and more.',
};

export default function TemplatesMarketplacePage() {
  const templates = Object.values(TEMPLATES_REGISTRY);
  const categories = Array.from(new Set(templates.map((template) => template.category))).sort();

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 px-6 py-16 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#4f46e533,transparent_34rem)]" />
      <div className="relative z-10 mx-auto max-w-7xl space-y-12">
        <section className="mx-auto max-w-3xl text-center">
          <a href="/" className="mb-6 inline-flex rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-300 transition hover:border-indigo-500/60">
            ← Back to vortic
          </a>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-300">Template Marketplace</p>
          <h1 className="mt-4 bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-6xl">
            165 professional templates ready for launch
          </h1>
          <p className="mt-5 text-sm leading-7 text-slate-400 md:text-base">
            Premium conversion-focused pages for SaaS, ecommerce, medical, local services, creators, restaurants, agencies, events, luxury services, and more.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-300">
            <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-emerald-300">✅ Edge-ready schemas</span>
            <span className="rounded-full bg-indigo-500/10 px-4 py-2 text-indigo-300">✅ Responsive sections</span>
            <span className="rounded-full bg-fuchsia-500/10 px-4 py-2 text-fuchsia-300">✅ Lead forms included</span>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <a
              key={category}
              href={`#${category}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/55 p-4 text-center text-xs font-black uppercase tracking-wider text-slate-300 transition hover:border-indigo-500/60 hover:bg-indigo-500/10 hover:text-white"
            >
              {categoryLabels[category] || category}
            </a>
          ))}
        </section>

        {categories.map((category) => {
          const items = templates.filter((template) => template.category === category);
          return (
            <section key={category} id={category} className="scroll-mt-8 space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-900 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-400">{items.length} templates</p>
                  <h2 className="mt-1 text-2xl font-black text-white">{categoryLabels[category] || category}</h2>
                </div>
                <a href="/editor" className="rounded-xl bg-white px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-indigo-100">
                  Open editor
                </a>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((template) => (
                  <article
                    key={template.templateId}
                    className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/55 shadow-2xl shadow-black/10 transition hover:-translate-y-1 hover:border-indigo-500/60 hover:bg-slate-900"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-white">
                      <iframe
                        src={`/templates/preview/${encodeURIComponent(template.templateId)}`}
                        title={`${template.name} live preview`}
                        loading="lazy"
                        className="h-full w-full border-0"
                        sandbox="allow-scripts"
                      />
                    </div>
                    <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black text-white group-hover:text-indigo-200">{template.name}</h3>
                        <p className="mt-2 line-clamp-3 text-xs leading-6 text-slate-400">{template.description}</p>
                      </div>
                      <span className="shrink-0 rounded-xl bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black text-indigo-300">{template.category}</span>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                      <code className="truncate text-[10px] text-slate-500">{template.templateId}</code>
                      <a
                        href={`/editor?template=${encodeURIComponent(template.templateId)}`}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white transition hover:bg-indigo-500"
                      >
                        Use template
                      </a>
                    </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <div className="relative z-10 -mx-6 mt-16">
        <PremiumFooter />
      </div>
    </main>
  );
}
