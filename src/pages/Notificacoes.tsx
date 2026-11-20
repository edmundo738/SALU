import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';
import { usePreferencias } from '../state/preferencias';
import { derivarNotificacoes, type TipoNotificacao } from '../domain/notificacoes';
import { tempoRelativo } from '../lib/formato';

const PONTO: Record<TipoNotificacao, string> = {
  'proposta-recebida': 'bg-brand-600',
  mensagem: 'bg-ink/40',
  'proposta-aceite': 'bg-forest-500',
  'proposta-recusada': 'bg-ink/30',
  avaliar: 'bg-brand-600',
  'avaliacao-recebida': 'bg-forest-500',
};

export function Notificacoes() {
  const sessao = useSessao((estado) => estado.sessao);
  const pedidos = useApp((estado) => estado.pedidos);
  const propostas = useApp((estado) => estado.propostas);
  const mensagens = useApp((estado) => estado.mensagens);
  const avaliacoes = useApp((estado) => estado.avaliacoes);
  const carregar = useApp((estado) => estado.carregar);
  const lidas = usePreferencias((estado) => estado.lidas);
  const marcarLidas = usePreferencias((estado) => estado.marcarLidas);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const lidasAte = sessao ? (lidas[sessao.nome.trim().toLowerCase()] ?? null) : null;

  const notificacoes = useMemo(
    () => (sessao ? derivarNotificacoes(sessao, { pedidos, propostas, mensagens, avaliacoes }, lidasAte) : []),
    [sessao, pedidos, propostas, mensagens, avaliacoes, lidasAte],
  );

  if (!sessao) {
    return (
      <div className="cartao mx-auto max-w-md p-8 text-center">
        <p className="font-semibold">Entra para ver as tuas notificações.</p>
        <Link to="/entrar" className="btn-primario mt-4 px-5 py-2.5 text-sm">Entrar</Link>
      </div>
    );
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="mx-auto max-w-2xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="titulo-display text-[clamp(1.9rem,5vw,2.8rem)]">Notificações</h1>
          <p className="mt-1 text-sm text-mute">
            {naoLidas === 0 ? 'Tudo visto.' : `${naoLidas} por ver.`}
          </p>
        </div>
        {naoLidas > 0 && (
          <button type="button" className="btn-secundario px-4 py-2 text-sm" onClick={() => marcarLidas(sessao.nome)}>
            Marcar tudo como visto
          </button>
        )}
      </header>

      {notificacoes.length === 0 ? (
        <p className="mt-6 text-sm text-mute">Ainda nada. Quando alguém se propuser, escrever ou te avaliar, aparece aqui.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-cartao border border-line bg-paper">
          {notificacoes.map((n) => (
            <li key={n.id}>
              <Link to={n.rota} className={`flex items-start gap-3 px-4 py-3.5 transition hover:bg-sand/60 ${n.lida ? '' : 'bg-brand-50/40'}`}>
                <span aria-hidden="true" className={`mt-2 h-2 w-2 shrink-0 rounded-full ${PONTO[n.tipo]} ${n.lida ? 'opacity-30' : ''}`} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${n.lida ? 'font-medium' : 'font-semibold'}`}>{n.titulo}</span>
                  <span className="block truncate text-sm text-mute">{n.detalhe}</span>
                </span>
                <time className="shrink-0 text-[11px] text-mute" dateTime={n.criadoEm}>{tempoRelativo(n.criadoEm)}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-mute">
        As notificações são calculadas a partir do que aconteceu nos teus pedidos e propostas. Nesta versão não há envio para o telemóvel.
      </p>
    </div>
  );
}
