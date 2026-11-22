import { useI18n } from '../../i18n';

/**
 * Três passos do SALU.
 *
 * Versão anterior: secção de 320vh com os três actos empilhados em `absolute`
 * e um cursor de scroll a decidir qual estava visível. Em ecrãs baixos, ao rolar
 * depressa, e em capturas de página inteira, os três textos apareciam ao mesmo
 * tempo e sobrepostos. Agora é uma grelha estática: lê-se sempre, igual em
 * qualquer ecrã e em qualquer captura.
 */
export function CinematicStory() {
  const { t } = useI18n();
  const acts = [
    { n: '01', title: t('landing.step1.title'), body: t('landing.step1.body'), note: t('landing.mock1') },
    { n: '02', title: t('landing.step2.title'), body: t('landing.step2.body'), note: t('landing.mock2') },
    { n: '03', title: t('landing.step3.title'), body: t('landing.step3.body'), note: t('landing.mock3') },
  ];

  return (
    <section className="cine-story text-white" aria-labelledby="cine-story-title">
      <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
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

        <ol className="mt-12 grid gap-10 sm:mt-16 sm:grid-cols-3 sm:gap-8">
          {acts.map((act) => (
            <li key={act.n} className="cine-step">
              <span className="cine-step-number" aria-hidden="true">
                {act.n}
              </span>
              <h3 className="cine-act-title mt-5">{act.title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">{act.body}</p>
              <p className="mt-5 inline-flex items-start gap-2 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[#FDBA74]">
                <span className="mt-[0.45rem] h-px w-6 shrink-0 bg-[#F97316]/60" aria-hidden="true" />
                {act.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
