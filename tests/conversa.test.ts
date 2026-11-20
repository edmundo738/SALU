import { describe, expect, it } from 'vitest';
import { validarMensagem, validarProposta } from '../src/domain/validacao';
import { RepositorioLocal, type ArmazenamentoSimples } from '../src/data/repositorioLocal';

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
    () => `2026-11-20T12:00:0${contador}.000Z`,
  );
}

describe('validarProposta', () => {
  const base = {
    pedidoId: 'd1',
    autorNome: 'Ivo Manuel',
    mensagem: 'Trabalho com frigoríficos e posso passar amanhã.',
    precoTexto: '15.000 Kz',
    prazoTexto: 'amanhã',
  };

  it('aceita uma proposta completa', () => {
    expect(validarProposta(base).valido).toBe(true);
  });

  it('rejeita mensagem demasiado curta', () => {
    const resultado = validarProposta({ ...base, mensagem: 'Posso' });
    expect(resultado.valido).toBe(false);
    expect(resultado.erros.mensagem).toBeDefined();
  });

  it('rejeita sem nome', () => {
    expect(validarProposta({ ...base, autorNome: ' ' }).valido).toBe(false);
  });
});

describe('validarMensagem', () => {
  it('aceita texto normal', () => {
    expect(validarMensagem('Combinado, passo às 9h.')).toBeNull();
  });

  it('rejeita vazio e texto em branco', () => {
    expect(validarMensagem('')).not.toBeNull();
    expect(validarMensagem('   ')).not.toBeNull();
  });

  it('rejeita acima de 500 caracteres', () => {
    expect(validarMensagem('a'.repeat(501))).not.toBeNull();
  });
});

describe('RepositorioLocal — conversa', () => {
  it('guarda propostas e devolve-as da mais recente para a mais antiga', async () => {
    const repositorio = criarRepositorio();

    await repositorio.criarProposta({
      pedidoId: 'd1',
      autorNome: 'Ivo',
      mensagem: 'Primeira proposta para o pedido.',
      precoTexto: '',
      prazoTexto: '',
    });
    await repositorio.criarProposta({
      pedidoId: 'd1',
      autorNome: 'Neusa',
      mensagem: 'Segunda proposta para o mesmo pedido.',
      precoTexto: '',
      prazoTexto: '',
    });

    const propostas = (await repositorio.listarPropostas()).filter((p) => p.pedidoId === 'd1');
    expect(propostas).toHaveLength(2);
    expect(propostas[0]?.autorNome).toBe('Neusa');
  });

  it('rejeita proposta inválida', async () => {
    await expect(
      criarRepositorio().criarProposta({
        pedidoId: 'd1',
        autorNome: 'Ivo',
        mensagem: 'curta',
        precoTexto: '',
        prazoTexto: '',
      }),
    ).rejects.toThrow();
  });

  it('mantém as mensagens por ordem de chegada', async () => {
    const repositorio = criarRepositorio();

    await repositorio.enviarMensagem({
      pedidoId: 'd1',
      lado: 'prestador',
      autorNome: 'Ivo',
      texto: 'Boa tarde, posso passar amanhã.',
    });
    await repositorio.enviarMensagem({
      pedidoId: 'd1',
      lado: 'cliente',
      autorNome: 'Marta',
      texto: 'Combinado, às 9h.',
    });

    const mensagens = (await repositorio.listarMensagens()).filter((m) => m.pedidoId === 'd1');
    expect(mensagens).toHaveLength(2);
    expect(mensagens[0]?.lado).toBe('prestador');
    expect(mensagens[1]?.lado).toBe('cliente');
  });

  it('não deixa enviar mensagem vazia', async () => {
    await expect(
      criarRepositorio().enviarMensagem({
        pedidoId: 'd1',
        lado: 'cliente',
        autorNome: 'Marta',
        texto: '   ',
      }),
    ).rejects.toThrow();
  });
});
