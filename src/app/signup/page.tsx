import React from 'react';
import { PremiumNavbar } from '../../components/layout/PremiumNavbar';
import { PremiumFooter } from '../../components/layout/PremiumFooter';

export const metadata = { title: 'Sign up | Vortic.website' };

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PremiumNavbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 shadow-2xl shadow-black/20">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Create workspace</p>
          <h1 className="mt-3 text-3xl font-black text-white">Start building with Vortic</h1>
          <form className="mt-8 space-y-4">
            <input type="text" placeholder="Full name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white" />
            <input type="email" placeholder="Work email" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white" />
            <input type="password" placeholder="Password" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white" />
            <a href="/onboarding" className="block w-full rounded-2xl bg-white px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-slate-950">Create account</a>
          </form>
          <p className="mt-5 text-center text-xs text-slate-500">Already have an account? <a href="/login" className="text-indigo-300">Log in</a></p>
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
