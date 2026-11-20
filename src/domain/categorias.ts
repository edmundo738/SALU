import type { Categoria, CategoriaId } from './types';

/**
 * Categorias de arranque do piloto.
 *
 * Decisão de âmbito: seis categorias, todas de serviço doméstico ou técnico,
 * com procura recorrente e contacto fácil. Foi uma escolha do dono do produto;
 * ampliar a taxonomia antes de haver utilizadores reais só acrescenta ruído.
 */
export const CATEGORIAS: readonly Categoria[] = [
  {
    id: 'informatica',
    rotulo: 'Informática',
    exemplo: 'Reparação de computadores e telemóveis',
  },
  {
    id: 'electricidade',
    rotulo: 'Electricidade',
    exemplo: 'Instalações e avarias eléctricas',
  },
  {
    id: 'canalizacao',
    rotulo: 'Canalização',
    exemplo: 'Fugas de água, torneiras e sanitários',
  },
  {
    id: 'limpeza',
    rotulo: 'Limpeza',
    exemplo: 'Limpeza doméstica e de escritórios',
  },
  {
    id: 'explicacoes',
    rotulo: 'Explicações',
    exemplo: 'Aulas de matemática, inglês e informática',
  },
  {
    id: 'cozinha',
    rotulo: 'Cozinha',
    exemplo: 'Refeições por encomenda e eventos',
  },
];

const POR_ID = new Map<CategoriaId, Categoria>(CATEGORIAS.map((c) => [c.id, c]));

export function obterCategoria(id: CategoriaId): Categoria {
  const categoria = POR_ID.get(id);
  if (!categoria) {
    // Nunca deve acontecer: os ids vêm de um array const e são validados na entrada.
    throw new Error(`Categoria desconhecida: ${String(id)}`);
  }
  return categoria;
}
