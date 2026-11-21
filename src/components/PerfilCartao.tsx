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
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111A15]/90 p-5 transition-all duration-300 hover:border-emerald-500/40 hover:bg-[#14231c] hover:shadow-xl hover:-translate-y-1"
    >
      <div>
        {/* Topo do Cartão: Categoria & Selo Exemplo/Disponível */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/60 px-2.5 py-1 text-[11px] font-semibold text-[#CBFF4D] border border-emerald-500/20">
            <IconeCategoria categoria={perfil.categoria} className="h-3.5 w-3.5" />
            <span>{categoria.rotulo}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {perfil.exemplo ? (
              <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono uppercase text-white/50">
                Demonstração
              </span>
            ) : perfil.disponivel ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-[#22c55e]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"></span>
                Disponível
              </span>
            ) : null}
          </div>
        </div>

        {/* Informações Principais & Avatar */}
        <div className="flex items-start gap-3.5">
          {perfil.fotoUrl ? (
            <img
              src={perfil.fotoUrl}
              alt={perfil.nome}
              className="h-14 w-14 shrink-0 rounded-2xl object-cover border border-white/10 shadow-sm"
              loading="lazy"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-[#0F6B60] to-[#16a34a] font-display text-xl font-black text-white shadow-sm border border-emerald-500/30"
            >
              {iniciais(perfil.nome).charAt(0)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold text-white group-hover:text-[#CBFF4D] transition-colors">
              {perfil.nome}
            </h3>
            <p className="mt-0.5 truncate text-xs font-medium text-white/70">{perfil.oficio}</p>
            <p className="mt-1 truncate text-[11px] text-white/45 flex items-center gap-1">
              <span>⌖</span>
              <span>{perfil.bairro ? `${perfil.bairro}, ` : ''}{perfil.municipio}</span>
            </p>
          </div>
        </div>

        {/* Descrição resumida */}
        {perfil.descricao && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/60">
            {perfil.descricao}
          </p>
        )}

        {/* Competências em pílulas */}
        {perfil.competencias && perfil.competencias.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {perfil.competencias.slice(0, 3).map((comp, idx) => (
              <span
                key={idx}
                className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/60"
              >
                {comp}
              </span>
            ))}
            {perfil.competencias.length > 3 && (
              <span className="text-[10px] text-white/40 self-center">
                +{perfil.competencias.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Rodapé com Preço Indicativo e Ação */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
        <div>
          <span className="text-[10px] text-white/40 block">Orçamento indicativo</span>
          <span className="font-mono font-bold text-white">
            {perfil.precoTexto || 'A combinar'}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 font-semibold text-[#CBFF4D] group-hover:translate-x-1 transition-transform">
          <span>Ver perfil</span>
          <span>→</span>
        </span>
      </div>
    </Link>
  );
}
