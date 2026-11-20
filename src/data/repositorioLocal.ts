import type {
  EventoContacto,
  FiltroPerfis,
  OrigemContacto,
  Perfil,
  PerfilEntrada,
} from '../domain/types';
import { filtrarPerfis } from '../domain/filtros';
import { limparEntrada, validarPerfil } from '../domain/validacao';
import { perfisDeExemplo } from './exemplos';
import type { RepositorioSalu } from './repositorio';

export interface ArmazenamentoSimples {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
}

const CHAVE_PERFIS = 'salu:v1:perfis';
const CHAVE_CONTACTOS = 'salu:v1:contactos';

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
 * Adaptador de dados para desenvolvimento e testes.
 *
 * LIMITAÇÃO CONHECIDA (não é um bug): os dados vivem no armazenamento do
 * dispositivo. Um perfil criado num telemóvel não aparece noutro. Serve para
 * desenvolver e para testar a interface; NÃO serve para o piloto com pessoas
 * reais — para isso é necessário o Supabase.
 */
export class RepositorioLocal implements RepositorioSalu {
  readonly modo = 'local' as const;

  constructor(
    private readonly armazenamento: ArmazenamentoSimples,
    private readonly gerarId: () => string = () => crypto.randomUUID(),
    private readonly agora: () => string = () => new Date().toISOString(),
  ) {}

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

  private gravarContactos(contactos: EventoContacto[]): void {
    this.armazenamento.setItem(CHAVE_CONTACTOS, JSON.stringify(contactos));
  }

  async listarPerfis(filtro: FiltroPerfis): Promise<Perfil[]> {
    const perfis = filtrarPerfis(this.lerPerfis(), filtro);
    return ordenarPorRecencia(perfis);
  }

  async obterPerfil(id: string): Promise<Perfil | null> {
    return this.lerPerfis().find((perfil) => perfil.id === id) ?? null;
  }

  async criarPerfil(entrada: PerfilEntrada): Promise<Perfil> {
    const validacao = validarPerfil(entrada);
    if (!validacao.valido) {
      const primeiroErro = Object.values(validacao.erros)[0] ?? 'Dados inválidos.';
      throw new Error(primeiroErro);
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

    const perfis = this.lerPerfis();
    this.gravarPerfis([perfil, ...perfis]);

    return perfil;
  }

  async registarContacto(perfilId: string, origem: OrigemContacto): Promise<EventoContacto> {
    const evento: EventoContacto = {
      id: this.gerarId(),
      perfilId,
      origem,
      criadoEm: this.agora(),
    };

    const contactos = ler<EventoContacto[]>(this.armazenamento, CHAVE_CONTACTOS, []);
    this.gravarContactos([evento, ...contactos]);

    return evento;
  }

  async listarContactos(): Promise<EventoContacto[]> {
    return ler<EventoContacto[]>(this.armazenamento, CHAVE_CONTACTOS, []);
  }
}

function ordenarPorRecencia(perfis: Perfil[]): Perfil[] {
  return [...perfis].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}
