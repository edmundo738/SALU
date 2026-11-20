import { Link } from 'react-router-dom';
import type { Perfil } from '../domain/types';
import { obterCategoria } from '../domain/categorias';

function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter((parte) => parte.length > 0)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');
}

export function PerfilCartao({ perfil }: { perfil: Perfil }) {
  const categoria = obterCategoria(perfil.categoria);

  return (
    <Link
      to={`/perfil/${perfil.id}`}
      className="block rounded-2xl border border-line bg-paper p-4 transition hover:border-ink/25 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700"
        >
          {iniciais(perfil.nome)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{perfil.nome}</h3>
            {perfil.exemplo && (
              <span className="selo bg-line/70 text-mute">Exemplo</span>
            )}
          </div>
          <p className="truncate text-sm text-mute">{perfil.oficio}</p>
          <p className="mt-1 text-xs text-mute">
            {perfil.bairro} · {perfil.municipio}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="selo bg-forest-500/10 text-forest-600">{categoria.rotulo}</span>
        {perfil.precoTexto && (
          <span className="text-xs text-mute">{perfil.precoTexto}</span>
        )}
      </div>
    </Link>
  );
}
