import { Link, NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../state/store';

export function Layout() {
  const modo = useApp((estado) => estado.modo);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-sand/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-xl font-black tracking-tight">SALU</span>
            <span className="hidden text-xs text-mute sm:inline">serviços em Luanda</span>
          </Link>

          <nav className="flex items-center gap-2 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 ${
                  isActive ? 'bg-ink text-sand' : 'text-mute hover:text-ink'
                }`
              }
            >
              Encontrar
            </NavLink>
            <Link
              to="/publicar"
              className="rounded-full bg-forest-600 px-3 py-1.5 font-semibold text-white hover:bg-forest-700"
            >
              Publicar perfil
            </Link>
          </nav>
        </div>
      </header>

      {modo === 'local' && (
        <div className="border-b border-brand-500/30 bg-brand-50">
          <p className="mx-auto max-w-3xl px-4 py-2 text-xs text-brand-700">
            <strong>Modo local.</strong> Os perfis que criar ficam apenas neste dispositivo —
            não são visíveis para outras pessoas. A base de dados partilhada ainda não está
            ligada.
          </p>
        </div>
      )}

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-mute">
          <p>SALU — protótipo em construção para o piloto de Luanda.</p>
          <Link to="/interno" className="underline decoration-dotted hover:text-ink">
            Área interna
          </Link>
        </div>
      </footer>
    </div>
  );
}
