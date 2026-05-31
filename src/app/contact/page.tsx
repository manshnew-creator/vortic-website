'use client';

import React, { useState } from 'react';
import { toast } from '../../components/ui/ToastProvider';
import { PremiumFooter } from '../../components/layout/PremiumFooter';

/**
 * VORTIC PREMIUM CONTACT & SUPPORT DESK PAGE (Next.js App Router)
 * 
 * Features:
 * - High-end, conversion-focused user interface.
 * - Secure contact form connected directly to our Honeypot anti-spam filter.
 * - Essential support routing required by Paddle merchant compliance.
 * - Integrated sales funnel routing for enterprise clients.
 */
export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: 'support_ticket', data }),
      });

      if (!response.ok) throw new Error('Ticket submission failed');

      toast({
        title: 'Ticket received',
        description: 'We will reply to your email as soon as possible.',
        variant: 'success',
      });
      form.reset();
    } catch {
      toast({
        title: 'Could not send ticket',
        description: 'Please email support@vortic.website directly while we reconnect the support API.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-20 px-6 font-sans relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-900/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            24/7 Support Desk
          </span>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
            How Can We Help You?
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Have questions about billing, enterprise scale, custom domains, or need developer support? Reach out to our technical team instantly.
          </p>
        </div>

        {/* Contact Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-6 text-left">
          
          {/* 1. Technical Support Info Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white">Direct Channels</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our support engineers monitor tickets 24/7 to resolve serverless, DNS, or compilation inquiries in less than 2 hours.
              </p>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📧</span>
                  <div>
                    <div className="font-bold text-slate-300">Technical Support Email</div>
                    <a href="mailto:support@vortic.website" className="text-indigo-400 hover:underline">support@vortic.website</a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">💼</span>
                  <div>
                    <div className="font-bold text-slate-300">Enterprise Sales Inquiry</div>
                    <a href="mailto:sales@vortic.website" className="text-indigo-400 hover:underline">sales@vortic.website</a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">💳</span>
                  <div>
                    <div className="font-bold text-slate-300">Paddle Billing Inquiries</div>
                    <a href="https://paddle.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">paddle.com/support</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800/80 pt-4">
              For security, do not share private credentials or database connection secrets in your help tickets.
            </div>
          </div>

          {/* 2. Contact Ingestion Form */}
          <form onSubmit={handleSubmit} className="bg-slate-900 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 space-y-4 shadow-2xl" aria-busy={isSubmitting}>
            <h2 className="text-lg font-bold text-white">Submit a Ticket</h2>
            
            {/* SPAM PROTECTION: Hidden Honeypot Field (invisible to humans, traps bots) */}
            <input 
              type="text" 
              name="_website_trap_field" 
              className="hidden" 
              placeholder="Leave this empty" 
              tabIndex={-1} 
              autoComplete="off"
            />

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Message / Inquiry Details</label>
              <textarea
                rows={4}
                name="message"
                placeholder="Describe your request..."
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? 'Sending securely...' : 'Submit Ticket ➡️'}
            </button>
          </form>

        </div>

      </div>
      <div className="relative z-10 -mx-6 mt-16">
        <PremiumFooter />
      </div>
    </div>
  );
}
