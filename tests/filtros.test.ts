import { describe, expect, it } from 'vitest';
import { filtrarPedidos, filtrarPerfis, normalizarTexto } from '../src/domain/filtros';
import type { Pedido, Perfil } from '../src/domain/types';

function perfil(alteracoes: Partial<Perfil> = {}): Perfil {
  return {
    id: 'p1',
    nome: 'Ana Manuel',
    telefone: '244923456789',
    municipio: 'Luanda',
    bairro: 'Maianga',
    categoria: 'tecnologia',
    oficio: 'Reparação de computadores',
    descricao: 'Reparo computadores e telemóveis em casa do cliente.',
    precoTexto: null,
    fotoUrl: null,
    disponivel: true,
    exemplo: false,
    criadoEm: '2026-11-20T10:00:00.000Z',
    ...alteracoes,
  };
}

function pedido(alteracoes: Partial<Pedido> = {}): Pedido {
  return {
    id: 'd1',
    autorNome: 'Cliente',
    autorTelefone: '244923456789',
    titulo: 'O frigorífico deixou de refrigerar',
    categoria: 'reparacoes',
    municipio: 'Luanda',
    bairro: 'Maianga',
    descricao: 'Liga mas não arrefece desde ontem.',
    fotoUrl: null,
    estado: 'aberto',
    exemplo: false,
    criadoEm: '2026-11-20T10:00:00.000Z',
    ...alteracoes,
  };
}

const FILTRO_VAZIO = { texto: '', categoria: 'todas' as const, municipio: 'todos' as const };

describe('normalizarTexto', () => {
  it('remove acentos e maiúsculas', () => {
    expect(normalizarTexto('Electricidade')).toBe('electricidade');
    expect(normalizarTexto('Canalização')).toBe('canalizacao');
  });
});

describe('filtrarPerfis', () => {
  it('devolve tudo quando o filtro está vazio', () => {
    expect(filtrarPerfis([perfil()], FILTRO_VAZIO)).toHaveLength(1);
  });

  it('encontra sem acentos, nos dois sentidos', () => {
    const perfis = [perfil({ oficio: 'Canalização de água' })];
    expect(filtrarPerfis(perfis, { ...FILTRO_VAZIO, texto: 'canalizacao' })).toHaveLength(1);
  });

  it('exige que todas as palavras do termo apareçam', () => {
    const perfis = [perfil({ oficio: 'Reparação de computadores' })];
    expect(filtrarPerfis(perfis, { ...FILTRO_VAZIO, texto: 'computador maianga' })).toHaveLength(1);
    expect(filtrarPerfis(perfis, { ...FILTRO_VAZIO, texto: 'computador benfica' })).toHaveLength(0);
  });

  it('filtra por categoria', () => {
    const perfis = [perfil(), perfil({ id: 'p2', categoria: 'limpeza' })];
    const resultado = filtrarPerfis(perfis, { ...FILTRO_VAZIO, categoria: 'limpeza' });
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.id).toBe('p2');
  });

  it('filtra por município', () => {
    const perfis = [perfil(), perfil({ id: 'p2', municipio: 'Viana' })];
    const resultado = filtrarPerfis(perfis, { ...FILTRO_VAZIO, municipio: 'Viana' });
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.id).toBe('p2');
  });

  it('esconde perfis indisponíveis', () => {
    const perfis = [perfil({ disponivel: false })];
    expect(filtrarPerfis(perfis, FILTRO_VAZIO)).toHaveLength(0);
  });
});

describe('filtrarPedidos', () => {
  it('encontra pelo título, sem acentos', () => {
    expect(filtrarPedidos([pedido()], { ...FILTRO_VAZIO, texto: 'frigorifico' })).toHaveLength(1);
  });

  it('filtra por categoria e por município', () => {
    const pedidos = [pedido(), pedido({ id: 'd2', categoria: 'design', municipio: 'Talatona' })];

    expect(filtrarPedidos(pedidos, { ...FILTRO_VAZIO, categoria: 'design' })).toHaveLength(1);
    expect(filtrarPedidos(pedidos, { ...FILTRO_VAZIO, municipio: 'Talatona' })).toHaveLength(1);
    expect(filtrarPedidos(pedidos, { ...FILTRO_VAZIO, municipio: 'Viana' })).toHaveLength(0);
  });

  it('esconde pedidos fechados — o mural só mostra o que está aberto', () => {
    expect(filtrarPedidos([pedido({ estado: 'fechado' })], FILTRO_VAZIO)).toHaveLength(0);
  });
});
