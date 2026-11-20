import { create } from 'zustand';
import type {
  AlvoTipo,
  EventoContacto,
  FiltroPedidos,
  FiltroPerfis,
  OrigemContacto,
  Pedido,
  PedidoEntrada,
  Perfil,
  PerfilEntrada,
} from '../domain/types';
import { FILTRO_INICIAL, FILTRO_PEDIDOS_INICIAL } from '../domain/types';
import { filtrarPedidos, filtrarPerfis } from '../domain/filtros';
import { criarRepositorio, modoDados } from '../data/criarRepositorio';
import type { ModoDados } from '../data/repositorio';

type EstadoCarga = 'inicial' | 'a-carregar' | 'pronto' | 'erro';

interface EstadoApp {
  modo: ModoDados;
  perfis: Perfil[];
  pedidos: Pedido[];
  contactos: EventoContacto[];
  filtro: FiltroPerfis;
  filtroPedidos: FiltroPedidos;
  estado: EstadoCarga;
  erro: string | null;

  carregar: () => Promise<void>;
  carregarContactos: () => Promise<void>;
  definirFiltro: (parcial: Partial<FiltroPerfis>) => void;
  definirFiltroPedidos: (parcial: Partial<FiltroPedidos>) => void;
  publicarPerfil: (entrada: PerfilEntrada) => Promise<Perfil>;
  publicarPedido: (entrada: PedidoEntrada) => Promise<Pedido>;
  registarContacto: (
    alvoTipo: AlvoTipo,
    alvoId: string,
    origem: OrigemContacto,
  ) => Promise<void>;
}

export const useApp = create<EstadoApp>((set, get) => ({
  modo: modoDados(),
  perfis: [],
  pedidos: [],
  contactos: [],
  filtro: FILTRO_INICIAL,
  filtroPedidos: FILTRO_PEDIDOS_INICIAL,
  estado: 'inicial',
  erro: null,

  carregar: async () => {
    if (get().estado === 'a-carregar') return;

    set({ estado: 'a-carregar', erro: null });

    try {
      const repositorio = await criarRepositorio();
      // Uma única leitura sem filtro; a pesquisa é feita em memória pelo domínio.
      // Com poucos registos é instantâneo e garante que o comportamento é o mesmo
      // em modo local e em modo Supabase.
      const [perfis, pedidos] = await Promise.all([
        repositorio.listarPerfis(FILTRO_INICIAL),
        repositorio.listarPedidos(FILTRO_PEDIDOS_INICIAL),
      ]);
      set({ perfis, pedidos, estado: 'pronto' });
    } catch (erro) {
      set({ estado: 'erro', erro: mensagemDeErro(erro) });
    }
  },

  carregarContactos: async () => {
    try {
      const repositorio = await criarRepositorio();
      const contactos = await repositorio.listarContactos();
      set({ contactos });
    } catch {
      set({ contactos: [] });
    }
  },

  definirFiltro: (parcial) => {
    set({ filtro: { ...get().filtro, ...parcial } });
  },

  definirFiltroPedidos: (parcial) => {
    set({ filtroPedidos: { ...get().filtroPedidos, ...parcial } });
  },

  publicarPerfil: async (entrada) => {
    const repositorio = await criarRepositorio();
    const perfil = await repositorio.criarPerfil(entrada);
    set({ perfis: [perfil, ...get().perfis] });
    return perfil;
  },

  publicarPedido: async (entrada) => {
    const repositorio = await criarRepositorio();
    const pedido = await repositorio.criarPedido(entrada);
    set({ pedidos: [pedido, ...get().pedidos] });
    return pedido;
  },

  registarContacto: async (alvoTipo, alvoId, origem) => {
    try {
      const repositorio = await criarRepositorio();
      const evento = await repositorio.registarContacto(alvoTipo, alvoId, origem);
      set({ contactos: [evento, ...get().contactos] });
    } catch (erro) {
      // O WhatsApp já abriu; falhar o registo não pode impedir a conversa.
      console.error('[SALU] Falha ao registar contacto:', erro);
    }
  },
}));

/** Perfis já filtrados pelo estado actual. */
export function usePerfisFiltrados(): Perfil[] {
  const perfis = useApp((estado) => estado.perfis);
  const filtro = useApp((estado) => estado.filtro);
  return filtrarPerfis(perfis, filtro);
}

/** Pedidos já filtrados pelo estado actual. */
export function usePedidosFiltrados(): Pedido[] {
  const pedidos = useApp((estado) => estado.pedidos);
  const filtro = useApp((estado) => estado.filtroPedidos);
  return filtrarPedidos(pedidos, filtro);
}

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message;
  return 'Ocorreu um erro inesperado.';
}
