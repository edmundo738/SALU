/**
 * Tipos do domínio SALU.
 *
 * Regra de âmbito (incremento 1): só existe aquilo que o percurso
 * «prestador publica perfil → cliente encontra → cliente contacta»
 * precisa. Pedidos e respostas entram no incremento seguinte.
 */

export const CATEGORIA_IDS = [
  'informatica',
  'electricidade',
  'canalizacao',
  'limpeza',
  'explicacoes',
  'cozinha',
] as const;

export type CategoriaId = (typeof CATEGORIA_IDS)[number];

export interface Categoria {
  id: CategoriaId;
  rotulo: string;
  exemplo: string;
}

/** Municípios da província de Luanda (arranque do piloto). */
export const MUNICIPIOS = [
  'Luanda',
  'Belas',
  'Cacuaco',
  'Cazenga',
  'Viana',
  'Talatona',
  'Kilamba Kiaxi',
] as const;

export type Municipio = (typeof MUNICIPIOS)[number];

export interface Perfil {
  id: string;
  nome: string;
  /** Número em formato internacional só com dígitos, ex.: 244923456789. */
  telefone: string;
  municipio: Municipio;
  bairro: string;
  categoria: CategoriaId;
  oficio: string;
  descricao: string;
  /** Preço em texto livre: «a combinar», «5.000–10.000 Kz». Nunca um número calculado. */
  precoTexto: string | null;
  disponivel: boolean;
  /**
   * Perfil de exemplo criado pelo sistema para demonstração.
   * Nunca corresponde a uma pessoa real e o contacto está desactivado.
   */
  exemplo: boolean;
  criadoEm: string;
}

export interface PerfilEntrada {
  nome: string;
  telefone: string;
  municipio: Municipio;
  bairro: string;
  categoria: CategoriaId;
  oficio: string;
  descricao: string;
  precoTexto: string;
}

export interface FiltroPerfis {
  texto: string;
  categoria: CategoriaId | 'todas';
  municipio: Municipio | 'todos';
}

export type OrigemContacto = 'perfil' | 'pesquisa';

/** Registo de que alguém iniciou contacto. É a métrica central do produto. */
export interface EventoContacto {
  id: string;
  perfilId: string;
  origem: OrigemContacto;
  criadoEm: string;
}

export const FILTRO_INICIAL: FiltroPerfis = {
  texto: '',
  categoria: 'todas',
  municipio: 'todos',
};
