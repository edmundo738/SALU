import { create } from 'zustand';
import type {
  EventoContacto,
  FiltroPerfis,
  OrigemContacto,
  Perfil,
  PerfilEntrada,
} from '../domain/types';
import { FILTRO_INICIAL } from '../domain/types';
import { filtrarPerfis } from '../domain/filtros';
import { criarRepositorio, modoDados } from '../data/criarRepositorio';
import type { ModoDados } from '../data/repositorio';

type EstadoCarga = 'inicial' | 'a-carregar' | 'pronto' | 'erro';

interface EstadoApp {
  modo: ModoDados;
  perfis: Perfil[];
  contactos: EventoContacto[];
  filtro: FiltroPerfis;
  estado: EstadoCarga;
  erro: string | null;

  carregar: () => Promise<void>;
  carregarContactos: () => Promise<void>;
  definirFiltro: (parcial: Partial<FiltroPerfis>) => void;
  publicar: (entrada: PerfilEntrada) => Promise<Perfil>;
  registarContacto: (perfilId: string, origem: OrigemContacto) => Promise<void>;
}

export const useApp = create<EstadoApp>((set, get) => ({
  modo: modoDados(),
  perfis: [],
  contactos: [],
  filtro: FILTRO_INICIAL,
  estado: 'inicial',
  erro: null,

  carregar: async () => {
    if (get().estado === 'a-carregar') return;

    set({ estado: 'a-carregar', erro: null });

    try {
      const repositorio = await criarRepositorio();
      // Uma única leitura sem filtro; a pesquisa é feita em memória pelo domínio.
      // Com poucos perfis é instantâneo e garante que o comportamento é idêntico
      // em modo local e em modo Supabase.
      const perfis = await repositorio.listarPerfis(FILTRO_INICIAL);
      set({ perfis, estado: 'pronto' });
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

  publicar: async (entrada) => {
    const repositorio = await criarRepositorio();
    const perfil = await repositorio.criarPerfil(entrada);
    set({ perfis: [perfil, ...get().perfis] });
    return perfil;
  },

  registarContacto: async (perfilId, origem) => {
    try {
      const repositorio = await criarRepositorio();
      const evento = await repositorio.registarContacto(perfilId, origem);
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

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message;
  return 'Ocorreu um erro inesperado.';
}
