'use client';

import React, { useEffect, useMemo, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type ToastPayload = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = Required<ToastPayload> & { id: string };

const TOAST_EVENT = 'vortic:toast';

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-400/30 bg-emerald-500/12 text-emerald-50 shadow-emerald-950/30',
  error: 'border-rose-400/30 bg-rose-500/12 text-rose-50 shadow-rose-950/30',
  info: 'border-indigo-400/30 bg-indigo-500/12 text-indigo-50 shadow-indigo-950/30',
  warning: 'border-amber-400/30 bg-amber-500/12 text-amber-50 shadow-amber-950/30',
};

const variantIcons: Record<ToastVariant, string> = {
  success: '✅',
  error: '⚠️',
  info: '✨',
  warning: '🟡',
};

export function toast(payload: ToastPayload) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastPayload>).detail;
      const id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const next: ToastItem = {
        id,
        title: detail.title,
        description: detail.description || '',
        variant: detail.variant || 'info',
        duration: detail.duration || 4200,
      };

      setItems((current) => [...current.slice(-3), next]);
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, next.duration);
    };

    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  const regionLabel = useMemo(() => 'Vortic notifications', []);

  return (
    <>
      {children}
      <div
        aria-live="polite"
        aria-label={regionLabel}
        className="fixed bottom-4 right-4 z-[9999] flex w-[min(92vw,24rem)] flex-col gap-3 pointer-events-none"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl animate-toast-in ${variantStyles[item.variant]}`}
            role={item.variant === 'error' ? 'alert' : 'status'}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-base" aria-hidden="true">{variantIcons[item.variant]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black leading-snug tracking-tight">{item.title}</p>
                {item.description && <p className="mt-1 text-xs leading-relaxed opacity-80">{item.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((toastItem) => toastItem.id !== item.id))}
                className="rounded-lg px-1.5 py-0.5 text-xs opacity-70 transition hover:bg-white/10 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
