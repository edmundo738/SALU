import { Link } from 'react-router-dom';
import type { Perfil } from '../domain/types';
import { obterCategoria } from '../domain/categorias';
import { iniciais } from '../lib/formato';
import { IconeCategoria } from './IconeCategoria';

export function PerfilCartao({ perfil }: { perfil: Perfil }) {
  const categoria = obterCategoria(perfil.categoria);

  return (
    <Link to={`/perfil/${perfil.id}`} className="cartao-interativo group block p-4">
      <div className="flex items-start gap-3">
        {perfil.fotoUrl ? (
          <img
            src={perfil.fotoUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl object-cover"
            loading="lazy"
          />
        ) : (
          <span
            aria-hidden="true"
            className="titulo-display grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand-100 text-2xl text-brand-700"
          >
            {iniciais(perfil.nome).charAt(0)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold leading-tight">{perfil.nome}</h3>
            {perfil.exemplo && (
              <span className="selo shrink-0 bg-ink/5 text-mute">exemplo</span>
            )}
          </div>

          <p className="mt-0.5 truncate text-sm text-ink-soft">{perfil.oficio}</p>
          <p className="mt-1 truncate text-xs text-mute">
            {perfil.bairro} · {perfil.municipio}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/70 pt-3">
        <span className="selo bg-forest-500/10 text-forest-700">
          <IconeCategoria categoria={perfil.categoria} className="h-3 w-3" />
          {categoria.rotulo}
        </span>
        <span className="flex items-center gap-2 text-xs text-mute">
          {perfil.precoTexto && <span>{perfil.precoTexto}</span>}
          <span
            aria-hidden="true"
            className="text-brand-600 transition group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
