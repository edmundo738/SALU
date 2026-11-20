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

export type ModoDados = 'local' | 'supabase';

/**
 * Contrato único de acesso a dados.
 *
 * Existe por uma razão concreta e temporária: o protótipo tem de correr e ser
 * testado sem um projecto Supabase. O adaptador local permite desenvolver,
 * testar e demonstrar; o adaptador Supabase é o caminho para um dia haver
 * utilizadores reais.
 */
export interface RepositorioSalu {
  readonly modo: ModoDados;

  listarPerfis(filtro: FiltroPerfis): Promise<Perfil[]>;
  obterPerfil(id: string): Promise<Perfil | null>;
  criarPerfil(entrada: PerfilEntrada): Promise<Perfil>;

  listarPedidos(filtro: FiltroPedidos): Promise<Pedido[]>;
  obterPedido(id: string): Promise<Pedido | null>;
  criarPedido(entrada: PedidoEntrada): Promise<Pedido>;

  registarContacto(
    alvoTipo: AlvoTipo,
    alvoId: string,
    origem: OrigemContacto,
  ): Promise<EventoContacto>;
  listarContactos(): Promise<EventoContacto[]>;
}
