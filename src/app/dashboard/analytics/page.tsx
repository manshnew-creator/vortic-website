import React from 'react';
import { PremiumNavbar } from '../../../components/layout/PremiumNavbar';
import { PremiumFooter } from '../../../components/layout/PremiumFooter';

const funnel = [
  ['Visitors', 12840, '100%'],
  ['CTA clicks', 2410, '18.8%'],
  ['Form starts', 1184, '9.2%'],
  ['Conversions', 428, '3.3%'],
];

const referrers = ['Google Ads', 'Direct', 'LinkedIn', 'Instagram', 'Partner site'];

export const metadata = {
  title: 'Analytics Dashboard | Vortic.website',
  description: 'Demo analytics dashboard for Vortic page views, conversions, referrers, and funnel performance.',
};

export default function AnalyticsDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PremiumNavbar />
      <section className="px-6 pb-12 pt-28">
        <div className="mx-auto max-w-7xl space-y-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Analytics</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">Conversion analytics that marketers understand.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">A premium analytics surface for page views, funnel progression, referrers, devices, and form outcomes.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {funnel.map(([label, value, rate]) => (
              <div key={String(label)} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-black text-white">{Number(value).toLocaleString()}</p>
                <p className="mt-2 text-xs font-bold text-indigo-300">{rate} funnel share</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-6">
              <h2 className="text-lg font-black text-white">7-day traffic trend</h2>
              <div className="mt-8 flex h-72 items-end gap-3 border-b border-slate-800 pb-4">
                {[42, 58, 51, 76, 69, 88, 96].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-2xl bg-gradient-to-t from-indigo-600 to-cyan-400" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[10px] font-bold uppercase text-slate-500">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <span key={day}>{day}</span>)}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-6">
              <h2 className="text-lg font-black text-white">Top referrers</h2>
              <div className="mt-5 space-y-3">
                {referrers.map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex justify-between text-xs font-bold"><span>{item}</span><span>{32 - index * 5}%</span></div>
                    <div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${32 - index * 5}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
