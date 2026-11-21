import React from 'react';
import { AlertTriangle } from 'lucide-react';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#060E20] p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-700 dark:text-red-300" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-[#0F172A] dark:text-white">Algo correu mal.</h1>
          <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
            A interface encontrou um erro inesperado. Recarrega a página. Se continuar, contacta suporte@salu.ao.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 min-h-11 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white hover:bg-[#EA580C]"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}
