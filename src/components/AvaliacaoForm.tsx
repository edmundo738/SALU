import { useState } from 'react';
import { useApp } from '../state/store';
import type { TipoAvaliado } from '../domain/types';

const NOTAS = [
  { valor: 1, rotulo: 'Mau' },
  { valor: 2, rotulo: 'Fraco' },
  { valor: 3, rotulo: 'Razoável' },
  { valor: 4, rotulo: 'Bom' },
  { valor: 5, rotulo: 'Excelente' },
];

/**
 * Avaliação só depois de um trabalho concluído.
 *
 * Sem comentário obrigatório: pedir sempre uma justificação reduz o número de
 * avaliações, e uma nota com história vale mais do que nenhuma.
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

  const [nota, setNota] = useState<number>(0);
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  async function submeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (nota < 1) {
      setErro('Escolha uma nota de 1 a 5.');
      return;
    }

    setErro(null);
    setAEnviar(true);
    try {
      await avaliar({ pedidoId, autorNome, alvoNome, alvoTipo, nota, comentario });
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível avaliar.');
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="seccao-titulo text-xl">Como correu?</h2>
      <p className="mt-1 text-sm text-mute">
        Esta avaliação fica ligada ao trabalho concluído — não é uma opinião solta.
      </p>

      <form onSubmit={submeter} className="cartao mt-3 space-y-4 p-4 sm:p-5">
        <fieldset>
          <legend className="etiqueta">Nota para {alvoNome}</legend>
          <div className="flex flex-wrap gap-2">
            {NOTAS.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => {
                  setNota(opcao.valor);
                  setErro(null);
                }}
                aria-pressed={nota === opcao.valor}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  nota === opcao.valor
                    ? 'border-ink bg-ink text-sand'
                    : 'border-line bg-paper hover:border-ink/30'
                }`}
              >
                {opcao.valor} · {opcao.rotulo}
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

        {erro && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
            {erro}
          </p>
        )}

        <button type="submit" className="btn-primario w-full px-4 py-2.5 text-sm" disabled={aEnviar}>
          {aEnviar ? 'A enviar…' : 'Enviar avaliação'}
        </button>
      </form>
    </section>
  );
}
