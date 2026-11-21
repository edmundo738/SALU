import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../state/store';
import type { CategoriaId } from '../domain/types';
import { PedidoCartao } from '../components/PedidoCartao';
import { PerfilCartao } from '../components/PerfilCartao';
import luandaHeroBg from '../assets/images/hero_salu_luanda_1795204346004.jpg';

export function Home() {
  const navegar = useNavigate();
  const perfis = useApp((estado) => estado.perfis);
  const pedidos = useApp((estado) => estado.pedidos);
  const carregar = useApp((estado) => estado.carregar);
  const definirFiltro = useApp((estado) => estado.definirFiltro);
  const definirFiltroPedidos = useApp((estado) => estado.definirFiltroPedidos);

  const [termo, setTermo] = useState('');
  const [municipioSelecionado, setMunicipioSelecionado] = useState('Luanda');

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const destaques = perfis.filter((perfil) => perfil.disponivel).slice(0, 3);
  const pedidosRecentes = pedidos.filter((pedido) => pedido.estado === 'aberto').slice(0, 4);

  function pesquisar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = termo.trim();
    definirFiltro({ texto, categoria: 'todas', municipio: 'todos' });
    definirFiltroPedidos({ texto, categoria: 'todas', municipio: 'todos' });
    navegar('/explorar');
  }

  function abrirCategoria(catId: CategoriaId) {
    definirFiltro({ texto: '', categoria: catId, municipio: 'todos' });
    definirFiltroPedidos({ texto: '', categoria: catId, municipio: 'todos' });
    navegar('/explorar');
  }

  return (
    <div className="w-full flex flex-col bg-white">
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Exatamente como na Imagem 1)                  */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden bg-[#071324] text-white pt-8 pb-16 lg:pt-14 lg:pb-24">
        {/* Foto Panorâmica Noturna da Baía de Luanda */}
        <div className="absolute inset-0 z-0">
          <img
            src={luandaHeroBg}
            alt="Baía e Skyline de Luanda à noite"
            className="h-full w-full object-cover object-center"
          />
          {/* Overlay Escuro com Gradiente para Legibilidade Perfeita */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071324]/92 via-[#071324]/75 to-[#071324]/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071324] via-transparent to-transparent" />
        </div>

        {/* Linha Curva Laranja Decorativa no Canto Superior Direito */}
        <svg
          className="absolute top-0 right-0 w-[450px] h-[250px] pointer-events-none text-[#FF6A00]/30 hidden lg:block"
          viewBox="0 0 500 250"
          fill="none"
        >
          <path d="M500 0 Q350 120 180 200" stroke="currentColor" strokeWidth="2" />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Lado Esquerdo: Tipografia e Busca */}
            <div className="lg:col-span-8 space-y-6">
              {/* Título Principal */}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] text-white tracking-tight">
                Onde as habilidades<br />
                existem, as<br />
                <span className="text-[#FF6A00]">oportunidades</span> também.
              </h1>

              {/* Subtítulo */}
              <p className="text-base sm:text-lg text-slate-200 max-w-xl font-normal leading-relaxed">
                Encontre serviços, resolva seus problemas e descubra novas oportunidades.
              </p>

              {/* Barra de Pesquisa em Cápsula Arredondada (Fiel à Imagem 1) */}
              <form onSubmit={pesquisar} className="pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-3xl sm:rounded-full bg-white p-2 shadow-2xl max-w-2xl text-slate-800">
                  {/* Campo de Termo */}
                  <div className="flex flex-1 items-center gap-3 px-4 py-2 sm:py-0">
                    <svg className="h-5 w-5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                      type="text"
                      placeholder="O que você precisa?"
                      value={termo}
                      onChange={(e) => setTermo(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none font-medium"
                    />
                  </div>

                  {/* Divisor Vertical */}
                  <div className="hidden sm:block h-7 w-px bg-slate-200" />

                  {/* Seletor de Município */}
                  <div className="flex items-center gap-2 px-4 py-2 sm:py-0">
                    <svg className="h-4 w-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <select
                      value={municipioSelecionado}
                      onChange={(e) => setMunicipioSelecionado(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="Luanda">Luanda</option>
                      <option value="Talatona">Talatona</option>
                      <option value="Kilamba">Kilamba</option>
                      <option value="Maianga">Maianga</option>
                      <option value="Benguela">Benguela</option>
                      <option value="Huambo">Huambo</option>
                    </select>
                  </div>

                  {/* Botão Pesquisar Laranja */}
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#FF6A00] hover:bg-[#e85f00] px-6 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95"
                  >
                    <span>Pesquisar</span>
                    <span>→</span>
                  </button>
                </div>
              </form>

              {/* Pílulas de Categorias Rápidas Abaixo da Busca */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => abrirCategoria('reparacoes')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-slate-200 transition"
                >
                  <span>🔧</span>
                  <span>Reparação</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirCategoria('tecnologia')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-slate-200 transition"
                >
                  <span>💻</span>
                  <span>Tecnologia</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirCategoria('construcao')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-slate-200 transition"
                >
                  <span>🏗️</span>
                  <span>Construção</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirCategoria('limpeza')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-slate-200 transition"
                >
                  <span>🧹</span>
                  <span>Limpeza</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirCategoria('entregas')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-slate-200 transition"
                >
                  <span>🚚</span>
                  <span>Transporte</span>
                </button>

                <Link
                  to="/explorar"
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-slate-300 hover:text-white hover:underline transition"
                >
                  <span>+ Ver mais</span>
                </Link>
              </div>
            </div>

            {/* Lado Direito: Cartão Flutuante (Fiel à Imagem 1) */}
            <div className="lg:col-span-4 flex justify-end">
              <div className="rounded-3xl border border-white/20 bg-[#0B192E]/85 backdrop-blur-md px-6 py-5 text-white flex items-center gap-4 shadow-2xl max-w-sm">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-white">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold leading-snug">Conectando pessoas,</p>
                  <p className="text-sm font-extrabold leading-snug text-[#FF6A00]">impulsionando Angola.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. BARRA DE CONFIANÇA (Dark Navy Strip com 4 Propostas)         */}
      {/* ============================================================== */}
      <section className="bg-[#0B192E] border-t border-white/10 py-5 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {/* 1: Seguro e Confiável */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
              <div className="text-[#FF6A00] shrink-0">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Seguro e confiável</p>
                <p className="text-slate-400 text-[11px]">em cada negociação</p>
              </div>
            </div>

            {/* 2: Conexão Rápida */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
              <div className="text-[#FF6A00] shrink-0">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Conexão rápida</p>
                <p className="text-slate-400 text-[11px]">com profissionais</p>
              </div>
            </div>

            {/* 3: Avaliações Reais */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
              <div className="text-[#FF6A00] shrink-0">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Avaliações reais</p>
                <p className="text-slate-400 text-[11px]">para sua segurança</p>
              </div>
            </div>

            {/* 4: Suporte Dedicado */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
              <div className="text-[#FF6A00] shrink-0">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Suporte dedicado</p>
                <p className="text-slate-400 text-[11px]">sempre ao seu lado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. PARTE INFERIOR (Fiel à Imagem 1: Cards de Papel e Categorias)*/}
      {/* ============================================================== */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Bloco da Esquerda: "O que você deseja fazer?" */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                  O que você deseja fazer?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Escolha o seu perfil e comece agora:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cartão Azul: Preciso de um serviço */}
                <Link
                  to="/publicar-pedido"
                  className="group flex items-center justify-between p-5 rounded-2xl bg-[#EEF4FF] border border-[#D0E0FD] hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#3B82F6] text-white shadow-sm">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0F172A] leading-snug">
                        Preciso de um serviço
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        Encontre profissionais e resolva seu problema.
                      </p>
                    </div>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#3B82F6] text-white shrink-0 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>

                {/* Cartão Laranja: Quero prestar serviços */}
                <Link
                  to="/entrar?tipo=prestador"
                  className="group flex items-center justify-between p-5 rounded-2xl bg-[#FFF4EC] border border-[#FDE0CE] hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FF6A00] text-white shadow-sm">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="14" x="2" y="7" rx="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0F172A] leading-snug">
                        Quero prestar serviços
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        Ofereça suas habilidades e encontre oportunidades.
                      </p>
                    </div>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#FF6A00] text-white shrink-0 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Bloco da Direita: "Categorias em destaque" */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-[#FF6A00]" />
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                    Categorias em destaque
                  </h2>
                </div>
                <Link
                  to="/explorar"
                  className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1"
                >
                  <span>Ver todas</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Fila Horizontal de 5 Categorias (Fiel à Imagem 1) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* 1: Tecnologia */}
                <button
                  type="button"
                  onClick={() => abrirCategoria('tecnologia')}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 hover:border-[#FF6A00]/50 hover:shadow-md transition text-center group"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="14" x="2" y="3" rx="2" />
                      <line x1="8" x2="16" y1="21" y2="21" />
                      <line x1="12" x2="12" y1="17" y2="21" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Tecnologia</span>
                </button>

                {/* 2: Construção */}
                <button
                  type="button"
                  onClick={() => abrirCategoria('construcao')}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 hover:border-[#FF6A00]/50 hover:shadow-md transition text-center group"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-orange-600 mb-2 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 18h20" />
                      <path d="M12 2a7 7 0 0 0-7 7v9h14V9a7 7 0 0 0-7-7Z" />
                      <line x1="12" x2="12" y1="2" y2="9" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Construção</span>
                </button>

                {/* 3: Limpeza */}
                <button
                  type="button"
                  onClick={() => abrirCategoria('limpeza')}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 hover:border-[#FF6A00]/50 hover:shadow-md transition text-center group"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-50 text-cyan-600 mb-2 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m3 21 9-9" />
                      <path d="m12.2 9.8 4.6-4.6a2 2 0 1 1 2.8 2.8l-4.6 4.6" />
                      <path d="M7 17l4 4" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Limpeza</span>
                </button>

                {/* 4: Design */}
                <button
                  type="button"
                  onClick={() => abrirCategoria('design')}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 hover:border-[#FF6A00]/50 hover:shadow-md transition text-center group"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Design</span>
                </button>

                {/* 5: Serviços Gerais */}
                <button
                  type="button"
                  onClick={() => abrirCategoria('reparacoes')}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 hover:border-[#FF6A00]/50 hover:shadow-md transition text-center group"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600 mb-2 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Serviços Gerais</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. DADOS REAIS: Pedidos Abertos & Profissionais Verificados    */}
      {/* ============================================================== */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Mural de Pedidos Recentes */}
          {pedidosRecentes.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                    Pedidos Recentes em Aberto
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Demandas de clientes em Luanda prontas para receber propostas.
                  </p>
                </div>
                <Link
                  to="/pedidos"
                  className="text-xs font-bold text-[#FF6A00] hover:underline"
                >
                  Ver mural completo ({pedidos.length}) →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {pedidosRecentes.map((pedido) => (
                  <PedidoCartao key={pedido.id} pedido={pedido} />
                ))}
              </div>
            </div>
          )}

          {/* Profissionais em Destaque */}
          {destaques.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                    Profissionais em Destaque
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Especialistas verificados e disponíveis em Luanda.
                  </p>
                </div>
                <Link
                  to="/explorar"
                  className="text-xs font-bold text-[#FF6A00] hover:underline"
                >
                  Explorar directório ({perfis.length}) →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {destaques.map((perfil) => (
                  <PerfilCartao key={perfil.id} perfil={perfil} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
