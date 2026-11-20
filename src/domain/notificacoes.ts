import type { Avaliacao, Mensagem, Pedido, Proposta, Sessao } from './types';

export type TipoNotificacao =
  | 'proposta-recebida'
  | 'mensagem'
  | 'proposta-aceite'
  | 'proposta-recusada'
  | 'avaliar'
  | 'avaliacao-recebida';

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  detalhe: string;
  rota: string;
  criadoEm: string;
  lida: boolean;
}

interface Fontes {
  pedidos: Pedido[];
  propostas: Proposta[];
  mensagens: Mensagem[];
  avaliacoes: Avaliacao[];
}

/**
 * Notificações derivadas dos dados, não guardadas.
 *
 * Decisão deliberada para o protótipo: em vez de uma tabela de notificações
 * que pode ficar desfasada dos factos, calculamos «o que aconteceu que te diz
 * respeito» a partir do que já existe — propostas, mensagens, aceitações,
 * conclusões, avaliações. O único estado próprio é «até quando já viste»,
 * guardado por nome. Quando houver servidor, isto passa a push; a regra de
 * *o que* notificar fica a mesma.
 */
export function derivarNotificacoes(
  sessao: Sessao,
  fontes: Fontes,
  lidasAte: string | null,
): Notificacao[] {
  const { pedidos, propostas, mensagens, avaliacoes } = fontes;
  const nome = sessao.nome.toLowerCase();
  const ehEu = (outro: string) => outro.toLowerCase() === nome;
  const lida = (criadoEm: string) => lidasAte !== null && criadoEm <= lidasAte;
  const saida: Notificacao[] = [];

  const meusPedidos = pedidos.filter((pedido) => sessao.pedidoIds.includes(pedido.id));
  const minhasPropostas = propostas.filter((proposta) => ehEu(proposta.autorNome));

  // -- Como cliente -----------------------------------------------------------
  for (const pedido of meusPedidos) {
    for (const proposta of propostas.filter((p) => p.pedidoId === pedido.id)) {
      saida.push({
        id: `prop-${proposta.id}`,
        tipo: 'proposta-recebida',
        titulo: `${proposta.autorNome} propôs-se`,
        detalhe: pedido.titulo,
        rota: `/pedidos/${pedido.id}`,
        criadoEm: proposta.criadoEm,
        lida: lida(proposta.criadoEm),
      });
    }

    if (pedido.estado === 'concluido') {
      const avaliei = avaliacoes.some((a) => a.pedidoId === pedido.id && ehEu(a.autorNome));
      const concluidoEm = pedido.historico.find((e) => e.tipo === 'concluido')?.criadoEm ?? pedido.criadoEm;
      if (!avaliei) {
        saida.push({
          id: `avaliar-${pedido.id}`,
          tipo: 'avaliar',
          titulo: 'Avalia o profissional',
          detalhe: pedido.titulo,
          rota: `/pedidos/${pedido.id}`,
          criadoEm: concluidoEm,
          lida: false,
        });
      }
    }
  }

  // -- Como prestador ---------------------------------------------------------
  for (const proposta of minhasPropostas) {
    const pedido = pedidos.find((p) => p.id === proposta.pedidoId);
    if (!pedido) continue;

    const eventoAceite = pedido.historico.find((e) => e.tipo === 'aceite');
    if (proposta.estado === 'aceite') {
      const quando = eventoAceite?.criadoEm ?? proposta.criadoEm;
      saida.push({
        id: `aceite-${proposta.id}`,
        tipo: 'proposta-aceite',
        titulo: `${pedido.autorNome} escolheu-te`,
        detalhe: pedido.titulo,
        rota: `/pedidos/${pedido.id}`,
        criadoEm: quando,
        lida: lida(quando),
      });

      if (pedido.estado === 'concluido') {
        const avaliei = avaliacoes.some((a) => a.pedidoId === pedido.id && ehEu(a.autorNome));
        const concluidoEm = pedido.historico.find((e) => e.tipo === 'concluido')?.criadoEm ?? quando;
        if (!avaliei) {
          saida.push({
            id: `avaliar-cliente-${pedido.id}`,
            tipo: 'avaliar',
            titulo: 'Avalia o cliente',
            detalhe: pedido.titulo,
            rota: `/pedidos/${pedido.id}`,
            criadoEm: concluidoEm,
            lida: false,
          });
        }
      }
    } else if (proposta.estado === 'recusada' && eventoAceite) {
      saida.push({
        id: `recusada-${proposta.id}`,
        tipo: 'proposta-recusada',
        titulo: 'Não foste escolhido desta vez',
        detalhe: pedido.titulo,
        rota: `/pedidos/${pedido.id}`,
        criadoEm: eventoAceite.criadoEm,
        lida: lida(eventoAceite.criadoEm),
      });
    }
  }

  // -- Mensagens dos outros nas minhas conversas ------------------------------
  const pedidosOndeParticipo = new Set([
    ...meusPedidos.map((p) => p.id),
    ...minhasPropostas.map((p) => p.pedidoId),
  ]);
  for (const mensagem of mensagens) {
    if (!pedidosOndeParticipo.has(mensagem.pedidoId) || ehEu(mensagem.autorNome)) continue;
    const pedido = pedidos.find((p) => p.id === mensagem.pedidoId);
    saida.push({
      id: `msg-${mensagem.id}`,
      tipo: 'mensagem',
      titulo: `${mensagem.autorNome} escreveu`,
      detalhe: mensagem.texto.length > 80 ? `${mensagem.texto.slice(0, 77)}…` : mensagem.texto,
      rota: `/pedidos/${mensagem.pedidoId}`,
      criadoEm: mensagem.criadoEm,
      lida: lida(mensagem.criadoEm),
    });
    void pedido;
  }

  // -- Avaliações recebidas ---------------------------------------------------
  for (const avaliacao of avaliacoes.filter((a) => ehEu(a.alvoNome))) {
    saida.push({
      id: `aval-${avaliacao.id}`,
      tipo: 'avaliacao-recebida',
      titulo: `${avaliacao.autorNome} avaliou-te com ${avaliacao.nota}/5`,
      detalhe: avaliacao.comentario || 'Sem comentário.',
      rota: `/pedidos/${avaliacao.pedidoId}`,
      criadoEm: avaliacao.criadoEm,
      lida: lida(avaliacao.criadoEm),
    });
  }

  return saida.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export function contarNaoLidas(notificacoes: Notificacao[]): number {
  return notificacoes.filter((n) => !n.lida).length;
}
