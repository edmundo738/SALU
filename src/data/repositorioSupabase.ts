import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  CategoriaId,
  EventoContacto,
  FiltroPerfis,
  Municipio,
  OrigemContacto,
  Perfil,
  PerfilEntrada,
} from '../domain/types';
import { limparEntrada, validarPerfil } from '../domain/validacao';
import type { RepositorioSalu } from './repositorio';

/**
 * Adaptador Supabase — o caminho de produção.
 *
 * ESTADO: escrito e compilado, mas NÃO testado contra um projecto Supabase real.
 * Ver docs/DATA_MODEL.md, secção «O que ainda não está verificado».
 *
 * Duas limitações conhecidas e deliberadas no incremento 1:
 *  1. `criarPerfil` exige sessão autenticada, porque a política RLS de INSERT
 *     usa `auth.uid()`. A entrada de conta é o incremento seguinte; até lá o
 *     modo Supabase é só de leitura.
 *  2. `listarContactos` devolve apenas o que as políticas permitem ao utilizador
 *     actual. Sem sessão, devolve lista vazia.
 */

interface LinhaPerfil {
  id: string;
  nome: string;
  telefone: string;
  municipio: string;
  bairro: string;
  categoria: string;
  oficio: string;
  descricao: string;
  preco_texto: string | null;
  disponivel: boolean;
  exemplo: boolean;
  criado_em: string;
}

interface LinhaContacto {
  id: string;
  profile_id: string;
  origem: string;
  criado_em: string;
}

function paraPerfil(linha: LinhaPerfil): Perfil {
  return {
    id: linha.id,
    nome: linha.nome,
    telefone: linha.telefone,
    municipio: linha.municipio as Municipio,
    bairro: linha.bairro,
    categoria: linha.categoria as CategoriaId,
    oficio: linha.oficio,
    descricao: linha.descricao,
    precoTexto: linha.preco_texto,
    disponivel: linha.disponivel,
    exemplo: linha.exemplo,
    criadoEm: linha.criado_em,
  };
}

function paraContacto(linha: LinhaContacto): EventoContacto {
  return {
    id: linha.id,
    perfilId: linha.profile_id,
    origem: linha.origem as OrigemContacto,
    criadoEm: linha.criado_em,
  };
}

/** O PostgREST usa vírgula e parênteses como sintaxe: não podem vir do utilizador. */
function limparTermoPesquisa(texto: string): string {
  return texto.replace(/[,()%]/g, ' ').trim();
}

export class RepositorioSupabase implements RepositorioSalu {
  readonly modo = 'supabase' as const;
  private readonly cliente: SupabaseClient;

  constructor(url: string, chaveAnon: string) {
    this.cliente = createClient(url, chaveAnon, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }

  async listarPerfis(filtro: FiltroPerfis): Promise<Perfil[]> {
    let consulta = this.cliente
      .from('profiles')
      .select('*')
      .eq('disponivel', true);

    if (filtro.categoria !== 'todas') {
      consulta = consulta.eq('categoria', filtro.categoria);
    }

    if (filtro.municipio !== 'todos') {
      consulta = consulta.eq('municipio', filtro.municipio);
    }

    const termo = limparTermoPesquisa(filtro.texto);
    if (termo !== '') {
      const padrao = `%${termo}%`;
      consulta = consulta.or(
        `nome.ilike.${padrao},oficio.ilike.${padrao},bairro.ilike.${padrao},descricao.ilike.${padrao}`,
      );
    }

    const { data, error } = await consulta.order('criado_em', { ascending: false }).limit(200);

    if (error) {
      throw new Error(`Não foi possível carregar os perfis: ${error.message}`);
    }

    return ((data ?? []) as LinhaPerfil[]).map(paraPerfil);
  }

  async obterPerfil(id: string): Promise<Perfil | null> {
    const { data, error } = await this.cliente
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Não foi possível carregar o perfil: ${error.message}`);
    }

    return data ? paraPerfil(data as LinhaPerfil) : null;
  }

  async criarPerfil(entrada: PerfilEntrada): Promise<Perfil> {
    const validacao = validarPerfil(entrada);
    if (!validacao.valido) {
      throw new Error(Object.values(validacao.erros)[0] ?? 'Dados inválidos.');
    }

    const { data: sessao } = await this.cliente.auth.getUser();
    if (!sessao.user) {
      throw new Error(
        'Para publicar um perfil é necessário entrar na conta. A entrada de conta ainda não está implementada nesta versão.',
      );
    }

    const limpa = limparEntrada(validacao.valor);

    const { data, error } = await this.cliente
      .from('profiles')
      .insert({
        auth_user_id: sessao.user.id,
        nome: limpa.nome,
        telefone: limpa.telefone,
        municipio: limpa.municipio,
        bairro: limpa.bairro,
        categoria: limpa.categoria,
        oficio: limpa.oficio,
        descricao: limpa.descricao,
        preco_texto: limpa.precoTexto === '' ? null : limpa.precoTexto,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Não foi possível publicar o perfil: ${error.message}`);
    }

    return paraPerfil(data as LinhaPerfil);
  }

  async registarContacto(perfilId: string, origem: OrigemContacto): Promise<EventoContacto> {
    const { data, error } = await this.cliente
      .from('contact_events')
      .insert({ profile_id: perfilId, origem })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Não foi possível registar o contacto: ${error.message}`);
    }

    return paraContacto(data as LinhaContacto);
  }

  async listarContactos(): Promise<EventoContacto[]> {
    const { data, error } = await this.cliente
      .from('contact_events')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(200);

    if (error) {
      // Sem sessão, as políticas devolvem vazio — não é uma falha da aplicação.
      return [];
    }

    return ((data ?? []) as LinhaContacto[]).map(paraContacto);
  }
}
