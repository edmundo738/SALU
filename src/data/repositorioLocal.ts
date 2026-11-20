import type {
  AlvoTipo,
  EventoContacto,
  FiltroPedidos,
  FiltroPerfis,
  OrigemContacto,
  Pedido,
  PedidoEntrada,
  Perfil,
  PerfilEntrada,
} from '../domain/types';
import { filtrarPedidos, filtrarPerfis } from '../domain/filtros';
import {
  limparEntrada,
  limparPedido,
  validarPedido,
  validarPerfil,
} from '../domain/validacao';
import { pedidosDeExemplo, perfisDeExemplo } from './exemplos';
import type { RepositorioSalu } from './repositorio';

export interface ArmazenamentoSimples {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
}

const CHAVE_PERFIS = 'salu:v2:perfis';
const CHAVE_PEDIDOS = 'salu:v2:pedidos';
const CHAVE_CONTACTOS = 'salu:v2:contactos';

function ler<T>(armazenamento: ArmazenamentoSimples, chave: string, omissao: T): T {
  const bruto = armazenamento.getItem(chave);
  if (bruto === null) return omissao;

  try {
    return JSON.parse(bruto) as T;
  } catch {
    // Dados corrompidos não podem bloquear a aplicação.
    return omissao;
  }
}

/**
 * Adaptador de dados para desenvolvimento, testes e demonstração.
 *
 * LIMITAÇÃO CONHECIDA (não é um bug): os dados vivem no armazenamento do
 * dispositivo e o espaço é limitado (na ordem dos 5 MB). Um perfil criado num
 * telemóvel não aparece noutro. Serve para demonstrar o percurso completo;
 * NÃO serve para uma comunidade real — para isso é necessário o Supabase.
 */
export class RepositorioLocal implements RepositorioSalu {
  readonly modo = 'local' as const;

  constructor(
    private readonly armazenamento: ArmazenamentoSimples,
    private readonly gerarId: () => string = () => crypto.randomUUID(),
    private readonly agora: () => string = () => new Date().toISOString(),
  ) {}

  // -- perfis ---------------------------------------------------------------

  private lerPerfis(): Perfil[] {
    const guardados = ler<Perfil[] | null>(this.armazenamento, CHAVE_PERFIS, null);

    if (guardados === null) {
      const exemplos = perfisDeExemplo(this.agora());
      this.gravarPerfis(exemplos);
      return exemplos;
    }

    return guardados;
  }

  private gravarPerfis(perfis: Perfil[]): void {
    this.armazenamento.setItem(CHAVE_PERFIS, JSON.stringify(perfis));
  }

  async listarPerfis(filtro: FiltroPerfis): Promise<Perfil[]> {
    return ordenarPorRecencia(filtrarPerfis(this.lerPerfis(), filtro));
  }

  async obterPerfil(id: string): Promise<Perfil | null> {
    return this.lerPerfis().find((perfil) => perfil.id === id) ?? null;
  }

  async criarPerfil(entrada: PerfilEntrada): Promise<Perfil> {
    const validacao = validarPerfil(entrada);
    if (!validacao.valido) {
      throw new Error(Object.values(validacao.erros)[0] ?? 'Dados inválidos.');
    }

    const limpa = limparEntrada(validacao.valor);

    const perfil: Perfil = {
      id: this.gerarId(),
      ...limpa,
      precoTexto: limpa.precoTexto === '' ? null : limpa.precoTexto,
      disponivel: true,
      exemplo: false,
      criadoEm: this.agora(),
    };

    this.gravarPerfis([perfil, ...this.lerPerfis()]);

    return perfil;
  }

  // -- pedidos --------------------------------------------------------------

  private lerPedidos(): Pedido[] {
    const guardados = ler<Pedido[] | null>(this.armazenamento, CHAVE_PEDIDOS, null);

    if (guardados === null) {
      const exemplos = pedidosDeExemplo(this.agora());
      this.gravarPedidos(exemplos);
      return exemplos;
    }

    return guardados;
  }

  private gravarPedidos(pedidos: Pedido[]): void {
    this.armazenamento.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
  }

  async listarPedidos(filtro: FiltroPedidos): Promise<Pedido[]> {
    return ordenarPorRecencia(filtrarPedidos(this.lerPedidos(), filtro));
  }

  async obterPedido(id: string): Promise<Pedido | null> {
    return this.lerPedidos().find((pedido) => pedido.id === id) ?? null;
  }

  async criarPedido(entrada: PedidoEntrada): Promise<Pedido> {
    const validacao = validarPedido(entrada);
    if (!validacao.valido) {
      throw new Error(Object.values(validacao.erros)[0] ?? 'Dados inválidos.');
    }

    const limpa = limparPedido(validacao.valor);

    const pedido: Pedido = {
      id: this.gerarId(),
      ...limpa,
      estado: 'aberto',
      exemplo: false,
      criadoEm: this.agora(),
    };

    this.gravarPedidos([pedido, ...this.lerPedidos()]);

    return pedido;
  }

  // -- contactos ------------------------------------------------------------

  async registarContacto(
    alvoTipo: AlvoTipo,
    alvoId: string,
    origem: OrigemContacto,
  ): Promise<EventoContacto> {
    const evento: EventoContacto = {
      id: this.gerarId(),
      alvoTipo,
      alvoId,
      origem,
      criadoEm: this.agora(),
    };

    const contactos = ler<EventoContacto[]>(this.armazenamento, CHAVE_CONTACTOS, []);
    this.armazenamento.setItem(CHAVE_CONTACTOS, JSON.stringify([evento, ...contactos]));

    return evento;
  }

  async listarContactos(): Promise<EventoContacto[]> {
    return ler<EventoContacto[]>(this.armazenamento, CHAVE_CONTACTOS, []);
  }
}

function ordenarPorRecencia<T extends { criadoEm: string }>(itens: T[]): T[] {
  return [...itens].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}
