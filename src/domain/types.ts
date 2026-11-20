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

/** O SALU serve pessoas e pequenos negócios; o perfil diz qual é. */
export type TipoEntidade = 'individual' | 'pequeno-negocio' | 'empresa';

export const TIPOS_ENTIDADE: { id: TipoEntidade; rotulo: string }[] = [
  { id: 'individual', rotulo: 'Trabalho por conta própria' },
  { id: 'pequeno-negocio', rotulo: 'Pequeno negócio' },
  { id: 'empresa', rotulo: 'Empresa' },
];

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
  tipoEntidade: TipoEntidade;
  /** Até 8 competências curtas: «frigoríficos Samsung», «quadros trifásicos». */
  competencias: string[];
  /** Disponibilidade em texto: «seg–sáb, 8h–18h». Nunca uma agenda calculada. */
  disponibilidadeTexto: string | null;
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
  tipoEntidade: TipoEntidade;
  /** Competências separadas por vírgula, como a pessoa as escreve. */
  competenciasTexto: string;
  disponibilidadeTexto: string;
}

export interface FiltroPerfis {
  texto: string;
  categoria: CategoriaId | 'todas';
  municipio: Municipio | 'todos';
}

// ---------------------------------------------------------------------------
// Lado da procura
// ---------------------------------------------------------------------------

/**
 * Estados do pedido.
 *
 * `acordado` significa que o cliente escolheu uma proposta e o trabalho vai
 * acontecer — não que já aconteceu. Essa distinção evita o erro mais comum
 * destas plataformas: apresentar como concluído aquilo que só foi combinado.
 */
export type EstadoPedido = 'aberto' | 'acordado' | 'concluido' | 'cancelado';

export type EstadoProposta = 'pendente' | 'aceite' | 'recusada';

export type Urgencia = 'flexivel' | 'esta-semana' | 'urgente';

export const URGENCIAS: { id: Urgencia; rotulo: string; curto: string }[] = [
  { id: 'flexivel', rotulo: 'Flexível — quando der', curto: 'Flexível' },
  { id: 'esta-semana', rotulo: 'Esta semana', curto: 'Esta semana' },
  { id: 'urgente', rotulo: 'Urgente — nas próximas 48 horas', curto: 'Urgente' },
];

export type TipoEventoPedido =
  | 'publicado'
  | 'proposta'
  | 'aceite'
  | 'concluido'
  | 'cancelado'
  | 'avaliado';

/**
 * Um acontecimento no ciclo de vida do pedido.
 * É o que permite mostrar «o que aconteceu e quando» sem adivinhar.
 */
export interface EventoPedido {
  tipo: TipoEventoPedido;
  autorNome: string;
  criadoEm: string;
  detalhe?: string;
}

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
  urgencia: Urgencia;
  /** Orçamento indicativo em texto («até 20.000 Kz»). Opcional e nunca calculado. */
  orcamentoTexto: string | null;
  estado: EstadoPedido;
  historico: EventoPedido[];
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
  urgencia: Urgencia;
  orcamentoTexto: string;
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
// Propostas e conversa (Ciclo 5, versão de demonstração)
// ---------------------------------------------------------------------------

/**
 * Uma proposta é a manifestação formal de interesse de um prestador num pedido.
 *
 * A regra que a torna necessária: sem proposta, um prestador não pode abrir
 * conversa com o cliente. É o que impede mensagens não solicitadas.
 */
export interface Proposta {
  id: string;
  pedidoId: string;
  autorNome: string;
  mensagem: string;
  precoTexto: string;
  prazoTexto: string;
  estado: EstadoProposta;
  criadoEm: string;
}

export interface PropostaEntrada {
  pedidoId: string;
  autorNome: string;
  mensagem: string;
  precoTexto: string;
  prazoTexto: string;
}

export type LadoConversa = 'cliente' | 'prestador';

export interface Mensagem {
  id: string;
  pedidoId: string;
  lado: LadoConversa;
  autorNome: string;
  texto: string;
  criadoEm: string;
}

export interface MensagemEntrada {
  pedidoId: string;
  lado: LadoConversa;
  autorNome: string;
  texto: string;
}

// ---------------------------------------------------------------------------
// Avaliações
// ---------------------------------------------------------------------------

export type TipoAvaliado = 'prestador' | 'cliente';

/**
 * Uma avaliação só existe ligada a um pedido concluído.
 *
 * Não há avaliação livre: sem trabalho confirmado, uma nota é apenas uma
 * opinião — e opiniões sem contexto destroem a confiança que o produto promete.
 */
/**
 * Três dimensões, não uma estrela.
 *
 * Para um prestador: comunicação, pontualidade, qualidade do trabalho.
 * Para um cliente: comunicação, pontualidade, clareza do pedido.
 * A «nota» continua a existir como resumo (média arredondada) para que a
 * reputação se leia num relance — mas as dimensões é que dizem porquê.
 */
export interface DimensoesAvaliacao {
  comunicacao: number;
  pontualidade: number;
  qualidade: number;
}

export interface Avaliacao {
  id: string;
  pedidoId: string;
  autorNome: string;
  alvoNome: string;
  alvoTipo: TipoAvaliado;
  nota: number;
  dimensoes?: DimensoesAvaliacao;
  /** «Voltaria a trabalhar com esta pessoa?» — a pergunta que mais informa. */
  voltaria?: boolean;
  comentario: string;
  criadoEm: string;
}

export interface AvaliacaoEntrada {
  pedidoId: string;
  autorNome: string;
  alvoNome: string;
  alvoTipo: TipoAvaliado;
  nota: number;
  dimensoes?: DimensoesAvaliacao;
  voltaria?: boolean;
  comentario: string;
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
