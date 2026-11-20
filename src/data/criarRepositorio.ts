import { RepositorioLocal } from './repositorioLocal';
import { semear } from './semente';
import type { ModoDados, RepositorioSalu } from './repositorio';

interface ConfiguracaoSupabase {
  url: string;
  chave: string;
}

function configuracaoSupabase(): ConfiguracaoSupabase | null {
  const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
  const chave = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

  if (url !== '' && chave !== '') {
    return { url, chave };
  }

  if (url !== '' || chave !== '') {
    console.warn(
      '[SALU] Configuração Supabase incompleta: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. A usar modo local.',
    );
  }

  return null;
}

/**
 * Modo de dados, disponível de forma síncrona.
 *
 * Não carrega a biblioteca do Supabase para responder a isto — só lê variáveis de
 * ambiente. A interface precisa de saber o modo no primeiro desenho para avisar
 * o utilizador de que os dados são locais.
 */
export function modoDados(): ModoDados {
  return configuracaoSupabase() ? 'supabase' : 'local';
}

/**
 * Em modo local, garante a semente de demonstração **antes** do primeiro ecrã.
 *
 * Tem de correr no arranque e não à primeira leitura do repositório: o ecrã de
 * entrada lê a posse por nome ao criar a sessão, e se a semente ainda não
 * existir, «entrar como Marta» cria uma Marta sem o pedido dela.
 */
export function prepararArmazenamentoLocal(): void {
  if (modoDados() !== 'local') return;
  try {
    semear(window.localStorage);
  } catch {
    // Sem armazenamento disponível a aplicação continua, apenas sem semente.
  }
}

let promessaRepositorio: Promise<RepositorioSalu> | null = null;

/**
 * Obtém o repositório, criando-o uma única vez.
 *
 * A biblioteca do Supabase é importada dinamicamente de propósito: em modo local
 * não chega a ser descarregada. Em Angola, cada 50 KB poupados no primeiro
 * carregamento são dados que o utilizador não paga e segundos que não espera.
 */
export function criarRepositorio(): Promise<RepositorioSalu> {
  promessaRepositorio ??= criar();
  return promessaRepositorio;
}

async function criar(): Promise<RepositorioSalu> {
  const configuracao = configuracaoSupabase();

  if (!configuracao) {
    return new RepositorioLocal(window.localStorage);
  }

  const { RepositorioSupabase } = await import('./repositorioSupabase');
  return new RepositorioSupabase(configuracao.url, configuracao.chave);
}
