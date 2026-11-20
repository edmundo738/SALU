import { describe, expect, it } from 'vitest';
import { indicePasso, proximoPasso } from '../src/domain/estados';
import type { Pedido, Proposta } from '../src/domain/types';

function pedido(estado: Pedido['estado']): Pedido {
  return {
    id: 'd1',
    autorNome: 'Marta',
    autorTelefone: '244923000000',
    titulo: 'Frigorífico',
    categoria: 'reparacoes',
    municipio: 'Luanda',
    bairro: 'Maianga',
    descricao: 'Não refrigera desde ontem à noite.',
    fotoUrl: null,
    urgencia: 'flexivel',
    orcamentoTexto: null,
    estado,
    historico: [],
    exemplo: false,
    criadoEm: '2026-11-20T10:00:00.000Z',
  };
}

function proposta(estado: Proposta['estado'], autorNome = 'Ivo'): Proposta {
  return {
    id: `p-${autorNome}`,
    pedidoId: 'd1',
    autorNome,
    mensagem: 'Posso passar amanhã de manhã.',
    precoTexto: '',
    prazoTexto: '',
    estado,
    criadoEm: '2026-11-20T11:00:00.000Z',
  };
}

describe('proximoPasso — cliente', () => {
  it('sem propostas, espera', () => {
    const passo = proximoPasso(pedido('aberto'), 'cliente', { propostas: [], jaAvaliei: false });
    expect(passo.pendente).toBe(false);
    expect(passo.titulo).toMatch(/espera/i);
  });

  it('com propostas pendentes, tem de decidir', () => {
    const passo = proximoPasso(pedido('aberto'), 'cliente', {
      propostas: [proposta('pendente'), proposta('pendente', 'Neusa')],
      jaAvaliei: false,
    });
    expect(passo.pendente).toBe(true);
    expect(passo.titulo).toContain('2 propostas');
  });

  it('acordado nomeia o profissional escolhido', () => {
    const passo = proximoPasso(pedido('acordado'), 'cliente', {
      propostas: [proposta('aceite', 'Ivo')],
      jaAvaliei: false,
    });
    expect(passo.titulo).toContain('Ivo');
    expect(passo.pendente).toBe(true);
  });

  it('concluído pede avaliação até ela existir', () => {
    const antes = proximoPasso(pedido('concluido'), 'cliente', { propostas: [], jaAvaliei: false });
    const depois = proximoPasso(pedido('concluido'), 'cliente', { propostas: [], jaAvaliei: true });
    expect(antes.pendente).toBe(true);
    expect(depois.pendente).toBe(false);
  });
});

describe('proximoPasso — prestador', () => {
  it('pode propor-se a um pedido aberto sem proposta sua', () => {
    const passo = proximoPasso(pedido('aberto'), 'prestador', { propostas: [], jaAvaliei: false });
    expect(passo.pendente).toBe(true);
  });

  it('não pode propor-se a um pedido que já tem profissional', () => {
    const passo = proximoPasso(pedido('acordado'), 'prestador', { propostas: [], jaAvaliei: false });
    expect(passo.pendente).toBe(false);
  });

  it('proposta aceite num pedido acordado: foi escolhido', () => {
    const minha = proposta('aceite');
    const passo = proximoPasso(pedido('acordado'), 'prestador', {
      propostas: [minha],
      minhaProposta: minha,
      jaAvaliei: false,
    });
    expect(passo.titulo).toMatch(/escolhido/i);
    expect(passo.pendente).toBe(true);
  });

  it('proposta recusada não deixa acção pendente', () => {
    const minha = proposta('recusada');
    const passo = proximoPasso(pedido('acordado'), 'prestador', {
      propostas: [minha],
      minhaProposta: minha,
      jaAvaliei: false,
    });
    expect(passo.pendente).toBe(false);
  });
});

describe('indicePasso', () => {
  it('segue a ordem publicado → acordado → concluído e exclui cancelado', () => {
    expect(indicePasso('aberto')).toBe(0);
    expect(indicePasso('acordado')).toBe(1);
    expect(indicePasso('concluido')).toBe(2);
    expect(indicePasso('cancelado')).toBe(-1);
  });
});
