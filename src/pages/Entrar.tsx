import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSessao } from '../state/sessao';
import type { TipoSessao } from '../domain/types';
import { PERSONAS } from '../data/semente';
import { SaluLogo } from '../components/SaluLogo';
import luandaNightBg from '../assets/images/luanda_night_bg.jpg';

export function Entrar() {
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const entrar = useSessao((estado) => estado.entrar);

  const [tipo, setTipo] = useState<TipoSessao>(
    parametros.get('tipo') === 'cliente' ? 'cliente' : 'prestador',
  );
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(true);

  function submeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nomeUtilizador = identificador.trim() || (tipo === 'cliente' ? 'Marta Kilamba' : 'Ivo Manuel');
    entrar(tipo, nomeUtilizador);
    navegar(tipo === 'cliente' ? '/painel' : '/pedidos');
  }

  function entrarComoPersona(persona: (typeof PERSONAS)[number]) {
    entrar(persona.tipo, persona.nome);
    navegar(persona.rota);
  }

  return (
    <div className="min-h-screen bg-[#071324] flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-[#0A1A30] grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* ============================================================== */}
        {/* LADO ESQUERDO: Visual Noturno de Luanda + Tipografia & Badges  */}
        {/* ============================================================== */}
        <div className="lg:col-span-6 relative overflow-hidden p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          {/* Foto de Fundo */}
          <img
            src={luandaNightBg}
            alt="Baía e Mausoléu de Luanda à noite"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Overlay Azul Noturno Profundo */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#071324]/85 via-[#071324]/75 to-[#050E1C]/92" />

          {/* Curva Laranja Decorativa */}
          <svg
            className="absolute bottom-0 left-0 w-80 h-40 pointer-events-none text-[#FF6A00]/40"
            viewBox="0 0 300 150"
            fill="none"
          >
            <path d="M-50 150 Q100 80 280 150" stroke="currentColor" strokeWidth="2" />
          </svg>

          {/* Conteúdo Superior: Logótipo SALU */}
          <div className="relative z-10">
            <SaluLogo />
          </div>

          {/* Conteúdo Central: Título de Alto Impacto */}
          <div className="relative z-10 my-10 space-y-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-[1.12]">
              Onde as habilidades<br />
              existem, as<br />
              <span className="text-[#FF6A00]">oportunidades</span> também.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-md leading-relaxed">
              Encontre serviços, resolva seus problemas e descubra novas oportunidades.
            </p>
          </div>

          {/* Conteúdo Inferior: 2 Badges de Confiança */}
          <div className="relative z-10 flex flex-wrap items-center gap-6 sm:gap-8 pt-4 border-t border-white/10 text-white/90">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white border border-white/15">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-bold text-white leading-tight">Seguro</p>
                <p className="text-slate-300 text-[11px]">e confiável</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white border border-white/15">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-bold text-white leading-tight">Conectando</p>
                <p className="text-slate-300 text-[11px]">pessoas e talentos</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LADO DIREITO: Cartão Branco Curvado com Formulário Fiel        */}
        {/* ============================================================== */}
        <div className="lg:col-span-6 bg-white rounded-3xl lg:rounded-r-[2.5rem] lg:rounded-l-none p-6 sm:p-10 lg:p-12 flex flex-col justify-center text-slate-800 relative">
          {/* Suave onda gradiente nos cantos */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-100/60 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-orange-100/60 blur-2xl" />

          <div className="relative z-10 max-w-md mx-auto w-full space-y-6">
            {/* Cabeçalho */}
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                Bem-vindo de volta!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Entre na sua conta para continuar
              </p>
            </div>

            {/* Seletor de Papel Duplo (Pills lado a lado) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setTipo('cliente')}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                  tipo === 'cliente'
                    ? 'bg-[#0B192E] text-white border-transparent shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`grid h-8 w-8 place-items-center rounded-xl ${
                    tipo === 'cliente' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs leading-snug">Cliente</p>
                  <p className={`text-[10px] truncate ${tipo === 'cliente' ? 'text-slate-300' : 'text-slate-400'}`}>
                    (Preciso de um serviço)
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTipo('prestador')}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                  tipo === 'prestador'
                    ? 'bg-[#0B192E] text-white border-transparent shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`grid h-8 w-8 place-items-center rounded-xl ${
                    tipo === 'prestador' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="14" x="2" y="7" rx="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs leading-snug">Prestador</p>
                  <p className={`text-[10px] truncate ${tipo === 'prestador' ? 'text-slate-300' : 'text-slate-400'}`}>
                    (Quero oferecer serviços)
                  </p>
                </div>
              </button>
            </div>

            {/* Formulário de Autenticação */}
            <form onSubmit={submeter} className="space-y-4">
              {/* Campo E-mail / Telefone */}
              <div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="E-mail ou número de telefone"
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Senha"
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {mostrarSenha ? (
                        <>
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </>
                      ) : (
                        <>
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Opções: Lembrar-me e Esqueceu a Senha */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={lembrarMe}
                    onChange={(e) => setLembrarMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#FF6A00] focus:ring-[#FF6A00]"
                  />
                  <span>Lembrar-me</span>
                </label>
                <a href="#recuperar" className="text-[#2563EB] font-medium hover:underline">
                  Esqueceu sua senha?
                </a>
              </div>

              {/* Botão Entrar Primário */}
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#FF6A00] hover:bg-[#e65c00] text-white font-bold py-3.5 px-6 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
              >
                <span>Entrar</span>
                <span>→</span>
              </button>
            </form>

            {/* Separador ou */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs text-slate-400 absolute font-medium">ou</span>
            </div>

            {/* Botões Sociais (Google e Apple) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  entrar(tipo, 'Utilizador Google');
                  navegar(tipo === 'cliente' ? '/painel' : '/pedidos');
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 px-3 hover:bg-slate-50 transition text-xs font-semibold text-slate-700"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="truncate">Entrar com Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  entrar(tipo, 'Utilizador Apple');
                  navegar(tipo === 'cliente' ? '/painel' : '/pedidos');
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 px-3 hover:bg-slate-50 transition text-xs font-semibold text-slate-700"
              >
                <svg className="h-4 w-4 shrink-0 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.86.96-2.95-1 .04-2.18.66-2.82 1.41-.57.65-1.07 1.76-.94 2.81 1.12.09 2.16-.54 2.8-1.27z" />
                </svg>
                <span className="truncate">Entrar com Apple</span>
              </button>
            </div>

            {/* Rodapé: Link para Criar Conta */}
            <p className="text-center text-xs text-slate-600 pt-2">
              Não tem uma conta?{' '}
              <Link to="/perfil/novo" className="text-[#1D4ED8] font-bold hover:underline">
                Criar conta
              </Link>
            </p>

            {/* Alternador Rápido de Demonstração Local (Discreto) */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                Atalhos Rápidos de Demonstração
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {PERSONAS.map((p) => (
                  <button
                    key={p.nome}
                    type="button"
                    onClick={() => entrarComoPersona(p)}
                    className="rounded-lg bg-slate-100 hover:bg-[#FF6A00] hover:text-white px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors"
                  >
                    {p.nome.split(' ')[0]} ({p.tipo})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
