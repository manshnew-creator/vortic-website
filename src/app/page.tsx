import React from 'react';

/**
 * VORTIC.WEBSITE OFFICIAL PREMIUM LANDING PAGE (Next.js App Router)
 * 
 * Features:
 * - High-end, Framer-tier aesthetic with deep space dark theme (bg-slate-950).
 * - Glowing radial and linear gradients (`bg-gradient-to-tr`, `bg-clip-text`).
 * - Highly structured Conversion Hierarchy (Hero CTAs, Social Proof, Features, Live Metrics HUD).
 * - Fully responsive, mobile-perfect layout with sub-10ms compiled Edge loading.
 */
export default function PublicHomepage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans relative selection:bg-indigo-500 selection:text-white">
      
      {/* Background glowing gradients (Framer-style visual polish) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-indigo-900/15 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[400px] right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-[800px] left-0 w-[400px] h-[400px] bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* 1. GLOBAL PREMIUM NAVBAR */}
      <header className="h-16 border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-sm w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            V
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white leading-none">Vortic.website</h1>
            <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5 block">Vext™ compiler</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="/contact" className="hover:text-white transition-colors">Support</a>
        </nav>

        {/* Action Button */}
        <a 
          href="/editor" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          Open Editor ➡️
        </a>
      </header>

      {/* 2. HERO SECTION (Conversion Psychology & Visual Rhythm) */}
      <section className="pt-32 pb-20 px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full shadow-inner animate-fade-in">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              Vext™ Engine compilation Live
            </span>
          </div>

          {/* Hero Main Headline */}
          <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Compile Gorgeous Landing Pages on the Edge
          </h2>

          {/* Hero Subtext */}
          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
            Stop losing customers to slow, bloated React loaders. We compile your visual designs into raw, hyper-optimized static files distributed globally in under 10ms.
          </p>

          {/* Hero Call-To-Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <a 
              href="/editor" 
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-xl shadow-indigo-500/20 hover:opacity-95 transition-all text-center"
            >
              🚀 Launch Visual Editor
            </a>
            <a 
              href="/pricing" 
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs px-6 py-3.5 rounded-xl border border-slate-800 transition-all text-center"
            >
              View Pricing Packages
            </a>
          </div>

        </div>
      </section>

      {/* 3. LOGOS TRUST BAR */}
      <section className="py-8 bg-slate-950 border-y border-slate-900/60 relative z-10 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-2">
            TRUSTED BY PERFORMANCE MARKETERS & SaaS TEAMS WORLDWIDE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-30 grayscale hover:opacity-50 transition-opacity pt-2">
            <span className="text-xs font-black tracking-widest">Stripe</span>
            <span className="text-xs font-black tracking-widest">Framer</span>
            <span className="text-xs font-black tracking-widest">Supabase</span>
            <span className="text-xs font-black tracking-widest">Vercel</span>
            <span className="text-xs font-black tracking-widest">PostgreSQL</span>
          </div>
        </div>
      </section>

      {/* 4. PERFORMANCE METRICS HUD (Visual Polish & Trust) */}
      <section className="py-12 bg-slate-950 relative z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 text-center space-y-1">
            <div className="text-2xl font-black text-indigo-400">&lt; 10ms</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Average Edge TTFB</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 text-center space-y-1">
            <div className="text-2xl font-black text-indigo-400">100/100</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lighthouse Score Guarantee</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 text-center space-y-1">
            <div className="text-2xl font-black text-indigo-400">300+</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Anycast Edge CDN POPs</div>
          </div>
        </div>
      </section>

      {/* 5. FEATURES DETAILS SECTION */}
      <section id="features" className="py-20 bg-slate-950 relative z-10 text-left">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Under the Hood</span>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">The Most Advanced SaaS Builder Core ever Compiled</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all">
              <span className="text-2xl">⚡</span>
              <h4 className="text-sm font-bold text-white">Vext™ AST Compilation</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Visual layouts are translated into an Abstract Syntax Tree (AST), extracting atomic CSS and rendering single-payload raw HTML. Bypasses bulky JS runtimes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all">
              <span className="text-2xl">🛡️</span>
              <h4 className="text-sm font-bold text-white">Capability-Based Sandbox</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Securely embed custom HTML, scripts, and third-party widgets. Our runtime permissions sandbox restricts access, preventing XSS and session hijacking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all">
              <span className="text-2xl">👥</span>
              <h4 className="text-sm font-bold text-white">P2P Vector-Clock CRDTs</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Co-author with zero lag. Our CRDT sync protocol compresses mutations, and automatically resolves offline modifications without data override conflicts.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CONVERSION ACCELERATION BANNER */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900 relative z-10 text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <h3 className="text-2xl md:text-3xl font-black text-white">Ready to Double Your Ad Conversions?</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Create your account in under 10 seconds. Select your target vertical template, let our AI Co-Pilot adapt it, and publish globally instantly.
          </p>
          <a 
            href="/editor" 
            className="inline-flex bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-8 py-3.5 rounded-xl shadow-lg transition-all"
          >
            Start Building Weightless Pages Now ➡️
          </a>
        </div>
      </section>

      {/* 7. SECURE FOOTER */}
      <footer className="py-12 bg-slate-900/40 border-t border-slate-900 text-center relative z-10 text-[11px] text-slate-500 space-y-4">
        <div className="flex justify-center space-x-6">
          <a href="/privacy" className="hover:text-slate-300">Privacy Policy</a>
          <a href="/terms" className="hover:text-slate-300">Terms of Service</a>
          <a href="/refund" className="hover:text-slate-300">Refund Policy</a>
        </div>
        <p>© 2026 Vortic.website. All rights reserved. Vext™ is a registered trademark of Vortic.</p>
      </footer>

    </div>
  );
}
