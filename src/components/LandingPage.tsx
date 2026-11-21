import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Compass,
  Cpu,
  FileCheck2,
  Hammer,
  Handshake,
  HardHat,
  Headphones,
  Home,
  Laptop,
  Lock,
  MapPin,
  Menu,
  MessageSquare,
  Moon,
  Palette,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Truck,
  User,
  Users,
  Utensils,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import {
  ANGOLA_MUNICIPALITIES,
  CATERING_TABLE_IMAGE,
  HERO_IMAGE,
  INITIAL_PROFESSIONALS,
  NETWORK_OFFICE_IMAGE,
  SOLAR_ARTISAN_IMAGE,
  STUDIO_CRAFT_IMAGE,
} from '../data/saluData';
import { UserRole } from '../types/salu';
import { useLang } from '../i18n/translations';
import {
  CornerCraftMotif,
  GeometricSoulDivider,
  LuandaNightBackdrop,
  SafeAvatar,
  SafeBannerImage,
  SaluRibbonMark,
} from './ui/Primitives';
import {
  CatCleaningIcon,
  CatConstructionIcon,
  CatHomeIcon,
  CatRepairsIcon,
  CatTechIcon,
} from './ui/SaluIcons';

interface LandingPageProps {
  onStartRole: (role: UserRole) => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  onQuickExplore: (
    role: UserRole,
    searchQuery?: string,
    category?: string,
    municipality?: string
  ) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const MUNICIPALITY_MARQUEE = [
  'Talatona · Luanda',
  'Maianga · Luanda',
  'Ingombota & Miramar',
  'Kilamba · Luanda',
  'Viana Industrial',
  'Benguela & Lobito',
  'Lubango · Huíla',
  'Huambo · Centro',
  'Cabinda · Norte',
  'Cacuaco · Luanda',
];

export function LandingPage({
  onStartRole,
  onOpenAuth,
  onQuickExplore,
  darkMode,
  onToggleDark,
}: LandingPageProps) {
  const { lang, setLang, t } = useLang();
  const [heroQuery, setHeroQuery] = useState('');
  const [heroArea, setHeroArea] = useState('Luanda');
  const [exploreMenuOpen, setExploreMenuOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [detectingGeo, setDetectingGeo] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleDetectGeo = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu dispositivo.');
      return;
    }
    setDetectingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        let detected = 'Talatona, Luanda';
        if (lat > -8.83) detected = 'Maianga, Luanda';
        else if (lat < -8.89) detected = 'Kilamba, Luanda';
        setHeroArea(detected);
        setGeoNotice(detected);
        setDetectingGeo(false);
      },
      () => {
        setDetectingGeo(false);
      },
      { timeout: 6000 }
    );
  };

  const HERO_QUICK_CATEGORIES = [
    {
      label: t('Reparação', 'Repairs'),
      icon: Wrench,
      query: 'Eletricidade',
      category: 'Electrical & Solar',
    },
    {
      label: t('Tecnologia', 'Technology'),
      icon: Laptop,
      query: 'TI',
      category: 'IT & Networks',
    },
    {
      label: t('Construção', 'Construction'),
      icon: HardHat,
      query: 'Arquitetura',
      category: 'Architecture & Renovation',
    },
    {
      label: t('Limpeza', 'Cleaning'),
      icon: Sparkles,
      query: 'Limpeza',
      category: 'Cleaning & Maintenance',
    },
    {
      label: t('Transporte', 'Transport'),
      icon: Truck,
      query: 'Transporte',
      category: 'Transport & Logistics',
    },
  ];

  const TRUST_PILLARS = [
    {
      icon: ShieldCheck,
      line1: t('Seguro e confiável', 'Safe and reliable'),
      line2: t('em cada negociação', 'in every negotiation'),
    },
    {
      icon: Zap,
      line1: t('Conexão rápida', 'Fast connection'),
      line2: t('com profissionais', 'with professionals'),
    },
    {
      icon: Star,
      line1: t('Avaliações reais', 'Verified reviews'),
      line2: t('para sua segurança', 'for your safety'),
    },
    {
      icon: Headphones,
      line1: t('Suporte dedicado', 'Dedicated support'),
      line2: t('sempre ao seu lado', 'always by your side'),
    },
  ];

  const FEATURED_CATEGORIES = [
    {
      label: t('Tecnologia', 'Technology'),
      icon: CatTechIcon,
      colorClass: 'text-[#1D6FE5] dark:text-[#60A5FA]',
      bgClass: 'bg-[#EFF6FF] dark:bg-[#1D6FE5]/15',
      category: 'IT & Networks',
    },
    {
      label: t('Construção', 'Construction'),
      icon: CatConstructionIcon,
      colorClass: 'text-[#F97316] dark:text-[#FB923C]',
      bgClass: 'bg-[#FFF7ED] dark:bg-[#F97316]/15',
      category: 'Architecture & Renovation',
    },
    {
      label: t('Limpeza', 'Cleaning'),
      icon: CatCleaningIcon,
      colorClass: 'text-[#1D6FE5] dark:text-[#60A5FA]',
      bgClass: 'bg-[#EFF6FF] dark:bg-[#1D6FE5]/15',
      category: 'Cleaning & Maintenance',
    },
    {
      label: t('Reparações', 'Repairs'),
      icon: CatRepairsIcon,
      colorClass: 'text-[#F97316] dark:text-[#FB923C]',
      bgClass: 'bg-[#FFF7ED] dark:bg-[#F97316]/15',
      category: 'Electrical & Solar',
    },
    {
      label: t('Serviços Gerais', 'Home & General'),
      icon: CatHomeIcon,
      colorClass: 'text-[#F97316] dark:text-[#FB923C]',
      bgClass: 'bg-[#FFF7ED] dark:bg-[#F97316]/15',
      category: 'Plumbing & HVAC',
    },
  ];

  const CUSTOMER_SPECIALTIES = [
    {
      label: t('Eletricidade & Solar', 'Electrical & Solar'),
      sub: t('Inversores e quadros', 'Inverters & panels'),
      icon: Zap,
      cat: 'Electrical & Solar',
    },
    {
      label: t('Arquitetura & Obras', 'Architecture & Fit-Outs'),
      sub: t('Casas e escritórios', 'Homes & offices'),
      icon: Building2,
      cat: 'Architecture & Renovation',
    },
    {
      label: t('TI & Redes', 'IT & Networks'),
      sub: t('Wi-Fi, CCTV e servidores', 'Wi-Fi, CCTV & servers'),
      icon: Cpu,
      cat: 'IT & Networks',
    },
    {
      label: t('Canalização & AVAC', 'Plumbing & HVAC'),
      sub: t('Diagnóstico e climatização', 'Diagnostics & AC'),
      icon: Wrench,
      cat: 'Plumbing & HVAC',
    },
    {
      label: t('Catering & Eventos', 'Catering & Events'),
      sub: t('Corporativo e privado', 'Corporate & private'),
      icon: Utensils,
      cat: 'Catering & Events',
    },
    {
      label: t('Jurídico & Contabilidade', 'Legal & Accounting'),
      sub: t('Conformidade PME', 'SME compliance'),
      icon: Calculator,
      cat: 'Legal & Accounting',
    },
    {
      label: t('Transporte & Logística', 'Transport & Logistics'),
      sub: t('Luanda e províncias', 'Luanda & provinces'),
      icon: Truck,
      cat: 'Transport & Logistics',
    },
    {
      label: t('Limpeza & Manutenção', 'Cleaning & Maintenance'),
      sub: t('Manutenção periódica', 'Scheduled upkeep'),
      icon: Hammer,
      cat: 'Cleaning & Maintenance',
    },
  ];

  const PROVIDER_OPPORTUNITIES = [
    {
      label: t('Projetos Residenciais', 'Residential Projects'),
      sub: t('Pedidos diretos de clientes', 'Direct homeowner jobs'),
      icon: Search,
    },
    {
      label: t('Contratos Corporativos', 'Corporate Retainers'),
      sub: t('Avenças mensais PME', 'Recurring SME contracts'),
      icon: Briefcase,
    },
    {
      label: t('Diagnósticos Técnicos', 'Technical Diagnostics'),
      sub: t('Visitas técnicas pagas', 'Paid site inspections'),
      icon: Wrench,
    },
    {
      label: t('Remodelações Chave-na-Mão', 'Turnkey Renovations'),
      sub: t('Acordos por etapas', 'Milestone agreements'),
      icon: Building2,
    },
    {
      label: t('Consultoria Remota', 'Remote Consulting'),
      sub: t('Finanças, jurídico e TI', 'Finance, legal & IT'),
      icon: Cpu,
    },
    {
      label: t('Eventos & Hotelaria', 'Event & Hospitality'),
      sub: t('Reservas verificadas', 'Verified bookings'),
      icon: Utensils,
    },
    {
      label: t('Atendimento de Urgência', 'Emergency Dispatch'),
      sub: t('Pedidos urgentes em Luanda', 'Same-day Luanda needs'),
      icon: Zap,
    },
    {
      label: t('Subcontratação de Equipas', 'Team Subcontracting'),
      sub: t('Escala para pequenas empresas', 'Small business scale'),
      icon: Handshake,
    },
  ];

  const SHOWCASE_STEPS = [
    {
      id: 'discover',
      stepNumber: '01',
      title: t('Descubra e Compare Visualmente', 'Discover & Compare Visually'),
      subtitle: t(
        'Pesquise especialistas locais por município, tarifas indicativas transparentes em Kwanzas, estado de verificação e métricas reais de fiabilidade.',
        'Browse local Luanda specialists by municipality, transparent Kwanza starting rates, verified license status, and multi-dimensional reliability metrics.'
      ),
      highlight: t('Mercado Inteligente', 'Smart Marketplace'),
      ctaLabel: t('Ver Profissionais', 'Browse Professionals'),
      role: 'customer' as UserRole,
    },
    {
      id: 'proposals',
      stepNumber: '02',
      title: t('Propostas Estruturadas & Chat Direto', 'Structured Quotes & Direct Chat'),
      subtitle: t(
        'Publique um pedido uma vez e receba propostas lado a lado — ou explore pedidos ativos como prestador e negocie dentro da SALU ou WhatsApp.',
        'Publish a service request once and receive side-by-side Kwanza proposals—or browse active client requests as a provider and negotiate inside SALU or WhatsApp.'
      ),
      highlight: t('Clareza Bilateral', 'Bilateral Clarity'),
      ctaLabel: t('Explorar Oportunidades', 'Explore Opportunities'),
      role: 'provider' as UserRole,
    },
    {
      id: 'agreement',
      stepNumber: '03',
      title: t('Acordos Privados em Kwanzas', 'Private Kwanza Agreements'),
      subtitle: t(
        'Feche entregáveis, datas de início e honorários totais em Kwanzas em privado entre ambas as partes. Os preços finais não aparecem em pesquisas públicas.',
        'Lock agreed deliverables, start dates, and total Kwanza fees privately between both parties. Agreed pricing stays off public search feeds by default.'
      ),
      highlight: t('Registo Privado', 'Private Record'),
      ctaLabel: t('Ver Fluxo de Acordo', 'See Agreement Flow'),
      role: 'customer' as UserRole,
    },
    {
      id: 'completion',
      stepNumber: '04',
      title: t('Confirmação Dupla & Confiança Mútua', 'Dual Sign-Off & Two-Way Trust'),
      subtitle: t(
        'Acompanhe cada etapa em 10 estados claros até que Cliente e Prestador confirmem a conclusão e troquem avaliações bilaterais estruturadas.',
        'Track every stage across 10 explicit states until both Customer and Service Provider confirm completion and exchange structured reliability reviews.'
      ),
      highlight: t('Reputação Partilhada', 'Shared Reputation'),
      ctaLabel: t('Ver Área de Trabalho', 'View Live Workspace'),
      role: 'provider' as UserRole,
    },
  ];

  const activeStep = SHOWCASE_STEPS[activeStepIdx];
  const featuredPro = INITIAL_PROFESSIONALS[0];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedArea = heroArea === 'ALL' ? undefined : heroArea;
    onQuickExplore('customer', heroQuery.trim(), undefined, resolvedArea);
  };

  const handlePrevStep = () => {
    setActiveStepIdx((prev) => (prev === 0 ? SHOWCASE_STEPS.length - 1 : prev - 1));
  };

  const handleNextStep = () => {
    setActiveStepIdx((prev) => (prev === SHOWCASE_STEPS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060E20] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* HERO & INTEGRATED NOCTURNAL HEADER */}
      <div className="relative bg-[#061534] text-white overflow-hidden">
        <LuandaNightBackdrop variant="hero" />

        {/* TOP NAVIGATION BAR */}
        <header className="relative z-30 border-b border-white/10 bg-[#061534]/55 backdrop-blur-md">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-4">
            {/* Brand Lockup */}
            <a
              href="#top"
              className="flex items-center gap-3 shrink-0 group focus-visible:outline-[#F97316]"
            >
              <SaluRibbonMark size={40} />
              <div className="leading-none">
                <span className="font-display text-2xl font-bold tracking-tight text-white block">
                  SALU
                </span>
                <span className="text-[10px] sm:text-[11px] text-white/75 tracking-wide block mt-0.5 whitespace-nowrap">
                  {t('Serviços · Oportunidades · Confiança', 'Services · Opportunities · Trust')}
                </span>
              </div>
            </a>

            {/* Primary Nav Links */}
            <nav
              aria-label={t('Navegação principal', 'Primary navigation')}
              className="hidden lg:flex items-center gap-6 text-sm font-medium"
            >
              <a
                href="#top"
                className="inline-flex items-center gap-1.5 text-white font-semibold border-b-2 border-[#F97316] pb-1 whitespace-nowrap shrink-0"
              >
                <Home className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                <span>{t('Início', 'Home')}</span>
              </a>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExploreMenuOpen((o) => !o)}
                  className="inline-flex items-center gap-1 text-white/85 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1"
                >
                  <span>{t('Explorar', 'Explore')}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>
                {exploreMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setExploreMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute left-0 top-9 z-30 w-64 bg-[#081C41] border border-[#1E3A70] rounded-xl shadow-2xl p-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setExploreMenuOpen(false);
                          onQuickExplore('customer');
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <p className="text-xs font-semibold text-[#60A5FA]">
                          {t('Mercado de Serviços', 'Service Marketplace')}
                        </p>
                        <p className="text-[11px] text-white/70">
                          {t('Encontre profissionais verificados', 'Find verified professionals')}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExploreMenuOpen(false);
                          onQuickExplore('provider');
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <p className="text-xs font-semibold text-[#FB923C]">
                          {t('Oportunidades Abertas', 'Open Opportunities')}
                        </p>
                        <p className="text-[11px] text-white/70">
                          {t('Responda a pedidos ativos de clientes', 'Submit proposals to active requests')}
                        </p>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <a
                href="#how-it-works"
                className="text-white/85 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1"
              >
                {t('Como Funciona', 'How It Works')}
              </a>

              <a
                href="#about-salu"
                className="text-white/85 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1"
              >
                {t('Sobre o SALU', 'About SALU')}
              </a>

              <a
                href="#trust"
                className="text-white/85 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1"
              >
                {t('Ajuda', 'Help')}
              </a>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Compact PT/EN Toggle */}
              <div className="hidden sm:inline-flex items-center p-0.5 bg-white/10 border border-white/15 rounded-full text-[11px]">
                <button
                  type="button"
                  onClick={() => setLang('pt')}
                  className={`px-2 py-1 rounded-full font-semibold transition-colors ${
                    lang === 'pt' ? 'bg-white text-[#061534]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  PT
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 rounded-full font-semibold transition-colors ${
                    lang === 'en' ? 'bg-white text-[#061534]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Notification Bell with Badge */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifPopoverOpen((o) => !o)}
                  aria-label={t('Notificações recentes', 'Recent notifications')}
                  className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F97316] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    2
                  </span>
                </button>

                {notifPopoverOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setNotifPopoverOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-11 z-30 w-72 bg-[#081C41] border border-[#1E3A70] rounded-xl shadow-2xl p-3 space-y-2.5 text-left">
                      <p className="text-xs font-semibold text-white/90 border-b border-white/10 pb-2">
                        {t('Atividade Recente na Rede', 'Recent Network Activity')}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifPopoverOpen(false);
                          onQuickExplore('customer');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <p className="text-xs font-semibold text-white">
                          {t('3 novas propostas recebidas', '3 new proposals received')}
                        </p>
                        <p className="text-[11px] text-white/70">
                          {t('Instalação Solar Híbrida · Talatona', 'Hybrid Solar Setup · Talatona')}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifPopoverOpen(false);
                          onQuickExplore('provider');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <p className="text-xs font-semibold text-white">
                          {t('Novo pedido urgente em Maianga', 'New urgent request in Maianga')}
                        </p>
                        <p className="text-[11px] text-white/70">
                          {t('Quadro Trifásico · Clínica Esperança', 'Three-Phase Panel · Clinic')}
                        </p>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium text-white border border-white/30 hover:border-white hover:bg-white/10 rounded-full transition-colors whitespace-nowrap shrink-0"
              >
                {t('Entrar', 'Sign In')}
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#FF7E00] to-[#F97316] hover:from-[#EA580C] hover:to-[#C2410C] rounded-full shadow-md transition-all whitespace-nowrap shrink-0"
              >
                <span>{t('Criar Conta', 'Create Account')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-2 text-white/90 hover:text-white"
                aria-label={t('Abrir menu', 'Open navigation menu')}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <div
              className="fixed inset-0 bg-black/60"
              onClick={() => setMobileDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 w-72 max-w-[85vw] bg-[#081C41] text-white h-full p-5 flex flex-col justify-between border-l border-white/15">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg">SALU</span>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    aria-label={t('Fechar menu', 'Close menu')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onQuickExplore('customer');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg bg-white/10 font-medium"
                  >
                    {t('Explorar Serviços', 'Explore Services')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onQuickExplore('provider');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10"
                  >
                    {t('Oportunidades para Prestadores', 'Provider Opportunities')}
                  </button>
                  <a
                    href="#how-it-works"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="block px-3 py-2.5 rounded-lg hover:bg-white/10"
                  >
                    {t('Como Funciona', 'How It Works')}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg border border-white/25"
                  >
                    {t('Entrar', 'Sign In')}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/15">
                <div className="inline-flex bg-white/10 rounded-full p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setLang('pt')}
                    className={`px-2.5 py-1 rounded-full font-semibold ${
                      lang === 'pt' ? 'bg-white text-[#061534]' : 'text-white/80'
                    }`}
                  >
                    PT
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-1 rounded-full font-semibold ${
                      lang === 'en' ? 'bg-white text-[#061534]' : 'text-white/80'
                    }`}
                  >
                    EN
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onToggleDark}
                  className="p-2 rounded-lg bg-white/10 text-white"
                  aria-label={t('Alternar tema', 'Toggle theme')}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HERO CONTENT */}
        <section id="top" className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Hero Statement, Unified Search Bar & Quick Category Chips */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:col-span-8 space-y-6"
            >
              <h1
                className="font-display font-bold tracking-tight text-white leading-[1.06]"
                style={{ fontSize: 'clamp(2.2rem, 4.4vw, 3.65rem)', textWrap: 'balance' }}
              >
                {lang === 'pt' ? (
                  <>
                    Onde as habilidades
                    <br className="hidden sm:inline" /> existem, as{' '}
                    <span className="text-[#F97316]">oportunidades</span>{' '}
                    <br className="hidden sm:inline" />
                    também.
                  </>
                ) : (
                  <>
                    Where skills exist,{' '}
                    <span className="text-[#F97316]">opportunities</span>
                    <br className="hidden sm:inline" /> should thrive across Angola.
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-white/85 max-w-xl leading-relaxed">
                {t(
                  'Encontre serviços, resolva seus problemas e descubra novas oportunidades.',
                  'Find trusted services, solve everyday problems, and discover new opportunities.'
                )}
              </p>

              {/* Unified Search Pill */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white rounded-2xl sm:rounded-full p-2 sm:pl-5 shadow-2xl border border-white/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 px-2 sm:px-0 py-1.5 sm:py-0">
                  <Search className="w-4 h-4 text-[#64748B] shrink-0" aria-hidden="true" />
                  <input
                    type="text"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    placeholder={t('O que você precisa?', 'What service do you need?')}
                    className="w-full text-sm text-[#0F172A] placeholder:text-[#64748B] bg-transparent border-none focus:outline-none focus:ring-0"
                  />
                </div>

                <div className="hidden sm:block h-7 w-px bg-[#E2E8F0]" aria-hidden="true" />

                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-0 border-t sm:border-t-0 border-[#E2E8F0]">
                  <MapPin className="w-4 h-4 text-[#081C41] shrink-0" aria-hidden="true" />
                  <select
                    value={heroArea}
                    onChange={(e) => {
                      setHeroArea(e.target.value);
                      setGeoNotice(null);
                    }}
                    aria-label={t('Selecionar localização', 'Select location')}
                    className="text-sm font-medium text-[#0F172A] bg-transparent border-none focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="Luanda">Luanda</option>
                    <option value="ALL">{t('Toda Angola', 'All Angola')}</option>
                    {ANGOLA_MUNICIPALITIES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleDetectGeo}
                    title={t('Detectar minha localização real', 'Detect my real location')}
                    className="p-1 rounded-full hover:bg-slate-100 text-[#1D6FE5] transition-colors cursor-pointer"
                  >
                    <Compass className={`w-4 h-4 ${detectingGeo ? 'animate-spin text-[#F97316]' : ''}`} />
                  </button>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#FF7E00] to-[#F97316] hover:from-[#EA580C] hover:to-[#C2410C] rounded-xl sm:rounded-full shadow-md transition-all whitespace-nowrap shrink-0"
                >
                  <span>{t('Pesquisar', 'Search')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {geoNotice && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FDBA74] px-2 py-0.5 animate-pulse">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Localização confirmada: {geoNotice}</span>
                </div>
              )}

              {/* Quick Category Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {HERO_QUICK_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() =>
                        onQuickExplore('customer', '', cat.category, heroArea === 'ALL' ? undefined : heroArea)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white/90 hover:text-white bg-[#0A2252]/75 hover:bg-[#112E68] border border-white/15 rounded-full backdrop-blur-sm transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#93C5FD]" aria-hidden="true" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => onQuickExplore('customer')}
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full backdrop-blur-sm transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
                  <span>{t('Ver mais', 'See more')}</span>
                </button>
              </div>
            </motion.div>

            {/* Right Floating Skyline Glass Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="lg:col-span-4 flex lg:justify-end"
            >
              <div className="bg-[#061534]/75 backdrop-blur-md border border-white/15 rounded-2xl px-6 py-5 text-center max-w-xs w-full shadow-xl space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 mx-auto flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <p className="font-display text-sm sm:text-base font-semibold text-white leading-snug">
                  {t(
                    'Conectando pessoas, impulsionando Angola.',
                    'Connecting people, moving Angola forward.'
                  )}
                </p>
                <div className="w-10 h-0.5 bg-[#F97316] mx-auto rounded-full" aria-hidden="true" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 4-PILLAR DARK NAVY TRUST STRIP */}
        <section className="relative z-10 bg-[#051433]/92 backdrop-blur border-t border-white/10">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              {TRUST_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.line1}
                    className="flex items-center gap-3.5 py-2.5 sm:py-1 sm:px-5 first:sm:pl-0"
                  >
                    <span className="w-9 h-9 rounded-full border border-[#F97316]/50 bg-[#F97316]/12 text-[#F97316] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div className="text-xs leading-tight">
                      <p className="font-semibold text-white">{pillar.line1}</p>
                      <p className="text-white/75 mt-0.5">{pillar.line2}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <main>
        {/* WHITE BOTTOM FOLD: "O que você deseja fazer?" & "Categorias em destaque" */}
        <section className="relative bg-white dark:bg-[#09142B] pt-10 pb-14 border-b border-[#E2E8F0] dark:border-[#1E325C] overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left 7 Cols: Role Choice Cards */}
              <div className="lg:col-span-7 space-y-5 lg:pr-8 lg:border-r border-[#E2E8F0] dark:border-[#1E325C]">
                <div>
                  <div className="w-8 h-0.5 bg-[#F97316] mb-2 rounded-full" aria-hidden="true" />
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#081C41] dark:text-white">
                    {t('O que você deseja fazer?', 'What would you like to do?')}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
                    {t('Escolha o seu perfil e comece agora:', 'Choose your path and start now:')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Customer (Soft Cobalt Blue) */}
                  <button
                    type="button"
                    onClick={() => onStartRole('customer')}
                    className="group text-left bg-[#EFF6FF] hover:bg-[#DBEAFE]/70 dark:bg-[#1D6FE5]/15 dark:hover:bg-[#1D6FE5]/25 border border-[#BFDBFE] dark:border-[#1D6FE5]/40 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-11 h-11 rounded-xl bg-white dark:bg-[#0C1833] border border-[#BFDBFE] dark:border-[#1D6FE5]/40 text-[#1D6FE5] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base text-[#081C41] dark:text-white leading-snug">
                          {t('Preciso de um serviço', 'I need a service')}
                        </h3>
                        <p className="text-xs text-[#475569] dark:text-[#CBD5E1] mt-1 leading-relaxed">
                          {t(
                            'Encontre profissionais e resolva seu problema.',
                            'Find vetted pros and solve your task.'
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-[#1D6FE5] text-white flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>

                  {/* Card 2: Provider (Soft Vibrant Orange) */}
                  <button
                    type="button"
                    onClick={() => onStartRole('provider')}
                    className="group text-left bg-[#FFF7ED] hover:bg-[#FFEDD5]/75 dark:bg-[#F97316]/15 dark:hover:bg-[#F97316]/25 border border-[#FED7AA] dark:border-[#F97316]/40 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-11 h-11 rounded-xl bg-white dark:bg-[#0C1833] border border-[#FED7AA] dark:border-[#F97316]/40 text-[#F97316] dark:text-[#FB923C] flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base text-[#081C41] dark:text-white leading-snug">
                          {t('Quero prestar serviços', 'I want to provide services')}
                        </h3>
                        <p className="text-xs text-[#475569] dark:text-[#CBD5E1] mt-1 leading-relaxed">
                          {t(
                            'Ofereça suas habilidades e encontre oportunidades.',
                            'Offer your skills and win local work.'
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Right 5 Cols: Featured Categories */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="w-8 h-0.5 bg-[#F97316] mb-2 rounded-full" aria-hidden="true" />
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[#081C41] dark:text-white">
                      {t('Categorias em destaque', 'Featured categories')}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => onQuickExplore('customer')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA] hover:underline whitespace-nowrap shrink-0"
                  >
                    <span>{t('Ver todas', 'View all')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {FEATURED_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => onQuickExplore('customer', '', cat.category)}
                        className="group bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#1D6FE5] dark:hover:border-[#F97316] rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-2.5 transition-all hover:-translate-y-0.5"
                      >
                        <span
                          className={`w-10 h-10 rounded-xl ${cat.bgClass} ${cat.colorClass} flex items-center justify-center group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="text-[11px] font-semibold text-[#081C41] dark:text-[#F8FAFC] leading-tight">
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Signature Curved Navy & Orange Wave Transition */}
          <div className="w-full overflow-hidden leading-none mt-8 -mb-14" aria-hidden="true">
            <svg
              viewBox="0 0 1440 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-10 sm:h-14"
              preserveAspectRatio="none"
            >
              <path
                d="M0 10 C320 68 960 68 1440 16 L1440 72 L0 72 Z"
                fill="#061534"
              />
              <path
                d="M0 10 C220 48 480 62 760 56"
                stroke="#F97316"
                strokeWidth="4"
                fill="none"
              />
            </svg>
          </div>
        </section>

        {/* DARK NAVY MUNICIPALITY BAND + MARQUEE */}
        <section id="about-salu" className="relative bg-[#061534] text-white py-14 overflow-hidden">
          <CornerCraftMotif />
          <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight max-w-2xl mx-auto text-white">
              {t(
                'A ligar competências práticas e necessidades reais em toda Angola',
                'Connecting practical skills and real service needs across Angola'
              )}
            </h2>
            <p className="text-sm text-white/80 max-w-xl mx-auto">
              {t(
                'Do profissional independente e pequeno negócio às equipas técnicas, com acordos transparentes e acompanhamento direto.',
                'From independent professionals and small workshops to technical teams, with clear agreements and direct tracking.'
              )}
            </p>
          </div>

          <div className="mt-8 border-y border-white/10 bg-[#041029]/80 py-3.5 overflow-hidden">
            <div className="animate-salu-marquee gap-8 items-center">
              {[...MUNICIPALITY_MARQUEE, ...MUNICIPALITY_MARQUEE].map((hub, idx) => (
                <div
                  key={`${hub}-${idx}`}
                  className="inline-flex items-center gap-2.5 text-sm font-medium text-white/90 whitespace-nowrap px-4"
                >
                  <MapPin className="w-4 h-4 text-[#F97316] shrink-0" aria-hidden="true" />
                  <span>{hub}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-6 pt-8 flex justify-center relative z-10">
            <button
              type="button"
              onClick={() => onQuickExplore('customer')}
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold bg-white text-[#081C41] hover:bg-[#EFF6FF] rounded-full transition-colors shadow-md"
            >
              <Compass className="w-4 h-4 text-[#1D6FE5]" />
              <span>{t('Explorar Mercado em Direto', 'Explore Live Marketplace')}</span>
            </button>
          </div>
        </section>

        {/* ECOSYSTEM SHOWCASE & BILATERAL PROOF */}
        <section className="max-w-[1200px] mx-auto px-6 py-16 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F97316]">
              {t('Fiabilidade Local Mensurável', 'Measurable Local Reliability')}
            </p>
            <h2
              className="font-display font-bold tracking-tight text-[#081C41] dark:text-white"
              style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.85rem)', textWrap: 'balance' }}
            >
              {t('Feito por angolanos qualificados,', 'Built by skilled Angolans,')}{' '}
              <span className="text-[#1D6FE5] dark:text-[#60A5FA]">
                {t('verificado em cada serviço.', 'verified on every job.')}
              </span>
            </h2>
            <p className="text-base text-[#475569] dark:text-[#94A3B8]">
              {t(
                'Cada serviço concluído gera confiança mútua entre municípios — transformando recomendações locais em reputação digital duradoura.',
                'Every completed service builds two-way trust across municipalities—turning word-of-mouth into durable digital reputation.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4 space-y-5">
              <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E325C] h-56 relative">
                <SafeBannerImage
                  src={STUDIO_CRAFT_IMAGE}
                  alt="Luanda interior architecture studio"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#0C1833]/95 backdrop-blur px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E325C]">
                  <p className="text-xs font-semibold text-[#081C41] dark:text-white">
                    Engrácia Domingos · Miramar
                  </p>
                </div>
              </div>

              <div className="bg-[#081C41] text-white rounded-2xl p-6 shadow-md space-y-2">
                <p className="font-display text-lg font-bold text-[#F97316]">
                  {t('Acordo Bilateral Privado', 'Private Bilateral Agreement')}
                </p>
                <p className="text-sm font-normal text-white/85 leading-relaxed">
                  {t(
                    'Escopo, prazos de execução e valor em Kwanzas definidos com clareza antes do início dos trabalhos.',
                    'Clear scope, deadlines and Kwanza prices agreed upfront before any work starts.'
                  )}
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-5">
              <div className="bg-[#1D6FE5] text-white rounded-2xl p-6 shadow-md space-y-2">
                <p className="font-display text-lg font-bold text-white">
                  {t('Confirmação de Conclusão', 'Completion Confirmation')}
                </p>
                <p className="text-sm font-normal text-white/90 leading-relaxed">
                  {t(
                    'O prestador submete as provas da conclusão e o cliente valida a entrega antes de fechar o ciclo.',
                    'The provider submits completion proof and the client validates the work before closing.'
                  )}
                </p>
              </div>

              <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E325C] h-64 relative">
                <SafeBannerImage
                  src={NETWORK_OFFICE_IMAGE}
                  alt="Network specialist installing office fiber and Wi-Fi"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#0C1833]/95 backdrop-blur px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E325C]">
                  <p className="text-xs font-semibold text-[#081C41] dark:text-white">
                    Cláudio Ngunza · Maianga
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-5">
              <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E325C] h-56 relative">
                <SafeBannerImage
                  src={CATERING_TABLE_IMAGE}
                  alt="Angolan catering service table setup in Kilamba"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#0C1833]/95 backdrop-blur px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E325C]">
                  <p className="text-xs font-semibold text-[#081C41] dark:text-white">
                    Joana Tchissingui · Kilamba
                  </p>
                </div>
              </div>

              <div className="bg-[#F97316] text-white rounded-2xl p-6 shadow-md">
                <p className="font-mono tabular-nums text-4xl font-bold">
                  {t('10 Estados', '10 States')}
                </p>
                <p className="text-sm font-medium text-white/90 mt-1">
                  {t('Ciclo explícito desde o Rascunho até à Conclusão Bilateral', 'Explicit lifecycle from Draft through Bilateral Completion')}
                </p>
              </div>
            </div>
          </div>

          {/* Editorial Privacy & Opportunity Splits */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-4">
            <div className="lg:col-span-5 bg-[#EFF6FF] dark:bg-[#1D6FE5]/15 border border-[#BFDBFE] dark:border-[#1D6FE5]/35 rounded-3xl p-8 flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA]">
                  <ShieldCheck className="w-4 h-4" />
                  {t('Identidade Verificada & Portfólio', 'Verified Identity & Portfolio Proof')}
                </span>
                <h3 className="font-display text-2xl font-bold text-[#081C41] dark:text-white">
                  {t(
                    'Mostre o seu talento com clareza — mesmo sem anos de papelada formal.',
                    'Showcase craft cleanly—even without years of formal papers.'
                  )}
                </h3>
                <p className="text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                  {t(
                    'A experiência anterior é opcional ao registar-se como prestador. Jovens talentosos e técnicos independentes ganham confiança com trabalhos concluídos, provas fotográficas e pontualidade.',
                    'Prior experience is optional when registering as a provider. Skilled youth and independent technicians earn trust directly through completed jobs, photo proof, and on-time delivery.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartRole('provider')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D6FE5] dark:text-[#60A5FA] hover:underline underline-offset-4 w-fit"
              >
                <span>{t('Criar Perfil de Prestador', 'Create Provider Profile')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E325C] min-h-[260px]">
              <SafeBannerImage
                src={HERO_IMAGE}
                alt="Client and service provider reviewing digital project agreement"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 grid grid-cols-12 gap-4">
              <div className="col-span-7 rounded-3xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E325C] min-h-[240px]">
                <SafeBannerImage
                  src={SOLAR_ARTISAN_IMAGE}
                  alt="Angolan technician calibrating hybrid solar inverter"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-5 rounded-3xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E325C] min-h-[240px]">
                <SafeBannerImage
                  src={STUDIO_CRAFT_IMAGE}
                  alt="Architect inspecting interior finishes"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FFF7ED] dark:bg-[#F97316]/15 border border-[#FED7AA] dark:border-[#F97316]/35 rounded-3xl p-8 flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EA580C] dark:text-[#FB923C]">
                  <Lock className="w-4 h-4" />
                  {t('Acordos Privados em Kwanzas', 'Private Kwanza Agreements')}
                </span>
                <h3 className="font-display text-2xl font-bold text-[#081C41] dark:text-white">
                  {t(
                    'O preço final acordado fica estritamente entre cliente e prestador.',
                    'Final agreed pricing stays strictly between client and provider.'
                  )}
                </h3>
                <p className="text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                  {t(
                    'Embora os prestadores possam mostrar valores iniciais orientativos, os termos finais em Kwanzas, entregáveis e prazos permanecem privados no acordo bilateral assinado.',
                    'While providers can display optional starting guidance, final agreed Kwanza terms, deliverables, and timelines remain private inside the signed bilateral agreement.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onQuickExplore('customer')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#EA580C] dark:text-[#FB923C] hover:underline underline-offset-4 w-fit"
              >
                <span>{t('Inspecionar Área de Acordo', 'Inspect Agreement Workspace')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        <GeometricSoulDivider className="max-w-[1200px] mx-auto px-6" />

        {/* INTERACTIVE STEPPED SHOWCASE SLIDER */}
        <section id="how-it-works" className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F97316]">
                  {t('Como Funciona a SALU', 'How SALU Works')}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#081C41] dark:text-white">
                  {t('Cada etapa fica', 'Every step stays')}{' '}
                  <span className="text-[#1D6FE5] dark:text-[#60A5FA]">
                    {t('clara e segura', 'clear & safe')}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {SHOWCASE_STEPS.map((step, index) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStepIdx(index)}
                    className={`py-2 px-3 rounded-xl font-mono text-xs font-semibold border transition-all ${
                      activeStepIdx === index
                        ? 'bg-[#081C41] dark:bg-[#F97316] text-white border-[#081C41] dark:border-[#F97316]'
                        : 'bg-white dark:bg-[#0C1833] text-[#475569] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#1D6FE5]'
                    }`}
                  >
                    {step.stepNumber}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-3xl p-6 space-y-4">
                <p className="text-xs font-mono uppercase tracking-wider text-[#1D6FE5] dark:text-[#60A5FA]">
                  {t('Etapa', 'Step')} {activeStep.stepNumber} · {activeStep.highlight}
                </p>
                <h3 className="font-display text-2xl font-bold text-[#081C41] dark:text-white">
                  {activeStep.title}
                </h3>
                <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  {activeStep.subtitle}
                </p>

                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => onQuickExplore(activeStep.role)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full transition-colors"
                  >
                    <span>{activeStep.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      aria-label={t('Etapa anterior', 'Previous step')}
                      className="w-10 h-10 rounded-full border border-[#E2E8F0] dark:border-[#1E325C] flex items-center justify-center text-[#081C41] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#132347] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      aria-label={t('Próxima etapa', 'Next step')}
                      className="w-10 h-10 rounded-full border border-[#E2E8F0] dark:border-[#1E325C] flex items-center justify-center text-[#081C41] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#132347] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#EFF6FF] dark:bg-[#0B1733] border border-[#BFDBFE] dark:border-[#1E325C] rounded-3xl p-5 sm:p-7 shadow-sm">
                <div className="bg-white dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E325C] pb-4">
                    <div>
                      <p className="text-xs font-mono text-[#475569] dark:text-[#94A3B8]">
                        {t('ÁREA DE TRABALHO · ETAPA', 'WORKSPACE PREVIEW · STEP')} {activeStep.stepNumber}
                      </p>
                      <p className="font-display font-bold text-lg text-[#081C41] dark:text-white">
                        {activeStep.highlight}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-md bg-[#FFF7ED] dark:bg-[#F97316]/20 text-xs font-mono font-semibold text-[#EA580C] dark:text-[#FB923C]">
                      {t('Em Direto', 'Live Sync')}
                    </span>
                  </div>

                  {activeStep.id === 'discover' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {INITIAL_PROFESSIONALS.slice(0, 2).map((pro) => (
                        <div
                          key={pro.id}
                          className="rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E325C] bg-[#F8FAFC] dark:bg-[#0C1833]"
                        >
                          <div className="h-32 overflow-hidden">
                            <SafeBannerImage
                              src={pro.showcaseImageUrl}
                              alt={pro.serviceTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3.5 space-y-1.5">
                            <p className="text-xs font-semibold text-[#081C41] dark:text-white truncate">
                              {pro.serviceTitle}
                            </p>
                            <p className="font-mono tabular-nums text-sm font-bold text-[#F97316]">
                              {t('Desde', 'From')} {pro.startingPriceKz?.toLocaleString('en-US')} Kz
                            </p>
                            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] flex items-center justify-between">
                              <span>{pro.location}</span>
                              <span>★ {pro.rating} ({pro.completedJobs})</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeStep.id === 'proposals' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <SafeAvatar src={featuredPro.avatarUrl} alt={featuredPro.name} sizeClass="w-10 h-10" />
                          <div>
                            <p className="text-sm font-semibold text-[#081C41] dark:text-white">
                              {featuredPro.name}
                            </p>
                            <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                              {t('Inclui diagnóstico no local + certificação de proteção contra surtos', 'Includes site diagnostic + surge arrestor certification')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono tabular-nums font-bold text-sm text-[#1D6FE5] dark:text-[#60A5FA]">
                            285,000 Kz
                          </p>
                          <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                            2 {t('dias', 'days')}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#EFF6FF] dark:bg-[#1D6FE5]/15 border border-[#BFDBFE] dark:border-[#1D6FE5]/35 flex items-center gap-3 text-xs text-[#081C41] dark:text-white">
                        <MessageSquare className="w-4 h-4 text-[#1D6FE5] dark:text-[#60A5FA] shrink-0" />
                        <span>
                          {t(
                            '“Podemos inspecionar o quadro elétrico amanhã às 09:00 e confirmar os cabos exatos antes de fechar o acordo.”',
                            '“We can inspect the distribution board tomorrow at 09:00 and confirm exact cable runs before locking the agreement.”'
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeStep.id === 'agreement' && (
                    <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-[#F97316]">
                          {t('ACORDO #SL-2048 · REGISTO PRIVADO', 'AGREEMENT #SL-2048 · PRIVATE RECORD')}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA]">
                          <Lock className="w-3.5 h-3.5" />
                          {t('Preço Confidencial', 'Confidential Price')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C]">
                          <p className="text-[#475569] dark:text-[#94A3B8]">{t('Valor Acordado', 'Agreed Fee')}</p>
                          <p className="font-mono tabular-nums text-base font-bold text-[#081C41] dark:text-white mt-0.5">
                            285,000 Kz
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C]">
                          <p className="text-[#475569] dark:text-[#94A3B8]">{t('Prazo de Entrega', 'Target Delivery')}</p>
                          <p className="font-mono tabular-nums text-base font-bold text-[#081C41] dark:text-white mt-0.5">
                            48 {t('Horas', 'Hours')}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                        {t(
                          'Âmbito: Fornecimento e instalação de proteção trifásica contra surtos, teste de transferência de carga e guia de entrega.',
                          'Scope: Supply and install 3-phase surge protection, test load transfer, and issue handover checklist.'
                        )}
                      </p>
                    </div>
                  )}

                  {activeStep.id === 'completion' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {['AGREEMENT_CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED'].map(
                          (st, idx) => (
                            <div
                              key={st}
                              className={`p-2.5 rounded-xl border text-center ${
                                idx === 3
                                  ? 'bg-[#081C41] text-white border-[#081C41]'
                                  : 'bg-[#F8FAFC] dark:bg-[#0C1833] border-[#E2E8F0] dark:border-[#1E325C] text-[#475569] dark:text-[#94A3B8]'
                              }`}
                            >
                              <p className="font-mono text-[10px] truncate">{st}</p>
                            </div>
                          ),
                        )}
                      </div>
                      <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-[#081C41] dark:text-white">
                            {t('Avaliação Bilateral Verificada', 'Bilateral Review Verified')}
                          </p>
                          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                            {t('Cliente avaliou Pontualidade & Qualidade · Prestador avaliou Clareza do Âmbito', 'Customer rated Punctuality & Craft · Provider rated Scope Clarity')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[#F97316] shrink-0">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-mono tabular-nums text-sm font-bold text-[#081C41] dark:text-white">
                            5.0
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DUAL SPECIALTY BREAKDOWN CARDS */}
        <section
          id="specialties"
          className="bg-white dark:bg-[#09142B] border-y border-[#E2E8F0] dark:border-[#1E325C] py-16"
        >
          <div className="max-w-[1200px] mx-auto px-6 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1D6FE5] dark:text-[#60A5FA]">
                {t('Especialidades & Oportunidades', 'Specialties & Opportunities')}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#081C41] dark:text-white">
                {t('Uma conta unificada. Dois caminhos claros.', 'One unified account. Two clear paths.')}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#F8FAFC] dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-3xl p-7 sm:p-8 flex flex-col justify-between gap-7">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#1D6FE5] dark:text-[#60A5FA]">
                      {t('Para Famílias & Empresas', 'For Households & Companies')}
                    </p>
                    <h3 className="font-display text-2xl font-bold text-[#081C41] dark:text-white mt-1">
                      {t('Procura contratar profissionais qualificados?', 'Looking to hire skilled professionals?')}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {CUSTOMER_SPECIALTIES.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => onQuickExplore('customer', '', item.cat)}
                          className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#1D6FE5] text-left transition-colors"
                        >
                          <span className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-[#1D6FE5]/20 text-[#1D6FE5] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#081C41] dark:text-white truncate">
                              {item.label}
                            </p>
                            <p className="text-xs text-[#475569] dark:text-[#94A3B8] truncate">
                              {item.sub}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onStartRole('customer')}
                    className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-full transition-colors"
                  >
                    {t('Publicar Pedido de Serviço', 'Post a Service Request')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickExplore('customer')}
                    className="w-full py-2 text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA] hover:underline underline-offset-4 inline-flex items-center justify-center gap-1"
                  >
                    <span>{t('Explorar Mercado de Serviços', 'Explore Customer Marketplace')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-[#F8FAFC] dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-3xl p-7 sm:p-8 flex flex-col justify-between gap-7">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#F97316]">
                      {t('Para Técnicos & Empresas', 'For Technicians & Businesses')}
                    </p>
                    <h3 className="font-display text-2xl font-bold text-[#081C41] dark:text-white mt-1">
                      {t('Pronto para conquistar contratos locais?', 'Ready to win local service contracts?')}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {PROVIDER_OPPORTUNITIES.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => onQuickExplore('provider')}
                          className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#F97316] text-left transition-colors"
                        >
                          <span className="w-9 h-9 rounded-xl bg-[#FFF7ED] dark:bg-[#F97316]/20 text-[#F97316] dark:text-[#FB923C] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#081C41] dark:text-white truncate">
                              {item.label}
                            </p>
                            <p className="text-xs text-[#475569] dark:text-[#94A3B8] truncate">
                              {item.sub}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onStartRole('provider')}
                    className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-full transition-colors"
                  >
                    {t('Criar Conta de Prestador', 'Create Provider Account')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickExplore('provider')}
                    className="w-full py-2 text-xs font-semibold text-[#F97316] hover:underline underline-offset-4 inline-flex items-center justify-center gap-1"
                  >
                    <span>{t('Explorar Oportunidades Abertas', 'Explore Open Opportunities')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST RATING STRIP + QUICK HELP TRIO */}
        <section id="trust" className="max-w-[1200px] mx-auto px-6 py-16 space-y-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-current" />
              </span>
              <div>
                <p className="font-mono tabular-nums text-xl font-bold text-[#081C41] dark:text-white">
                  4.9 / 5
                </p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  {t('Satisfação dos Clientes', 'Customer Satisfaction')}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-[#1D6FE5] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <p className="font-mono tabular-nums text-xl font-bold text-[#081C41] dark:text-white">
                  4.8 / 5
                </p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  {t('Fiabilidade dos Prestadores', 'Provider Reliability')}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-[#F97316] text-white flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </span>
              <div>
                <p className="font-mono tabular-nums text-xl font-bold text-[#081C41] dark:text-white">
                  100%
                </p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  {t('Termos Privados em Kz', 'Private Kwanza Terms')}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-[#081C41] text-[#F97316] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <p className="font-mono tabular-nums text-xl font-bold text-[#081C41] dark:text-white">
                  {t('Bilateral', '2-Way')}
                </p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  {t('Avaliações Mútuas', 'Bilateral Evaluations')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1D6FE5]/20 text-[#1D6FE5] dark:text-[#60A5FA] flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#081C41] dark:text-white">
                {t('Para Clientes', 'For Customers')}
              </h3>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                {t(
                  'Precisa de trabalho fiável em casa ou no escritório? Publique o seu pedido em minutos e compare propostas com segurança.',
                  'Need reliable work done at home or at the office? Post your scope in minutes and compare proposals safely.'
                )}
              </p>
              <div className="pt-2 space-y-2 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => onQuickExplore('customer')}
                  className="block text-[#1D6FE5] dark:text-[#60A5FA] hover:underline underline-offset-4"
                >
                  {t('Explorar Mercado em Luanda →', 'Browse Luanda Marketplace →')}
                </button>
                <button
                  type="button"
                  onClick={() => onStartRole('customer')}
                  className="block text-[#1D6FE5] dark:text-[#60A5FA] hover:underline underline-offset-4"
                >
                  {t('Publicar Novo Pedido →', 'Publish a New Request →')}
                </button>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] dark:bg-[#F97316]/20 text-[#F97316] dark:text-[#FB923C] flex items-center justify-center">
                <Handshake className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#081C41] dark:text-white">
                {t('Para Prestadores de Serviços', 'For Service Providers')}
              </h3>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                {t(
                  'Comece como profissional independente, pequena oficina ou empresa sem barreiras artificiais de experiência.',
                  'Start as an individual, small business, or company without artificial experience barriers.'
                )}
              </p>
              <div className="pt-2 space-y-2 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => onQuickExplore('provider')}
                  className="block text-[#EA580C] dark:text-[#FB923C] hover:underline underline-offset-4"
                >
                  {t('Ver Pedidos Abertos de Clientes →', 'View Open Client Requests →')}
                </button>
                <button
                  type="button"
                  onClick={() => onStartRole('provider')}
                  className="block text-[#EA580C] dark:text-[#FB923C] hover:underline underline-offset-4"
                >
                  {t('Configurar Perfil de Prestador →', 'Set Up Provider Profile →')}
                </button>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] dark:bg-[#132347] text-[#081C41] dark:text-[#F97316] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#081C41] dark:text-white">
                {t('Segurança & Mediação', 'Safety & Mediation')}
              </h3>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                {t(
                  'Mediação clara com base em acordos assinados, histórico de conversas e recursos transparentes.',
                  'Clear escalation paths referencing signed bilateral terms, chat records, and transparent appeals.'
                )}
              </p>
              <div className="pt-2 space-y-2 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="block text-[#081C41] dark:text-white hover:underline underline-offset-4"
                >
                  {t('Entrar na Conta Unificada →', 'Sign In to Unified Account →')}
                </button>
                <button
                  type="button"
                  onClick={onToggleDark}
                  className="inline-flex items-center gap-1.5 text-[#475569] dark:text-[#F97316] hover:text-[#081C41] dark:hover:text-white"
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>
                    {darkMode
                      ? t('Mudar para Modo Claro', 'Switch to Light Mode')
                      : t('Mudar para Modo Escuro', 'Switch to Dark Mode')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* DARK NOCTURNAL NAVY FOOTER */}
      <footer className="max-w-[1200px] mx-auto px-6 pb-10 pt-2">
        <div className="relative overflow-hidden rounded-3xl bg-[#061534] border border-[#1E3A70] text-white p-8 sm:p-12">
          <CornerCraftMotif />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/15">
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <SaluRibbonMark size={38} />
                <span className="font-display text-3xl font-bold tracking-tight text-white">
                  SALU
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed max-w-xs">
                {t(
                  'Onde as habilidades existem, as oportunidades também. A ligar famílias, empresas e profissionais em Angola.',
                  "Where skills exist, opportunities should exist. Connecting Angola's households, enterprises, and independent specialists."
                )}
              </p>
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => onStartRole('customer')}
                  className="px-4 py-2 text-xs font-semibold bg-[#1D6FE5] text-white hover:bg-[#1558B8] rounded-full transition-colors"
                >
                  {t('Preciso de um serviço', 'I need a service')}
                </button>
                <button
                  type="button"
                  onClick={() => onStartRole('provider')}
                  className="px-4 py-2 text-xs font-semibold bg-[#F97316] text-white hover:bg-[#EA580C] rounded-full transition-colors"
                >
                  {t('Quero prestar serviços', 'I provide services')}
                </button>
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div className="space-y-3">
                <p className="font-display font-semibold text-[#F97316]">
                  {t('Plataforma', 'Platform')}
                </p>
                <ul className="space-y-2 text-white/80">
                  <li>
                    <button
                      type="button"
                      onClick={() => onQuickExplore('customer')}
                      className="hover:text-white transition-colors"
                    >
                      {t('Área do Cliente', 'Customer Workspace')}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onQuickExplore('provider')}
                      className="hover:text-white transition-colors"
                    >
                      {t('Área do Prestador', 'Provider Workspace')}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpenAuth('signin')}
                      className="hover:text-white transition-colors"
                    >
                      {t('Entrar na Conta Unificada', 'Unified Account Login')}
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-display font-semibold text-[#F97316]">{t('Polos', 'Hubs')}</p>
                <ul className="space-y-2 text-white/80">
                  <li>Luanda (Talatona · Maianga)</li>
                  <li>Benguela &amp; Lobito</li>
                  <li>Lubango &amp; Huambo</li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-display font-semibold text-[#F97316]">
                  {t('Aparência', 'Appearance')}
                </p>
                <ul className="space-y-2 text-white/80">
                  <li>
                    <button
                      type="button"
                      onClick={onToggleDark}
                      className="inline-flex items-center gap-2 hover:text-white transition-colors"
                    >
                      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span>{darkMode ? t('Tema Claro', 'Light Theme') : t('Tema Escuro', 'Dark Theme')}</span>
                    </button>
                  </li>
                  <li>{t('Moeda Kwanza (Kz)', 'Kwanza (Kz) Currency')}</li>
                  <li>{t('Termos Bilaterais Privados', 'Private Bilateral Terms')}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
            <span>
              SALU Angola · {t('Onde as habilidades existem, as oportunidades também.', 'Where skills exist, opportunities should exist.')}
            </span>
            <span className="font-mono">
              {t('10 Estados de Ciclo · Fiabilidade Bilateral', '10 Tracked Lifecycle States · Two-Way Reliability')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
