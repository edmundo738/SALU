import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  FileText,
  Handshake,
  MessageSquare,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useAuth } from '../app/AuthProvider';
import { PublicLayout } from '../components/Layouts';
import { ButtonLink } from '../components/ui/Base';
import { CinematicHero } from '../components/landing/Hero';
import { CinematicStory } from '../components/landing/Story';
import { useReveal, useSpotlight } from '../components/landing/motion';
import '../styles/landing.css';

type IconType = React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;

function SpotlightCard({
  index,
  icon: Icon,
  title,
  body,
  delay,
}: {
  index: string;
  icon: IconType;
  title: string;
  body: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useSpotlight(ref);
  useReveal(ref);

  return (
    <div ref={ref} className="cine-card p-6" data-reveal style={{ '--delay': `${delay}ms` } as React.CSSProperties}>
      <div className="relative">
        <div className="flex items-start justify-between">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] dark:bg-[#132347]">
            <Icon className="h-5 w-5 text-[#1D6FE5] dark:text-[#93C5FD]" aria-hidden="true" />
          </span>
          <span className="font-mono text-[0.65rem] font-semibold tracking-[0.24em] text-[#94A3B8]">{index}</span>
        </div>
        <h3 className="mt-5 text-base font-bold text-[#0F172A] dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B] dark:text-[#94A3B8]">{body}</p>
      </div>
    </div>
  );
}

function MarqueeBand() {
  const { t } = useI18n();
  const phrase = t('landing.marquee');
  return (
    <div className="cine-band" aria-hidden="true">
      <div className="cine-marquee">
        {[0, 1].map((copy) => (
          <span key={copy} className="cine-marquee-text">
            {phrase} · {phrase} ·
          </span>
        ))}
      </div>
    </div>
  );
}

function TwoModes() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
      <div ref={ref} data-reveal className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#C2410C] dark:text-[#FDBA74]">
            {t('landing.audience.kicker')}
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-[#0F172A] dark:text-white sm:text-[2.75rem] sm:leading-[1.05]">
            {t('landing.audience.title')}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#64748B] dark:text-[#CBD5E1]">
            {t('onboarding.subtitle')}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-[#BFDBFE] bg-gradient-to-b from-[#EFF6FF] to-white p-6 dark:border-[#1D6FE5]/35 dark:from-[#0C1833] dark:to-[#081C41]">
            <FileText className="h-6 w-6 text-[#1D6FE5] dark:text-[#93C5FD]" aria-hidden="true" />
            <h3 className="mt-4 text-base font-bold text-[#0F172A] dark:text-white">
              {t('landing.audience.customer')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
              {t('landing.audience.customerBody')}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[#FED7AA] bg-gradient-to-b from-[#FFF7ED] to-white p-6 dark:border-[#F97316]/35 dark:from-[#1A1327] dark:to-[#081C41]">
            <Handshake className="h-6 w-6 text-[#C2410C] dark:text-[#FDBA74]" aria-hidden="true" />
            <h3 className="mt-4 text-base font-bold text-[#0F172A] dark:text-white">
              {t('landing.audience.provider')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
              {t('landing.audience.providerBody')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { t } = useI18n();
  const { user, loading } = useAuth();

  const capabilities = [
    { index: '01', icon: FileText, title: t('landing.caps.1.title'), body: t('landing.caps.1.body') },
    { index: '02', icon: Camera, title: t('landing.caps.2.title'), body: t('landing.caps.2.body') },
    { index: '03', icon: MessageSquare, title: t('landing.caps.3.title'), body: t('landing.caps.3.body') },
    { index: '04', icon: BadgeCheck, title: t('landing.caps.4.title'), body: t('landing.caps.4.body') },
  ];

  return (
    <PublicLayout overlay>
      <CinematicHero />
      <MarqueeBand />
      <CinematicStory />

      <div className="relative bg-[#F8FAFC] dark:bg-[#060E20]">
        <div
          className="h-px w-full bg-gradient-to-r from-transparent via-[#93C5FD]/60 to-transparent"
          aria-hidden="true"
        />
        <TwoModes />

        {/* O que já está construído */}
        <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#C2410C] dark:text-[#FDBA74]">
              {t('landing.caps.kicker')}
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-[#0F172A] dark:text-white sm:text-[2.5rem] sm:leading-[1.05]">
              {t('landing.caps.title')}
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap, index) => (
              <SpotlightCard
                key={cap.index}
                index={cap.index}
                icon={cap.icon}
                title={cap.title}
                body={cap.body}
                delay={index * 80}
              />
            ))}
          </div>
        </section>

        {/* Transparência: o que faz e o que não faz */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#C2410C] dark:text-[#FDBA74]">
              {t('landing.honesty.kicker')}
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-[#0F172A] dark:text-white sm:text-[2.5rem] sm:leading-[1.05]">
              {t('landing.honesty.title')}
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-emerald-900 dark:text-emerald-100">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {t('common.success')}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-emerald-950 dark:text-emerald-100">
                {[t('landing.honesty.do1'), t('landing.honesty.do2'), t('landing.honesty.do3')].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 dark:border-[#1E325C] dark:bg-[#0C1833]">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#334155] dark:text-[#E2E8F0]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {t('landing.honesty.kicker')}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#475569] dark:text-[#CBD5E1]">
                {[t('landing.honesty.dont1'), t('landing.honesty.dont2'), t('landing.honesty.dont3')].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <XCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#C2410C] dark:text-[#FDBA74]"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-6">
          <div className="cine-final rounded-[1.75rem] px-6 py-12 text-white sm:px-12 sm:py-16">
            <div className="cine-layer" aria-hidden="true">
              <div className="cine-aurora cine-aurora-b" style={{ opacity: 0.35 }} />
              <div className="cine-grain" />
            </div>
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <p className="cine-kicker">
                  <span className="cine-dot" aria-hidden="true" />
                  {t('landing.kicker')}
                </p>
                <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
                  {t('landing.final.title')}
                </h2>
                <p className="mt-4 text-sm text-white/70 sm:text-base">{t('landing.final.body')}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                {loading ? null : user ? (
                  <>
                    <ButtonLink to="/inicio" size="lg" className="w-full sm:w-auto">
                      {t('nav.dashboard')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </ButtonLink>
                    <Link
                      to={user.activeMode === 'provider' ? '/oportunidades' : '/publicar-pedido'}
                      className="cine-ghost w-full sm:w-auto"
                    >
                      {user.activeMode === 'provider' ? t('dashboard.findWork') : t('request.publish')}
                    </Link>
                  </>
                ) : (
                  <>
                    <ButtonLink to="/criar-conta" size="lg" className="w-full sm:w-auto">
                      {t('landing.ctaPrimary')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </ButtonLink>
                    <Link to="/entrar" className="cine-ghost w-full sm:w-auto">
                      {t('common.login')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
