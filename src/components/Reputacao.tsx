import type { ResumoReputacao } from '../domain/reputacao';
import type { TipoAvaliado } from '../domain/types';

const ROTULOS: Record<TipoAvaliado, [string, string, string]> = {
  prestador: ['Comunicação', 'Pontualidade', 'Qualidade do trabalho'],
  cliente: ['Comunicação', 'Pontualidade e cumprimento', 'Clareza do pedido'],
};

function Barra({ rotulo, valor }: { rotulo: string; valor: number | null }) {
  const pct = valor === null ? 0 : (valor / 5) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-mute">{rotulo}</span>
        <span className="numeral text-sm">{valor === null ? '—' : valor.toFixed(1).replace('.', ',')}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line/70">
        <div className="h-full rounded-full bg-forest-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Reputação em dimensões. Mostra «—» onde não há dados em vez de inventar zero. */
export function Reputacao({ resumo, tipo }: { resumo: ResumoReputacao; tipo: TipoAvaliado }) {
  if (resumo.total === 0) return null;

  const [c, p, q] = ROTULOS[tipo];
  const temDimensoes = resumo.dimensoes.comunicacao !== null;

  return (
    <section className="cartao mt-6 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">Reputação</h2>
        <p className="text-sm">
          <span className="numeral text-2xl leading-none">{resumo.media!.toFixed(1).replace('.', ',')}</span>
          <span className="text-mute"> · {resumo.total} {resumo.total === 1 ? 'avaliação' : 'avaliações'}</span>
        </p>
      </div>

      {temDimensoes ? (
        <div className="mt-4 space-y-3">
          <Barra rotulo={c} valor={resumo.dimensoes.comunicacao} />
          <Barra rotulo={p} valor={resumo.dimensoes.pontualidade} />
          <Barra rotulo={q} valor={resumo.dimensoes.qualidade} />
        </div>
      ) : (
        <p className="mt-3 text-xs text-mute">Avaliações antigas, sem detalhe por dimensão.</p>
      )}

      {resumo.voltariaPct !== null && (
        <p className="mt-4 border-t border-line pt-3 text-sm">
          <span className="numeral text-lg">{resumo.voltariaPct}%</span>
          <span className="text-mute">
            {' '}{tipo === 'prestador' ? 'voltariam a contratar' : 'voltariam a trabalhar com este cliente'}
          </span>
        </p>
      )}
    </section>
  );
}
