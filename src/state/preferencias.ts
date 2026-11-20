import { create } from 'zustand';
import { chaveNome } from '../data/chaves';

/**
 * Preferências por pessoa, locais ao dispositivo:
 *  - até quando as notificações foram vistas;
 *  - profissionais guardados como «de confiança».
 *
 * Vivem fora do repositório porque não são factos do mercado — são do
 * utilizador. Quando houver contas, migram para a tabela de perfil.
 */

const CHAVE_LIDAS = 'salu:v2:lidas';
const CHAVE_CONFIANCA = 'salu:v2:confianca';

type MapaLidas = Record<string, string>;
type MapaConfianca = Record<string, string[]>;

function ler<T>(chave: string, omissao: T): T {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : omissao;
  } catch {
    return omissao;
  }
}

function gravar(chave: string, valor: unknown): void {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Sem armazenamento, fica só em memória.
  }
}

interface EstadoPreferencias {
  lidas: MapaLidas;
  confianca: MapaConfianca;
  lidasAte: (nome: string) => string | null;
  marcarLidas: (nome: string) => void;
  deConfianca: (nome: string) => string[];
  ehDeConfianca: (nome: string, perfilId: string) => boolean;
  alternarConfianca: (nome: string, perfilId: string) => void;
}

export const usePreferencias = create<EstadoPreferencias>((set, get) => ({
  lidas: ler<MapaLidas>(CHAVE_LIDAS, {}),
  confianca: ler<MapaConfianca>(CHAVE_CONFIANCA, {}),

  lidasAte: (nome) => get().lidas[chaveNome(nome)] ?? null,

  marcarLidas: (nome) => {
    const lidas = { ...get().lidas, [chaveNome(nome)]: new Date().toISOString() };
    gravar(CHAVE_LIDAS, lidas);
    set({ lidas });
  },

  deConfianca: (nome) => get().confianca[chaveNome(nome)] ?? [],

  ehDeConfianca: (nome, perfilId) => (get().confianca[chaveNome(nome)] ?? []).includes(perfilId),

  alternarConfianca: (nome, perfilId) => {
    const chave = chaveNome(nome);
    const actuais = get().confianca[chave] ?? [];
    const proximos = actuais.includes(perfilId)
      ? actuais.filter((id) => id !== perfilId)
      : [perfilId, ...actuais];
    const confianca = { ...get().confianca, [chave]: proximos };
    gravar(CHAVE_CONFIANCA, confianca);
    set({ confianca });
  },
}));
