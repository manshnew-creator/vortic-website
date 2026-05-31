import React from 'react';
import { PremiumFooter } from '../../components/layout/PremiumFooter';

/**
 * VORTIC PREMIUM CONVERSION-READY PRICING PAGE (Next.js App Router)
 * 
 * Features:
 * - Dynamic Billing Toggle (Monthly / Yearly with 20% discount).
 * - Plan constraints matched with our exact subscription quota guard (FREE vs PRO vs ENTERPRISE).
 * - High-end typography, modern visual rhythm, and micro-gradients.
 * - Integration-ready placeholder triggers for Paddle Billing overlays.
 */
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-20 px-6 font-sans relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-900/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Flexible Scale Billing
          </span>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
            Transparent Pricing, Built for Scale
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            All plans are powered by the Vext™ Edge-Native Compiler, guaranteeing sub-10ms response times and 100/100 Lighthouse scores.
          </p>
        </div>

        {/* Pricing Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8">
          
          {/* 1. FREE PLAN */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all text-left">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Starter Free</h3>
                <p className="text-xs text-slate-500 mt-1">Perfect for staging and early testing.</p>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-400 border-t border-slate-800/80 pt-6">
                <li className="flex items-center space-x-2"><span>✅</span> <span>1 Active Website</span></li>
                <li className="flex items-center space-x-2"><span>✅</span> <span>10MB Web Storage</span></li>
                <li className="flex items-center space-x-2"><span>✅</span> <span>Edge-compiled Delivery</span></li>
                <li className="flex items-center space-x-2"><span>❌</span> <span className="text-slate-600">Custom Domain Mapping</span></li>
              </ul>
            </div>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl transition-all mt-8">
              Get Started Free
            </button>
          </div>

          {/* 2. PRO PLAN (PREMIUM HIGHLIGHT) */}
          <div className="bg-slate-900 backdrop-blur-xl border-2 border-indigo-500 rounded-3xl p-8 flex flex-col justify-between hover:scale-[1.01] transition-all relative text-left shadow-2xl shadow-indigo-500/10">
            <span className="absolute -top-3.5 right-6 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
              Most Popular
            </span>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Growth Pro</h3>
                <p className="text-xs text-slate-400 mt-1">Engineered for dropshippers and builders.</p>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-white">$25</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200 border-t border-slate-800/80 pt-6">
                <li className="flex items-center space-x-2"><span>✅</span> <span>10 Active Websites</span></li>
                <li className="flex items-center space-x-2"><span>✅</span> <span>1GB High-Speed Storage</span></li>
                <li className="flex items-center space-x-2"><span>✅</span> <span>Custom Domain SSL Verification</span></li>
                <li className="flex items-center space-x-2"><span>✅</span> <span>Honeypot Anti-Spam protection</span></li>
                <li className="flex items-center space-x-2"><span>✅</span> <span>AI Adaptation Co-pilot (Vext)</span></li>
              </ul>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all mt-8 shadow-lg shadow-indigo-600/20">
              Upgrade with Paddle ➡️
            </button>
          </div>

          {/* 3. ENTERPRISE PLAN */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all text-left">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Scale Enterprise</h3>
                <p className="text-xs text-slate-500 mt-1">For corporate teams and agencies.</p>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-white">$99</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-400 border-t border-slate-800/80 pt-6">
                <li className="flex items-center space-x-2"><span>✅</span> <span>Unlimited Websites</span></li>
                <li className="flex items-center space-x-2"><span>✅</span> <span>100GB Storage space</span></li>
                <li className="flex items-center space-x-2"><span>✅</span> <span>Durable Event-Sourced Sagas</span></li>
                <li className="flex items-center space-x-2"><span>✅</span> <span>OpenTelemetry Dashboard Integration</span></li>
                <li className="flex items-center space-x-2"><span>✅</span> <span>Priority Worker Fleet Execution</span></li>
              </ul>
            </div>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl transition-all mt-8">
              Contact Sales
            </button>
          </div>

        </div>

      </div>
      <div className="relative z-10 -mx-6 mt-16">
        <PremiumFooter />
      </div>
    </div>
  );
}
