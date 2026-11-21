import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp, usePerfisFiltrados } from '../state/store';
import { PerfilCartao } from '../components/PerfilCartao';
import { CATEGORIAS } from '../domain/categorias';
import { MUNICIPIOS } from '../domain/types';
import type { CategoriaId, Municipio } from '../domain/types';

export function Explorar() {
  const perfis = usePerfisFiltrados();
  const filtro = useApp((estado) => estado.filtro);
  const definirFiltro = useApp((estado) => estado.definirFiltro);
  const carregar = useApp((estado) => estado.carregar);
  const estado = useApp((estado) => estado.estado);
  const erro = useApp((estado) => estado.erro);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <div className="space-y-8">
      {/* Header com Contexto */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-0.5 text-xs font-semibold text-[#CBFF4D]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#CBFF4D]"></span>
            <span>Directório de Especialistas</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Profissionais em Angola
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Perfis certificados e verificados com avaliações reais e portfólios visíveis.
          </p>
        </div>

        <Link
          to="/perfil/novo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CBFF4D] px-5 py-2.5 text-xs font-bold text-[#0A0F0D] hover:bg-[#b8ec39] transition-all shadow-sm shrink-0"
        >
          <span>+ Publicar Meu Perfil</span>
        </Link>
      </header>

      {/* Barra de Filtros Avançada */}
      <section aria-label="Pesquisa e Filtros" className="rounded-2xl border border-white/[0.08] bg-[#111A15]/90 p-4 sm:p-5 backdrop-blur-xl space-y-4">
        {/* Campo de Busca Livre */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="pesquisa"
            type="search"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none transition focus:border-[#CBFF4D]/50 focus:bg-white/[0.06]"
            placeholder="Pesquisar por ofício, especialidade, nome ou bairro… (Ex.: canalizador, AC, Kilamba, electricista)"
            value={filtro.texto}
            onChange={(evento) => definirFiltro({ texto: evento.target.value })}
          />
        </div>

        {/* Linha de Seletores (Categoria + Município) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="categoria" className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Filtrar por Categoria
            </label>
            <select
              id="categoria"
              className="w-full rounded-xl border border-white/10 bg-[#0A0F0D] px-3.5 py-2.5 text-xs font-medium text-white/80 outline-none transition focus:border-[#CBFF4D]/50"
              value={filtro.categoria}
              onChange={(evento) =>
                definirFiltro({ categoria: evento.target.value as CategoriaId | 'todas' })
              }
            >
              <option value="todas">Todas as Categorias</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="municipio" className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Filtrar por Município
            </label>
            <select
              id="municipio"
              className="w-full rounded-xl border border-white/10 bg-[#0A0F0D] px-3.5 py-2.5 text-xs font-medium text-white/80 outline-none transition focus:border-[#CBFF4D]/50"
              value={filtro.municipio}
              onChange={(evento) =>
                definirFiltro({ municipio: evento.target.value as Municipio | 'todos' })
              }
            >
              <option value="todos">Todos os Municípios de Luanda & Províncias</option>
              {MUNICIPIOS.map((municipio) => (
                <option key={municipio} value={municipio}>
                  {municipio}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pílulas de Atalho Rápido para Categorias Populares */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.06]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 mr-1">
            Atalhos:
          </span>
          <button
            type="button"
            onClick={() => definirFiltro({ categoria: 'todas' })}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              filtro.categoria === 'todas'
                ? 'bg-[#CBFF4D] text-[#0A0F0D] font-bold'
                : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
            }`}
          >
            Todas
          </button>
          {CATEGORIAS.slice(0, 6).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => definirFiltro({ categoria: c.id })}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                filtro.categoria === c.id
                  ? 'bg-[#16a34a] text-white font-bold'
                  : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
              }`}
            >
              {c.rotulo}
            </button>
          ))}
        </div>
      </section>

      {/* Alerta de Erro se houver */}
      {estado === 'erro' && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-xs font-semibold text-red-300">
          {erro}
        </p>
      )}

      {/* Contagem de Resultados */}
      <div className="flex items-center justify-between text-xs text-white/50 px-1">
        <span>
          A mostrar{' '}
          <strong className="text-white font-mono">{perfis.length}</strong>{' '}
          {perfis.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
        </span>
        {(filtro.texto || filtro.categoria !== 'todas' || filtro.municipio !== 'todos') && (
          <button
            type="button"
            onClick={() => definirFiltro({ texto: '', categoria: 'todas', municipio: 'todos' })}
            className="text-[#CBFF4D] hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Grid de Profissionais */}
      {perfis.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.05] text-xl text-white/40 mb-3">
            🔍
          </div>
          <h3 className="font-display text-lg font-bold text-white">Nenhum profissional encontrado</h3>
          <p className="mt-1 text-xs text-white/50 max-w-sm mx-auto">
            Tenta procurar por outros termos, muda o município ou limpa os filtros de categoria.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => definirFiltro({ texto: '', categoria: 'todas', municipio: 'todos' })}
              className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
            >
              Limpar Filtros
            </button>
            <Link
              to="/perfil/novo"
              className="rounded-xl bg-[#CBFF4D] px-4 py-2 text-xs font-bold text-[#0A0F0D] hover:bg-[#b8ec39]"
            >
              Publicar Novo Perfil
            </Link>
          </div>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {perfis.map((perfil) => (
            <li key={perfil.id}>
              <PerfilCartao perfil={perfil} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
