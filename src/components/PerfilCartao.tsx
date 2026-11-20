import { Link } from 'react-router-dom';
import type { Perfil } from '../domain/types';
import { obterCategoria } from '../domain/categorias';
import { iniciais } from '../lib/formato';
import { IconeCategoria } from './IconeCategoria';

export function PerfilCartao({ perfil }: { perfil: Perfil }) {
  const categoria = obterCategoria(perfil.categoria);

  return (
    <Link
      to={`/perfil/${perfil.id}`}
      className="cartao group flex gap-3 p-4 transition hover:border-ink/25 hover:shadow-sm"
    >
      {perfil.fotoUrl ? (
        <img
          src={perfil.fotoUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-2xl object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-100 font-bold text-brand-700"
        >
          {iniciais(perfil.nome)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold leading-tight">{perfil.nome}</h3>
          {perfil.exemplo && <span className="selo shrink-0 bg-line/70 text-mute">Exemplo</span>}
        </div>

        <p className="mt-0.5 truncate text-sm text-mute">{perfil.oficio}</p>
        <p className="mt-0.5 truncate text-xs text-mute">
          {perfil.bairro} · {perfil.municipio}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="selo gap-1 bg-forest-500/10 text-forest-600">
            <IconeCategoria categoria={perfil.categoria} className="h-3.5 w-3.5" />
            {categoria.rotulo}
          </span>
          {perfil.precoTexto && (
            <span className="text-xs text-mute">{perfil.precoTexto}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
