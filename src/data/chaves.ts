/** Chaves do armazenamento local. Um só sítio, para a semente e a sessão não divergirem. */
export const CHAVES = {
  perfis: 'salu:v2:perfis',
  pedidos: 'salu:v2:pedidos',
  propostas: 'salu:v2:propostas',
  mensagens: 'salu:v2:mensagens',
  avaliacoes: 'salu:v2:avaliacoes',
  contactos: 'salu:v2:contactos',
  pertence: 'salu:v2:pertence',
  sessao: 'salu:v2:sessao',
  semente: 'salu:v2:semente',
} as const;

export interface RegistoPertence {
  perfilId: string | null;
  pedidoIds: string[];
}

export type MapaPertence = Record<string, RegistoPertence>;

/** O nome é a identidade neste protótipo: sem autenticação, é o que existe. */
export function chaveNome(nome: string): string {
  return nome.trim().toLowerCase();
}
