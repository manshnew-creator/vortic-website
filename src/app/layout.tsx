import React from 'react';

export const metadata = {
  title: 'Vortic.website | The Website Operating System',
  description: 'Compile lightweight, high-performance landing pages on the Edge using Vext™.',
};

/**
 * NEXT.JS ROOT LAYOUT (صمام الأمان لـ Vercel Build)
 * 
 * Critical Next.js App Router Requirement:
 * Resolves the fatal Vercel build error "page.tsx doesn't have a root layout."
 * Declares the global HTML wrapper, document head, and body rendering context.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
