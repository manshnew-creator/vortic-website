'use client';

import React, { useState, useEffect } from 'react';
import { PremiumNavbar } from '../../../components/layout/PremiumNavbar';
import { PremiumFooter } from '../../../components/layout/PremiumFooter';

interface FunnelItem {
  label: string;
  value: number;
  rate: string;
}

export default function AnalyticsDashboardPage() {
  const [funnel, setFunnel] = useState<FunnelItem[]>([]);
  const [referrers, setReferrers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API call to /api/analytics or Prisma
    const fetchAnalytics = async () => {
      await new Promise(resolve => setTimeout(resolve, 700));

      setFunnel([
        { label: 'Visitors', value: 12840, rate: '100%' },
        { label: 'CTA clicks', value: 2410, rate: '18.8%' },
        { label: 'Form starts', value: 1184, rate: '9.2%' },
        { label: 'Conversions', value: 428, rate: '3.3%' },
      ]);

      setReferrers(['Google Ads', 'Direct', 'LinkedIn', 'Instagram', 'Partner site']);
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

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

          {loading ? (
            <div className="text-center py-10 text-slate-400">جاري تحميل بيانات التحليلات...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                {funnel.map((item, index) => (
                  <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{item.label}</p>
                    <p className="mt-3 text-3xl font-black text-white">{item.value.toLocaleString()}</p>
                    <p className="mt-2 text-xs font-bold text-indigo-300">{item.rate} funnel share</p>
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
                      <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{item}</span>
                          <span>{32 - index * 5}%</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-800">
                          <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${32 - index * 5}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
