import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useI18n } from '../i18n';

type Tone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  tone: Tone;
  message: string;
}
interface ToastValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastValue | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((tone: Tone, message: string) => {
    const id = nextId++;
    setItems((current) => [...current.slice(-3), { id, tone, message }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 5200);
  }, []);

  const value = useMemo<ToastValue>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed z-[80] right-3 left-3 sm:left-auto sm:right-6 top-4 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {items.map((item) => {
          const Icon = item.tone === 'success' ? CheckCircle2 : item.tone === 'error' ? AlertCircle : Info;
          return (
            <div
              key={item.id}
              role={item.tone === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl text-sm max-w-md ml-auto ${
                item.tone === 'error'
                  ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/90 dark:border-red-800 dark:text-red-100'
                  : item.tone === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-100'
                    : 'bg-white border-slate-200 text-slate-900 dark:bg-[#0C1833] dark:border-[#1E325C] dark:text-slate-100'
              }`}
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="flex-1 leading-snug">{item.message}</p>
              <button
                type="button"
                className="p-1 -m-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                onClick={() => setItems((current) => current.filter((toast) => toast.id !== item.id))}
                aria-label={t('common.dismiss')}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
