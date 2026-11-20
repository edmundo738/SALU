import type {
  AlvoTipo,
  Avaliacao,
  AvaliacaoEntrada,
  EventoContacto,
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
  limparEntrada,
  limparPedido,
  validarAvaliacao,
  validarMensagem,
  validarPedido,
  validarPerfil,
  validarProposta,
} from '../domain/validacao';
import { pedidosDeExemplo, perfisDeExemplo } from './exemplos';
import type { RepositorioSalu } from './repositorio';

export interface ArmazenamentoSimples {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
}

const CHAVE_PERFIS = 'salu:v2:perfis';
const CHAVE_PEDIDOS = 'salu:v2:pedidos';
const CHAVE_CONTACTOS = 'salu:v2:contactos';
const CHAVE_PROPOSTAS = 'salu:v2:propostas';
const CHAVE_MENSAGENS = 'salu:v2:mensagens';
const CHAVE_AVALIACOES = 'salu:v2:avaliacoes';

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
  ) {}

  // -- perfis ---------------------------------------------------------------

  private lerPerfis(): Perfil[] {
    const guardados = ler<Perfil[] | null>(this.armazenamento, CHAVE_PERFIS, null);

    if (guardados === null) {
      const exemplos = perfisDeExemplo(this.agora());
      this.gravarPerfis(exemplos);
      return exemplos;
    }

    return guardados;
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

    const perfil: Perfil = {
      id: this.gerarId(),
      ...limpa,
      precoTexto: limpa.precoTexto === '' ? null : limpa.precoTexto,
      disponivel: true,
      exemplo: false,
      criadoEm: this.agora(),
    };

    this.gravarPerfis([perfil, ...this.lerPerfis()]);

    return perfil;
  }

  // -- pedidos --------------------------------------------------------------

  private lerPedidos(): Pedido[] {
    const guardados = ler<Pedido[] | null>(this.armazenamento, CHAVE_PEDIDOS, null);

    if (guardados === null) {
      const exemplos = pedidosDeExemplo(this.agora());
      this.gravarPedidos(exemplos);
      return exemplos;
    }

    return guardados;
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

    const pedido: Pedido = {
      id: this.gerarId(),
      ...limpa,
      estado: 'aberto',
      exemplo: false,
      criadoEm: this.agora(),
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
