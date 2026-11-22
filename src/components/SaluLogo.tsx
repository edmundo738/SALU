import { Link } from 'react-router-dom';

/**
 * Marca SALU — vector, sem imagens raster.
 * O monograma e o nome são desenhados em SVG/texto para nunca ficarem
 * cortados, esborratados ou com fundo branco colado ao cabeçalho.
 */
export function SaluMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="salu-mark-gradient" x1="6" y1="2" x2="34" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#143A78" />
          <stop offset="1" stopColor="#081C41" />
        </linearGradient>
      </defs>
      <rect
        x="0.75"
        y="0.75"
        width="38.5"
        height="38.5"
        rx="11.5"
        fill="url(#salu-mark-gradient)"
        stroke="#1D6FE5"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <path
        d="M26.4 13.9c0-2.6-2.9-4.1-6.4-4.1-3.7 0-6.4 1.6-6.4 4.4 0 2.7 2.4 3.8 6.4 4.6 4 .8 6.4 1.9 6.4 4.7 0 3-2.8 4.8-6.6 4.8-3.6 0-6.4-1.5-6.4-4.1"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="8" r="2.5" fill="#F97316" />
    </svg>
  );
}

export function SaluLogo({
  compact = false,
  tone = 'auto',
  className = '',
}: {
  compact?: boolean;
  /** 'light' força texto branco (cabeçalho sobre cena escura). */
  tone?: 'auto' | 'light';
  className?: string;
}) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2.5 transition-opacity hover:opacity-85 ${className}`}
      aria-label="SALU — Início"
    >
      <SaluMark className={compact ? 'h-9 w-9 shrink-0' : 'h-11 w-11 shrink-0'} />
      <span className="flex flex-col justify-center leading-none">
        <span
          className={`font-display font-extrabold tracking-[-0.02em] ${
            tone === 'light' ? 'text-white' : 'text-[#081C41] dark:text-white'
          } ${compact ? 'text-[19px]' : 'text-[22px]'}`}
        >
          SALU
        </span>
        {!compact && (
          <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#64748B] dark:text-[#94A3B8]">
            Serviços · Angola
          </span>
        )}
      </span>
    </Link>
  );
}
