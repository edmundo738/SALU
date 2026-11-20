import type { Avaliacao, TipoAvaliado } from './types';

export interface ResumoReputacao {
  /** `null` quando não há avaliações — não é zero, é ausência de informação. */
  media: number | null;
  total: number;
  distribuicao: Record<1 | 2 | 3 | 4 | 5, number>;
}

export const REPUTACAO_VAZIA: ResumoReputacao = {
  media: null,
  total: 0,
  distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

/**
 * Reputação de uma pessoa, a partir das avaliações recebidas.
 *
 * Deliberadamente simples: média e número de avaliações, ambos visíveis.
 * Esconder o número atrás da média é o erro que faz um perfil com uma nota
 * excelente parecer igual a outro com cinquenta — e é isso que o produto não
 * deve fazer.
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

  for (const avaliacao of recebidas) {
    const nota = Math.min(5, Math.max(1, Math.round(avaliacao.nota))) as 1 | 2 | 3 | 4 | 5;
    distribuicao[nota] += 1;
    soma += nota;
  }

  return {
    media: soma / recebidas.length,
    total: recebidas.length,
    distribuicao,
  };
}
