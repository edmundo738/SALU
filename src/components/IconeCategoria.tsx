import type { CategoriaId } from '../domain/types';

/**
 * Ícones desenhados à mão em SVG.
 *
 * Sem biblioteca de ícones: um pacote como o lucide acrescenta dezenas de
 * kilobytes para usar doze símbolos. Estes são caminhos de uma linha, pesam
 * quase nada e herdam a cor do texto.
 */
const CAMINHOS: Record<CategoriaId, string> = {
  reparacoes: 'M14.5 4.5a4 4 0 0 0 5 5L20 20l-3-3-8.5-8.5a4 4 0 0 1 6-4z',
  electricidade: 'M13 3 5 14h5l-1 7 8-11h-5l1-7z',
  canalizacao: 'M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10z',
  limpeza: 'M5 20l7-7M12 13l3-9 6 6-9 3z',
  tecnologia: 'M4 6h16v10H4zM2 19h20',
  design: 'M12 19l7-7-4-4-7 7-1 5zM15 5l4 4',
  explicacoes: 'M12 6C10 4 7 4 4 5v13c3-1 6-1 8 1 2-2 5-2 8-1V5c-3-1-6-1-8 1zM12 6v13',
  entregas: 'M3 7h10v8H3zM13 10h4l3 3v2h-7zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  beleza: 'M7 4l10 12M17 4L7 16M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  cozinha: 'M7 11a3 3 0 1 1 2-5 3.5 3.5 0 0 1 6 0 3 3 0 1 1 2 5v6H7z',
  construcao: 'M15 4l5 5-3 3-5-5zM12 10l-8 8 2 2 8-8',
  administrativo: 'M6 3h8l4 4v14H6zM14 3v4h4',
};

export function IconeCategoria({
  categoria,
  className = 'h-5 w-5',
}: {
  categoria: CategoriaId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={CAMINHOS[categoria]} />
    </svg>
  );
}
