import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { SUPPORT_EMAIL } from '../lib/config';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[SALU] Erro de interface:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const english = typeof navigator !== 'undefined' && !navigator.language.toLowerCase().startsWith('pt');
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#060E20] p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-700 dark:text-red-300" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-[#0F172A] dark:text-white">
            {english ? 'Something went wrong.' : 'Algo correu mal.'}
          </h1>
          <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
            {english
              ? `The interface hit an unexpected error. Reload the page.${SUPPORT_EMAIL ? ` If it persists, contact ${SUPPORT_EMAIL}.` : ''}`
              : `A interface encontrou um erro inesperado. Recarrega a página.${SUPPORT_EMAIL ? ` Se continuar, contacta ${SUPPORT_EMAIL}.` : ''}`}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 min-h-11 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white hover:bg-[#EA580C]"
          >
            {english ? 'Reload' : 'Recarregar'}
          </button>
        </div>
      </div>
    );
  }
}
