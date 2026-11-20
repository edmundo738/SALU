import type { EstadoPedido, EstadoProposta, Pedido, Proposta, TipoSessao } from './types';

/**
 * Significado visual de cada estado, num sítio só.
 *
 * O tom não é decoração: «verde» diz «está vivo, há algo a acontecer»,
 * «ocre» diz «combinado, ainda não feito», «neutro» diz «terminou».
 * Repetir estas decisões em cada ecrã é como nascem interfaces incoerentes.
 */
export type Tom = 'verde' | 'ocre' | 'neutro' | 'vermelho';

export interface MetaEstado {
  rotulo: string;
  tom: Tom;
}

export const META_PEDIDO: Record<EstadoPedido, MetaEstado> = {
  aberto: { rotulo: 'À procura de profissional', tom: 'verde' },
  acordado: { rotulo: 'Trabalho acordado', tom: 'ocre' },
  concluido: { rotulo: 'Concluído', tom: 'neutro' },
  cancelado: { rotulo: 'Cancelado', tom: 'neutro' },
};

export const META_PROPOSTA: Record<EstadoProposta, MetaEstado> = {
  pendente: { rotulo: 'Enviada', tom: 'ocre' },
  aceite: { rotulo: 'Aceite', tom: 'verde' },
  recusada: { rotulo: 'Não escolhida', tom: 'neutro' },
};

/** Ordem dos passos do ciclo, para a linha do tempo e para barras de progresso. */
export const PASSOS_PEDIDO: { estado: EstadoPedido; rotulo: string }[] = [
  { estado: 'aberto', rotulo: 'Publicado' },
  { estado: 'acordado', rotulo: 'Acordado' },
  { estado: 'concluido', rotulo: 'Concluído' },
];

export function indicePasso(estado: EstadoPedido): number {
  if (estado === 'cancelado') return -1;
  return PASSOS_PEDIDO.findIndex((passo) => passo.estado === estado);
}

export interface ProximoPasso {
  titulo: string;
  detalhe: string;
  /** Há uma acção concreta à espera desta pessoa. */
  pendente: boolean;
}

/**
 * O que esta pessoa deve fazer a seguir neste pedido — ou porque não há nada
 * a fazer. É o texto que evita a pergunta «e agora?», e por isso vive no
 * domínio: o painel, o cartão e o detalhe dizem todos a mesma coisa.
 */
export function proximoPasso(
  pedido: Pedido,
  papel: TipoSessao,
  contexto: {
    propostas: Proposta[];
    minhaProposta?: Proposta;
    jaAvaliei: boolean;
  },
): ProximoPasso {
  const { propostas, minhaProposta, jaAvaliei } = contexto;
  const aceite = propostas.find((proposta) => proposta.estado === 'aceite');

  if (papel === 'cliente') {
    switch (pedido.estado) {
      case 'aberto': {
        const n = propostas.filter((proposta) => proposta.estado === 'pendente').length;
        if (n === 0) {
          return {
            titulo: 'À espera de propostas',
            detalhe: 'Está no mural. Quem souber resolver vai propor-se.',
            pendente: false,
          };
        }
        return {
          titulo: n === 1 ? 'Tens 1 proposta para decidir' : `Tens ${n} propostas para decidir`,
          detalhe: 'Compara, abre os perfis e escolhe com quem queres trabalhar.',
          pendente: true,
        };
      }
      case 'acordado':
        return {
          titulo: `Combinado com ${aceite?.autorNome ?? 'o profissional'}`,
          detalhe: 'Quando o trabalho estiver feito, marca como concluído para poderes avaliar.',
          pendente: true,
        };
      case 'concluido':
        return jaAvaliei
          ? { titulo: 'Terminado e avaliado', detalhe: 'Obrigado — é assim que a confiança se constrói.', pendente: false }
          : { titulo: 'Avalia o profissional', detalhe: 'Leva trinta segundos e ajuda quem vem a seguir a escolher.', pendente: true };
      case 'cancelado':
        return { titulo: 'Cancelado', detalhe: 'Este pedido foi encerrado sem trabalho.', pendente: false };
    }
  }

  // Prestador
  if (!minhaProposta) {
    return pedido.estado === 'aberto'
      ? { titulo: 'Podes propor-te', detalhe: 'Diz o que consegues fazer, por quanto e quando.', pendente: true }
      : { titulo: 'Já tem profissional', detalhe: 'Este pedido já não aceita propostas.', pendente: false };
  }

  switch (minhaProposta.estado) {
    case 'pendente':
      return { titulo: 'À espera da decisão do cliente', detalhe: 'Podes adiantar detalhes na conversa.', pendente: false };
    case 'recusada':
      return { titulo: 'Não escolhido desta vez', detalhe: 'O teu perfil continua visível para outros pedidos.', pendente: false };
    case 'aceite':
      if (pedido.estado === 'concluido') {
        return jaAvaliei
          ? { titulo: 'Trabalho concluído', detalhe: 'Avaliado nos dois sentidos.', pendente: false }
          : { titulo: 'Avalia o cliente', detalhe: 'Clareza do pedido, pontualidade e comunicação.', pendente: true };
      }
      return { titulo: 'Foste escolhido', detalhe: 'Combina os detalhes na conversa ou no WhatsApp e faz o trabalho.', pendente: true };
  }
}
