import React from 'react';
import { PremiumNavbar } from '../../components/layout/PremiumNavbar';
import { PremiumFooter } from '../../components/layout/PremiumFooter';

const systems = ['Marketing site', 'Visual editor', 'Template API', 'Publishing API', 'Analytics ingestion', 'Fallback cache'];

export const metadata = { title: 'System Status | Vortic.website' };

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PremiumNavbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-4xl">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">All systems operational</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">Vortic system status</h1>
          <div className="mt-10 space-y-3">
            {systems.map((system) => (
              <div key={system} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <span className="font-bold text-white">{system}</span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">Operational</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
