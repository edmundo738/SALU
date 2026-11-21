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
  XCircle,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { PublicLayout } from '../components/Layouts';
import { ButtonLink, Button } from '../components/ui/Base';

export function LandingPage() {
  const { t } = useI18n();
  return (
    <PublicLayout>
      {/* 1. Hero */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] dark:border-[#1E325C]">
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-[#F2F7FF] to-white dark:from-[#060E20] dark:via-[#081C41] dark:to-[#060E20]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-40 dark:opacity-25"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(29,111,229,0.30), transparent 62%)',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-24 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C2410C] dark:text-[#FDBA74]">
            {t('landing.eyebrow')}
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-[2.5rem] font-extrabold leading-[1.04] tracking-[-0.03em] text-[#081C41] dark:text-white sm:text-6xl">
            {t('landing.title')}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#475569] dark:text-[#CBD5E1] sm:text-lg">
            {t('landing.subtitle')}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink to="/criar-conta" size="lg" className="w-full sm:w-auto">
              {t('landing.ctaPrimary')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink to="/entrar" size="lg" variant="secondary" className="w-full sm:w-auto">
              {t('landing.ctaSecondary')}
            </ButtonLink>
          </div>
          <p className="mt-7 text-sm">
            <Link
              to="/explorar"
              className="font-semibold text-[#081C41] underline decoration-[#F97316] decoration-2 underline-offset-4 hover:text-[#C2410C] dark:text-white dark:hover:text-[#FDBA74]"
            >
              {t('landing.ctaBrowse')}
            </Link>
          </p>
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
