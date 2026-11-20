import type { FiltroPedidos, FiltroPerfis, Pedido, Perfil } from './types';

/** Remove acentos e baixa para minúsculas — «Electricidade» e «electricidade» são o mesmo. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function correspondeAoTexto(campos: string[], filtro: { texto: string }): boolean {
  const termo = normalizarTexto(filtro.texto);
  if (termo === '') return true;

  const alvo = normalizarTexto(campos.join(' '));
  return termo.split(/\s+/).every((palavra) => alvo.includes(palavra));
}

/**
 * Filtros como funções puras.
 *
 * Vivem no domínio (e não dentro do adaptador de dados) para que a mesma regra
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

  return correspondeAoTexto(
    [perfil.nome, perfil.oficio, perfil.bairro, perfil.descricao, perfil.municipio],
    filtro,
  );
}

export function filtrarPerfis(perfis: Perfil[], filtro: FiltroPerfis): Perfil[] {
  return perfis.filter((perfil) => perfilCorresponde(perfil, filtro));
}

export function pedidoCorresponde(pedido: Pedido, filtro: FiltroPedidos): boolean {
  if (pedido.estado !== 'aberto') return false;

  if (filtro.categoria !== 'todas' && pedido.categoria !== filtro.categoria) {
    return false;
  }

  if (filtro.municipio !== 'todos' && pedido.municipio !== filtro.municipio) {
    return false;
  }

  return correspondeAoTexto(
    [pedido.titulo, pedido.descricao, pedido.bairro, pedido.municipio],
    filtro,
  );
}

export function filtrarPedidos(pedidos: Pedido[], filtro: FiltroPedidos): Pedido[] {
  return pedidos.filter((pedido) => pedidoCorresponde(pedido, filtro));
}
