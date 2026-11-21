import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fade out at 1.8s, finish at 2.2s
    const timer1 = setTimeout(() => setFade(true), 1800);
    const timer2 = setTimeout(() => onFinish(), 2200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#061534] text-white transition-opacity duration-500 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background glow effects */}
      <div className="absolute w-96 h-96 rounded-full bg-[#1D6FE5]/20 blur-3xl pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-[#F97316]/15 blur-2xl pointer-events-none translate-y-12" />

      {/* Main Branding Block */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Animated Logo Container */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#081C41] to-[#0D2B60] border border-white/20 p-4 shadow-2xl flex items-center justify-center animate-pulse">
            <img
              src="/assets/sprites/salu-mark.png"
              alt="SALU"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                // Fallback to text if sprite path differs
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F97316]"></span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          SALU
        </h1>
        <div className="text-xs uppercase font-bold tracking-widest text-[#F97316] mb-4">
          Serviços · Oportunidades · Confiança
        </div>

        <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed mb-6">
          «Onde as habilidades existem, as{' '}
          <span className="text-[#F97316] font-bold">oportunidades</span> também.»
        </p>

        <p className="text-xs text-slate-400 max-w-sm mb-8 leading-normal">
          Conectando pessoas com competências práticas a famílias e empresas que precisam de soluções em Angola.
        </p>

        {/* Skip button for user convenience */}
        <button
          onClick={onFinish}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 border border-white/15 transition-all cursor-pointer"
        >
          <span>Entrar na plataforma</span>
          <span>→</span>
        </button>
      </div>

      {/* Subtle loader bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#1D6FE5] via-[#F97316] to-[#FF6A00] animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  );
}
