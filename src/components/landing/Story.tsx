import { useRef } from 'react';
import { useI18n } from '../../i18n';
import { usePinnedStory } from './motion';

/**
 * Três actos presos ao ecrã: cada passo do SALU ganha o palco enquanto
 * o utilizador desliza. No telemóvel cai para uma lista normal (ver CSS).
 */
export function CinematicStory() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const acts = [
    { n: '01', title: t('landing.step1.title'), body: t('landing.step1.body'), note: t('landing.mock1') },
    { n: '02', title: t('landing.step2.title'), body: t('landing.step2.body'), note: t('landing.mock2') },
    { n: '03', title: t('landing.step3.title'), body: t('landing.step3.body'), note: t('landing.mock3') },
  ];
  const active = usePinnedStory(ref, acts.length);

  return (
    <section ref={ref} className="cine-story text-white" aria-labelledby="cine-story-title">
      <div className="cine-story-sticky">
        <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
          <p className="cine-kicker">
            <span className="cine-dot" aria-hidden="true" />
            {t('landing.story.kicker')}
          </p>
          <h2
            id="cine-story-title"
            className="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl"
          >
            {t('landing.story.title')}
          </h2>

          <div className="relative mt-10 min-h-[15rem] sm:mt-14 sm:min-h-[19rem]">
            {acts.map((act, index) => (
              <article key={act.n} className="cine-act" data-active={active === index}>
                <div className="grid w-full gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-12">
                  <div className="cine-act-number" aria-hidden="true">
                    {act.n}
                  </div>
                  <div>
                    <h3 className="cine-act-title">{act.title}</h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">{act.body}</p>
                    <p className="mt-6 inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[#FDBA74]">
                      <span className="h-px w-8 bg-[#F97316]/60" aria-hidden="true" />
                      {act.note}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="cine-progress" aria-hidden="true">
            {acts.map((act, index) => (
              <span key={act.n} data-on={active === index} />
            ))}
          </div>

          <p className="mt-10 hidden font-mono text-[0.6rem] uppercase tracking-[0.3em] text-white/30 sm:block">
            {t('landing.story.hint')}
          </p>
        </div>
      </div>
    </section>
  );
}
