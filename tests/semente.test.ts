import { describe, expect, it } from 'vitest';
import { construirSemente, PERSONAS, semear } from '../src/data/semente';
import { chaveNome } from '../src/data/chaves';
import { calcularReputacao } from '../src/domain/reputacao';
import { filtrarPedidos } from '../src/domain/filtros';
import { RepositorioLocal, type ArmazenamentoSimples } from '../src/data/repositorioLocal';

class ArmazenamentoFalso implements ArmazenamentoSimples {
  readonly dados = new Map<string, string>();
  getItem(chave: string): string | null {
    return this.dados.get(chave) ?? null;
  }
  setItem(chave: string, valor: string): void {
    this.dados.set(chave, valor);
  }
}

/**
 * A semente é dados de demonstração, mas tem de obedecer às mesmas regras que
 * o produto impõe aos dados reais. Caso contrário a demonstração mostra um
 * estado que a aplicação nunca conseguiria produzir.
 */
describe('semente de demonstração', () => {
  const s = construirSemente(new Date('2026-11-20T12:00:00.000Z'));
  const pedidoPorId = new Map(s.pedidos.map((p) => [p.id, p]));

  it('toda a proposta aponta para um pedido existente', () => {
    for (const proposta of s.propostas) {
      expect(pedidoPorId.has(proposta.pedidoId), proposta.id).toBe(true);
    }
  });

  it('pedido aberto só tem propostas pendentes; acordado/concluído tem exactamente uma aceite', () => {
    for (const pedido of s.pedidos.filter((p) => !p.exemplo)) {
      const suas = s.propostas.filter((p) => p.pedidoId === pedido.id);
      const aceites = suas.filter((p) => p.estado === 'aceite').length;
      if (pedido.estado === 'aberto') {
        expect(aceites, pedido.id).toBe(0);
      } else {
        expect(aceites, pedido.id).toBe(1);
      }
    }
  });

  it('toda a avaliação pertence a um pedido concluído e ao prestador aceite nele', () => {
    for (const avaliacao of s.avaliacoes) {
      const pedido = pedidoPorId.get(avaliacao.pedidoId);
      expect(pedido?.estado, avaliacao.id).toBe('concluido');
      const aceite = s.propostas.find(
        (p) => p.pedidoId === avaliacao.pedidoId && p.estado === 'aceite',
      );
      expect(aceite?.autorNome, avaliacao.id).toBe(avaliacao.alvoNome);
      expect(pedido?.autorNome, avaliacao.id).toBe(avaliacao.autorNome);
    }
  });

  it('toda a mensagem pertence a um pedido e a um participante dele', () => {
    for (const mensagem of s.mensagens) {
      const pedido = pedidoPorId.get(mensagem.pedidoId);
      expect(pedido, mensagem.id).toBeDefined();
      const participa =
        mensagem.autorNome === pedido!.autorNome ||
        s.propostas.some(
          (p) => p.pedidoId === mensagem.pedidoId && p.autorNome === mensagem.autorNome,
        );
      expect(participa, mensagem.id).toBe(true);
    }
  });

  it('a posse por nome corresponde aos perfis e pedidos da semente', () => {
    for (const [chave, registo] of Object.entries(s.pertence)) {
      if (registo.perfilId) {
        const perfil = s.perfis.find((p) => p.id === registo.perfilId);
        expect(perfil && chaveNome(perfil.nome), chave).toBe(chave);
      }
      for (const pedidoId of registo.pedidoIds) {
        const pedido = pedidoPorId.get(pedidoId);
        expect(pedido && chaveNome(pedido.autorNome), pedidoId).toBe(chave);
      }
    }
  });

  it('cada personagem tem entrada na posse e uma rota de arranque', () => {
    for (const persona of PERSONAS) {
      expect(s.pertence[chaveNome(persona.nome)], persona.nome).toBeDefined();
      expect(persona.rota.startsWith('/')).toBe(true);
    }
  });

  it('conta a história certa: Ivo com duas avaliações, Joana sem nenhuma', () => {
    expect(calcularReputacao(s.avaliacoes, 'Ivo Manuel', 'prestador').total).toBe(2);
    expect(calcularReputacao(s.avaliacoes, 'Joana Baptista', 'prestador').total).toBe(0);
  });

  it('o mural mostra só os pedidos abertos da semente', () => {
    const semFiltro = { texto: '', categoria: 'todas' as const, municipio: 'todos' as const };
    const abertos = filtrarPedidos(s.pedidos, semFiltro);
    expect(abertos.every((p) => p.estado === 'aberto')).toBe(true);
    expect(abertos.some((p) => p.id === 'pedido-marta-frigorifico')).toBe(true);
    expect(abertos.some((p) => p.id === 'pedido-paulo-quadro')).toBe(false);
  });

  it('semear é idempotente', () => {
    const armazenamento = new ArmazenamentoFalso();
    expect(semear(armazenamento)).toBe(true);
    expect(semear(armazenamento)).toBe(false);
  });

  it('o repositório local arranca com a semente carregada', async () => {
    const repositorio = new RepositorioLocal(new ArmazenamentoFalso());
    const pedido = await repositorio.obterPedido('pedido-marta-frigorifico');
    expect(pedido?.estado).toBe('aberto');
    const propostas = await repositorio.listarPropostas();
    expect(propostas.filter((p) => p.pedidoId === 'pedido-marta-frigorifico')).toHaveLength(2);
  });
});
