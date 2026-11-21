import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSessao } from '../state/sessao';
import { SaluLogo } from './SaluLogo';

export function Layout() {
  const sessao = useSessao((estado) => estado.sessao);
  const sair = useSessao((estado) => estado.sair);
  const { pathname } = useLocation();

  const [menuExplorarAberto, setMenuExplorarAberto] = useState(false);

  const isHome = pathname === '/';
  const isEntrar = pathname === '/entrar';

  // Se for a página de autenticação, renderiza directamente sem header duplicado
  if (isEntrar) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* ============================================================== */}
      {/* NAVBAR PRINCIPAL (Fiel ao design da Imagem 1)                   */}
      {/* ============================================================== */}
      <header
        className={`sticky top-0 z-40 transition-colors ${
          isHome ? 'bg-[#071324]/95 backdrop-blur-md border-b border-white/10' : 'bg-[#071324] border-b border-white/10'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Lado Esquerdo: Logótipo Oficial SALU */}
          <div className="flex items-center gap-3">
            <SaluLogo />
          </div>

          {/* Centro: Links de Navegação */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-200">
            <Link
              to="/"
              className={`relative py-2 transition-colors hover:text-white flex items-center gap-1.5 ${
                pathname === '/' ? 'text-white font-bold' : 'text-slate-300'
              }`}
            >
              <span>🏠</span>
              <span>Início</span>
              {pathname === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#FF6A00]" />
              )}
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuExplorarAberto(!menuExplorarAberto)}
                className={`py-2 transition-colors hover:text-white flex items-center gap-1 ${
                  pathname.startsWith('/explorar') ? 'text-white font-bold' : 'text-slate-300'
                }`}
              >
                <span>Explorar</span>
                <span className="text-xs">∨</span>
              </button>
              {menuExplorarAberto && (
                <div
                  className="absolute left-0 mt-2 w-52 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 text-slate-800 text-xs space-y-1 z-50"
                  onMouseLeave={() => setMenuExplorarAberto(false)}
                >
                  <Link
                    to="/explorar"
                    className="block px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold"
                    onClick={() => setMenuExplorarAberto(false)}
                  >
                    Todos os Profissionais
                  </Link>
                  <Link
                    to="/pedidos"
                    className="block px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold"
                    onClick={() => setMenuExplorarAberto(false)}
                  >
                    Mural de Pedidos
                  </Link>
                  <Link
                    to="/explorar?cat=reparacoes"
                    className="block px-3 py-2 rounded-xl hover:bg-slate-100"
                    onClick={() => setMenuExplorarAberto(false)}
                  >
                    Reparações & Obras
                  </Link>
                  <Link
                    to="/explorar?cat=tecnologia"
                    className="block px-3 py-2 rounded-xl hover:bg-slate-100"
                    onClick={() => setMenuExplorarAberto(false)}
                  >
                    Tecnologia & TI
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/confianca"
              className={`py-2 transition-colors hover:text-white ${
                pathname === '/confianca' ? 'text-white font-bold' : 'text-slate-300'
              }`}
            >
              Como Funciona
            </Link>

            <Link
              to="/seguranca"
              className={`py-2 transition-colors hover:text-white ${
                pathname === '/seguranca' ? 'text-white font-bold' : 'text-slate-300'
              }`}
            >
              Sobre o SALU
            </Link>

            <Link
              to="/interno"
              className={`py-2 transition-colors hover:text-white ${
                pathname === '/interno' ? 'text-white font-bold' : 'text-slate-300'
              }`}
            >
              Ajuda
            </Link>
          </nav>

          {/* Lado Direito: Notificações + Entrar + Criar Conta */}
          <div className="flex items-center gap-3">
            {/* Sino com Badge 2 */}
            <Link
              to="/notificacoes"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Notificações"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-red-600 text-[10px] font-bold text-white border-2 border-[#071324]">
                2
              </span>
            </Link>

            {sessao ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/painel"
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
                >
                  {sessao.nome.split(' ')[0]} ({sessao.tipo})
                </Link>
                <button
                  type="button"
                  onClick={sair}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Sair
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/entrar"
                  className="rounded-full border border-white/40 px-5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/entrar?tipo=prestador"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6A00] hover:bg-[#e85f00] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition-all active:scale-95"
                >
                  <span>Criar Conta</span>
                  <span>→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* CONTEÚDO PRINCIPAL                                             */}
      {/* ============================================================== */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* ============================================================== */}
      {/* RODAPÉ LIMPO E ALINHADO                                        */}
      {/* ============================================================== */}
      <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SaluLogo compact />
            <span>Serviços · Oportunidades · Confiança em Angola</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/confianca" className="hover:text-slate-900">Como Funciona</Link>
            <Link to="/seguranca" className="hover:text-slate-900">Segurança</Link>
            <Link to="/planos" className="hover:text-slate-900">Planos</Link>
            <Link to="/interno" className="hover:text-slate-900">Ajuda</Link>
          </div>
          <p>© 2026 SALU Angola. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
