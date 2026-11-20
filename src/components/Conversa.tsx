import { useState } from 'react';
import { useApp } from '../state/store';
import type { LadoConversa } from '../domain/types';
import { validarMensagem } from '../domain/validacao';

/**
 * Conversa dentro de um pedido.
 *
 * Nesta versão os dados vivem num só dispositivo, por isso os dois lados são
 * interpretados pela mesma pessoa ao trocar de sessão. A interface diz isso — não
 * finge ser um chat entre duas pessoas em telemóveis diferentes.
 */
export function Conversa({
  pedidoId,
  lado,
  autorNome,
  fechada = false,
}: {
  pedidoId: string;
  lado: LadoConversa;
  autorNome: string;
  /** Trabalho concluído ou cancelado: a conversa fica em leitura. */
  fechada?: boolean;
}) {
  const mensagens = useApp((estado) => estado.mensagens);
  const enviarMensagem = useApp((estado) => estado.enviarMensagem);

  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  const daConversa = mensagens.filter((mensagem) => mensagem.pedidoId === pedidoId);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const problema = validarMensagem(texto);
    if (problema) {
      setErro(problema);
      return;
    }

    setErro(null);
    setAEnviar(true);
    try {
      await enviarMensagem({ pedidoId, lado, autorNome, texto });
      setTexto('');
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível enviar.');
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="seccao-titulo text-xl">Conversa</h2>
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">
          {daConversa.length === 0
            ? 'sem mensagens'
            : `${daConversa.length} ${daConversa.length === 1 ? 'mensagem' : 'mensagens'}`}
        </span>
      </div>

      <div className="cartao mt-3 overflow-hidden">
        {daConversa.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-mute">
            Ainda não há mensagens. Escreve a primeira para combinar os detalhes.
          </p>
        ) : (
          <ul className="divide-y divide-line/70">
            {daConversa.map((mensagem) => {
              const meu = mensagem.lado === lado;
              return (
                <li
                  key={mensagem.id}
                  className={`px-4 py-3 ${meu ? 'bg-brand-50/50' : 'bg-transparent'}`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mute">
                      {mensagem.autorNome}
                      <span className="ml-1.5 font-normal normal-case tracking-normal text-mute/70">
                        · {mensagem.lado === 'cliente' ? 'cliente' : 'profissional'}
                      </span>
                    </span>
                    <time
                      className="shrink-0 text-[11px] text-mute"
                      dateTime={mensagem.criadoEm}
                    >
                      {new Date(mensagem.criadoEm).toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed">
                    {mensagem.texto}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {fechada ? (
          <p className="border-t border-line bg-sand/60 px-4 py-3 text-xs text-mute">
            Esta conversa está fechada porque o trabalho terminou. O histórico fica visível.
          </p>
        ) : (
        <form onSubmit={enviar} className="border-t border-line bg-sand/60 p-3">
          <label htmlFor={`mensagem-${pedidoId}`} className="sr-only">
            Escrever mensagem
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id={`mensagem-${pedidoId}`}
              className="campo min-h-11 resize-none py-2.5"
              rows={1}
              placeholder={`Escrever como ${lado === 'cliente' ? 'cliente' : 'profissional'}…`}
              value={texto}
              onChange={(evento) => {
                setTexto(evento.target.value);
                setErro(null);
              }}
            />
            <button
              type="submit"
              className="btn-primario shrink-0 px-4 py-2.5 text-sm"
              disabled={aEnviar}
            >
              {aEnviar ? '…' : 'Enviar'}
            </button>
          </div>
          {erro && <p className="mt-1.5 text-sm text-red-700">{erro}</p>}
        </form>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-mute">
        Conversa de demonstração: num dispositivo só, os dois lados são interpretados pela
        mesma pessoa ao trocar de sessão. O acordo combinado aqui não é vinculativo.
      </p>
    </section>
  );
}
