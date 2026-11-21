import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  Compass,
  FilePlus2,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { SaluLogo } from './SaluLogo';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { Avatar, Button, Spinner } from './ui/Base';

function ServerBanner() {
  const { apiReachable } = useAuth();
  const { t } = useI18n();
  if (apiReachable !== false) return null;
  return (
    <div className="bg-red-700 text-white text-xs px-4 py-2 text-center" role="alert">
      {t('common.networkError')}
    </div>
  );
}

const publicLinks = [
  { to: '/explorar', labelKey: 'nav.explore' as const },
  { to: '/ajuda', labelKey: 'nav.help' as const },
  { to: '/seguranca', labelKey: 'nav.safety' as const },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] dark:bg-[#060E20] dark:text-[#F8FAFC]">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-white focus:text-[#081C41] focus:px-4 focus:py-2 focus:rounded-lg"
      >
        {t('common.skip')}
      </a>
      <ServerBanner />
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/90 backdrop-blur dark:border-[#1E325C] dark:bg-[#060E20]/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <SaluLogo compact />
          <nav className="hidden md:flex items-center gap-1" aria-label={t('nav.main')}>
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold ${isActive ? 'text-[#C2410C] dark:text-[#FDBA74]' : 'text-[#334155] hover:bg-[#F1F5F9] dark:text-[#CBD5E1] dark:hover:bg-[#132347]'}`
                }
              >
                {t(link.labelKey)}
              </NavLink>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="w-32 h-10 rounded-xl bg-slate-100 dark:bg-[#132347] animate-pulse" />
            ) : user ? (
              <Link
                to="/inicio"
                className="inline-flex min-h-11 items-center rounded-xl bg-[#081C41] px-4 text-sm font-semibold text-white dark:bg-[#1D6FE5]"
              >
                {t('nav.dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/entrar"
                  className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-[#334155] hover:bg-[#F1F5F9] dark:text-[#CBD5E1] dark:hover:bg-[#132347]"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/criar-conta"
                  className="inline-flex min-h-11 items-center rounded-xl bg-[#F97316] px-4 text-sm font-semibold text-white hover:bg-[#EA580C]"
                >
                  {t('common.register')}
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="md:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-[#334155] hover:bg-[#F1F5F9] dark:text-[#CBD5E1] dark:hover:bg-[#132347]"
            aria-expanded={menuOpen}
            aria-controls="menu-publico"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.menu')}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <div
          id="menu-publico"
          className={`md:hidden overflow-hidden transition-all ${menuOpen ? 'max-h-96 border-t border-[#E2E8F0] dark:border-[#1E325C]' : 'max-h-0'}`}
        >
          <nav className="px-4 py-3 space-y-1" aria-label={t('nav.main')}>
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="block min-h-11 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#334155] hover:bg-[#F1F5F9] dark:text-[#CBD5E1] dark:hover:bg-[#132347]"
              >
                {t(link.labelKey)}
              </NavLink>
            ))}
            <div className="pt-2 flex gap-2">
              {user ? (
                <Link
                  to="/inicio"
                  className="flex-1 text-center rounded-xl bg-[#081C41] px-4 py-3 text-sm font-semibold text-white dark:bg-[#1D6FE5]"
                >
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <>
                  <Link
                    to="/entrar"
                    className="flex-1 text-center rounded-xl border border-[#CBD5E1] px-4 py-3 text-sm font-semibold dark:border-[#1E325C]"
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    to="/criar-conta"
                    className="flex-1 text-center rounded-xl bg-[#F97316] px-4 py-3 text-sm font-semibold text-white"
                  >
                    {t('common.register')}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main id="conteudo" className="flex-1 focus:outline-none">
        {children}
      </main>
      <footer className="border-t border-[#E2E8F0] dark:border-[#1E325C] mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <SaluLogo compact />
            <p className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
              {t('footer.rights', { year: new Date().getFullYear() })}
            </p>
          </div>
          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#475569] dark:text-[#94A3B8]"
            aria-label="Legal"
          >
            <Link to="/termos" className="hover:text-[#C2410C] dark:hover:text-[#FDBA74]">
              {t('footer.terms')}
            </Link>
            <Link to="/privacidade" className="hover:text-[#C2410C] dark:hover:text-[#FDBA74]">
              {t('footer.privacy')}
            </Link>
            <Link to="/ajuda" className="hover:text-[#C2410C] dark:hover:text-[#FDBA74]">
              {t('footer.help')}
            </Link>
            <Link to="/seguranca" className="hover:text-[#C2410C] dark:hover:text-[#FDBA74]">
              {t('footer.safety')}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function AppLayout() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#060E20]">
        <Spinner label={t('common.loading')} />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/entrar?next=${next}`} replace />;
  }

  const provider = user.activeMode === 'provider';
  const nav = provider
    ? [
        { to: '/inicio', label: t('nav.dashboard'), icon: Home },
        { to: '/oportunidades', label: t('nav.opportunities'), icon: BriefcaseBusiness },
        { to: '/explorar', label: t('nav.explore'), icon: Compass },
        { to: '/mensagens', label: t('nav.messages'), icon: MessageSquare },
        { to: '/notificacoes', label: t('nav.notifications'), icon: Bell },
      ]
    : [
        { to: '/inicio', label: t('nav.dashboard'), icon: Home },
        { to: '/explorar', label: t('nav.explore'), icon: Compass },
        { to: '/pedidos', label: t('nav.requests'), icon: FilePlus2 },
        { to: '/mensagens', label: t('nav.messages'), icon: MessageSquare },
        { to: '/notificacoes', label: t('nav.notifications'), icon: Bell },
      ];

  const secondary = [
    { to: '/definicoes', label: t('nav.settings'), icon: Settings },
    { to: '/seguranca', label: t('nav.safety'), icon: ShieldCheck },
    { to: '/ajuda', label: t('nav.help'), icon: CircleHelp },
    ...(provider ? [{ to: '/perfil-profissional', label: t('nav.providerProfile'), icon: UserRound }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] dark:bg-[#060E20] dark:text-[#F8FAFC]">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-white focus:text-[#081C41] focus:px-4 focus:py-2 focus:rounded-lg"
      >
        {t('common.skip')}
      </a>
      <ServerBanner />
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur dark:border-[#1E325C] dark:bg-[#060E20]/95">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 h-16 flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#132347]"
            aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.menu')}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <SaluLogo compact />
          <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label={t('nav.main')}>
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${isActive ? 'bg-[#EFF6FF] text-[#1558B8] dark:bg-[#132347] dark:text-[#93C5FD]' : 'text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#132347]'}`
                  }
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              to="/notificacoes"
              className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#132347]"
              aria-label={t('nav.notifications')}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-[#F1F5F9] dark:hover:bg-[#132347]"
                aria-expanded={profileOpen}
                aria-controls="menu-perfil"
              >
                <Avatar file={user.avatar} name={user.name} size="sm" />
                <span className="hidden sm:block text-left max-w-[9rem]">
                  <span className="block text-xs font-bold truncate">{user.name}</span>
                  <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    {t(`mode.${user.activeMode}`)}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#64748B] transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              <div
                id="menu-perfil"
                className={`absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-[#E2E8F0] bg-white shadow-xl transition-all duration-150 dark:border-[#1E325C] dark:bg-[#0C1833] ${
                  profileOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }`}
              >
                <div className="p-3 border-b border-[#E2E8F0] dark:border-[#1E325C]">
                  <p className="text-sm font-bold truncate">{user.name}</p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">{user.contact}</p>
                </div>
                <div className="p-2">
                  {secondary.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-2.5 min-h-11 px-2.5 rounded-lg text-sm font-medium text-[#334155] hover:bg-[#F1F5F9] dark:text-[#CBD5E1] dark:hover:bg-[#132347]"
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        {item.label}
                      </Link>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="w-full flex items-center gap-2.5 min-h-11 px-2.5 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    {t('common.logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <nav
            className="lg:hidden border-t border-[#E2E8F0] px-3 py-3 space-y-1 dark:border-[#1E325C]"
            aria-label={t('nav.main')}
          >
            {[...nav, ...secondary].map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-semibold ${isActive ? 'bg-[#EFF6FF] text-[#1558B8] dark:bg-[#132347] dark:text-[#93C5FD]' : 'text-[#334155] dark:text-[#CBD5E1]'}`
                  }
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        )}
      </header>
      <main id="conteudo" className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 pb-24 lg:pb-10">
        <Outlet />
      </main>
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#E2E8F0] bg-white/95 backdrop-blur dark:border-[#1E325C] dark:bg-[#060E20]/95"
        aria-label={t('nav.main')}
      >
        <div className="grid grid-cols-5">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `min-h-14 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${isActive ? 'text-[#C2410C] dark:text-[#FDBA74]' : 'text-[#64748B] dark:text-[#94A3B8]'}`
                }
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="truncate max-w-full px-1">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
