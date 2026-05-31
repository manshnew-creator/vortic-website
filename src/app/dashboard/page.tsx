import React from 'react';
import { PremiumNavbar } from '../../components/layout/PremiumNavbar';
import { PremiumFooter } from '../../components/layout/PremiumFooter';

const sites = [
  { name: 'Launch Website', domain: 'demo.vortic.website', status: 'Published', pages: 4, updated: 'Today', score: '100' },
  { name: 'AI Startup Funnel', domain: 'ai-demo.vortic.website', status: 'Draft', pages: 2, updated: 'Yesterday', score: '98' },
  { name: 'Agency Lead Gen', domain: 'agency.vortic.website', status: 'Published', pages: 6, updated: '2 days ago', score: '99' },
];

const cards = [
  ['Active websites', '3', 'Across published and draft workspaces'],
  ['Templates available', '165', 'Ready for instant application'],
  ['Conversions captured', '428', 'From secure lead forms'],
  ['Average score', '99', 'Performance target across pages'],
];

export const metadata = {
  title: 'Dashboard | Vortic.website',
  description: 'Manage Vortic websites, pages, publishing status, templates, and analytics from one dashboard.',
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PremiumNavbar />
      <section className="px-6 pb-12 pt-28">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Workspace dashboard</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">Manage every website from one command center.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">Monitor publishing status, open the visual editor, browse templates, and jump into analytics without leaving the Vortic operating system.</p>
            </div>
            <div className="flex gap-3">
              <a href="/templates" className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-indigo-500/10">Templates</a>
              <a href="/editor" className="rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-indigo-100">New page</a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {cards.map(([label, value, help]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/10">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-3 text-4xl font-black text-white">{value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{help}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/50 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-lg font-black text-white">Websites</h2>
                <p className="text-xs text-slate-500">Demo-ready workspace list; wire to Prisma for live accounts.</p>
              </div>
              <a href="/dashboard/analytics" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white hover:bg-indigo-500">View analytics</a>
            </div>
            <div className="divide-y divide-white/10">
              {sites.map((site) => (
                <div key={site.domain} className="grid gap-4 p-5 text-sm md:grid-cols-[1.2fr_1fr_0.6fr_0.6fr_0.8fr] md:items-center">
                  <div>
                    <p className="font-black text-white">{site.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{site.domain}</p>
                  </div>
                  <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">{site.status}</span>
                  <p className="text-slate-400">{site.pages} pages</p>
                  <p className="text-slate-400">Score {site.score}</p>
                  <div className="flex gap-2 md:justify-end">
                    <a href="/editor" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">Edit</a>
                    <a href="/dashboard/analytics" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">Stats</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
