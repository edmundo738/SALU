import { create } from 'zustand';
import type { Sessao, TipoSessao } from '../domain/types';

const CHAVE = 'salu:v2:sessao';

function ler(): Sessao | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const dados = JSON.parse(bruto) as Partial<Sessao>;
    if (!dados || typeof dados.nome !== 'string') return null;
    return {
      tipo: dados.tipo === 'prestador' ? 'prestador' : 'cliente',
      nome: dados.nome,
      criadoEm: dados.criadoEm ?? new Date().toISOString(),
      perfilId: dados.perfilId ?? null,
      pedidoIds: Array.isArray(dados.pedidoIds) ? dados.pedidoIds : [],
    };
  } catch {
    return null;
  }
}

function gravar(sessao: Sessao | null): void {
  try {
    if (sessao) {
      window.localStorage.setItem(CHAVE, JSON.stringify(sessao));
    } else {
      window.localStorage.removeItem(CHAVE);
    }
  } catch {
    // Sem armazenamento, a sessão vive apenas em memória.
  }
}

interface EstadoSessao {
  sessao: Sessao | null;
  entrar: (tipo: TipoSessao, nome: string) => void;
  sair: () => void;
  definirPerfil: (perfilId: string) => void;
  adicionarPedido: (pedidoId: string) => void;
}

/**
 * Sessão de demonstração.
 *
 * Não é autenticação. Não há palavra-passe, verificação nem conta. Serve para o
 * visitante escolher de que lado do mercado quer explorar o produto — e a
 * interface diz isso de forma discreta em vez de fingir que existe segurança.
 */
export const useSessao = create<EstadoSessao>((set, get) => ({
  sessao: ler(),

  entrar: (tipo, nome) => {
    /*
     * Entrar inicia sempre uma sessão nova.
     *
     * Uma versão anterior tentava ser mais esperta e preservava o perfil e os
     * pedidos da sessão anterior. O resultado foi um prestador tratado como
     * autor de pedidos que nunca publicou — e, por isso, sem botão de contacto.
     * Numa demonstração cada entrada representa uma pessoa; não há forma fiável
     * de saber que é a mesma, porque não há autenticação.
     */
    const sessao: Sessao = {
      tipo,
      nome: nome.trim(),
      criadoEm: new Date().toISOString(),
      perfilId: null,
      pedidoIds: [],
    };

    gravar(sessao);
    set({ sessao });
  },

  sair: () => {
    gravar(null);
    set({ sessao: null });
  },

  definirPerfil: (perfilId) => {
    const actual = get().sessao;
    if (!actual) return;
    const sessao = { ...actual, perfilId };
    gravar(sessao);
    set({ sessao });
  },

  adicionarPedido: (pedidoId) => {
    const actual = get().sessao;
    if (!actual) return;
    const sessao = { ...actual, pedidoIds: [pedidoId, ...actual.pedidoIds] };
    gravar(sessao);
    set({ sessao });
  },
}));
