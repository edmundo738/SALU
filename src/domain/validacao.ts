import { CATEGORIA_IDS, MUNICIPIOS } from './types';
import type {
  AvaliacaoEntrada,
  CategoriaId,
  Municipio,
  PedidoEntrada,
  PerfilEntrada,
  PropostaEntrada,
} from './types';
import { normalizarTelefone } from './telefone';

export type ErrosPerfil = Partial<Record<keyof PerfilEntrada, string>>;
export type ErrosPedido = Partial<Record<keyof PedidoEntrada, string>>;

export interface ResultadoValidacao<T> {
  valido: boolean;
  erros: Partial<Record<keyof T, string>>;
  /** Entrada já limpa (trim, telefone normalizado). Só faz sentido quando `valido`. */
  valor: T;
}

const LIMITES = {
  nome: { min: 2, max: 60 },
  oficio: { min: 2, max: 60 },
  bairro: { min: 2, max: 60 },
  descricao: { min: 20, max: 400 },
  precoTexto: { max: 40 },
  tituloPedido: { min: 4, max: 80 },
  descricaoPedido: { min: 15, max: 500 },
} as const;

function limpar(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// Perfil (lado da oferta)
// ---------------------------------------------------------------------------

export function limparEntrada(entrada: PerfilEntrada): PerfilEntrada {
  return {
    nome: limpar(entrada.nome),
    telefone: normalizarTelefone(entrada.telefone) ?? entrada.telefone.trim(),
    municipio: entrada.municipio,
    bairro: limpar(entrada.bairro),
    categoria: entrada.categoria,
    oficio: limpar(entrada.oficio),
    descricao: entrada.descricao.trim(),
    precoTexto: entrada.precoTexto.trim(),
    fotoUrl: entrada.fotoUrl,
  };
}

/**
 * Validação de perfil.
 *
 * É uma função pura e testada por uma razão prática: as regras têm de ser
 * idênticas no formulário, nos testes e nas restrições da base de dados.
 * Quando divergem, entram dados inválidos por uma porta que ninguém vigia.
 */
export function validarPerfil(entrada: PerfilEntrada): ResultadoValidacao<PerfilEntrada> {
  const valor = limparEntrada(entrada);
  const erros: ErrosPerfil = {};

  if (valor.nome.length < LIMITES.nome.min) {
    erros.nome = 'Indique o seu nome.';
  } else if (valor.nome.length > LIMITES.nome.max) {
    erros.nome = `O nome não pode ter mais de ${LIMITES.nome.max} caracteres.`;
  }

  if (normalizarTelefone(valor.telefone) === null) {
    erros.telefone = 'Indique um número móvel angolano válido (ex.: 923 456 789).';
  }

  if (!MUNICIPIOS.includes(valor.municipio as Municipio)) {
    erros.municipio = 'Escolha o município onde trabalha.';
  }

  if (valor.bairro.length < LIMITES.bairro.min) {
    erros.bairro = 'Indique o bairro onde trabalha.';
  } else if (valor.bairro.length > LIMITES.bairro.max) {
    erros.bairro = `O bairro não pode ter mais de ${LIMITES.bairro.max} caracteres.`;
  }

  if (!CATEGORIA_IDS.includes(valor.categoria as CategoriaId)) {
    erros.categoria = 'Escolha uma categoria.';
  }

  if (valor.oficio.length < LIMITES.oficio.min) {
    erros.oficio = 'Descreva o seu ofício em poucas palavras.';
  } else if (valor.oficio.length > LIMITES.oficio.max) {
    erros.oficio = `O ofício não pode ter mais de ${LIMITES.oficio.max} caracteres.`;
  }

  if (valor.descricao.length < LIMITES.descricao.min) {
    erros.descricao = `Escreva pelo menos ${LIMITES.descricao.min} caracteres para que o cliente saiba o que faz.`;
  } else if (valor.descricao.length > LIMITES.descricao.max) {
    erros.descricao = `A descrição não pode ter mais de ${LIMITES.descricao.max} caracteres.`;
  }

  if (valor.precoTexto.length > LIMITES.precoTexto.max) {
    erros.precoTexto = `O preço não pode ter mais de ${LIMITES.precoTexto.max} caracteres.`;
  }

  return { valido: Object.keys(erros).length === 0, erros, valor };
}

/** Estado inicial do formulário — uma só fonte para o ecrã e para os testes. */
export function perfilVazio(): PerfilEntrada {
  return {
    nome: '',
    telefone: '',
    municipio: 'Luanda',
    bairro: '',
    categoria: 'reparacoes',
    oficio: '',
    descricao: '',
    precoTexto: '',
    fotoUrl: null,
  };
}

// ---------------------------------------------------------------------------
// Pedido (lado da procura)
// ---------------------------------------------------------------------------

export function limparPedido(entrada: PedidoEntrada): PedidoEntrada {
  return {
    autorNome: limpar(entrada.autorNome),
    autorTelefone: normalizarTelefone(entrada.autorTelefone) ?? entrada.autorTelefone.trim(),
    titulo: limpar(entrada.titulo),
    categoria: entrada.categoria,
    municipio: entrada.municipio,
    bairro: limpar(entrada.bairro),
    descricao: entrada.descricao.trim(),
    fotoUrl: entrada.fotoUrl,
  };
}

/**
 * Validação de pedido.
 *
 * O título tem um mínimo mais alto que o de um perfil porque é o que aparece no
 * mural: «Ajuda» não diz nada a um técnico que está a decidir se abre o pedido.
 */
export function validarPedido(entrada: PedidoEntrada): ResultadoValidacao<PedidoEntrada> {
  const valor = limparPedido(entrada);
  const erros: ErrosPedido = {};

  if (valor.autorNome.length < LIMITES.nome.min) {
    erros.autorNome = 'Indique o seu nome.';
  } else if (valor.autorNome.length > LIMITES.nome.max) {
    erros.autorNome = `O nome não pode ter mais de ${LIMITES.nome.max} caracteres.`;
  }

  if (normalizarTelefone(valor.autorTelefone) === null) {
    erros.autorTelefone = 'Indique um número móvel angolano válido (ex.: 923 456 789).';
  }

  if (valor.titulo.length < LIMITES.tituloPedido.min) {
    erros.titulo = 'Escreva um título claro do que precisa.';
  } else if (valor.titulo.length > LIMITES.tituloPedido.max) {
    erros.titulo = `O título não pode ter mais de ${LIMITES.tituloPedido.max} caracteres.`;
  }

  if (!CATEGORIA_IDS.includes(valor.categoria as CategoriaId)) {
    erros.categoria = 'Escolha uma categoria.';
  }

  if (!MUNICIPIOS.includes(valor.municipio as Municipio)) {
    erros.municipio = 'Escolha o município onde precisa do serviço.';
  }

  if (valor.bairro.length < LIMITES.bairro.min) {
    erros.bairro = 'Indique o bairro onde precisa do serviço.';
  } else if (valor.bairro.length > LIMITES.bairro.max) {
    erros.bairro = `O bairro não pode ter mais de ${LIMITES.bairro.max} caracteres.`;
  }

  if (valor.descricao.length < LIMITES.descricaoPedido.min) {
    erros.descricao = `Descreva o problema com pelo menos ${LIMITES.descricaoPedido.min} caracteres.`;
  } else if (valor.descricao.length > LIMITES.descricaoPedido.max) {
    erros.descricao = `A descrição não pode ter mais de ${LIMITES.descricaoPedido.max} caracteres.`;
  }

  return { valido: Object.keys(erros).length === 0, erros, valor };
}

// ---------------------------------------------------------------------------
// Proposta e mensagem
// ---------------------------------------------------------------------------

export type ErrosProposta = Partial<Record<keyof PropostaEntrada, string>>;

export function validarProposta(
  entrada: PropostaEntrada,
): ResultadoValidacao<PropostaEntrada> {
  const valor: PropostaEntrada = {
    pedidoId: entrada.pedidoId,
    autorNome: limpar(entrada.autorNome),
    mensagem: entrada.mensagem.trim(),
    precoTexto: entrada.precoTexto.trim(),
    prazoTexto: entrada.prazoTexto.trim(),
  };
  const erros: ErrosProposta = {};

  if (valor.autorNome.length < LIMITES.nome.min) {
    erros.autorNome = 'Indique o seu nome.';
  }

  if (valor.mensagem.length < 10) {
    erros.mensagem = 'Explique em poucas palavras o que consegue fazer.';
  } else if (valor.mensagem.length > 500) {
    erros.mensagem = 'A proposta não pode ter mais de 500 caracteres.';
  }

  if (valor.precoTexto.length > 40) {
    erros.precoTexto = 'O preço não pode ter mais de 40 caracteres.';
  }

  if (valor.prazoTexto.length > 40) {
    erros.prazoTexto = 'O prazo não pode ter mais de 40 caracteres.';
  }

  return { valido: Object.keys(erros).length === 0, erros, valor };
}

// ---------------------------------------------------------------------------
// Avaliação
// ---------------------------------------------------------------------------

export type ErrosAvaliacao = Partial<Record<keyof AvaliacaoEntrada, string>>;

export function validarAvaliacao(
  entrada: AvaliacaoEntrada,
): ResultadoValidacao<AvaliacaoEntrada> {
  const valor: AvaliacaoEntrada = {
    pedidoId: entrada.pedidoId,
    autorNome: limpar(entrada.autorNome),
    alvoNome: limpar(entrada.alvoNome),
    alvoTipo: entrada.alvoTipo,
    nota: entrada.nota,
    comentario: entrada.comentario.trim(),
  };
  const erros: ErrosAvaliacao = {};

  if (valor.autorNome.length < LIMITES.nome.min) {
    erros.autorNome = 'Indique o seu nome.';
  }

  if (valor.alvoNome.length < LIMITES.nome.min) {
    erros.alvoNome = 'Avaliação sem destinatário.';
  }

  if (!Number.isInteger(valor.nota) || valor.nota < 1 || valor.nota > 5) {
    erros.nota = 'Escolha uma nota de 1 a 5.';
  }

  if (valor.comentario.length > 300) {
    erros.comentario = 'O comentário não pode ter mais de 300 caracteres.';
  }

  return { valido: Object.keys(erros).length === 0, erros, valor };
}

/** Devolve a mensagem de erro, ou `null` se o texto for aceitável. */
export function validarMensagem(texto: string): string | null {
  const limpo = texto.trim();
  if (limpo.length === 0) return 'Escreva uma mensagem.';
  if (limpo.length > 500) return 'A mensagem não pode ter mais de 500 caracteres.';
  return null;
}

export function pedidoVazio(): PedidoEntrada {
  return {
    autorNome: '',
    autorTelefone: '',
    titulo: '',
    categoria: 'reparacoes',
    municipio: 'Luanda',
    bairro: '',
    descricao: '',
    fotoUrl: null,
  };
}
