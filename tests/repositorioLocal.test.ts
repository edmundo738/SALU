import { describe, expect, it } from 'vitest';
import { RepositorioLocal, type ArmazenamentoSimples } from '../src/data/repositorioLocal';
import type { PerfilEntrada } from '../src/domain/types';

class ArmazenamentoFalso implements ArmazenamentoSimples {
  private readonly dados = new Map<string, string>();

  getItem(chave: string): string | null {
    return this.dados.get(chave) ?? null;
  }

  setItem(chave: string, valor: string): void {
    this.dados.set(chave, valor);
  }
}

function entradaValida(alteracoes: Partial<PerfilEntrada> = {}): PerfilEntrada {
  return {
    nome: 'Carlos Domingos',
    telefone: '923 111 222',
    municipio: 'Luanda',
    bairro: 'Cazenga',
    categoria: 'electricidade',
    oficio: 'Electricista',
    descricao: 'Instalo e reparo quadros eléctricos, tomadas e iluminação em casas e lojas.',
    precoTexto: 'A combinar',
    ...alteracoes,
  };
}

function criarRepositorio(armazenamento = new ArmazenamentoFalso()): RepositorioLocal {
  let contador = 0;
  return new RepositorioLocal(
    armazenamento,
    () => `id-${++contador}`,
    () => '2026-11-20T12:00:00.000Z',
  );
}

const SEM_FILTRO = { texto: '', categoria: 'todas' as const, municipio: 'todos' as const };

describe('RepositorioLocal', () => {
  it('arranca com perfis de exemplo marcados como tal', async () => {
    const repositorio = criarRepositorio();
    const perfis = await repositorio.listarPerfis(SEM_FILTRO);

    expect(perfis.length).toBeGreaterThan(0);
    expect(perfis.every((perfil) => perfil.exemplo)).toBe(true);
  });

  it('cria um perfil real e não o marca como exemplo', async () => {
    const repositorio = criarRepositorio();
    const perfil = await repositorio.criarPerfil(entradaValida());

    expect(perfil.exemplo).toBe(false);
    expect(perfil.disponivel).toBe(true);
    expect(perfil.telefone).toBe('244923111222');
    expect(perfil.id).toBe('id-1');
  });

  it('rejeita dados inválidos em vez de os guardar', async () => {
    const repositorio = criarRepositorio();

    await expect(
      repositorio.criarPerfil(entradaValida({ telefone: '123' })),
    ).rejects.toThrow();

    const perfis = await repositorio.listarPerfis(SEM_FILTRO);
    expect(perfis.every((perfil) => perfil.exemplo)).toBe(true);
  });

  it('encontra o perfil criado por id', async () => {
    const repositorio = criarRepositorio();
    const perfil = await repositorio.criarPerfil(entradaValida());

    const encontrado = await repositorio.obterPerfil(perfil.id);
    expect(encontrado?.nome).toBe('Carlos Domingos');
    expect(await repositorio.obterPerfil('não-existe')).toBeNull();
  });

  it('regista e lista contactos', async () => {
    const repositorio = criarRepositorio();
    await repositorio.registarContacto('exemplo-informatica', 'perfil');
    await repositorio.registarContacto('exemplo-informatica', 'pesquisa');

    const contactos = await repositorio.listarContactos();
    expect(contactos).toHaveLength(2);
    expect(contactos[0]?.origem).toBe('pesquisa');
  });

  it('persiste entre instâncias que partilham o mesmo armazenamento', async () => {
    const armazenamento = new ArmazenamentoFalso();
    const primeiro = criarRepositorio(armazenamento);
    const perfil = await primeiro.criarPerfil(entradaValida());

    const segundo = criarRepositorio(armazenamento);
    const encontrado = await segundo.obterPerfil(perfil.id);

    expect(encontrado?.nome).toBe('Carlos Domingos');
  });

  it('tolera dados corrompidos no armazenamento', async () => {
    const armazenamento = new ArmazenamentoFalso();
    armazenamento.setItem('salu:v1:perfis', '{isto não é json');

    const repositorio = criarRepositorio(armazenamento);
    const perfis = await repositorio.listarPerfis(SEM_FILTRO);

    expect(perfis.length).toBeGreaterThan(0);
  });
});
