import type {
  EventoContacto,
  FiltroPerfis,
  OrigemContacto,
  Perfil,
  PerfilEntrada,
} from '../domain/types';

export type ModoDados = 'local' | 'supabase';

/**
 * Contrato único de acesso a dados.
 *
 * Existe por uma razão concreta e temporária: o incremento 1 tem de correr e ser
 * testado antes de existir um projecto Supabase. O adaptador local permite
 * desenvolver e testar; o adaptador Supabase é o que serve pessoas reais.
 *
 * Quando o Supabase estiver ligado, o adaptador local deixa de ser usado em
 * produção — continua apenas nos testes.
 */
export interface RepositorioSalu {
  readonly modo: ModoDados;

  listarPerfis(filtro: FiltroPerfis): Promise<Perfil[]>;
  obterPerfil(id: string): Promise<Perfil | null>;
  criarPerfil(entrada: PerfilEntrada): Promise<Perfil>;

  registarContacto(perfilId: string, origem: OrigemContacto): Promise<EventoContacto>;
  listarContactos(): Promise<EventoContacto[]>;
}
