import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AlvoTipo,
  CategoriaId,
  EventoContacto,
  FiltroPedidos,
  FiltroPerfis,
  Municipio,
  OrigemContacto,
  Pedido,
  PedidoEntrada,
  Perfil,
  PerfilEntrada,
} from '../domain/types';
import {
  limparEntrada,
  limparPedido,
  validarPedido,
  validarPerfil,
} from '../domain/validacao';
import type { RepositorioSalu } from './repositorio';

/**
 * Adaptador Supabase — o caminho de produção.
 *
 * ESTADO: escrito e compilado, mas NUNCA testado contra um projecto Supabase
 * real. A demonstração do concurso corre no adaptador local. Ver a secção
 * «O que ainda não está verificado» em docs/MODELO_DE_DADOS.md.
 *
 * Limitações conhecidas:
 *  1. `criarPerfil` e `criarPedido` exigem sessão autenticada, porque as
 *     políticas RLS usam `auth.uid()`. A autenticação não está implementada.
 *  2. `listarContactos` devolve apenas o que as políticas permitem ao
 *     utilizador actual. Sem sessão, devolve lista vazia.
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
  foto_url: string | null;
  disponivel: boolean;
  exemplo: boolean;
  criado_em: string;
}

interface LinhaPedido {
  id: string;
  autor_nome: string;
  autor_telefone: string;
  titulo: string;
  categoria: string;
  municipio: string;
  bairro: string;
  descricao: string;
  foto_url: string | null;
  estado: string;
  exemplo: boolean;
  criado_em: string;
}

interface LinhaContacto {
  id: string;
  alvo_tipo: string;
  alvo_id: string;
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
    fotoUrl: linha.foto_url,
    disponivel: linha.disponivel,
    exemplo: linha.exemplo,
    criadoEm: linha.criado_em,
  };
}

function paraPedido(linha: LinhaPedido): Pedido {
  return {
    id: linha.id,
    autorNome: linha.autor_nome,
    autorTelefone: linha.autor_telefone,
    titulo: linha.titulo,
    categoria: linha.categoria as CategoriaId,
    municipio: linha.municipio as Municipio,
    bairro: linha.bairro,
    descricao: linha.descricao,
    fotoUrl: linha.foto_url,
    estado: linha.estado === 'fechado' ? 'fechado' : 'aberto',
    exemplo: linha.exemplo,
    criadoEm: linha.criado_em,
  };
}

function paraContacto(linha: LinhaContacto): EventoContacto {
  return {
    id: linha.id,
    alvoTipo: linha.alvo_tipo as AlvoTipo,
    alvoId: linha.alvo_id,
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
    let consulta = this.cliente.from('profiles').select('*').eq('disponivel', true);

    if (filtro.categoria !== 'todas') consulta = consulta.eq('categoria', filtro.categoria);
    if (filtro.municipio !== 'todos') consulta = consulta.eq('municipio', filtro.municipio);

    const termo = limparTermoPesquisa(filtro.texto);
    if (termo !== '') {
      const padrao = `%${termo}%`;
      consulta = consulta.or(
        `nome.ilike.${padrao},oficio.ilike.${padrao},bairro.ilike.${padrao},descricao.ilike.${padrao}`,
      );
    }

    const { data, error } = await consulta.order('criado_em', { ascending: false }).limit(200);
    if (error) throw new Error(`Não foi possível carregar os perfis: ${error.message}`);

    return ((data ?? []) as LinhaPerfil[]).map(paraPerfil);
  }

  async obterPerfil(id: string): Promise<Perfil | null> {
    const { data, error } = await this.cliente
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Não foi possível carregar o perfil: ${error.message}`);
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
        'Para publicar é necessário entrar na conta. A autenticação não está implementada nesta versão.',
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
        foto_url: limpa.fotoUrl,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Não foi possível publicar o perfil: ${error.message}`);
    return paraPerfil(data as LinhaPerfil);
  }

  async listarPedidos(filtro: FiltroPedidos): Promise<Pedido[]> {
    let consulta = this.cliente.from('requests').select('*').eq('estado', 'aberto');

    if (filtro.categoria !== 'todas') consulta = consulta.eq('categoria', filtro.categoria);
    if (filtro.municipio !== 'todos') consulta = consulta.eq('municipio', filtro.municipio);

    const termo = limparTermoPesquisa(filtro.texto);
    if (termo !== '') {
      const padrao = `%${termo}%`;
      consulta = consulta.or(
        `titulo.ilike.${padrao},descricao.ilike.${padrao},bairro.ilike.${padrao}`,
      );
    }

    const { data, error } = await consulta.order('criado_em', { ascending: false }).limit(200);
    if (error) throw new Error(`Não foi possível carregar os pedidos: ${error.message}`);

    return ((data ?? []) as LinhaPedido[]).map(paraPedido);
  }

  async obterPedido(id: string): Promise<Pedido | null> {
    const { data, error } = await this.cliente
      .from('requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Não foi possível carregar o pedido: ${error.message}`);
    return data ? paraPedido(data as LinhaPedido) : null;
  }

  async criarPedido(entrada: PedidoEntrada): Promise<Pedido> {
    const validacao = validarPedido(entrada);
    if (!validacao.valido) {
      throw new Error(Object.values(validacao.erros)[0] ?? 'Dados inválidos.');
    }

    const { data: sessao } = await this.cliente.auth.getUser();
    if (!sessao.user) {
      throw new Error(
        'Para publicar é necessário entrar na conta. A autenticação não está implementada nesta versão.',
      );
    }

    const limpa = limparPedido(validacao.valor);

    const { data, error } = await this.cliente
      .from('requests')
      .insert({
        auth_user_id: sessao.user.id,
        autor_nome: limpa.autorNome,
        autor_telefone: limpa.autorTelefone,
        titulo: limpa.titulo,
        categoria: limpa.categoria,
        municipio: limpa.municipio,
        bairro: limpa.bairro,
        descricao: limpa.descricao,
        foto_url: limpa.fotoUrl,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Não foi possível publicar o pedido: ${error.message}`);
    return paraPedido(data as LinhaPedido);
  }

  async registarContacto(
    alvoTipo: AlvoTipo,
    alvoId: string,
    origem: OrigemContacto,
  ): Promise<EventoContacto> {
    const { data, error } = await this.cliente
      .from('contact_events')
      .insert({ alvo_tipo: alvoTipo, alvo_id: alvoId, origem })
      .select('*')
      .single();

    if (error) throw new Error(`Não foi possível registar o contacto: ${error.message}`);
    return paraContacto(data as LinhaContacto);
  }

  async listarContactos(): Promise<EventoContacto[]> {
    const { data, error } = await this.cliente
      .from('contact_events')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(200);

    // Sem sessão, as políticas devolvem vazio — não é uma falha da aplicação.
    if (error) return [];

    return ((data ?? []) as LinhaContacto[]).map(paraContacto);
  }
}
