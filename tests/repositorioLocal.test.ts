import { describe, expect, it } from 'vitest';
import { RepositorioLocal, type ArmazenamentoSimples } from '../src/data/repositorioLocal';
import type { PedidoEntrada, PerfilEntrada } from '../src/domain/types';

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
    fotoUrl: null,
    tipoEntidade: 'individual',
    competenciasTexto: 'Quadros, tomadas, quadros, iluminação',
    disponibilidadeTexto: 'Seg–sáb',
    ...alteracoes,
  };
}

function pedidoValido(alteracoes: Partial<PedidoEntrada> = {}): PedidoEntrada {
  return {
    autorNome: 'Marta Silva',
    autorTelefone: '924 333 444',
    titulo: 'O frigorífico deixou de refrigerar',
    categoria: 'reparacoes',
    municipio: 'Luanda',
    bairro: 'Maianga',
    descricao: 'Liga mas não arrefece desde ontem. Já desliguei e voltei a ligar.',
    fotoUrl: null,
    urgencia: 'flexivel',
    orcamentoTexto: '',
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

describe('RepositorioLocal — perfis', () => {
  it('arranca com exemplos estáticos e personagens de demonstração', async () => {
    const perfis = await criarRepositorio().listarPerfis(SEM_FILTRO);

    expect(perfis.length).toBeGreaterThan(0);
    // Os exemplos de fundo são não-contactáveis; as personagens são utilizáveis.
    expect(perfis.some((perfil) => perfil.exemplo)).toBe(true);
    expect(perfis.some((perfil) => !perfil.exemplo)).toBe(true);
  });

  it('cria um perfil real e não o marca como exemplo', async () => {
    const perfil = await criarRepositorio().criarPerfil(entradaValida());

    expect(perfil.exemplo).toBe(false);
    expect(perfil.disponivel).toBe(true);
    expect(perfil.telefone).toBe('244923111222');
    // Competências limpas e sem repetidas.
    expect(perfil.competencias).toEqual(['Quadros', 'tomadas', 'iluminação']);
    expect(perfil.disponibilidadeTexto).toBe('Seg–sáb');
  });

  it('rejeita dados inválidos em vez de os guardar', async () => {
    const repositorio = criarRepositorio();
    const antes = (await repositorio.listarPerfis(SEM_FILTRO)).length;

    await expect(
      repositorio.criarPerfil(entradaValida({ telefone: '123' })),
    ).rejects.toThrow();

    expect((await repositorio.listarPerfis(SEM_FILTRO)).length).toBe(antes);
  });

  it('encontra o perfil criado por id', async () => {
    const repositorio = criarRepositorio();
    const perfil = await repositorio.criarPerfil(entradaValida());

    expect((await repositorio.obterPerfil(perfil.id))?.nome).toBe('Carlos Domingos');
    expect(await repositorio.obterPerfil('não-existe')).toBeNull();
  });
});

describe('RepositorioLocal — pedidos', () => {
  it('arranca com pedidos de exemplo abertos e pedidos de personagens em vários estados', async () => {
    const pedidos = await criarRepositorio().listarPedidos(SEM_FILTRO);

    expect(pedidos.length).toBeGreaterThan(0);
    expect(pedidos.filter((p) => p.exemplo).every((p) => p.estado === 'aberto')).toBe(true);
    expect(new Set(pedidos.map((p) => p.estado)).size).toBeGreaterThan(1);
  });

  it('cria um pedido real, aberto e não marcado como exemplo', async () => {
    const pedido = await criarRepositorio().criarPedido(pedidoValido());

    expect(pedido.exemplo).toBe(false);
    expect(pedido.estado).toBe('aberto');
    expect(pedido.autorTelefone).toBe('244924333444');
  });

  it('rejeita pedido com título demasiado curto', async () => {
    await expect(
      criarRepositorio().criarPedido(pedidoValido({ titulo: 'Oi' })),
    ).rejects.toThrow();
  });

  it('devolve o pedido criado por id', async () => {
    const repositorio = criarRepositorio();
    const pedido = await repositorio.criarPedido(pedidoValido());

    expect((await repositorio.obterPedido(pedido.id))?.titulo).toBe(
      'O frigorífico deixou de refrigerar',
    );
  });
});

describe('RepositorioLocal — contactos', () => {
  it('regista contactos a perfis e a pedidos com o alvo correcto', async () => {
    const repositorio = criarRepositorio();
    await repositorio.registarContacto('perfil', 'exemplo-reparacoes', 'perfil');
    await repositorio.registarContacto('pedido', 'exemplo-pedido-frigorifico', 'pedido');

    // A semente já traz contactos; olhamos só para os dois que registámos.
    const contactos = (await repositorio.listarContactos()).filter((evento) =>
      ['exemplo-reparacoes', 'exemplo-pedido-frigorifico'].includes(evento.alvoId),
    );
    expect(contactos).toHaveLength(2);
    expect(contactos[0]?.alvoTipo).toBe('pedido');
    expect(contactos[1]?.alvoTipo).toBe('perfil');
  });

  it('persiste entre instâncias que partilham o mesmo armazenamento', async () => {
    const armazenamento = new ArmazenamentoFalso();
    const perfil = await criarRepositorio(armazenamento).criarPerfil(entradaValida());

    const encontrado = await criarRepositorio(armazenamento).obterPerfil(perfil.id);
    expect(encontrado?.nome).toBe('Carlos Domingos');
  });

  it('tolera dados corrompidos no armazenamento', async () => {
    const armazenamento = new ArmazenamentoFalso();
    const repositorio = criarRepositorio(armazenamento);
    armazenamento.setItem('salu:v2:perfis', '{isto não é json');

    // Não rebenta; devolve lista vazia em vez de bloquear a aplicação.
    await expect(repositorio.listarPerfis(SEM_FILTRO)).resolves.toEqual([]);
  });
});
