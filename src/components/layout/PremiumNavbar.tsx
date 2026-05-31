import React from 'react';

const navLinks = [
  { label: 'Product', href: '/#product' },
  { label: 'Templates', href: '/templates' },
  { label: 'Use Cases', href: '/#use-cases' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: '/contact' },
];

function VorticLogo() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 ring-1 ring-white/10 sm:h-10 sm:w-10">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-cyan-400 opacity-40 blur-md" />
      <svg className="relative h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="nav-vortex-a" x1="0" x2="100" y1="0" y2="100">
            <stop stopColor="#818cf8" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="nav-vortex-b" x1="100" x2="0" y1="0" y2="100">
            <stop stopColor="#22d3ee" />
            <stop offset="1" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        <path d="M50 10c22 0 40 18 40 40 0 12-5.3 23-13.7 30.3" stroke="url(#nav-vortex-a)" strokeWidth="8" strokeLinecap="round" />
        <path d="M50 90c-22 0-40-18-40-40 0-10.4 4-20 10.5-27.1" stroke="url(#nav-vortex-b)" strokeWidth="8" strokeLinecap="round" />
        <path d="M50 27c12.7 0 23 10.3 23 23 0 6.6-2.8 12.6-7.3 16.8" stroke="url(#nav-vortex-b)" strokeWidth="6" strokeLinecap="round" />
        <path d="M50 73c-12.7 0-23-10.3-23-23 0-5.5 1.9-10.5 5.2-14.5" stroke="url(#nav-vortex-a)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="50" cy="50" r="8" fill="white" />
      </svg>
    </div>
  );
}

export function PremiumNavbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-slate-950/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <a href="/" className="group flex items-center gap-3" aria-label="Vortic homepage">
          <VorticLogo />
          <div className="leading-none">
            <p className="text-sm font-black tracking-tight text-white sm:text-[15px]">vortic</p>
            <p className="mt-1 text-[8px] font-black uppercase tracking-[0.22em] text-indigo-300 sm:text-[9px]">Vext™ Engine</p>
          </div>
        </a>

        <nav className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.035] p-1 text-[11px] font-black uppercase tracking-wider text-slate-400 lg:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="rounded-xl px-3.5 py-2 transition hover:bg-white/10 hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <a href="/templates" className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition hover:border-indigo-400/60 hover:bg-indigo-500/10">
            165 Templates
          </a>
          <a href="/editor" className="rounded-2xl bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-white/10 transition hover:bg-indigo-100">
            Open Editor
          </a>
        </div>

        <details className="group relative sm:hidden">
          <summary className="list-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-black/20 marker:hidden">
            Menu
          </summary>
          <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-2 shadow-2xl shadow-black/60">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="block rounded-2xl px-4 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white">
                {link.label}
              </a>
            ))}
            <div className="mt-2 grid gap-2 border-t border-white/10 pt-2">
              <a href="/templates" className="rounded-2xl bg-indigo-500/10 px-4 py-3 text-center text-xs font-black text-indigo-200">Browse Templates</a>
              <a href="/editor" className="rounded-2xl bg-white px-4 py-3 text-center text-xs font-black text-slate-950">Open Editor</a>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
