import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileEdit,
  Handshake,
  MessageSquare,
  PlayCircle,
  Search,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import { RequestState } from '../../types/salu';
import { translateRequestState, useLang } from '../../i18n/translations';

export function SaluRibbonMark({
  size = 40,
  variant = 'circle',
}: {
  size?: number;
  variant?: 'circle' | 'app-dark' | 'app-light' | 'mark';
}) {
  const srcMap = {
    circle: '/assets/sprites/salu-circle-mark.png',
    'app-dark': '/assets/sprites/salu-app-dark.png',
    'app-light': '/assets/sprites/salu-app-light.png',
    mark: '/assets/sprites/salu-mark.png',
  };

  return (
    <img
      src={srcMap[variant]}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0 object-contain select-none"
      style={{ width: size, height: size }}
    />
  );
}

export function LuandaNightBackdrop({
  variant = 'hero',
}: {
  variant?: 'hero' | 'auth';
}) {
  const isHero = variant === 'hero';
  return (
    <svg
      viewBox="0 0 1440 720"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
    >
      <defs>
        <linearGradient id="luandaSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#051330" />
          <stop offset="48%" stopColor="#0A2252" />
          <stop offset="100%" stopColor="#071636" />
        </linearGradient>
        <radialGradient id="twilightHorizon" cx="68%" cy="46%" r="48%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#2563EB" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#051330" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bayWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12326B" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#061430" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="obeliskBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2D4A7C" />
          <stop offset="50%" stopColor="#5676AC" />
          <stop offset="100%" stopColor="#1D335B" />
        </linearGradient>
        <linearGradient id="leftVignette" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#041029" stopOpacity="0.92" />
          <stop offset="52%" stopColor="#06173B" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#06173B" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <rect width="1440" height="720" fill="url(#luandaSky)" />
      <rect width="1440" height="720" fill="url(#twilightHorizon)" />

      {/* Marginal Downtown High-Rises */}
      <g fill="#0A214B" opacity="0.92">
        <rect x="640" y="210" width="44" height="190" rx="2" />
        <rect x="692" y="170" width="54" height="230" rx="2" />
        <rect x="756" y="230" width="42" height="170" rx="2" />
        <rect x="812" y="135" width="64" height="265" rx="3" />
        <rect x="886" y="195" width="48" height="205" rx="2" />
        <rect x="945" y="160" width="58" height="240" rx="3" />
        <rect x="1140" y="180" width="60" height="220" rx="3" />
        <rect x="1210" y="128" width="68" height="272" rx="3" />
        <rect x="1288" y="200" width="52" height="200" rx="2" />
        <rect x="1350" y="220" width="62" height="180" rx="2" />
      </g>

      {/* Warm Amber & Cool Ice City Lights */}
      <g fill="#FBBF24" opacity="0.62">
        <rect x="706" y="188" width="4" height="5" />
        <rect x="718" y="188" width="4" height="5" />
        <rect x="730" y="206" width="4" height="5" />
        <rect x="826" y="154" width="5" height="5" />
        <rect x="840" y="154" width="5" height="5" />
        <rect x="854" y="172" width="5" height="5" />
        <rect x="826" y="196" width="5" height="5" />
        <rect x="840" y="216" width="5" height="5" />
        <rect x="958" y="180" width="5" height="5" />
        <rect x="972" y="196" width="5" height="5" />
        <rect x="1226" y="148" width="5" height="6" />
        <rect x="1240" y="148" width="5" height="6" />
        <rect x="1254" y="166" width="5" height="6" />
        <rect x="1226" y="190" width="5" height="6" />
        <rect x="1302" y="218" width="4" height="5" />
      </g>

      {/* Bay of Luanda Water & Golden Shimmer Reflections */}
      <path d="M0 392 Q520 382 1440 400 L1440 620 L0 620 Z" fill="url(#bayWater)" />
      <g stroke="#93C5FD" strokeOpacity="0.2" strokeWidth="1.5">
        <line x1="480" y1="440" x2="720" y2="440" />
        <line x1="780" y1="472" x2="1080" y2="472" />
        <line x1="600" y1="504" x2="940" y2="504" />
        <line x1="1120" y1="488" x2="1380" y2="488" />
      </g>
      <g stroke="#F97316" strokeOpacity="0.32" strokeWidth="2">
        <line x1="825" y1="425" x2="865" y2="425" />
        <line x1="830" y1="448" x2="860" y2="448" />
        <line x1="1225" y1="432" x2="1272" y2="432" />
        <line x1="1235" y1="454" x2="1264" y2="454" />
      </g>

      {/* Iconic Agostinho Neto Memorial Silhouette */}
      <g opacity="0.88">
        <path d="M905 516 L1165 516 L1140 492 L930 492 Z" fill="#182D54" />
        <path d="M976 502 L1026 268 L1042 268 L1004 502 Z" fill="#2A4474" />
        <path d="M1098 502 L1048 268 L1032 268 L1072 502 Z" fill="#1C325B" />
        <polygon points="1018,488 1033,52 1042,52 1056,488" fill="url(#obeliskBody)" />
      </g>

      {/* Marginal Promenade & Palm Fronds */}
      <path d="M0 595 Q720 558 1440 605 L1440 720 L0 720 Z" fill="#041027" />
      <g fill="#FBBF24" opacity="0.6">
        <circle cx="540" cy="576" r="2.4" />
        <circle cx="640" cy="571" r="2.4" />
        <circle cx="740" cy="569" r="2.4" />
        <circle cx="840" cy="571" r="2.4" />
        <circle cx="940" cy="576" r="2.4" />
        <circle cx="1040" cy="581" r="2.4" />
        <circle cx="1140" cy="587" r="2.4" />
        <circle cx="1240" cy="593" r="2.4" />
      </g>

      {/* Palm silhouettes right foreground */}
      <g stroke="#030A1A" strokeWidth="3.5" strokeLinecap="round" opacity="0.7">
        <path d="M1355 680 Q1358 610 1372 565" />
        <path d="M1372 565 Q1340 555 1322 572" strokeWidth="2.2" />
        <path d="M1372 565 Q1350 538 1335 545" strokeWidth="2.2" />
        <path d="M1372 565 Q1398 542 1420 555" strokeWidth="2.2" />
        <path d="M1372 565 Q1405 566 1422 586" strokeWidth="2.2" />
      </g>

      {/* Readability vignette for hero text */}
      <rect width="1440" height="720" fill="url(#leftVignette)" />

      {/* Sweeping Vibrant Orange Orbital Curve matching reference */}
      {isHero ? (
        <path
          d="M990 480 Q1165 215 1470 110"
          stroke="#F97316"
          strokeWidth="2.5"
          strokeOpacity="0.85"
          fill="none"
        />
      ) : (
        <path
          d="M-40 600 Q280 540 560 740"
          stroke="#F97316"
          strokeWidth="2.5"
          strokeOpacity="0.9"
          fill="none"
        />
      )}
    </svg>
  );
}

export const REQUEST_STATE_META: Record<
  RequestState,
  {
    label: string;
    shortLabel: string;
    tone: 'neutral' | 'blue' | 'orange' | 'emerald' | 'amber' | 'red';
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  DRAFT: { label: 'Draft', shortLabel: 'DRAFT', tone: 'neutral', icon: FileEdit },
  OPEN: { label: 'Open for Proposals', shortLabel: 'OPEN', tone: 'blue', icon: Search },
  PROPOSALS_RECEIVED: {
    label: 'Proposals Received',
    shortLabel: 'PROPOSALS_RECEIVED',
    tone: 'blue',
    icon: MessageSquare,
  },
  NEGOTIATING: {
    label: 'Negotiating Terms',
    shortLabel: 'NEGOTIATING',
    tone: 'amber',
    icon: Handshake,
  },
  AGREEMENT_CONFIRMED: {
    label: 'Agreement Confirmed',
    shortLabel: 'AGREEMENT_CONFIRMED',
    tone: 'emerald',
    icon: ShieldCheck,
  },
  IN_PROGRESS: { label: 'In Progress', shortLabel: 'IN_PROGRESS', tone: 'orange', icon: PlayCircle },
  COMPLETION_PENDING: {
    label: 'Awaiting Completion',
    shortLabel: 'COMPLETION_PENDING',
    tone: 'amber',
    icon: Clock,
  },
  COMPLETED: { label: 'Completed', shortLabel: 'COMPLETED', tone: 'emerald', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', shortLabel: 'CANCELLED', tone: 'neutral', icon: XCircle },
  DISPUTED: { label: 'Disputed · Under Review', shortLabel: 'DISPUTED', tone: 'red', icon: AlertTriangle },
};

const TONE_CLASSES = {
  neutral:
    'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#132347] border-slate-200 dark:border-[#1E325C]',
  blue:
    'text-[#1558B8] dark:text-[#93C5FD] bg-[#EFF6FF] dark:bg-[#1D6FE5]/20 border-[#BFDBFE] dark:border-[#1D6FE5]/40',
  orange:
    'text-[#C2410C] dark:text-[#FDBA74] bg-[#FFF7ED] dark:bg-[#F97316]/20 border-[#FED7AA] dark:border-[#F97316]/40',
  emerald:
    'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
  amber:
    'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
  red: 'text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/70',
};

export function RequestStateTag({
  state,
  showCode = false,
}: {
  state: RequestState;
  showCode?: boolean;
}) {
  const { lang } = useLang();
  const meta = REQUEST_STATE_META[state];
  const Icon = meta.icon;
  const dotColor =
    meta.tone === 'emerald'
      ? 'bg-[#10B981]'
      : meta.tone === 'orange'
        ? 'bg-[#F97316]'
        : meta.tone === 'blue'
          ? 'bg-[#1D6FE5]'
          : meta.tone === 'amber'
            ? 'bg-[#F59E0B]'
            : meta.tone === 'red'
              ? 'bg-[#EF4444]'
              : 'bg-[#94A3B8]';
  const showDot = ['OPEN', 'PROPOSALS_RECEIVED', 'NEGOTIATING', 'IN_PROGRESS', 'DRAFT'].includes(
    state
  );

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border whitespace-nowrap shrink-0 ${TONE_CLASSES[meta.tone]}`}
    >
      {showDot ? (
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
      ) : (
        <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      )}
      <span>{showCode ? meta.shortLabel : translateRequestState(state, meta.label, lang)}</span>
    </span>
  );
}

/**
 * Clean geometric hairline divider in Nocturnal Navy, Cobalt Blue & SALU Orange.
 */
export function GeometricSoulDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden select-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-[20px] text-[#CBD5E1] dark:text-[#1E325C]"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="10" x2="1200" y2="10" stroke="currentColor" strokeWidth="1" strokeOpacity="0.8" />
        <g stroke="#F97316" strokeWidth="1.4" strokeOpacity="0.85">
          <polygon points="600,2 608,10 600,18 592,10" fill="#F97316" fillOpacity="0.25" />
          <polygon points="574,4 580,10 574,16 568,10" fill="none" />
          <polygon points="626,4 632,10 626,16 620,10" fill="none" />
          <path d="M550 10L557 4M550 10L557 16" stroke="#1D6FE5" />
          <path d="M650 10L643 4M650 10L643 16" stroke="#1D6FE5" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Subtle geometric corner linework in vibrant orange & cobalt blue for Navy banners.
 */
export function CornerCraftMotif() {
  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute right-0 top-0 h-full w-auto pointer-events-none opacity-30"
      aria-hidden="true"
    >
      <path
        d="M40 0L220 180M80 0L220 140M120 0L220 100M160 0L220 60"
        stroke="#F97316"
        strokeWidth="1.3"
      />
      <polygon points="150,40 175,65 150,90 125,65" stroke="#93C5FD" strokeWidth="1.3" />
      <polygon points="150,53 162,65 150,77 138,65" stroke="#F97316" strokeWidth="1.4" />
    </svg>
  );
}

export function SafeAvatar({
  src,
  alt,
  sizeClass = 'w-11 h-11',
  roundedClass = 'rounded-xl',
}: {
  src?: string;
  alt: string;
  sizeClass?: string;
  roundedClass?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${sizeClass} ${roundedClass} bg-[#F1F5F9] dark:bg-[#132347] border border-[#E2E8F0] dark:border-[#1E325C] flex items-center justify-center text-[#475569] dark:text-[#94A3B8] shrink-0`}
        aria-label={alt}
      >
        <User className="w-5 h-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${sizeClass} ${roundedClass} object-cover border border-[#E2E8F0] dark:border-[#1E325C] shrink-0`}
    />
  );
}

export function SafeBannerImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-[#EFF6FF] to-[#E2E8F0] dark:from-[#0C1833] dark:to-[#132347] border border-[#E2E8F0] dark:border-[#1E325C] flex flex-col items-center justify-center p-8 text-center`}
      >
        <ShieldCheck className="w-10 h-10 text-[#1D6FE5] dark:text-[#F97316] mb-3" />
        <p className="text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC]">
          {fallbackTitle || alt}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function ReliabilityBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#475569] dark:text-[#94A3B8]">{label}</span>
        <span className="font-mono tabular-nums font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
          {value}%
        </span>
      </div>
      <div className="h-2 w-full bg-[#E2E8F0] dark:bg-[#132347] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#081C41] via-[#1D6FE5] to-[#F97316] dark:from-[#3B82F6] dark:to-[#F97316] transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
