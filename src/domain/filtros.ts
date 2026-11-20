import type { FiltroPerfis, Perfil } from './types';

/** Remove acentos e baixa para minúsculas — «Electricidade» e «electricidade» são o mesmo. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtro de perfis, como função pura.
 *
 * Vive no domínio (e não dentro do adaptador de dados) para que a mesma regra
 * seja usada nos testes, na pesquisa local e, mais tarde, na pesquisa do
 * servidor. Uma regra, um sítio.
 */
export function perfilCorresponde(perfil: Perfil, filtro: FiltroPerfis): boolean {
  if (!perfil.disponivel) return false;

  if (filtro.categoria !== 'todas' && perfil.categoria !== filtro.categoria) {
    return false;
  }

  if (filtro.municipio !== 'todos' && perfil.municipio !== filtro.municipio) {
    return false;
  }

  const termo = normalizarTexto(filtro.texto);
  if (termo === '') return true;

  const alvo = normalizarTexto(
    [perfil.nome, perfil.oficio, perfil.bairro, perfil.descricao, perfil.municipio].join(' '),
  );

  return termo.split(/\s+/).every((palavra) => alvo.includes(palavra));
}

export function filtrarPerfis(perfis: Perfil[], filtro: FiltroPerfis): Perfil[] {
  return perfis.filter((perfil) => perfilCorresponde(perfil, filtro));
}
