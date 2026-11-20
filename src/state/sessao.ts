import { create } from 'zustand';
import type { Sessao, TipoSessao } from '../domain/types';
import { CHAVES, chaveNome, type MapaPertence, type RegistoPertence } from '../data/chaves';

const CHAVE_SESSAO = CHAVES.sessao;
const CHAVE_PERTENCE = CHAVES.pertence;

const VAZIO: RegistoPertence = { perfilId: null, pedidoIds: [] };

function lerPertence(): MapaPertence {
  try {
    const bruto = window.localStorage.getItem(CHAVE_PERTENCE);
    return bruto ? (JSON.parse(bruto) as MapaPertence) : {};
  } catch {
    return {};
  }
}

function gravarPertence(mapa: MapaPertence): void {
  try {
    window.localStorage.setItem(CHAVE_PERTENCE, JSON.stringify(mapa));
  } catch {
    // Sem armazenamento, a posse vive apenas em memória nesta sessão.
  }
}

function lerSessao(): Sessao | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE_SESSAO);
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

function gravarSessao(sessao: Sessao | null): void {
  try {
    if (sessao) {
      window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    } else {
      window.localStorage.removeItem(CHAVE_SESSAO);
    }
  } catch {
    // Sem armazenamento, a sessão vive apenas em memória.
  }
}

interface EstadoSessao {
  sessao: Sessao | null;
  entrar: (tipo: TipoSessao, nome: string) => void;
  /**
   * Uma pessoa, dois papéis. A mesma Marta pode precisar de um canalizador e
   * dar explicações de matemática. Trocar de papel não é trocar de pessoa: a
   * posse (perfil e pedidos) mantém-se, só muda o lado do mercado que a
   * interface mostra primeiro.
   */
  trocarPapel: (tipo: TipoSessao) => void;
  sair: () => void;
  definirPerfil: (perfilId: string) => void;
  adicionarPedido: (pedidoId: string) => void;
}

/**
 * Sessão de demonstração.
 *
 * Não é autenticação: não há palavra-passe, verificação nem conta. Serve para o
 * visitante escolher de que lado do mercado quer explorar o produto.
 *
 * A posse do que cada pessoa criou é guardada **por nome**, não pela sessão
 * activa. Sem isso, trocar de lado para ver o outro lado de um pedido apagava a
 * autoria — e o cliente nunca conseguia ver as propostas que recebeu. É uma
 * identidade fraca (duas pessoas com o mesmo nome colidem), aceitável num
 * protótipo e substituída por autenticação no Ciclo 0 de `docs/CICLOS.md`.
 */
export const useSessao = create<EstadoSessao>((set, get) => ({
  sessao: lerSessao(),

  entrar: (tipo, nome) => {
    const limpo = nome.trim();
    const registo = lerPertence()[chaveNome(limpo)] ?? VAZIO;

    const sessao: Sessao = {
      tipo,
      nome: limpo,
      criadoEm: new Date().toISOString(),
      perfilId: registo.perfilId,
      pedidoIds: [...registo.pedidoIds],
    };

    gravarSessao(sessao);
    set({ sessao });
  },

  trocarPapel: (tipo) => {
    const actual = get().sessao;
    if (!actual || actual.tipo === tipo) return;
    const sessao = { ...actual, tipo };
    gravarSessao(sessao);
    set({ sessao });
  },

  sair: () => {
    gravarSessao(null);
    set({ sessao: null });
  },

  definirPerfil: (perfilId) => {
    const actual = get().sessao;
    if (!actual) return;

    const mapa = lerPertence();
    const chave = chaveNome(actual.nome);
    mapa[chave] = { perfilId, pedidoIds: mapa[chave]?.pedidoIds ?? actual.pedidoIds };
    gravarPertence(mapa);

    const sessao = { ...actual, perfilId };
    gravarSessao(sessao);
    set({ sessao });
  },

  adicionarPedido: (pedidoId) => {
    const actual = get().sessao;
    if (!actual) return;

    const mapa = lerPertence();
    const chave = chaveNome(actual.nome);
    const pedidoIds = [pedidoId, ...(mapa[chave]?.pedidoIds ?? actual.pedidoIds)];
    mapa[chave] = { perfilId: mapa[chave]?.perfilId ?? actual.perfilId, pedidoIds };
    gravarPertence(mapa);

    const sessao = { ...actual, pedidoIds };
    gravarSessao(sessao);
    set({ sessao });
  },
}));
