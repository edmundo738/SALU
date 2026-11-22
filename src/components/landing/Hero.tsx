import React, { Fragment, useRef } from 'react';
import { ArrowRight, MoveDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useAuth } from '../../app/AuthProvider';
import { ButtonLink } from '../ui/Base';
import { useCamera, useFinePointer, useReducedMotion } from './motion';

/** Divide o título em palavras para entrarem uma a uma, sem quebrar traduções. */
function SplitTitle({ text, accentLast = false }: { text: string; accentLast?: boolean }) {
  const words = text.split(' ').filter(Boolean);
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span
            className={`cine-word${accentLast && index === words.length - 1 ? ' cine-word-accent' : ''}`}
            style={{ '--i': index } as React.CSSProperties}
          >
            {word}
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}

export function CinematicHero() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  useCamera(ref, fine && !reduced);

  const steps = [
    { n: '01', title: t('landing.step1.title'), note: t('landing.mock1') },
    { n: '02', title: t('landing.step2.title'), note: t('landing.mock2') },
    { n: '03', title: t('landing.step3.title'), note: t('landing.mock3') },
  ];

  return (
    <section ref={ref} className="cine-hero">
      <div className="cine-layer" aria-hidden="true">
        <div className="cine-aurora cine-aurora-a" />
        <div className="cine-aurora cine-aurora-b" />
        <div className="cine-aurora cine-aurora-c" />
        <div className="cine-grid" />
        <div className="cine-beam cine-beam-a" />
        <div className="cine-beam cine-beam-b" />
        <div className="cine-cursor" />
        <div className="cine-horizon" />
        <div className="cine-grain" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-24 pt-32 sm:px-8 sm:pb-28 sm:pt-36">
        <p className="cine-kicker">
          <span className="cine-dot" aria-hidden="true" />
          {t('landing.kicker')}
        </p>

        <h1 className="cine-title mt-6 max-w-3xl">
          <SplitTitle text={t('landing.title')} accentLast />
        </h1>

        <p className="cine-lede mt-7">{t('landing.subtitle')}</p>

        <div className="cine-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                {t('landing.ctaSecondary')}
              </Link>
            </>
          )}
        </div>

        <div className="cine-rail cine-rise mt-16 grid gap-5 sm:grid-cols-3 sm:gap-8">
          {steps.map((step) => (
            <div key={step.n} className="cine-rail-step">
              <p className="font-mono text-[0.65rem] font-semibold tracking-[0.3em] text-[#93C5FD]">{step.n}</p>
              <p className="mt-1.5 text-sm font-semibold text-white">{step.title}</p>
              <p className="mt-1 text-xs text-white/55">{step.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/45"
        aria-hidden="true"
      >
        <span className="font-mono text-[0.6rem] tracking-[0.32em]">{t('landing.scroll')}</span>
        <MoveDown className="cine-scroll-cue h-4 w-4" />
      </div>
    </section>
  );
}
