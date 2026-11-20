import { describe, expect, it } from 'vitest';
import { validarAvaliacao } from '../src/domain/validacao';
import { calcularReputacao } from '../src/domain/reputacao';
import { RepositorioLocal, type ArmazenamentoSimples } from '../src/data/repositorioLocal';
import type { Avaliacao, PedidoEntrada } from '../src/domain/types';

class ArmazenamentoFalso implements ArmazenamentoSimples {
  private readonly dados = new Map<string, string>();
  getItem(chave: string): string | null {
    return this.dados.get(chave) ?? null;
  }
  setItem(chave: string, valor: string): void {
    this.dados.set(chave, valor);
  }
}

function criarRepositorio(): RepositorioLocal {
  let contador = 0;
  return new RepositorioLocal(
    new ArmazenamentoFalso(),
    () => `id-${++contador}`,
    () => `2026-11-20T12:00:${String(contador).padStart(2, '0')}.000Z`,
  );
}

function pedidoValido(): PedidoEntrada {
  return {
    autorNome: 'Marta Kilamba',
    autorTelefone: '924 111 222',
    titulo: 'Frigorífico deixou de refrigerar',
    categoria: 'reparacoes',
    municipio: 'Kilamba Kiaxi',
    bairro: 'Centralidade do Kilamba',
    descricao: 'Liga mas não arrefece desde ontem.',
    fotoUrl: null,
    urgencia: 'esta-semana',
    orcamentoTexto: '',
  };
}

function avaliacao(alteracoes: Partial<Avaliacao> = {}): Avaliacao {
  return {
    id: 'a1',
    pedidoId: 'd1',
    autorNome: 'Marta',
    alvoNome: 'Ivo Manuel',
    alvoTipo: 'prestador',
    nota: 5,
    comentario: 'Rápido e limpo.',
    criadoEm: '2026-11-20T12:00:00.000Z',
    ...alteracoes,
  };
}

describe('validarAvaliacao', () => {
  const base = {
    pedidoId: 'd1',
    autorNome: 'Marta Kilamba',
    alvoNome: 'Ivo Manuel',
    alvoTipo: 'prestador' as const,
    nota: 5,
    comentario: 'Muito bom.',
  };

  it('aceita uma avaliação válida', () => {
    expect(validarAvaliacao(base).valido).toBe(true);
  });

  it('rejeita nota fora do intervalo', () => {
    expect(validarAvaliacao({ ...base, nota: 0 }).valido).toBe(false);
    expect(validarAvaliacao({ ...base, nota: 6 }).valido).toBe(false);
  });

  it('rejeita nota não inteira', () => {
    expect(validarAvaliacao({ ...base, nota: 4.5 }).valido).toBe(false);
  });

  it('rejeita comentário acima de 300 caracteres', () => {
    expect(validarAvaliacao({ ...base, comentario: 'a'.repeat(301) }).valido).toBe(false);
  });
});

describe('validarAvaliacao — dimensões', () => {
  const base = {
    pedidoId: 'd1',
    autorNome: 'Marta Kilamba',
    alvoNome: 'Ivo Manuel',
    alvoTipo: 'prestador' as const,
    nota: 4,
    comentario: '',
  };

  it('aceita dimensões de 1 a 5', () => {
    expect(
      validarAvaliacao({ ...base, dimensoes: { comunicacao: 5, pontualidade: 3, qualidade: 4 }, voltaria: true }).valido,
    ).toBe(true);
  });

  it('rejeita dimensão fora do intervalo', () => {
    expect(
      validarAvaliacao({ ...base, dimensoes: { comunicacao: 0, pontualidade: 3, qualidade: 4 } }).valido,
    ).toBe(false);
  });
});

describe('notaDasDimensoes', () => {
  it('é a média arredondada, presa entre 1 e 5', async () => {
    const { notaDasDimensoes } = await import('../src/domain/reputacao');
    expect(notaDasDimensoes({ comunicacao: 5, pontualidade: 3, qualidade: 5 })).toBe(4);
    expect(notaDasDimensoes({ comunicacao: 1, pontualidade: 1, qualidade: 1 })).toBe(1);
  });
});

describe('calcularReputacao — dimensões e «voltaria»', () => {
  it('calcula médias por dimensão e percentagem de «voltaria»', () => {
    const resultado = calcularReputacao(
      [
        avaliacao({ dimensoes: { comunicacao: 5, pontualidade: 5, qualidade: 5 }, voltaria: true }),
        avaliacao({ id: 'a2', dimensoes: { comunicacao: 5, pontualidade: 3, qualidade: 5 }, voltaria: false }),
      ],
      'Ivo Manuel',
      'prestador',
    );
    expect(resultado.dimensoes.pontualidade).toBe(4);
    expect(resultado.dimensoes.comunicacao).toBe(5);
    expect(resultado.voltariaPct).toBe(50);
  });

  it('sem dimensões devolve null em vez de zero', () => {
    const resultado = calcularReputacao([avaliacao()], 'Ivo Manuel', 'prestador');
    expect(resultado.dimensoes.comunicacao).toBeNull();
    expect(resultado.voltariaPct).toBeNull();
  });
});

describe('calcularReputacao', () => {
  it('sem avaliações devolve ausência, não zero', () => {
    const resultado = calcularReputacao([], 'Ivo Manuel', 'prestador');
    expect(resultado.media).toBeNull();
    expect(resultado.total).toBe(0);
  });

  it('calcula a média e conta as avaliações', () => {
    const resultado = calcularReputacao(
      [avaliacao({ nota: 5 }), avaliacao({ id: 'a2', nota: 3 })],
      'Ivo Manuel',
      'prestador',
    );
    expect(resultado.media).toBe(4);
    expect(resultado.total).toBe(2);
    expect(resultado.distribuicao[5]).toBe(1);
    expect(resultado.distribuicao[3]).toBe(1);
  });

  it('ignora maiúsculas e minúsculas no nome', () => {
    const resultado = calcularReputacao([avaliacao()], 'ivo manuel', 'prestador');
    expect(resultado.total).toBe(1);
  });

  it('não mistura avaliações de clientes com as de prestadores', () => {
    const resultado = calcularReputacao(
      [avaliacao({ alvoTipo: 'cliente' })],
      'Ivo Manuel',
      'prestador',
    );
    expect(resultado.total).toBe(0);
  });
});

describe('RepositorioLocal — ciclo do trabalho', () => {
  async function prepararPedidoComProposta() {
    const repositorio = criarRepositorio();
    const pedido = await repositorio.criarPedido(pedidoValido());
    const proposta = await repositorio.criarProposta({
      pedidoId: pedido.id,
      autorNome: 'Ivo Manuel',
      mensagem: 'Passo amanhã de manhã para verificar.',
      precoTexto: '15.000 Kz',
      prazoTexto: 'amanhã',
    });
    return { repositorio, pedido, proposta };
  }

  it('aceitar põe o pedido acordado e recusa as outras propostas', async () => {
    const { repositorio, pedido, proposta } = await prepararPedidoComProposta();
    await repositorio.criarProposta({
      pedidoId: pedido.id,
      autorNome: 'Neusa Domingos',
      mensagem: 'Também posso ir ver esse frigorífico.',
      precoTexto: '',
      prazoTexto: '',
    });

    await repositorio.aceitarProposta(pedido.id, proposta.id);

    const pedidoDepois = await repositorio.obterPedido(pedido.id);
    expect(pedidoDepois?.estado).toBe('acordado');

    const propostas = (await repositorio.listarPropostas()).filter(
      (item) => item.pedidoId === pedido.id,
    );
    expect(propostas.find((item) => item.id === proposta.id)?.estado).toBe('aceite');
    expect(propostas.filter((item) => item.estado === 'recusada')).toHaveLength(1);
  });

  it('um pedido concluído continua a ser devolvido pela camada de dados, mas sai do mural', async () => {
    const { repositorio, pedido, proposta } = await prepararPedidoComProposta();
    await repositorio.aceitarProposta(pedido.id, proposta.id);
    await repositorio.concluirPedido(pedido.id);

    const semFiltro = { texto: '', categoria: 'todas' as const, municipio: 'todos' as const };
    const todos = await repositorio.listarPedidos(semFiltro);
    expect(todos.some((item) => item.id === pedido.id)).toBe(true);

    const { filtrarPedidos } = await import('../src/domain/filtros');
    expect(filtrarPedidos(todos, semFiltro).some((item) => item.id === pedido.id)).toBe(false);
  });

  it('não aceita propostas num pedido já acordado', async () => {
    const { repositorio, pedido, proposta } = await prepararPedidoComProposta();
    await repositorio.aceitarProposta(pedido.id, proposta.id);

    await expect(repositorio.aceitarProposta(pedido.id, proposta.id)).rejects.toThrow();
  });

  it('só conclui um pedido acordado', async () => {
    const repositorio = criarRepositorio();
    const pedido = await repositorio.criarPedido(pedidoValido());

    await expect(repositorio.concluirPedido(pedido.id)).rejects.toThrow();
  });

  it('não avalia antes de o trabalho estar concluído', async () => {
    const { repositorio, pedido } = await prepararPedidoComProposta();

    await expect(
      repositorio.criarAvaliacao({
        pedidoId: pedido.id,
        autorNome: 'Marta Kilamba',
        alvoNome: 'Ivo Manuel',
        alvoTipo: 'prestador',
        nota: 5,
        comentario: '',
      }),
    ).rejects.toThrow();
  });

  it('avalia depois de concluído e não deixa avaliar duas vezes', async () => {
    const { repositorio, pedido, proposta } = await prepararPedidoComProposta();
    await repositorio.aceitarProposta(pedido.id, proposta.id);
    await repositorio.concluirPedido(pedido.id);

    const criada = await repositorio.criarAvaliacao({
      pedidoId: pedido.id,
      autorNome: 'Marta Kilamba',
      alvoNome: 'Ivo Manuel',
      alvoTipo: 'prestador',
      nota: 4,
      comentario: 'Bom trabalho.',
    });

    expect(criada.nota).toBe(4);
    const doPedido = (await repositorio.listarAvaliacoes()).filter((a) => a.pedidoId === pedido.id);
    expect(doPedido).toHaveLength(1);

    await expect(
      repositorio.criarAvaliacao({
        pedidoId: pedido.id,
        autorNome: 'Marta Kilamba',
        alvoNome: 'Ivo Manuel',
        alvoTipo: 'prestador',
        nota: 5,
        comentario: '',
      }),
    ).rejects.toThrow();
  });
});
