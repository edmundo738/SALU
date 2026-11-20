import { create } from 'zustand';

export type MotivoDenuncia =
  | 'burla'
  | 'incumprimento'
  | 'nao-pagamento'
  | 'servico-nao-realizado'
  | 'comportamento-abusivo'
  | 'conteudo-proibido'
  | 'outro';

export const MOTIVOS: { id: MotivoDenuncia; rotulo: string }[] = [
  { id: 'burla', rotulo: 'Burla ou tentativa de burla' },
  { id: 'incumprimento', rotulo: 'Incumprimento do que foi acordado' },
  { id: 'nao-pagamento', rotulo: 'Não pagamento' },
  { id: 'servico-nao-realizado', rotulo: 'Serviço pago e não realizado' },
  { id: 'comportamento-abusivo', rotulo: 'Comportamento abusivo ou ameaças' },
  { id: 'conteudo-proibido', rotulo: 'Anúncio de actividade proibida' },
  { id: 'outro', rotulo: 'Outro' },
];

export type EstadoDenuncia = 'recebida' | 'em-analise' | 'decidida';

export interface Denuncia {
  id: string;
  autorNome: string;
  alvoNome: string;
  pedidoId: string | null;
  motivo: MotivoDenuncia;
  descricao: string;
  estado: EstadoDenuncia;
  criadoEm: string;
}

const CHAVE = 'salu:v2:denuncias';

function ler(): Denuncia[] {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Denuncia[]) : [];
  } catch {
    return [];
  }
}

interface EstadoDenuncias {
  denuncias: Denuncia[];
  denunciar: (entrada: Omit<Denuncia, 'id' | 'estado' | 'criadoEm'>) => Denuncia;
}

/**
 * Denúncias — versão local do protótipo.
 *
 * Uma denúncia não é uma condenação: fica «recebida» até alguém a analisar.
 * Aqui não há ninguém do outro lado; a interface di-lo. O que esta versão
 * demonstra é o caminho — onde se denuncia, o que se pede, o que acontece a
 * seguir — não a moderação em si, que é trabalho humano e recorrente.
 */
export const useDenuncias = create<EstadoDenuncias>((set, get) => ({
  denuncias: ler(),

  denunciar: (entrada) => {
    const denuncia: Denuncia = {
      ...entrada,
      id: crypto.randomUUID(),
      estado: 'recebida',
      criadoEm: new Date().toISOString(),
    };
    const denuncias = [denuncia, ...get().denuncias];
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(denuncias));
    } catch {
      // Sem armazenamento, fica em memória.
    }
    set({ denuncias });
    return denuncia;
  },
}));
