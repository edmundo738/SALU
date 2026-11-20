import { Link, NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../state/store';
import { useSessao } from '../state/sessao';

const LIGACOES = [
  { para: '/', rotulo: 'Início' },
  { para: '/explorar', rotulo: 'Explorar' },
  { para: '/pedidos', rotulo: 'Pedidos' },
  { para: '/planos', rotulo: 'Planos' },
];

export function Layout() {
  const modo = useApp((estado) => estado.modo);
  const sessao = useSessao((estado) => estado.sessao);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-sand/92 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-xl font-black tracking-tight">SALU</span>
            <span className="hidden text-xs text-mute sm:inline">oportunidades em Luanda</span>
          </Link>

          {sessao ? (
            <Link
              to="/minha-area"
              className="flex items-center gap-2 rounded-full border border-line bg-paper px-2.5 py-1.5 text-xs"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-forest-500"
              />
              <span className="max-w-28 truncate font-medium">{sessao.nome}</span>
              <span className="text-mute">
                {sessao.tipo === 'prestador' ? 'prestador' : 'cliente'}
              </span>
            </Link>
          ) : (
            <Link
              to="/entrar"
              className="rounded-full bg-forest-600 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700"
            >
              Entrar
            </Link>
          )}
        </div>

        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {LIGACOES.map((ligacao) => (
            <NavLink
              key={ligacao.para}
              to={ligacao.para}
              end={ligacao.para === '/'}
              className={({ isActive }) =>
                `chip ${isActive ? 'chip-ativo' : 'text-mute'}`
              }
            >
              {ligacao.rotulo}
            </NavLink>
          ))}
        </nav>
      </header>

      {modo === 'local' && (
        <div className="border-b border-brand-500/30 bg-brand-50">
          <p className="mx-auto max-w-5xl px-4 py-2 text-xs text-brand-700">
            <strong>Modo demonstração.</strong> Os dados ficam neste dispositivo e os
            perfis marcados como «Exemplo» não podem ser contactados.
          </p>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="mt-8 border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-mute">
          <p>
            SALU — protótipo para o concurso Africa Builds Tech, 2026. Não é um serviço
            em produção.
          </p>
          <Link to="/interno" className="underline decoration-dotted hover:text-ink">
            Área interna
          </Link>
        </div>
      </footer>
    </div>
  );
}
