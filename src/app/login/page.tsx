'use client';

import React, { useState } from 'react';
import { PremiumNavbar } from '../../components/layout/PremiumNavbar';
import { PremiumFooter } from '../../components/layout/PremiumFooter';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // TODO: Replace with real Supabase Auth or NextAuth
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!email || !password) {
        throw new Error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      }

      // On success
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PremiumNavbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 shadow-2xl shadow-black/20">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">Welcome back</p>
          <h1 className="mt-3 text-3xl font-black text-white">Log in to Vortic</h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white"
              required
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">تم تسجيل الدخول بنجاح! جاري التحويل...</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 disabled:opacity-70"
            >
              {loading ? 'جاري الدخول...' : 'Continue'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            No account? <a href="/signup" className="text-indigo-300">Create one</a>
          </p>
        </div>
      </section>
      <PremiumFooter />
    </main>
  );
}
