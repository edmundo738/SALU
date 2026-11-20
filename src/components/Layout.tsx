import { Link, NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';

const LIGACOES = [
  { para: '/explorar', rotulo: 'Profissionais' },
  { para: '/pedidos', rotulo: 'Pedidos' },
  { para: '/planos', rotulo: 'Planos' },
];

const ABAS = [
  { para: '/', rotulo: 'Início', icone: 'M3 11l9-8 9 8M5 10v10h14V10' },
  { para: '/explorar', rotulo: 'Explorar', icone: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4' },
  { para: '/pedidos', rotulo: 'Pedidos', icone: 'M4 6h16M4 12h16M4 18h10' },
  { para: '/minha-area', rotulo: 'Área', icone: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0' },
];

export function Layout() {
  const modo = useApp((estado) => estado.modo);
  const sessao = useSessao((estado) => estado.sessao);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-sand/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="group flex items-baseline gap-1.5" aria-label="SALU — início">
            <span className="titulo-display text-[27px] leading-none">SALU</span>
            <span
              aria-hidden="true"
              className="mb-1 h-1.5 w-1.5 rounded-full bg-brand-600 transition group-hover:scale-125"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            {LIGACOES.map((ligacao) => (
              <NavLink
                key={ligacao.para}
                to={ligacao.para}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    isActive ? 'bg-ink text-sand' : 'text-ink-soft hover:bg-ink/5'
                  }`
                }
              >
                {ligacao.rotulo}
              </NavLink>
            ))}
          </nav>

          {sessao ? (
            <Link
              to="/minha-area"
              className="flex items-center gap-2 rounded-full border border-line bg-paper px-2.5 py-1.5 text-xs transition hover:border-ink/30"
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-forest-500" />
              <span className="max-w-24 truncate font-semibold">{sessao.nome}</span>
              <span className="hidden text-mute sm:inline">
                {sessao.tipo === 'prestador' ? 'prestador' : 'cliente'}
              </span>
            </Link>
          ) : (
            <Link to="/entrar" className="btn-primario px-4 py-2 text-sm">
              Entrar
            </Link>
          )}
        </div>

        {modo === 'local' && (
          <div className="border-t border-brand-500/20 bg-brand-50/70">
            <p className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-1.5 text-[11px] font-medium tracking-wide text-brand-700">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              Demonstração · os dados ficam neste dispositivo · perfis «Exemplo» não são
              contactáveis
            </p>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 pb-28 md:pb-12">
        <Outlet />
      </main>

      <footer className="hidden border-t border-line md:block">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-8 text-xs text-mute">
          <p className="max-w-md">
            SALU — protótipo para o concurso Africa Builds Tech, 2026. Não é um serviço em
            produção.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/planos" className="hover:text-ink">
              Planos
            </Link>
            <Link to="/interno" className="hover:text-ink">
              Área interna
            </Link>
          </div>
        </div>
      </footer>

      {/* Barra inferior: dá ao telemóvel a sensação de aplicação, não de página web. */}
      <nav
        aria-label="Navegação"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-sand/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="mx-auto flex max-w-md">
          {ABAS.map((aba) => (
            <li key={aba.para} className="flex-1">
              <NavLink
                to={aba.para}
                end={aba.para === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide transition ${
                    isActive ? 'text-brand-600' : 'text-mute'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={isActive ? 2.1 : 1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path d={aba.icone} />
                    </svg>
                    {aba.rotulo}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
