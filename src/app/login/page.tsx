import React from 'react';
import { PremiumNavbar } from '../../components/layout/PremiumNavbar';
import { PremiumFooter } from '../../components/layout/PremiumFooter';

export const metadata = { title: 'Login | Vortic.website' };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PremiumNavbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 shadow-2xl shadow-black/20">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Welcome back</p>
          <h1 className="mt-3 text-3xl font-black text-white">Log in to Vortic</h1>
          <form className="mt-8 space-y-4">
            <input type="email" placeholder="Email address" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white" />
            <input type="password" placeholder="Password" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white" />
            <button type="button" className="w-full rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950">Continue</button>
          </form>
          <p className="mt-5 text-center text-xs text-slate-500">No account? <a href="/signup" className="text-indigo-300">Create one</a></p>
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
