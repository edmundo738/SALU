import type { Categoria, CategoriaId } from './types';

/**
 * Categorias do protótipo.
 *
 * Decisão revista pelo dono do produto: em vez de seis categorias domésticas,
 * o SALU cobre desde o início trabalho manual e trabalho digital — um designer e
 * um canalizador têm o mesmo problema (serem encontrados) e a mesma solução.
 *
 * Não há subcategorias. A taxonomia é plana até haver utilizadores suficientes
 * para justificar profundidade.
 */
export const CATEGORIAS: readonly Categoria[] = [
  { id: 'reparacoes', rotulo: 'Reparações', exemplo: 'Electrodomésticos e equipamentos' },
  { id: 'electricidade', rotulo: 'Electricidade', exemplo: 'Instalações e avarias' },
  { id: 'canalizacao', rotulo: 'Canalização', exemplo: 'Fugas, torneiras e sanitários' },
  { id: 'limpeza', rotulo: 'Limpeza', exemplo: 'Casas, escritórios e condomínios' },
  { id: 'tecnologia', rotulo: 'Tecnologia', exemplo: 'Computadores, telemóveis e redes' },
  { id: 'design', rotulo: 'Design', exemplo: 'Logotipos, cartazes e redes sociais' },
  { id: 'explicacoes', rotulo: 'Explicações', exemplo: 'Aulas e apoio escolar' },
  { id: 'entregas', rotulo: 'Entregas', exemplo: 'Entregas e mandados na cidade' },
  { id: 'beleza', rotulo: 'Beleza', exemplo: 'Cabelo, unhas e estética' },
  { id: 'cozinha', rotulo: 'Cozinha', exemplo: 'Refeições, bolos e eventos' },
  { id: 'construcao', rotulo: 'Construção', exemplo: 'Obra, pintura e acabamentos' },
  { id: 'administrativo', rotulo: 'Administrativo', exemplo: 'Apoio virtual, dados e documentos' },
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
