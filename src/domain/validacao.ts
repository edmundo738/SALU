import { CATEGORIA_IDS, MUNICIPIOS } from './types';
import type { CategoriaId, Municipio, PerfilEntrada } from './types';
import { normalizarTelefone } from './telefone';

export type ErrosPerfil = Partial<Record<keyof PerfilEntrada, string>>;

export interface ResultadoValidacao {
  valido: boolean;
  erros: ErrosPerfil;
  /** Entrada já limpa (trim, telefone normalizado). Só faz sentido quando `valido`. */
  valor: PerfilEntrada;
}

const LIMITES = {
  nome: { min: 2, max: 60 },
  oficio: { min: 2, max: 60 },
  bairro: { min: 2, max: 60 },
  descricao: { min: 20, max: 400 },
  precoTexto: { max: 40 },
} as const;

export function limparEntrada(entrada: PerfilEntrada): PerfilEntrada {
  return {
    nome: entrada.nome.trim().replace(/\s+/g, ' '),
    telefone: normalizarTelefone(entrada.telefone) ?? entrada.telefone.trim(),
    municipio: entrada.municipio,
    bairro: entrada.bairro.trim().replace(/\s+/g, ' '),
    categoria: entrada.categoria,
    oficio: entrada.oficio.trim().replace(/\s+/g, ' '),
    descricao: entrada.descricao.trim(),
    precoTexto: entrada.precoTexto.trim(),
  };
}

/**
 * Validação de perfil.
 *
 * É uma função pura e testada por uma razão prática: as regras têm de ser
 * idênticas no formulário, nos testes e nas restrições da base de dados.
 * Quando divergem, entram dados inválidos por uma porta que ninguém vigia.
 */
export function validarPerfil(entrada: PerfilEntrada): ResultadoValidacao {
  const valor = limparEntrada(entrada);
  const erros: ErrosPerfil = {};

  const nome = valor.nome;
  if (nome.length < LIMITES.nome.min) {
    erros.nome = 'Indique o seu nome.';
  } else if (nome.length > LIMITES.nome.max) {
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
    categoria: 'informatica',
    oficio: '',
    descricao: '',
    precoTexto: '',
  };
}
