import { Link } from 'react-router-dom';
import type { Pedido } from '../domain/types';
import { obterCategoria } from '../domain/categorias';
import { tempoRelativo } from '../lib/formato';
import { IconeCategoria } from './IconeCategoria';

export function PedidoCartao({ pedido }: { pedido: Pedido }) {
  const categoria = obterCategoria(pedido.categoria);

  return (
    <Link
      to={`/pedidos/${pedido.id}`}
      className="cartao group block overflow-hidden transition hover:border-ink/25 hover:shadow-sm"
    >
      <div className="flex gap-3 p-4">
        {pedido.fotoUrl && (
          <img
            src={pedido.fotoUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug">{pedido.titulo}</h3>
            {pedido.exemplo && <span className="selo shrink-0 bg-line/70 text-mute">Exemplo</span>}
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-mute">{pedido.descricao}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mute">
            <span className="selo gap-1 bg-forest-500/10 text-forest-600">
              <IconeCategoria categoria={pedido.categoria} className="h-3.5 w-3.5" />
              {categoria.rotulo}
            </span>
            <span>
              {pedido.bairro} · {pedido.municipio}
            </span>
            <span aria-hidden="true">·</span>
            <span>{tempoRelativo(pedido.criadoEm)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
