/**
 * Tipos do domínio SALU.
 *
 * O SALU tem dois lados, e o modelo tem de reflectir isso desde o início:
 * quem oferece um serviço (perfil) e quem precisa de um (pedido).
 */

export const CATEGORIA_IDS = [
  'reparacoes',
  'electricidade',
  'canalizacao',
  'limpeza',
  'tecnologia',
  'design',
  'explicacoes',
  'entregas',
  'beleza',
  'cozinha',
  'construcao',
  'administrativo',
] as const;

export type CategoriaId = (typeof CATEGORIA_IDS)[number];

export interface Categoria {
  id: CategoriaId;
  rotulo: string;
  exemplo: string;
}

/** Municípios da província de Luanda. */
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

// ---------------------------------------------------------------------------
// Lado da oferta
// ---------------------------------------------------------------------------

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
  /** Preço em texto livre: «a combinar», «5.000–10.000 Kz». Nunca calculado. */
  precoTexto: string | null;
  /** Fotografia do profissional ou de um trabalho. Data URL no protótipo. */
  fotoUrl: string | null;
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
  fotoUrl: string | null;
}

export interface FiltroPerfis {
  texto: string;
  categoria: CategoriaId | 'todas';
  municipio: Municipio | 'todos';
}

// ---------------------------------------------------------------------------
// Lado da procura
// ---------------------------------------------------------------------------

export type EstadoPedido = 'aberto' | 'fechado';

export interface Pedido {
  id: string;
  autorNome: string;
  /** Telefone de quem publica. Só é exposto como botão de contacto. */
  autorTelefone: string;
  titulo: string;
  categoria: CategoriaId;
  municipio: Municipio;
  bairro: string;
  descricao: string;
  fotoUrl: string | null;
  estado: EstadoPedido;
  exemplo: boolean;
  criadoEm: string;
}

export interface PedidoEntrada {
  autorNome: string;
  autorTelefone: string;
  titulo: string;
  categoria: CategoriaId;
  municipio: Municipio;
  bairro: string;
  descricao: string;
  fotoUrl: string | null;
}

export interface FiltroPedidos {
  texto: string;
  categoria: CategoriaId | 'todas';
  municipio: Municipio | 'todos';
}

// ---------------------------------------------------------------------------
// Contacto — a métrica central
// ---------------------------------------------------------------------------

export type OrigemContacto = 'perfil' | 'pesquisa' | 'pedido';

export type AlvoTipo = 'perfil' | 'pedido';

/**
 * Registo de que alguém iniciou contacto.
 *
 * Generalizado no incremento 2: um contacto pode acontecer a partir de um perfil
 * (cliente procura profissional) ou de um pedido (profissional responde a alguém
 * que precisa). Sem esta distinção não se sabe qual dos dois lados está a puxar
 * o mercado.
 */
export interface EventoContacto {
  id: string;
  alvoTipo: AlvoTipo;
  alvoId: string;
  origem: OrigemContacto;
  criadoEm: string;
}

// ---------------------------------------------------------------------------
// Sessão de demonstração
// ---------------------------------------------------------------------------

export type TipoSessao = 'prestador' | 'cliente';

/**
 * Sessão simulada, sem palavra-passe nem verificação.
 * Existe para o visitante poder percorrer os dois lados do produto.
 */
export interface Sessao {
  tipo: TipoSessao;
  nome: string;
  criadoEm: string;
  /** Perfil criado nesta sessão, se houver. */
  perfilId: string | null;
  /** Pedidos publicados nesta sessão. */
  pedidoIds: string[];
}

// ---------------------------------------------------------------------------

export const FILTRO_INICIAL: FiltroPerfis = {
  texto: '',
  categoria: 'todas',
  municipio: 'todos',
};

export const FILTRO_PEDIDOS_INICIAL: FiltroPedidos = {
  texto: '',
  categoria: 'todas',
  municipio: 'todos',
};
