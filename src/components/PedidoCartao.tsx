import { Link } from 'react-router-dom';
import type { Pedido } from '../domain/types';
import { obterCategoria } from '../domain/categorias';
import { tempoRelativo } from '../lib/formato';
import { IconeCategoria } from './IconeCategoria';

/**
 * Cartão de pedido com ar de anúncio classificado: a categoria à esquerda como
 * marcador, o título em destaque, o resto em linhas finas. Menos caixas dentro
 * de caixas do que a versão anterior.
 */
export function PedidoCartao({ pedido }: { pedido: Pedido }) {
  const categoria = obterCategoria(pedido.categoria);

  return (
    <Link to={`/pedidos/${pedido.id}`} className="cartao-interativo group block p-4">
      <div className="flex gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <IconeCategoria categoria={pedido.categoria} className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold leading-snug texto-bonito">
              {pedido.titulo}
            </h3>
            {pedido.exemplo && (
              <span className="selo shrink-0 bg-ink/5 text-mute">exemplo</span>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-mute">
            {pedido.descricao}
          </p>
        </div>

        {pedido.fotoUrl && (
          <img
            src={pedido.fotoUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
            loading="lazy"
          />
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-line/70 pt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-mute">
        {pedido.urgencia === 'urgente' && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-800">Urgente</span>
        )}
        {pedido.urgencia === 'esta-semana' && (
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">Esta semana</span>
        )}
        <span className="text-brand-700">{categoria.rotulo}</span>
        <span aria-hidden="true" className="text-line">
          /
        </span>
        <span className="truncate normal-case tracking-normal">
          {pedido.bairro} · {pedido.municipio}
        </span>
        <span className="ml-auto shrink-0 normal-case tracking-normal">
          {tempoRelativo(pedido.criadoEm)}
        </span>
      </div>
    </Link>
  );
}
