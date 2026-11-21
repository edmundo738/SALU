import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Briefcase,
  ChevronDown,
  ClipboardList,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Moon,
  PlusCircle,
  Search,
  Settings,
  ShieldAlert,
  Star,
  Sun,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { ANGOLA_MUNICIPALITIES } from '../data/saluData';
import { useLang } from '../i18n/translations';
import { ScreenId, UserRole } from '../types/salu';
import { SaluRibbonMark } from './ui/Primitives';
import {
  NavAlertsIcon,
  NavExploreIcon,
  NavHomeIcon,
  NavMessagesIcon,
  NavOrdersIcon,
  NavProfileIcon,
  NavSettingsIcon,
  TrustTrophySprite,
} from './ui/SaluIcons';

interface AppShellProps {
  activeRole: UserRole;
  activeScreen: ScreenId;
  userName: string;
  municipality: string;
  activeRequestsCount: number;
  unreadMessages: number;
  unreadNotifications: number;
  darkMode: boolean;
  onToggleDark: () => void;
  onSwitchRole: (role: UserRole) => void;
  onNavigate: (screen: ScreenId) => void;
  onGlobalSearch: (query: string) => void;
  onChangeMunicipality: (area: string) => void;
  onBackToLanding: () => void;
  children: React.ReactNode;
}

export function AppShell({
  activeRole,
  activeScreen,
  userName,
  municipality,
  activeRequestsCount,
  unreadMessages,
  unreadNotifications,
  darkMode,
  onToggleDark,
  onSwitchRole,
  onNavigate,
  onGlobalSearch,
  onChangeMunicipality,
  onBackToLanding,
  children,
}: AppShellProps) {
  const { lang, setLang, t } = useLang();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const sidebarItems: {
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    matchScreens?: ScreenId[];
  }[] = [
    {
      id: 'dashboard',
      label: t('Início', 'Home'),
      icon: NavHomeIcon,
    },
    {
      id: activeRole === 'customer' ? 'discover-pros' : 'opportunities',
      label: activeRole === 'customer' ? t('Contratar Serviços', 'Hire Services') : t('Pedidos de Serviço', 'Service Requests'),
      icon: NavExploreIcon,
      matchScreens: ['discover-pros', 'opportunities', 'profile-detail'],
    },
    {
      id: 'requests',
      label: activeRole === 'customer' ? t('Meus Pedidos', 'My Requests') : t('Meus Trabalhos', 'My Jobs'),
      icon: NavOrdersIcon,
      badge: activeRequestsCount,
      matchScreens: ['requests', 'request-detail'],
    },
    activeRole === 'customer'
      ? {
          id: 'create-request',
          label: t('Resolver Problema', 'Post a Problem'),
          icon: PlusCircle,
        }
      : {
          id: 'reviews',
          label: t('Avaliações', 'Reviews'),
          icon: Star,
        },
    {
      id: 'messages',
      label: t('Negociações', 'Negotiations'),
      icon: NavMessagesIcon,
      badge: unreadMessages,
    },
    {
      id: 'favorites',
      label: activeRole === 'customer' ? t('Favoritos', 'Favorites') : t('Contactos', 'Contacts'),
      icon: UserCheck,
    },
    {
      id: 'notifications',
      label: t('Notificações', 'Notifications'),
      icon: NavAlertsIcon,
      badge: unreadNotifications,
    },
    {
      id: activeRole === 'customer' ? 'customer-profile' : 'provider-onboarding',
      label: t('Meu Perfil', 'My Profile'),
      icon: NavProfileIcon,
      matchScreens: ['customer-profile', 'provider-onboarding'],
    },
    {
      id: 'settings',
      label: t('Definições', 'Settings'),
      icon: NavSettingsIcon,
    },
  ];

  const accountDropdownItems: {
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: activeRole === 'customer' ? 'customer-profile' : 'provider-onboarding',
      label: activeRole === 'customer' ? t('Meu Perfil & Fiabilidade', 'My Profile & Standing') : t('Editar Perfil de Prestador', 'Edit Provider Profile'),
      icon: UserCheck,
    },
    { id: 'reviews', label: t('Avaliações & Reputação', 'Reviews & Reputation'), icon: Star },
    { id: 'safety', label: t('Segurança & Mediação', 'Safety & Moderation'), icon: ShieldAlert },
    { id: 'settings', label: t('Definições da Conta', 'Account Settings'), icon: Settings },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGlobalSearch(searchInput.trim());
  };

  const handleNav = (id: ScreenId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  const isNavActive = (item: (typeof sidebarItems)[number]) =>
    item.matchScreens ? item.matchScreens.includes(activeScreen) : activeScreen === item.id;

  const shortCity = municipality.split(',')[0].trim() || 'Luanda';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#060E20] text-[#0F172A] dark:text-[#F8FAFC] flex">
      {/* DESKTOP PERSISTENT SIDEBAR — Deep Nocturnal Luanda Navy */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-[#061534] text-white border-r border-[#12295A] z-30 select-none">
        {/* Brand Header */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <SaluRibbonMark size={40} variant="app-dark" />
            <div>
              <span className="font-display text-xl font-extrabold tracking-tight text-white block leading-none">
                SALU
              </span>
              <span className="text-[10px] text-white/65 tracking-wide block mt-1">
                {t('Serviços · Oportunidades · Confiança', 'Services · Opportunities · Trust')}
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          aria-label={t('Menu lateral principal', 'Sidebar navigation')}
          className="flex-1 px-3 py-2 space-y-1 overflow-y-auto"
        >
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-sm rounded-xl transition-all duration-150 ${
                  active
                    ? 'bg-[#F97316] text-white font-semibold shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/8 font-medium'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      active ? 'text-white' : 'text-white/75'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-full font-mono tabular-nums text-[11px] font-bold flex items-center justify-center shrink-0 ${
                      active
                        ? 'bg-white text-[#F97316]'
                        : 'bg-[#EF4444] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Reputation & Rewards Card matching visual reference */}
        <div className="p-3.5 mt-auto">
          <div className="relative overflow-hidden rounded-2xl bg-[#0B1E48] border border-[#1B356C] p-4 space-y-2.5">
            {/* Subtle Nocturnal Skyline & Orange Sweep */}
            <svg
              viewBox="0 0 240 120"
              fill="none"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none opacity-55"
              preserveAspectRatio="xMidYMid slice"
            >
              <g fill="#06122E">
                <rect x="135" y="45" width="16" height="75" rx="1" />
                <rect x="155" y="28" width="20" height="92" rx="1" />
                <rect x="180" y="52" width="14" height="68" rx="1" />
                <rect x="198" y="34" width="22" height="86" rx="1" />
              </g>
              <path
                d="M-10 96 Q90 122 250 105 L250 124 L-10 124 Z"
                fill="#F97316"
                fillOpacity="0.88"
              />
            </svg>

            <div className="relative z-10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#F97316]/20 border border-[#F97316]/40 flex items-center justify-center">
                <TrustTrophySprite className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-white leading-snug">
                  {activeRole === 'customer'
                    ? t('Resolva sem riscos!', 'Solve problems safely!')
                    : t('Ganha mais trabalhos!', 'Win more paid jobs!')}
                </p>
                <p className="text-[11px] text-white/75 leading-relaxed mt-1">
                  {activeRole === 'customer'
                    ? t(
                        'Compare propostas em Kwanzas e só confirme após conclusão.',
                        'Compare Kwanza quotes and confirm only after completion.'
                      )
                    : t(
                        'Quanto mais trabalhos concluíres, mais clientes te escolhem.',
                        'Completed jobs build trust and attract higher-value clients.'
                      )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNav(activeRole === 'customer' ? 'create-request' : 'opportunities')}
                className="w-full py-2 px-3 rounded-lg bg-[#132C62] hover:bg-[#1A3B80] border border-[#284C96] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <span>
                  {activeRole === 'customer'
                    ? t('Publicar Pedido →', 'Post Request →')
                    : t('Ver pedidos abertos →', 'Browse paid requests →')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* TOP WORKSPACE HEADER */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-[#0C1833]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E325C]">
          <div className="max-w-[1380px] mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-3">
            {/* Left: Mobile Trigger + Search Pill */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0 max-w-xl">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#081C41] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#132347] shrink-0"
                aria-label={t('Abrir menu', 'Open navigation menu')}
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className="lg:hidden flex items-center gap-1.5 font-display font-extrabold text-base text-[#081C41] dark:text-white shrink-0"
              >
                <SaluRibbonMark size={26} />
                <span className="hidden xs:inline">SALU</span>
              </button>

              <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[120px]">
                <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    activeRole === 'customer'
                      ? t(
                          'Pesquisar serviços, profissionais ou categorias...',
                          'Search services, professionals or categories...'
                        )
                      : t(
                          'Pesquisar oportunidades, zonas ou categorias...',
                          'Search opportunities, areas or categories...'
                        )
                  }
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F1F5F9] dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] focus:border-[#1D6FE5] rounded-full text-[#0F172A] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none transition-colors"
                />
              </form>
            </div>

            {/* Right Utility & Profile Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
              {/* Location Selector */}
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#132347] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                <MapPin className="w-4 h-4 text-[#081C41] dark:text-[#60A5FA] shrink-0" />
                <select
                  aria-label={t('Selecionar localização', 'Select location')}
                  value={municipality}
                  onChange={(e) => onChangeMunicipality(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none cursor-pointer pr-1"
                >
                  {ANGOLA_MUNICIPALITIES.map((area) => (
                    <option key={area} value={area} className="text-[#0F172A] bg-white">
                      {area.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <span className="hidden xl:block h-5 w-px bg-[#E2E8F0] dark:bg-[#1E325C]" aria-hidden="true" />

              {/* Role Switcher */}
              <div className="p-0.5 bg-[#F1F5F9] dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] rounded-lg inline-flex">
                <button
                  type="button"
                  onClick={() => onSwitchRole('customer')}
                  className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeRole === 'customer'
                      ? 'bg-[#1D6FE5] text-white shadow-xs'
                      : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  {t('Cliente', 'Customer')}
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('provider')}
                  className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeRole === 'provider'
                      ? 'bg-[#F97316] text-white shadow-xs'
                      : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  {t('Prestador', 'Provider')}
                </button>
              </div>

              {/* Language Switcher */}
              <div className="hidden md:inline-flex items-center p-0.5 bg-[#F1F5F9] dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setLang('pt')}
                  className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                    lang === 'pt'
                      ? 'bg-[#081C41] text-white dark:bg-[#1D6FE5]'
                      : 'text-[#475569] dark:text-[#94A3B8]'
                  }`}
                >
                  PT
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                    lang === 'en'
                      ? 'bg-[#081C41] text-white dark:bg-[#1D6FE5]'
                      : 'text-[#475569] dark:text-[#94A3B8]'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Dark Theme Toggle */}
              <button
                type="button"
                onClick={onToggleDark}
                className="hidden sm:inline-flex p-2 rounded-lg text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#132347] transition-colors"
                aria-label={
                  darkMode
                    ? t('Tema claro', 'Switch to light theme')
                    : t('Tema escuro', 'Switch to dark theme')
                }
              >
                {darkMode ? <Sun className="w-4 h-4 text-[#F97316]" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => handleNav('notifications')}
                className="relative p-2 rounded-lg text-[#081C41] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#132347] transition-colors"
                aria-label={t('Notificações', 'Notifications')}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* User Profile Dropdown */}
              <button
                type="button"
                onClick={() => setAccountMenuOpen((o) => !o)}
                className="hidden sm:inline-flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#132347] transition-colors text-left"
              >
                <div
                  className={`w-9 h-9 rounded-full font-display font-bold text-xs text-white flex items-center justify-center shrink-0 ${
                    activeRole === 'customer' ? 'bg-[#1D6FE5]' : 'bg-[#F97316]'
                  }`}
                >
                  {userInitials}
                </div>
                <div className="hidden md:block leading-tight">
                  <p className="text-xs font-bold text-[#0F172A] dark:text-white max-w-[120px] truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {activeRole === 'customer'
                      ? t('Cliente', 'Customer')
                      : t('Prestador', 'Provider')}{' '}
                    · {shortCity}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
              </button>

              {accountMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setAccountMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-13 z-40 w-64 bg-white dark:bg-[#0C1833] text-[#081C41] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl shadow-xl p-2 space-y-1">
                    <div className="px-3 py-2 border-b border-[#E2E8F0] dark:border-[#1E325C]">
                      <p className="text-sm font-semibold truncate">{userName}</p>
                      <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                        {activeRole === 'customer'
                          ? t('Modo Cliente', 'Customer Mode')
                          : t('Modo Prestador', 'Service Provider Mode')}{' '}
                        · {municipality}
                      </p>
                    </div>
                    {accountDropdownItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNav(item.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#132347] rounded-lg text-left"
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              activeRole === 'customer'
                                ? 'text-[#1D6FE5] dark:text-[#60A5FA]'
                                : 'text-[#F97316]'
                            }`}
                          />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                    <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#1E325C]">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onBackToLanding();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#475569] dark:text-[#94A3B8] hover:text-[#081C41] dark:hover:text-white rounded-lg text-left"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>{t('Sair / Início SALU', 'Exit / Landing Overview')}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/55"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <aside className="relative w-72 max-w-[85vw] bg-[#061534] text-white h-full overflow-y-auto border-r border-[#12295A] z-10 p-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-display font-bold text-lg text-white">
                    <SaluRibbonMark size={28} />
                    <span>SALU</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-white/80 hover:text-white"
                    aria-label={t('Fechar menu', 'Close navigation menu')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const active = isNavActive(item);
                    return (
                      <button
                        key={`mob-${item.id}`}
                        type="button"
                        onClick={() => handleNav(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl ${
                          active
                            ? 'bg-[#F97316] text-white font-semibold'
                            : 'text-white/80 hover:bg-white/8'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#EF4444] text-white font-mono text-[11px] font-bold flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleNav('safety')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl ${
                      activeScreen === 'safety'
                        ? 'bg-[#F97316] text-white font-semibold'
                        : 'text-white/80 hover:bg-white/8'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{t('Segurança & Mediação', 'Safety & Moderation')}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">{t('Idioma', 'Language')}</span>
                  <div className="inline-flex p-0.5 bg-[#0D234E] rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setLang('pt')}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        lang === 'pt' ? 'bg-white text-[#061534]' : 'text-white/70'
                      }`}
                    >
                      PT
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        lang === 'en' ? 'bg-white text-[#061534]' : 'text-white/70'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onBackToLanding}
                    className="inline-flex items-center gap-2 text-xs text-white/75 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('Sair / Início SALU', 'Exit / Landing')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onToggleDark}
                    className="p-2 text-white/80 hover:text-[#FB923C]"
                    aria-label={t('Alternar tema', 'Toggle theme')}
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN CONTENT VIEWPORT */}
        <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-5 pb-24 lg:pb-10">
          <motion.div
            key={`${activeScreen}-${activeRole}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav
          aria-label={t('Navegação rápida móvel', 'Mobile quick navigation')}
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white/95 dark:bg-[#0C1833]/95 backdrop-blur-md border-t border-[#E2E8F0] dark:border-[#1E325C] grid grid-cols-4 items-center px-1"
        >
          {[
            {
              id: 'dashboard' as ScreenId,
              label: t('Início', 'Home'),
              icon: NavHomeIcon,
              isActive: activeScreen === 'dashboard',
              badge: 0,
            },
            {
              id: 'messages' as ScreenId,
              label: t('Mensagens', 'Messages'),
              icon: NavMessagesIcon,
              isActive: activeScreen === 'messages',
              badge: unreadMessages,
            },
            {
              id: 'requests' as ScreenId,
              label: t('Pedidos', 'Requests'),
              icon: NavOrdersIcon,
              isActive: ['requests', 'request-detail', 'create-request'].includes(activeScreen),
              badge: 0,
            },
            {
              id: (activeRole === 'customer' ? 'customer-profile' : 'provider-onboarding') as ScreenId,
              label: t('Perfil', 'Profile'),
              icon: activeRole === 'customer' ? NavProfileIcon : Briefcase,
              isActive: ['customer-profile', 'provider-onboarding', 'settings'].includes(activeScreen),
              badge: 0,
            },
          ].map((item) => {
            const Icon = item.icon;
            const activeClass =
              activeRole === 'customer'
                ? 'text-[#1D6FE5] dark:text-[#60A5FA]'
                : 'text-[#F97316] dark:text-[#FB923C]';
            const barClass =
              activeRole === 'customer'
                ? 'bg-[#1D6FE5] dark:bg-[#60A5FA]'
                : 'bg-[#F97316] dark:bg-[#FB923C]';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                aria-current={item.isActive ? 'page' : undefined}
                className={`relative min-h-[44px] h-full flex flex-col items-center justify-center gap-1 text-[11px] leading-none transition-colors whitespace-nowrap ${
                  item.isActive
                    ? `${activeClass} font-semibold`
                    : 'text-[#475569] dark:text-[#94A3B8] font-medium'
                }`}
              >
                {item.isActive && (
                  <span
                    aria-hidden="true"
                    className={`absolute top-0 w-8 h-0.5 rounded-full ${barClass}`}
                  />
                )}
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
