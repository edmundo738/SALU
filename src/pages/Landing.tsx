import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Handshake,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { PublicLayout } from '../components/Layouts';
import { ButtonLink, Button } from '../components/ui/Base';

function HeroVisual() {
  const { t } = useI18n();
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081C41] p-5 sm:p-7 shadow-2xl">
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#1D6FE5]/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[#F97316]/30 blur-3xl" />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 420" fill="none" aria-hidden="true">
          <path d="M-20 340 Q180 300 300 390 T540 300" stroke="#F97316" strokeOpacity=".55" strokeWidth="2" />
          <path d="M-20 80 Q130 20 280 80 T540 30" stroke="#60A5FA" strokeOpacity=".45" strokeWidth="1.5" />
          <g stroke="#93C5FD" strokeOpacity=".2">
            {Array.from({ length: 8 }).map((_, index) => (
              <line key={index} x1={40 + index * 60} y1="0" x2={-40 + index * 60} y2="420" />
            ))}
          </g>
        </svg>
      </div>
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
            <Sparkles className="w-3.5 h-3.5 text-[#FDBA74]" aria-hidden="true" />
            {t('landing.eyebrow')}
          </div>
          <span className="text-[10px] font-mono text-white/50">LUANDA · 2024</span>
        </div>
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F97316] flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{t('landing.step1.title')}</p>
                <p className="text-xs text-white/60 truncate">{t('landing.mock1')}</p>
              </div>
              <span className="ml-auto text-[10px] font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                {t('status.request.OPEN')}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-[#1D6FE5]/30 bg-[#1D6FE5]/15 p-4 backdrop-blur sm:ml-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1D6FE5] flex items-center justify-center">
                <Handshake className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{t('landing.step2.title')}</p>
                <p className="text-xs text-white/60 truncate">{t('landing.mock2')}</p>
              </div>
              <span className="ml-auto text-[10px] font-bold text-[#93C5FD] bg-[#1D6FE5]/20 border border-[#93C5FD]/20 rounded-full px-2 py-0.5">
                {t('status.proposal.ACCEPTED')}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 backdrop-blur sm:ml-12">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{t('landing.step3.title')}</p>
                <p className="text-xs text-white/60 truncate">{t('landing.mock3')}</p>
              </div>
              <span className="ml-auto text-[10px] font-bold text-emerald-200 bg-emerald-400/15 border border-emerald-300/20 rounded-full px-2 py-0.5">
                {t('status.agreement.COMPLETED')}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-white/50">
          {t('landing.mockLabel')} · {t('agreement.paymentNote')}
        </p>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { t } = useI18n();
  return (
    <PublicLayout>
      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] via-[#EFF6FF] to-[#FFF7ED] dark:from-[#060E20] dark:via-[#081C41] dark:to-[#0C1833]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#FED7AA] bg-white/80 px-3 py-1.5 text-xs font-bold text-[#C2410C] dark:border-[#F97316]/30 dark:bg-[#0C1833] dark:text-[#FDBA74]">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              {t('landing.eyebrow')}
            </p>
            <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] text-[#081C41] dark:text-white">
              {t('landing.title')}
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#475569] dark:text-[#CBD5E1] max-w-xl">
              {t('landing.subtitle')}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <ButtonLink to="/criar-conta" size="lg" className="w-full sm:w-auto">
                {t('landing.ctaPrimary')}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink to="/entrar" size="lg" variant="secondary" className="w-full sm:w-auto">
                {t('landing.ctaSecondary')}
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
              <Link
                to="/explorar"
                className="font-semibold underline underline-offset-4 hover:text-[#C2410C] dark:hover:text-[#FDBA74]"
              >
                {t('landing.ctaBrowse')}
              </Link>{' '}
              · {t('landing.honesty.dont3')}
            </p>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* 2. How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C2410C] dark:text-[#FDBA74]">01 · 02 · 03</p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            {t('landing.step1.title')} → {t('landing.step3.title')}
          </h2>
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { icon: FileText, title: t('landing.step1.title'), body: t('landing.step1.body'), n: '1' },
            { icon: MessageSquare, title: t('landing.step2.title'), body: t('landing.step2.body'), n: '2' },
            { icon: Handshake, title: t('landing.step3.title'), body: t('landing.step3.body'), n: '3' },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#1E325C] dark:bg-[#0C1833]"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#132347] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#1D6FE5] dark:text-[#93C5FD]" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#94A3B8]">0{step.n}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#0F172A] dark:text-white">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#64748B] dark:text-[#94A3B8]">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. One account, two modes */}
      <section className="border-y border-[#E2E8F0] bg-white dark:border-[#1E325C] dark:bg-[#081C41]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#C2410C] dark:text-[#FDBA74]">SALU</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
              {t('landing.audience.title')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B] dark:text-[#CBD5E1]">
              {t('onboarding.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-5 dark:border-[#1D6FE5]/40 dark:bg-[#0C1833]">
              <UsersIcon className="w-6 h-6 text-[#1D6FE5] dark:text-[#93C5FD]" />
              <h3 className="mt-3 text-base font-bold text-[#0F172A] dark:text-white">
                {t('landing.audience.customer')}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
                {t('landing.audience.customerBody')}
              </p>
            </div>
            <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-5 dark:border-[#F97316]/40 dark:bg-[#0C1833]">
              <Search className="w-6 h-6 text-[#C2410C] dark:text-[#FDBA74]" aria-hidden="true" />
              <h3 className="mt-3 text-base font-bold text-[#0F172A] dark:text-white">
                {t('landing.audience.provider')}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
                {t('landing.audience.providerBody')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Honesty */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C2410C] dark:text-[#FDBA74]">
            TRANSPARÊNCIA
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            {t('landing.honesty.title')}
          </h2>
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-emerald-900 dark:text-emerald-100">
              <BadgeCheck className="w-4 h-4" aria-hidden="true" /> {t('common.success')}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-emerald-950 dark:text-emerald-100">
              {[t('landing.honesty.do1'), t('landing.honesty.do2'), t('landing.honesty.do3')].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#1E325C] dark:bg-[#0C1833]">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-[#334155] dark:text-[#E2E8F0]">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" /> {t('landing.honesty.title')}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#475569] dark:text-[#CBD5E1]">
              {[t('landing.honesty.dont1'), t('landing.honesty.dont2'), t('landing.honesty.dont3')].map((item) => (
                <li key={item} className="flex gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#C2410C] dark:text-[#FDBA74]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#081C41] px-6 sm:px-10 py-10 sm:py-14">
          <div className="absolute inset-0 opacity-60" aria-hidden="true">
            <div className="absolute -top-20 right-10 w-72 h-72 rounded-full bg-[#F97316]/25 blur-3xl" />
            <div className="absolute -bottom-24 left-10 w-80 h-80 rounded-full bg-[#1D6FE5]/30 blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {t('landing.final.title')}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-white/70 max-w-xl">{t('landing.final.body')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <ButtonLink to="/criar-conta" size="lg" className="w-full sm:w-auto">
                {t('landing.ctaPrimary')}
              </ButtonLink>
              <ButtonLink to="/entrar" size="lg" variant="secondary" className="w-full sm:w-auto">
                {t('landing.ctaSecondary')}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
