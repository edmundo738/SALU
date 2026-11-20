import type { Avaliacao, DimensoesAvaliacao, TipoAvaliado } from './types';

export interface ResumoReputacao {
  /** `null` quando não há avaliações — não é zero, é ausência de informação. */
  media: number | null;
  total: number;
  distribuicao: Record<1 | 2 | 3 | 4 | 5, number>;
  /** Médias por dimensão; `null` quando nenhuma avaliação as trouxe. */
  dimensoes: { [K in keyof DimensoesAvaliacao]: number | null };
  /** Percentagem de quem respondeu «sim» a «voltaria a trabalhar»; `null` sem respostas. */
  voltariaPct: number | null;
}

export const REPUTACAO_VAZIA: ResumoReputacao = {
  media: null,
  total: 0,
  distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  dimensoes: { comunicacao: null, pontualidade: null, qualidade: null },
  voltariaPct: null,
};

/** Nota resumo a partir das três dimensões: média arredondada, 1–5. */
export function notaDasDimensoes(dimensoes: DimensoesAvaliacao): number {
  const media = (dimensoes.comunicacao + dimensoes.pontualidade + dimensoes.qualidade) / 3;
  return Math.min(5, Math.max(1, Math.round(media)));
}

/**
 * Reputação de uma pessoa, a partir das avaliações recebidas.
 *
 * Média e número de avaliações, ambos visíveis — esconder o número atrás da
 * média é o erro que faz um perfil com uma nota excelente parecer igual a outro
 * com cinquenta. As dimensões e o «voltaria» dizem o *porquê* da média.
 */
export function calcularReputacao(
  avaliacoes: Avaliacao[],
  alvoNome: string,
  alvoTipo: TipoAvaliado,
): ResumoReputacao {
  const chave = alvoNome.trim().toLowerCase();

  const recebidas = avaliacoes.filter(
    (avaliacao) =>
      avaliacao.alvoTipo === alvoTipo && avaliacao.alvoNome.trim().toLowerCase() === chave,
  );

  if (recebidas.length === 0) return REPUTACAO_VAZIA;

  const distribuicao: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let soma = 0;
  const somaDim = { comunicacao: 0, pontualidade: 0, qualidade: 0 };
  let comDimensoes = 0;
  let voltariaSim = 0;
  let voltariaRespostas = 0;

  for (const avaliacao of recebidas) {
    const nota = Math.min(5, Math.max(1, Math.round(avaliacao.nota))) as 1 | 2 | 3 | 4 | 5;
    distribuicao[nota] += 1;
    soma += nota;

    if (avaliacao.dimensoes) {
      comDimensoes += 1;
      somaDim.comunicacao += avaliacao.dimensoes.comunicacao;
      somaDim.pontualidade += avaliacao.dimensoes.pontualidade;
      somaDim.qualidade += avaliacao.dimensoes.qualidade;
    }

    if (typeof avaliacao.voltaria === 'boolean') {
      voltariaRespostas += 1;
      if (avaliacao.voltaria) voltariaSim += 1;
    }
  }

  return {
    media: soma / recebidas.length,
    total: recebidas.length,
    distribuicao,
    dimensoes: {
      comunicacao: comDimensoes ? somaDim.comunicacao / comDimensoes : null,
      pontualidade: comDimensoes ? somaDim.pontualidade / comDimensoes : null,
      qualidade: comDimensoes ? somaDim.qualidade / comDimensoes : null,
    },
    voltariaPct: voltariaRespostas ? Math.round((voltariaSim / voltariaRespostas) * 100) : null,
  };
}
