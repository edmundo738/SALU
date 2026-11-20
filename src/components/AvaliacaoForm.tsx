import { useState } from 'react';
import { useApp } from '../state/store';
import type { DimensoesAvaliacao, TipoAvaliado } from '../domain/types';
import { notaDasDimensoes } from '../domain/reputacao';

const ESCALA = [1, 2, 3, 4, 5] as const;

const ROTULOS: Record<TipoAvaliado, { [K in keyof DimensoesAvaliacao]: string }> = {
  prestador: {
    comunicacao: 'Comunicação',
    pontualidade: 'Pontualidade',
    qualidade: 'Qualidade do trabalho',
  },
  cliente: {
    comunicacao: 'Comunicação',
    pontualidade: 'Pontualidade e cumprimento',
    qualidade: 'Clareza do pedido',
  },
};

/**
 * Avaliação em três dimensões, só depois de um trabalho concluído.
 *
 * Três toques em vez de um: custa segundos a mais e produz uma reputação que
 * diz porquê — «comunica bem mas atrasa-se» é informação; «4 estrelas» não é.
 * O comentário continua opcional: obrigá-lo reduz o número de avaliações.
 */
export function AvaliacaoForm({
  pedidoId,
  autorNome,
  alvoNome,
  alvoTipo,
}: {
  pedidoId: string;
  autorNome: string;
  alvoNome: string;
  alvoTipo: TipoAvaliado;
}) {
  const avaliar = useApp((estado) => estado.avaliar);

  const [dimensoes, setDimensoes] = useState<Partial<DimensoesAvaliacao>>({});
  const [voltaria, setVoltaria] = useState<boolean | null>(null);
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  const completas =
    dimensoes.comunicacao !== undefined &&
    dimensoes.pontualidade !== undefined &&
    dimensoes.qualidade !== undefined;

  async function submeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!completas) {
      setErro('Classifica as três dimensões.');
      return;
    }
    if (voltaria === null) {
      setErro('Diz-nos se voltarias a trabalhar com esta pessoa.');
      return;
    }

    const dims = dimensoes as DimensoesAvaliacao;
    setErro(null);
    setAEnviar(true);
    try {
      await avaliar({
        pedidoId,
        autorNome,
        alvoNome,
        alvoTipo,
        nota: notaDasDimensoes(dims),
        dimensoes: dims,
        voltaria,
        comentario,
      });
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível avaliar.');
    } finally {
      setAEnviar(false);
    }
  }

  const primeiroNome = alvoNome.split(' ')[0];

  return (
    <section className="mt-8">
      <h2 className="seccao-titulo text-xl">Como correu com {primeiroNome}?</h2>
      <p className="mt-1 text-sm text-mute">
        Esta avaliação fica ligada ao trabalho concluído — não é uma opinião solta.
      </p>

      <form onSubmit={submeter} className="cartao mt-3 space-y-5 p-4 sm:p-5">
        {(Object.keys(ROTULOS[alvoTipo]) as (keyof DimensoesAvaliacao)[]).map((chave) => (
          <fieldset key={chave}>
            <legend className="etiqueta">{ROTULOS[alvoTipo][chave]}</legend>
            <div className="flex gap-1.5" role="radiogroup" aria-label={ROTULOS[alvoTipo][chave]}>
              {ESCALA.map((valor) => {
                const activo = dimensoes[chave] === valor;
                return (
                  <button
                    key={valor}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    aria-label={`${valor} de 5`}
                    onClick={() => {
                      setDimensoes((d) => ({ ...d, [chave]: valor }));
                      setErro(null);
                    }}
                    className={`numeral h-10 w-10 rounded-full border text-base transition ${
                      activo ? 'border-ink bg-ink text-sand' : 'border-line bg-paper hover:border-ink/30'
                    }`}
                  >
                    {valor}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        <fieldset>
          <legend className="etiqueta">
            Voltarias a {alvoTipo === 'prestador' ? 'contratar' : 'trabalhar com'} {primeiroNome}?
          </legend>
          <div className="flex gap-2">
            {[
              { valor: true, rotulo: 'Sim' },
              { valor: false, rotulo: 'Não' },
            ].map((opcao) => (
              <button
                key={String(opcao.valor)}
                type="button"
                aria-pressed={voltaria === opcao.valor}
                onClick={() => {
                  setVoltaria(opcao.valor);
                  setErro(null);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  voltaria === opcao.valor
                    ? 'border-ink bg-ink text-sand'
                    : 'border-line bg-paper hover:border-ink/30'
                }`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="avaliacao-comentario" className="etiqueta">
            Comentário <span className="font-normal text-mute">(opcional)</span>
          </label>
          <textarea
            id="avaliacao-comentario"
            className="campo min-h-20 resize-y"
            placeholder="O que correu bem, ou o que podia ter corrido melhor."
            maxLength={300}
            value={comentario}
            onChange={(evento) => setComentario(evento.target.value)}
          />
        </div>

        {completas && (
          <p className="text-sm text-mute">
            Nota resumo: <span className="numeral text-base text-ink">{notaDasDimensoes(dimensoes as DimensoesAvaliacao)}</span>/5
          </p>
        )}

        {erro && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>
        )}

        <button type="submit" className="btn-primario w-full px-4 py-2.5 text-sm" disabled={aEnviar}>
          {aEnviar ? 'A enviar…' : 'Enviar avaliação'}
        </button>
      </form>
    </section>
  );
}
