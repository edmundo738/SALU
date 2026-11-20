import type {
  AlvoTipo,
  Avaliacao,
  AvaliacaoEntrada,
  EventoContacto,
  EventoPedido,
  FiltroPedidos,
  FiltroPerfis,
  Mensagem,
  MensagemEntrada,
  OrigemContacto,
  Pedido,
  PedidoEntrada,
  Perfil,
  PerfilEntrada,
  Proposta,
  PropostaEntrada,
} from '../domain/types';
import { filtrarPedidos, filtrarPerfis } from '../domain/filtros';
import {
  competenciasDeTexto,
  limparEntrada,
  limparPedido,
  validarAvaliacao,
  validarMensagem,
  validarPedido,
  validarPerfil,
  validarProposta,
} from '../domain/validacao';
import { CHAVES } from './chaves';
import { semear } from './semente';
import type { RepositorioSalu } from './repositorio';

export interface ArmazenamentoSimples {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
}

const CHAVE_PERFIS = CHAVES.perfis;
const CHAVE_PEDIDOS = CHAVES.pedidos;
const CHAVE_CONTACTOS = CHAVES.contactos;
const CHAVE_PROPOSTAS = CHAVES.propostas;
const CHAVE_MENSAGENS = CHAVES.mensagens;
const CHAVE_AVALIACOES = CHAVES.avaliacoes;

function ler<T>(armazenamento: ArmazenamentoSimples, chave: string, omissao: T): T {
  const bruto = armazenamento.getItem(chave);
  if (bruto === null) return omissao;

  try {
    return JSON.parse(bruto) as T;
  } catch {
    // Dados corrompidos não podem bloquear a aplicação.
    return omissao;
  }
}

/**
 * Adaptador de dados para desenvolvimento, testes e demonstração.
 *
 * LIMITAÇÃO CONHECIDA (não é um bug): os dados vivem no armazenamento do
 * dispositivo e o espaço é limitado (na ordem dos 5 MB). Um perfil criado num
 * telemóvel não aparece noutro. Serve para demonstrar o percurso completo;
 * NÃO serve para uma comunidade real — para isso é necessário o Supabase.
 */
export class RepositorioLocal implements RepositorioSalu {
  readonly modo = 'local' as const;

  constructor(
    private readonly armazenamento: ArmazenamentoSimples,
    private readonly gerarId: () => string = () => crypto.randomUUID(),
    private readonly agora: () => string = () => new Date().toISOString(),
  ) {
    // Primeira abertura neste dispositivo: carrega as personagens e os exemplos.
    // Idempotente — nas seguintes não toca em nada.
    semear(armazenamento, new Date(this.agora()));
  }

  // -- perfis ---------------------------------------------------------------

  private lerPerfis(): Perfil[] {
    // Perfis gravados antes de existirem estes campos ganham valores neutros.
    return ler<Perfil[]>(this.armazenamento, CHAVE_PERFIS, []).map((perfil) => ({
      ...perfil,
      tipoEntidade: perfil.tipoEntidade ?? 'individual',
      competencias: perfil.competencias ?? [],
      disponibilidadeTexto: perfil.disponibilidadeTexto ?? null,
    }));
  }

  private gravarPerfis(perfis: Perfil[]): void {
    this.armazenamento.setItem(CHAVE_PERFIS, JSON.stringify(perfis));
  }

  async listarPerfis(filtro: FiltroPerfis): Promise<Perfil[]> {
    return ordenarPorRecencia(filtrarPerfis(this.lerPerfis(), filtro));
  }

  async obterPerfil(id: string): Promise<Perfil | null> {
    return this.lerPerfis().find((perfil) => perfil.id === id) ?? null;
  }

  async criarPerfil(entrada: PerfilEntrada): Promise<Perfil> {
    const validacao = validarPerfil(entrada);
    if (!validacao.valido) {
      throw new Error(Object.values(validacao.erros)[0] ?? 'Dados inválidos.');
    }

    const limpa = limparEntrada(validacao.valor);
    const { competenciasTexto, disponibilidadeTexto, ...resto } = limpa;

    const perfil: Perfil = {
      id: this.gerarId(),
      ...resto,
      precoTexto: limpa.precoTexto === '' ? null : limpa.precoTexto,
      competencias: competenciasDeTexto(competenciasTexto),
      disponibilidadeTexto: disponibilidadeTexto === '' ? null : disponibilidadeTexto,
      disponivel: true,
      exemplo: false,
      criadoEm: this.agora(),
    };

    this.gravarPerfis([perfil, ...this.lerPerfis()]);

    return perfil;
  }

  // -- pedidos --------------------------------------------------------------

  private lerPedidos(): Pedido[] {
    // Pedidos gravados antes de existirem urgência e histórico ganham valores
    // neutros em vez de rebentar o ecrã.
    return ler<Pedido[]>(this.armazenamento, CHAVE_PEDIDOS, []).map((pedido) => ({
      ...pedido,
      urgencia: pedido.urgencia ?? 'flexivel',
      orcamentoTexto: pedido.orcamentoTexto ?? null,
      historico: pedido.historico ?? [
        { tipo: 'publicado', autorNome: pedido.autorNome, criadoEm: pedido.criadoEm },
      ],
    }));
  }

  /** Acrescenta um acontecimento ao histórico de um pedido. */
  private registarEvento(pedidoId: string, evento: EventoPedido): void {
    this.gravarPedidos(
      this.lerPedidos().map((pedido) =>
        pedido.id === pedidoId ? { ...pedido, historico: [...pedido.historico, evento] } : pedido,
      ),
    );
  }

  private gravarPedidos(pedidos: Pedido[]): void {
    this.armazenamento.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
  }

  async listarPedidos(filtro: FiltroPedidos): Promise<Pedido[]> {
    // Devolve todos os estados; o mural aplica «só abertos» por cima.
    return ordenarPorRecencia(
      filtrarPedidos(this.lerPedidos(), filtro, { apenasAbertos: false }),
    );
  }

  async obterPedido(id: string): Promise<Pedido | null> {
    return this.lerPedidos().find((pedido) => pedido.id === id) ?? null;
  }

  async criarPedido(entrada: PedidoEntrada): Promise<Pedido> {
    const validacao = validarPedido(entrada);
    if (!validacao.valido) {
      throw new Error(Object.values(validacao.erros)[0] ?? 'Dados inválidos.');
    }

    const limpa = limparPedido(validacao.valor);

    const agora = this.agora();
    const pedido: Pedido = {
      id: this.gerarId(),
      ...limpa,
      orcamentoTexto: limpa.orcamentoTexto === '' ? null : limpa.orcamentoTexto,
      estado: 'aberto',
      historico: [{ tipo: 'publicado', autorNome: limpa.autorNome, criadoEm: agora }],
      exemplo: false,
      criadoEm: agora,
    };

    this.gravarPedidos([pedido, ...this.lerPedidos()]);

    return pedido;
  }

  // -- propostas e conversa -------------------------------------------------

  async listarPropostas(): Promise<Proposta[]> {
    // Propostas gravadas antes de existirem estados contam como pendentes.
    const propostas = ler<Proposta[]>(this.armazenamento, CHAVE_PROPOSTAS, []).map(
      (proposta) => ({ ...proposta, estado: proposta.estado ?? 'pendente' }),
    );
    return ordenarPorRecencia(propostas);
  }

  async criarProposta(entrada: PropostaEntrada): Promise<Proposta> {
    const validacao = validarProposta(entrada);
    if (!validacao.valido) {
      throw new Error(Object.values(validacao.erros)[0] ?? 'Proposta inválida.');
    }

    const proposta: Proposta = {
      id: this.gerarId(),
      ...validacao.valor,
      estado: 'pendente',
      criadoEm: this.agora(),
    };

    const existentes = ler<Proposta[]>(this.armazenamento, CHAVE_PROPOSTAS, []);
    this.armazenamento.setItem(CHAVE_PROPOSTAS, JSON.stringify([proposta, ...existentes]));

    this.registarEvento(proposta.pedidoId, {
      tipo: 'proposta',
      autorNome: proposta.autorNome,
      criadoEm: proposta.criadoEm,
    });

    return proposta;
  }

  async listarMensagens(): Promise<Mensagem[]> {
    const mensagens = ler<Mensagem[]>(this.armazenamento, CHAVE_MENSAGENS, []);
    // A conversa lê-se de cima para baixo: ordem de chegada, não de recência.
    return [...mensagens].sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
  }

  async enviarMensagem(entrada: MensagemEntrada): Promise<Mensagem> {
    const problema = validarMensagem(entrada.texto);
    if (problema) throw new Error(problema);

    const mensagem: Mensagem = {
      id: this.gerarId(),
      pedidoId: entrada.pedidoId,
      lado: entrada.lado,
      autorNome: entrada.autorNome.trim(),
      texto: entrada.texto.trim(),
      criadoEm: this.agora(),
    };

    const existentes = ler<Mensagem[]>(this.armazenamento, CHAVE_MENSAGENS, []);
    this.armazenamento.setItem(CHAVE_MENSAGENS, JSON.stringify([...existentes, mensagem]));

    return mensagem;
  }

  // -- decisão do cliente e conclusão ---------------------------------------

  private lerPropostas(): Proposta[] {
    return ler<Proposta[]>(this.armazenamento, CHAVE_PROPOSTAS, []).map((proposta) => ({
      ...proposta,
      estado: proposta.estado ?? 'pendente',
    }));
  }

  private gravarPropostas(propostas: Proposta[]): void {
    this.armazenamento.setItem(CHAVE_PROPOSTAS, JSON.stringify(propostas));
  }

  async aceitarProposta(pedidoId: string, propostaId: string): Promise<void> {
    const pedidos = this.lerPedidos();
    const pedido = pedidos.find((item) => item.id === pedidoId);

    if (!pedido) throw new Error('Pedido não encontrado.');
    if (pedido.estado !== 'aberto') throw new Error('Este pedido já não aceita propostas.');

    const propostas = this.lerPropostas();
    const escolhida = propostas.find(
      (proposta) => proposta.id === propostaId && proposta.pedidoId === pedidoId,
    );

    if (!escolhida) throw new Error('Proposta não encontrada.');

    this.gravarPropostas(
      propostas.map((proposta) =>
        proposta.pedidoId === pedidoId
          ? { ...proposta, estado: proposta.id === propostaId ? 'aceite' : 'recusada' }
          : proposta,
      ),
    );

    this.gravarPedidos(
      pedidos.map((item) => (item.id === pedidoId ? { ...item, estado: 'acordado' } : item)),
    );
    this.registarEvento(pedidoId, {
      tipo: 'aceite',
      autorNome: escolhida.autorNome,
      criadoEm: this.agora(),
      detalhe: `Escolhido por ${pedido.autorNome}`,
    });
  }

  async concluirPedido(pedidoId: string): Promise<void> {
    const pedidos = this.lerPedidos();
    const pedido = pedidos.find((item) => item.id === pedidoId);

    if (!pedido) throw new Error('Pedido não encontrado.');
    if (pedido.estado !== 'acordado') {
      throw new Error('Só um trabalho acordado pode ser marcado como concluído.');
    }

    this.gravarPedidos(
      pedidos.map((item) => (item.id === pedidoId ? { ...item, estado: 'concluido' } : item)),
    );
    this.registarEvento(pedidoId, {
      tipo: 'concluido',
      autorNome: pedido.autorNome,
      criadoEm: this.agora(),
    });
  }

  // -- avaliações -----------------------------------------------------------

  async listarAvaliacoes(): Promise<Avaliacao[]> {
    return ordenarPorRecencia(ler<Avaliacao[]>(this.armazenamento, CHAVE_AVALIACOES, []));
  }

  async criarAvaliacao(entrada: AvaliacaoEntrada): Promise<Avaliacao> {
    const validacao = validarAvaliacao(entrada);
    if (!validacao.valido) {
      throw new Error(Object.values(validacao.erros)[0] ?? 'Avaliação inválida.');
    }

    const pedido = this.lerPedidos().find((item) => item.id === entrada.pedidoId);
    if (!pedido) throw new Error('Pedido não encontrado.');
    if (pedido.estado !== 'concluido') {
      throw new Error('Só é possível avaliar um trabalho concluído.');
    }

    const existentes = ler<Avaliacao[]>(this.armazenamento, CHAVE_AVALIACOES, []);
    const repetida = existentes.some(
      (avaliacao) =>
        avaliacao.pedidoId === entrada.pedidoId &&
        avaliacao.autorNome.trim().toLowerCase() === validacao.valor.autorNome.toLowerCase(),
    );
    if (repetida) throw new Error('Já avaliou este trabalho.');

    const avaliacao: Avaliacao = {
      id: this.gerarId(),
      ...validacao.valor,
      criadoEm: this.agora(),
    };

    this.armazenamento.setItem(
      CHAVE_AVALIACOES,
      JSON.stringify([avaliacao, ...existentes]),
    );

    this.registarEvento(avaliacao.pedidoId, {
      tipo: 'avaliado',
      autorNome: avaliacao.autorNome,
      criadoEm: avaliacao.criadoEm,
      detalhe: `${avaliacao.nota}/5 para ${avaliacao.alvoNome}`,
    });

    return avaliacao;
  }

  // -- contactos ------------------------------------------------------------

  async registarContacto(
    alvoTipo: AlvoTipo,
    alvoId: string,
    origem: OrigemContacto,
  ): Promise<EventoContacto> {
    const evento: EventoContacto = {
      id: this.gerarId(),
      alvoTipo,
      alvoId,
      origem,
      criadoEm: this.agora(),
    };

    const contactos = ler<EventoContacto[]>(this.armazenamento, CHAVE_CONTACTOS, []);
    this.armazenamento.setItem(CHAVE_CONTACTOS, JSON.stringify([evento, ...contactos]));

    return evento;
  }

  async listarContactos(): Promise<EventoContacto[]> {
    return ler<EventoContacto[]>(this.armazenamento, CHAVE_CONTACTOS, []);
  }
}

function ordenarPorRecencia<T extends { criadoEm: string }>(itens: T[]): T[] {
  return [...itens].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}
