import { describe, expect, it } from 'vitest';
import { construirSemente } from '../src/data/semente';
import { contarNaoLidas, derivarNotificacoes } from '../src/domain/notificacoes';
import { chaveNome } from '../src/data/chaves';
import type { Sessao } from '../src/domain/types';

const s = construirSemente(new Date('2026-11-20T12:00:00.000Z'));

function sessaoDe(nome: string, tipo: Sessao['tipo']): Sessao {
  const registo = s.pertence[chaveNome(nome)]!;
  return { tipo, nome, criadoEm: '2026-11-20T12:00:00.000Z', perfilId: registo.perfilId, pedidoIds: registo.pedidoIds };
}

describe('derivarNotificacoes', () => {
  it('a Marta recebe uma notificação por proposta e pela mensagem do Ivo', () => {
    const n = derivarNotificacoes(sessaoDe('Marta Kilamba', 'cliente'), s, null);
    expect(n.filter((x) => x.tipo === 'proposta-recebida')).toHaveLength(2);
    expect(n.some((x) => x.tipo === 'mensagem' && x.titulo.startsWith('Ivo'))).toBe(true);
    // A própria mensagem da Marta não a notifica.
    expect(n.some((x) => x.tipo === 'mensagem' && x.titulo.startsWith('Marta'))).toBe(false);
  });

  it('o Ivo sabe que foi escolhido e que foi avaliado', () => {
    const n = derivarNotificacoes(sessaoDe('Ivo Manuel', 'prestador'), s, null);
    expect(n.filter((x) => x.tipo === 'proposta-aceite')).toHaveLength(2);
    expect(n.filter((x) => x.tipo === 'avaliacao-recebida')).toHaveLength(2);
    // Já avaliou os dois clientes: nada pendente para avaliar.
    expect(n.some((x) => x.tipo === 'avaliar')).toBe(false);
  });

  it('o Paulo tem o trabalho acordado mas ainda nada para avaliar', () => {
    const n = derivarNotificacoes(sessaoDe('Paulo Sebastião', 'cliente'), s, null);
    expect(n.some((x) => x.tipo === 'avaliar')).toBe(false);
  });

  it('«lidas até» marca as antigas como lidas sem apagar nada', () => {
    const sessao = sessaoDe('Marta Kilamba', 'cliente');
    const antes = derivarNotificacoes(sessao, s, null);
    const depois = derivarNotificacoes(sessao, s, '2026-11-20T12:00:00.000Z');
    expect(depois).toHaveLength(antes.length);
    expect(contarNaoLidas(antes)).toBeGreaterThan(0);
    expect(contarNaoLidas(depois)).toBe(0);
  });

  it('vem ordenado da mais recente para a mais antiga', () => {
    const n = derivarNotificacoes(sessaoDe('Lúcia Tavares', 'cliente'), s, null);
    for (let i = 1; i < n.length; i++) {
      expect(n[i - 1]!.criadoEm >= n[i]!.criadoEm).toBe(true);
    }
  });
});
