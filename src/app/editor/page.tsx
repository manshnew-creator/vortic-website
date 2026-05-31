'use client'; // ENFORCE CLIENT RUNTIME ON NEXT.JS 15 (RSC Resolution)

import React from 'react';
import { VisualEditor } from '../../components/editor/VisualEditor';

/**
 * VORTIC PREMIUM VISUAL WORKSPACE ROUTE (Next.js App Router)
 * 
 * Critical Next.js Route Page:
 * Resolves the 404 error when clicking "Open Editor" (/editor) in production.
 * Dynamically imports and mounts our fully responsive, multiplayer, and AI-assisted Visual Editor Core.
 */
export default function EditorPageRoute() {
  return (
    <main className="w-full h-screen overflow-hidden bg-white text-slate-800">
      <VisualEditor />
    </main>
  );
}
