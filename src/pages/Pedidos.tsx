import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp, usePedidosFiltrados } from '../state/store';
import { useSessao } from '../state/sessao';
import { CATEGORIAS } from '../domain/categorias';
import { MUNICIPIOS, URGENCIAS } from '../domain/types';
import type { CategoriaId, Municipio, Urgencia } from '../domain/types';
import { tempoRelativo } from '../lib/formato';
import { obterCategoria } from '../domain/categorias';

const EMOJI_CATEGORIA: Record<string, string> = {
  reparacoes: '🔧',
  electricidade: '⚡',
  canalizacao: '🚿',
  limpeza: '🧹',
  tecnologia: '💻',
  design: '🎨',
  explicacoes: '📚',
  entregas: '📦',
  beleza: '✂️',
  cozinha: '🍳',
  construcao: '🏗️',
  administrativo: '📋',
};

const URGENCIA_CONFIG: Record<Urgencia, { label: string; cls: string }> = {
  urgente: { label: 'Urgente', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  'esta-semana': { label: 'Esta semana', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  flexivel: { label: 'Flexível', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
};

export function Pedidos() {
  const pedidos = usePedidosFiltrados();
  const filtro = useApp((estado) => estado.filtroPedidos);
  const definirFiltroPedidos = useApp((estado) => estado.definirFiltroPedidos);
  const carregar = useApp((estado) => estado.carregar);
  const estado = useApp((estado) => estado.estado);
  const erro = useApp((estado) => estado.erro);
  const sessao = useSessao((s) => s.sessao);

  const [urgenciaFiltro, setUrgenciaFiltro] = useState<Urgencia | 'todas'>('todas');

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const pedidosFiltradosUrgencia = urgenciaFiltro === 'todas'
    ? pedidos
    : pedidos.filter((p) => p.urgencia === urgenciaFiltro);

  const totalAbertos = pedidosFiltradosUrgencia.filter((p) => p.estado === 'aberto').length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-2">
              Mural de pedidos
            </p>
            <h1 className="font-display text-3xl font-black sm:text-4xl gradient-text">
              Pedidos em aberto
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
              {totalAbertos === 0
                ? 'Sem pedidos activos neste momento.'
                : totalAbertos === 1
                  ? '1 pedido aguarda resposta'
                  : `${totalAbertos} pedidos aguardam resposta`}
            </p>
          </div>
          <Link
            to="/publicar-pedido"
            className="btn-primary"
          >
            + Publicar pedido
          </Link>
        </header>

        {/* Filtros */}
        <section aria-label="Filtros" className="mb-8 glass rounded-2xl p-4 space-y-4">
          <input
            type="search"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'var(--color-ink)',
            }}
            placeholder="Pesquisar pedidos… ex.: frigorífico, logotipo, limpeza"
            value={filtro.texto}
            onChange={(e) => definirFiltroPedidos({ texto: e.target.value })}
          />

          <div className="flex flex-wrap gap-2">
            {/* Categoria pills */}
            <button
              onClick={() => definirFiltroPedidos({ categoria: 'todas' })}
              className={`pill ${filtro.categoria === 'todas' ? 'pill-active' : ''}`}
            >
              Todas as categorias
            </button>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  definirFiltroPedidos({
                    categoria: filtro.categoria === cat.id ? 'todas' : (cat.id as CategoriaId),
                  })
                }
                className={`pill ${filtro.categoria === cat.id ? 'pill-active' : ''}`}
              >
                {EMOJI_CATEGORIA[cat.id]} {cat.rotulo}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Município pills */}
            <button
              onClick={() => definirFiltroPedidos({ municipio: 'todos' })}
              className={`pill ${filtro.municipio === 'todos' ? 'pill-active' : ''}`}
            >
              Todos os municípios
            </button>
            {MUNICIPIOS.map((mun) => (
              <button
                key={mun}
                onClick={() =>
                  definirFiltroPedidos({
                    municipio: filtro.municipio === mun ? 'todos' : (mun as Municipio),
                  })
                }
                className={`pill ${filtro.municipio === mun ? 'pill-active' : ''}`}
              >
                {mun}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Urgência pills */}
            <button
              onClick={() => setUrgenciaFiltro('todas')}
              className={`pill ${urgenciaFiltro === 'todas' ? 'pill-active' : ''}`}
            >
              Qualquer urgência
            </button>
            {URGENCIAS.map((u) => (
              <button
                key={u.id}
                onClick={() =>
                  setUrgenciaFiltro(urgenciaFiltro === u.id ? 'todas' : (u.id as Urgencia))
                }
                className={`pill ${urgenciaFiltro === u.id ? 'pill-active' : ''}`}
              >
                {u.curto}
              </button>
            ))}
          </div>
        </section>

        {/* Erro */}
        {estado === 'erro' && (
          <p role="alert" className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {erro}
          </p>
        )}

        {/* Grid de cards */}
        {pedidosFiltradosUrgencia.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-semibold mb-2">Nenhum pedido aberto.</p>
            <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
              Sê o primeiro a publicar.
            </p>
            <Link to="/publicar-pedido" className="btn-primary">
              Publicar pedido — gratuito
            </Link>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pedidosFiltradosUrgencia.map((pedido) => {
              const urg = URGENCIA_CONFIG[pedido.urgencia];
              const cat = obterCategoria(pedido.categoria);
              const emoji = EMOJI_CATEGORIA[pedido.categoria] ?? '📋';
              return (
                <li key={pedido.id} className="flex">
                  <div className="glass card-hover rounded-2xl p-5 flex flex-col w-full relative overflow-hidden">
                    {/* Badge exemplo */}
                    {pedido.exemplo && (
                      <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                        Exemplo
                      </span>
                    )}

                    {/* Urgência badge */}
                    <span
                      className={`inline-flex self-start items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border mb-3 ${urg.cls}`}
                    >
                      {pedido.urgencia === 'urgente' && '🔴 '}
                      {pedido.urgencia === 'esta-semana' && '🟡 '}
                      {pedido.urgencia === 'flexivel' && '🟢 '}
                      {urg.label}
                    </span>

                    {/* Título */}
                    <h2 className="font-bold text-base leading-snug mb-2" style={{ color: 'var(--color-ink)' }}>
                      {pedido.titulo}
                    </h2>

                    {/* Categoria */}
                    <p className="text-xs mb-1" style={{ color: 'var(--color-ink-soft)' }}>
                      {emoji} {cat.rotulo}
                    </p>

                    {/* Localização */}
                    <p className="text-xs mb-1" style={{ color: 'var(--color-ink-soft)' }}>
                      📍 {pedido.bairro}, {pedido.municipio}
                    </p>

                    {/* Tempo */}
                    <p className="text-xs mb-3" style={{ color: 'var(--color-ink-soft)' }}>
                      🕐 {tempoRelativo(pedido.criadoEm)}
                    </p>

                    {/* Orçamento */}
                    {pedido.orcamentoTexto && (
                      <p className="text-xs font-semibold text-green-400 mb-3">
                        💰 {pedido.orcamentoTexto}
                      </p>
                    )}

                    {/* CTA */}
                    <div className="mt-auto pt-3 border-t border-white/10">
                      <Link
                        to={`/pedidos/${pedido.id}`}
                        className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition ${
                          sessao?.tipo === 'prestador' && !pedido.exemplo
                            ? 'btn-primary'
                            : 'bg-white/5 hover:bg-white/10 text-white/80'
                        }`}
                      >
                        {sessao?.tipo === 'prestador' && !pedido.exemplo
                          ? '✋ Tenho interesse'
                          : 'Ver pedido →'}
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
