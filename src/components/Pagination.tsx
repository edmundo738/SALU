import { Button } from './ui/Base';
import { useI18n } from '../i18n';

export function Pagination({
  page,
  hasMore,
  onPage,
}: {
  page: number;
  hasMore: boolean;
  onPage: (page: number) => void;
}) {
  const { lang } = useI18n();
  if (page === 1 && !hasMore) return null;
  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-center gap-3"
      aria-label={lang === 'pt' ? 'Páginas de resultados' : 'Result pages'}
    >
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        {lang === 'pt' ? 'Anterior' : 'Previous'}
      </Button>
      <span className="text-sm text-[#475569] dark:text-[#CBD5E1]">
        {lang === 'pt' ? `Página ${page}` : `Page ${page}`}
      </span>
      <Button variant="secondary" disabled={!hasMore} onClick={() => onPage(page + 1)}>
        {lang === 'pt' ? 'Seguinte' : 'Next'}
      </Button>
    </nav>
  );
}
