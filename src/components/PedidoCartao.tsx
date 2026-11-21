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
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111A15]/90 p-5 transition-all duration-300 hover:border-emerald-500/40 hover:bg-[#14231c] hover:shadow-xl hover:-translate-y-1"
    >
      <div>
        {/* Topo: Categoria + Urgência */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/60 px-2.5 py-1 text-[11px] font-semibold text-[#CBFF4D] border border-emerald-500/20">
            <IconeCategoria categoria={pedido.categoria} className="h-3.5 w-3.5" />
            <span>{categoria.rotulo}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {pedido.urgencia === 'urgente' && (
              <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-red-400">
                Urgente
              </span>
            )}
            {pedido.urgencia === 'esta-semana' && (
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                Esta Semana
              </span>
            )}
            {pedido.exemplo && (
              <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono uppercase text-white/40">
                Demonstração
              </span>
            )}
          </div>
        </div>

        {/* Corpo com Título e Imagem se houver */}
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold text-white group-hover:text-[#CBFF4D] transition-colors leading-snug">
              {pedido.titulo}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/60">
              {pedido.descricao}
            </p>
          </div>

          {pedido.fotoUrl && (
            <img
              src={pedido.fotoUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-xl object-cover border border-white/10"
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* Rodapé: Localização, Tempo e Ação */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-white/50 text-[11px] truncate max-w-[65%]">
          <span>⌖</span>
          <span className="truncate">{pedido.bairro ? `${pedido.bairro}, ` : ''}{pedido.municipio}</span>
          <span className="text-white/20">•</span>
          <span className="shrink-0">{tempoRelativo(pedido.criadoEm)}</span>
        </div>

        <span className="inline-flex items-center gap-1 font-semibold text-[#CBFF4D] group-hover:translate-x-1 transition-transform shrink-0">
          <span>Propor</span>
          <span>→</span>
        </span>
      </div>
    </Link>
  );
}
