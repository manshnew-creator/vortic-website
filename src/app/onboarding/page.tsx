'use client';

import React, { useMemo, useState } from 'react';
import { PremiumNavbar } from '../../components/layout/PremiumNavbar';
import { PremiumFooter } from '../../components/layout/PremiumFooter';

const recommendations: Record<string, string> = {
  saas: 'ai_startup_os',
  ecommerce: 'ecommerce_brand',
  local: 'roofing_contractor',
  medical: 'dental_clinic',
  course: 'online_bootcamp',
  creator: 'podcaster_media',
  restaurant: 'coffee_shop',
  agency: 'creative_agency',
};

export default function OnboardingPage() {
  const [businessType, setBusinessType] = useState('saas');
  const [goal, setGoal] = useState('leads');
  const [brand, setBrand] = useState('');
  const templateId = useMemo(() => recommendations[businessType] || 'ai_startup_os', [businessType]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PremiumNavbar />
      <section className="px-6 pb-16 pt-28">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Guided onboarding</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">Start with the right template in under a minute.</h1>
            <p className="mt-5 text-sm leading-8 text-slate-400">Answer three quick questions and Vortic will route you into a suitable template and the visual editor.</p>
          </div>
          <form className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
            <div className="space-y-5">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Business type</span>
                <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white">
                  <option value="saas">SaaS / AI product</option>
                  <option value="ecommerce">Ecommerce / DTC</option>
                  <option value="local">Local service</option>
                  <option value="medical">Medical / clinic</option>
                  <option value="course">Course / coaching</option>
                  <option value="creator">Creator / media</option>
                  <option value="restaurant">Restaurant / hospitality</option>
                  <option value="agency">Agency / consulting</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Primary goal</span>
                <select value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white">
                  <option value="leads">Capture qualified leads</option>
                  <option value="bookings">Book calls / appointments</option>
                  <option value="sales">Sell a product</option>
                  <option value="waitlist">Build a waitlist</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Brand name</span>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Your brand" className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white" />
              </label>
              <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm text-indigo-100">
                Recommended template: <strong>{templateId}</strong><br />Goal: <strong>{goal}</strong>{brand ? <> · Brand: <strong>{brand}</strong></> : null}
              </div>
              <a href={`/editor?template=${encodeURIComponent(templateId)}`} className="block rounded-2xl bg-white px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-indigo-100">Start in editor</a>
            </div>
          </form>
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
