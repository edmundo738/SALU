import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  Flame,
  Handshake,
  Heart,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Store,
  Trash2,
} from 'lucide-react';
import {
  ANGOLA_MUNICIPALITIES,
  SERVICE_CATEGORIES,
  formatKwanza,
} from '../data/saluData';
import { translateCategory, useLang } from '../i18n/translations';
import {
  CustomerSummary,
  NotificationItem,
  Professional,
  ReviewItem,
  ScreenId,
  ServiceRequest,
  UrgencyLevel,
} from '../types/salu';
import {
  CornerCraftMotif,
  LuandaNightBackdrop,
  ReliabilityBar,
  RequestStateTag,
  SafeAvatar,
  SafeBannerImage,
} from './ui/Primitives';
import {
  CatCleaningIcon,
  CatConstructionIcon,
  CatHomeIcon,
  CatMoreIcon,
  CatRepairsIcon,
  CatTechIcon,
  CatTransportIcon,
  VerifiedShieldSprite,
} from './ui/SaluIcons';

interface CustomerDashboardProps {
  userName: string;
  municipality: string;
  requests: ServiceRequest[];
  professionals: Professional[];
  notifications: NotificationItem[];
  onNavigate: (screen: ScreenId) => void;
  onSelectRequest: (id: string) => void;
  onSelectProfessional: (id: string) => void;
  onSelectCategorySearch: (cat: string) => void;
  onStartChat: (pro: Professional) => void;
  onToggleFavoritePro: (id: string) => void;
  onStartRequestWithTitle: (title: string) => void;
}

export function CustomerDashboard({
  userName,
  municipality,
  requests,
  professionals,
  notifications,
  onNavigate,
  onSelectRequest,
  onSelectProfessional,
  onSelectCategorySearch,
  onStartChat,
  onToggleFavoritePro,
  onStartRequestWithTitle,
}: CustomerDashboardProps) {
  const { lang, t } = useLang();
  const [problemPrompt, setProblemPrompt] = useState('');
  const [requestFilter, setRequestFilter] = useState<
    'ALL' | 'PROPOSALS' | 'ACTIVE' | 'CONFIRM' | 'COMPLETED'
  >('ALL');
  const [heroSlide, setHeroSlide] = useState(0);

  const activeRequests = requests.filter(
    (r) => !['COMPLETED', 'CANCELLED'].includes(r.state)
  );
  const completedCount = requests.filter((r) => r.state === 'COMPLETED').length;
  const requestsWithProposals = requests.filter(
    (r) => r.proposals.length > 0 && ['OPEN', 'PROPOSALS_RECEIVED'].includes(r.state)
  );
  const executingRequests = requests.filter((r) =>
    ['NEGOTIATING', 'AGREEMENT_CONFIRMED', 'IN_PROGRESS'].includes(r.state)
  );
  const confirmPendingRequests = requests.filter(
    (r) => r.state === 'COMPLETION_PENDING'
  );
  const completedRequestsList = requests.filter((r) => r.state === 'COMPLETED');

  const filteredRequests =
    requestFilter === 'PROPOSALS'
      ? requestsWithProposals
      : requestFilter === 'ACTIVE'
        ? executingRequests
        : requestFilter === 'CONFIRM'
          ? confirmPendingRequests
          : requestFilter === 'COMPLETED'
            ? completedRequestsList
            : requests.filter((r) => r.state !== 'CANCELLED');
  const featuredPros = [...professionals]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3);

  const handleProblemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartRequestWithTitle(problemPrompt.trim());
    setProblemPrompt('');
  };

  const quickProblems = [
    t('Instalar inversor solar', 'Install solar inverter'),
    t('Ar condicionado não gela', 'AC not cooling'),
    t('Configurar rede & Wi-Fi', 'Configure Wi-Fi network'),
    t('Reparar fuga de água', 'Fix water leak'),
  ];

  const heroSlides = [
    {
      titleBefore: t('Tem um ', 'Have a '),
      titleItalic: t('problema', 'problem'),
      titleMid: t(' para resolver? Contrate quem ', ' to solve? Hire who '),
      titleOrange: t('sabe fazer', 'gets it done'),
      titleAfter: '.',
      subtitle: t(
        'Descreva o que precisa, receba orçamentos em Kwanzas e pague apenas pelo serviço acordado.',
        'Describe your problem, receive Kwanza quotes, and pay for verified work completed.'
      ),
      ctaLabel: t('Publicar Pedido', 'Post Request'),
      action: () => onNavigate('create-request'),
      secondaryLabel: t('Explorar Serviços', 'Browse Services'),
      secondaryAction: () => onNavigate('discover-pros'),
    },
    {
      titleBefore: t('Especialistas ', 'Verified '),
      titleItalic: t('verificados', 'specialists'),
      titleMid: t(' perto de ', ' near '),
      titleOrange: municipality.split(',')[0],
      titleAfter: '.',
      subtitle: t(
        'Compare preços iniciais em Kwanzas, prazos e avaliações reais antes de contratar.',
        'Compare starting Kwanza rates, timelines, and client reviews before hiring.'
      ),
      ctaLabel: t('Ver Serviços & Preços', 'View Services & Rates'),
      action: () => onNavigate('discover-pros'),
      secondaryLabel: t('Pedir Orçamento', 'Request Quote'),
      secondaryAction: () => onNavigate('create-request'),
    },
    {
      titleBefore: t('Acordo ', 'Private '),
      titleItalic: t('fechado', 'agreement'),
      titleMid: t(' com preço em ', ' locked in '),
      titleOrange: t('Kwanzas', 'Kwanzas'),
      titleAfter: '.',
      subtitle: t(
        'Negocie o escopo no chat, feche o valor e só confirme a conclusão quando ficar resolvido.',
        'Negotiate scope in chat, lock the price, and confirm completion once solved.'
      ),
      ctaLabel: t('Ver Meus Pedidos', 'View My Requests'),
      action: () => onNavigate('requests'),
      secondaryLabel: t('Novo Pedido', 'New Request'),
      secondaryAction: () => onNavigate('create-request'),
    },
  ];

  const currentSlide = heroSlides[heroSlide] || heroSlides[0];

  const popularCategories = [
    {
      label: t('Tecnologia', 'Technology'),
      category: 'IT & Networks',
      icon: CatTechIcon,
      tintClass: 'bg-[#F8FAFC] dark:bg-[#060E20] border-[#E2E8F0] dark:border-[#1E325C]',
    },
    {
      label: t('Construção', 'Construction'),
      category: 'Architecture & Renovation',
      icon: CatConstructionIcon,
      tintClass: 'bg-[#F8FAFC] dark:bg-[#060E20] border-[#E2E8F0] dark:border-[#1E325C]',
    },
    {
      label: t('Limpeza', 'Cleaning'),
      category: 'Cleaning & Maintenance',
      icon: CatCleaningIcon,
      tintClass: 'bg-[#FFF8F1] dark:bg-[#F97316]/10 border-[#FED7AA] dark:border-[#F97316]/35',
    },
    {
      label: t('Transportes', 'Transport'),
      category: 'Transport & Logistics',
      icon: CatTransportIcon,
      tintClass: 'bg-[#F8FAFC] dark:bg-[#060E20] border-[#E2E8F0] dark:border-[#1E325C]',
    },
    {
      label: t('Reparações', 'Repairs'),
      category: 'Electrical & Solar',
      icon: CatRepairsIcon,
      tintClass: 'bg-[#FFF8F1] dark:bg-[#F97316]/10 border-[#FED7AA] dark:border-[#F97316]/35',
    },
    {
      label: t('Domésticos', 'Home Care'),
      category: 'Plumbing & HVAC',
      icon: CatHomeIcon,
      tintClass: 'bg-[#FFF8F1] dark:bg-[#F97316]/10 border-[#FED7AA] dark:border-[#F97316]/35',
    },
    {
      label: t('Mais', 'More'),
      category: 'ALL',
      icon: CatMoreIcon,
      tintClass: 'bg-[#F1F5F9] dark:bg-[#132347] border-[#E2E8F0] dark:border-[#1E325C]',
    },
  ];

  const featuredTags = [
    {
      label: t('Disponível hoje', 'Available today'),
      className: 'bg-[#10B981] text-white',
    },
    {
      label: t('Verificado', 'Verified'),
      className: 'bg-[#1D6FE5] text-white',
    },
    {
      label: t('Mais pedido', 'Top rated'),
      className: 'bg-[#7C3AED] text-white',
    },
  ];

  // Progress ring math (r=34 -> circumference ~ 213.6)
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const profilePct = 95;
  const ringOffset = ringCircumference * (1 - profilePct / 100);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* CENTER WORKSPACE COLUMN */}
      <div className="xl:col-span-8 space-y-6 min-w-0">
        {/* 1. HERO BANNER CARD */}
        <section className="relative overflow-hidden rounded-2xl bg-[#061534] text-white min-h-[220px] sm:min-h-[246px] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <LuandaNightBackdrop variant="hero" />

          <div className="relative z-10 max-w-xl space-y-3">
            <h1 className="font-display text-2xl sm:text-[32px] font-extrabold tracking-tight leading-[1.14] text-white">
              {currentSlide.titleBefore}
              <em className="italic font-extrabold">{currentSlide.titleItalic}</em>
              {currentSlide.titleMid}
              <span className="text-[#F97316]">{currentSlide.titleOrange}</span>
              {currentSlide.titleAfter}
            </h1>
            <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed max-w-md">
              {currentSlide.subtitle}
            </p>
          </div>

          <div className="relative z-10 pt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={currentSlide.action}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold shadow-md transition-colors"
              >
                <span>{currentSlide.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={currentSlide.secondaryAction}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/12 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors"
              >
                <span>{currentSlide.secondaryLabel}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5" role="tablist" aria-label={t('Destaques', 'Hero slides')}>
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setHeroSlide(idx)}
                  aria-label={`${t('Slide', 'Slide')} ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    heroSlide === idx
                      ? 'w-5 bg-white'
                      : 'w-2 bg-white/45 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 2. POPULAR CATEGORIES STRIP */}
        <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#081C41] dark:text-[#F8FAFC]">
              {t('Categorias populares', 'Popular categories')}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('discover-pros')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
            >
              <span>{t('Ver todas', 'See all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {popularCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() =>
                    cat.category === 'ALL'
                      ? onNavigate('discover-pros')
                      : onSelectCategorySearch(cat.category)
                  }
                  className={`group flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all hover:-translate-y-0.5 hover:border-[#1D6FE5] ${cat.tintClass}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0C1833] border border-[#E2E8F0]/80 dark:border-[#1E325C] flex items-center justify-center shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-center leading-tight line-clamp-2">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. FEATURED SERVICES GRID */}
        <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#081C41] dark:text-[#F8FAFC] inline-flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#F97316] fill-[#F97316]/20" />
              <span>{t('Serviços em destaque', 'Featured services')}</span>
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('discover-pros')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
            >
              <span>{t('Ver todas', 'See all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredPros.map((pro, idx) => {
              const badge = featuredTags[idx % featuredTags.length];
              return (
                <article
                  key={pro.id}
                  className="group bg-white dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#1D6FE5] rounded-xl overflow-hidden flex flex-col justify-between transition-all shadow-2xs"
                >
                  <div>
                    {/* Card Media */}
                    <div className="relative aspect-[16/10] w-full bg-[#E2E8F0] dark:bg-[#132347] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onSelectProfessional(pro.id)}
                        className="w-full h-full block"
                      >
                        <SafeBannerImage
                          src={pro.showcaseImageUrl}
                          alt={pro.serviceTitle}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                        />
                      </button>

                      <span
                        className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-xs ${badge.className}`}
                      >
                        {badge.label}
                      </span>

                      <button
                        type="button"
                        onClick={() => onToggleFavoritePro(pro.id)}
                        aria-label={
                          pro.isFavorite
                            ? t('Remover dos favoritos', 'Remove favorite')
                            : t('Guardar nos favoritos', 'Save favorite')
                        }
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 dark:bg-[#0C1833]/90 text-[#0F172A] dark:text-white flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            pro.isFavorite
                              ? 'fill-[#F97316] text-[#F97316]'
                              : 'text-[#475569] dark:text-[#CBD5E1]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Card Details */}
                    <div className="p-3.5 space-y-2">
                      <button
                        type="button"
                        onClick={() => onSelectProfessional(pro.id)}
                        className="text-left block w-full"
                      >
                        <h3 className="font-display font-bold text-sm text-[#081C41] dark:text-[#F8FAFC] line-clamp-1 group-hover:text-[#1D6FE5]">
                          {pro.serviceTitle}
                        </h3>
                      </button>

                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                        <span className="truncate">
                          {pro.location} · {pro.distanceKm} km
                        </span>
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
                        <div className="flex items-center gap-2 font-mono tabular-nums text-[#334155] dark:text-[#CBD5E1] min-w-0">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                            {pro.rating}
                            <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">
                              ({pro.completedJobs})
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span className="truncate">{pro.responseTime}</span>
                          </span>
                        </div>
                        <span className="font-mono tabular-nums font-bold text-xs text-[#081C41] dark:text-[#F97316] whitespace-nowrap">
                          {formatKwanza(pro.startingPriceKz, lang)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-3.5 py-2.5 border-t border-[#E2E8F0] dark:border-[#1E325C] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectProfessional(pro.id)}
                      className="flex items-center gap-2 min-w-0 text-left"
                    >
                      <SafeAvatar
                        src={pro.avatarUrl}
                        alt={pro.name}
                        sizeClass="w-7 h-7"
                        roundedClass="rounded-full"
                      />
                      <span className="text-xs font-medium text-[#334155] dark:text-[#CBD5E1] truncate">
                        {pro.businessName || pro.name}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onStartChat(pro)}
                        aria-label={t('Negociar por mensagem', 'Negotiate via chat')}
                        title={t('Negociar por mensagem', 'Negotiate via chat')}
                        className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E325C] text-[#475569] dark:text-[#CBD5E1] hover:border-[#1D6FE5] hover:text-[#1D6FE5] transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectProfessional(pro.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] dark:bg-[#1D6FE5]/20 text-[#1D6FE5] dark:text-[#60A5FA] hover:bg-[#DBEAFE] dark:hover:bg-[#1D6FE5]/30 text-[11px] font-semibold whitespace-nowrap transition-colors"
                      >
                        <span>{t('Contratar', 'Hire')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 4. PROBLEM-TO-QUOTE ACTION BOX */}
        <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 space-y-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-[#081C41] dark:text-[#F8FAFC]">
                {t('Qual problema precisa resolver hoje?', 'What problem do you need solved today?')}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {t(
                  'Olá',
                  'Hi'
                )}{' '}
                {userName.split(' ')[0]} —{' '}
                {t(
                  'publique o pedido com orçamento em Kwanzas e receba propostas de quem resolve.',
                  'post your problem with a Kwanza budget and receive quotes from vetted pros.'
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleProblemSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input
              type="text"
              value={problemPrompt}
              onChange={(e) => setProblemPrompt(e.target.value)}
              placeholder={t(
                'Ex: O meu ar condicionado deixou de gelar / Instalar inversor solar...',
                'e.g. My AC stopped cooling / Install a solar inverter...'
              )}
              className="flex-1 min-h-[44px] px-4 py-2 text-sm bg-[#F8FAFC] dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-xl text-[#0F172A] dark:text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#F97316]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shrink-0 transition-colors shadow-xs"
            >
              <span>{t('Pedir Orçamentos', 'Get Quotes')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              {t('Sugestões rápidas:', 'Quick problems:')}
            </span>
            {quickProblems.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onStartRequestWithTitle(preset)}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#F97316] text-[11px] font-medium text-[#334155] dark:text-[#CBD5E1] transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </section>

        {/* 5. ACTIVE REQUESTS & RECEIVED KWANZA PROPOSALS HUB */}
        <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#081C41] dark:text-[#F8FAFC]">
                {t('Os Meus Pedidos & Propostas Recebidas', 'My Requests & Received Quotes')}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {t(
                  'Compare orçamentos, feche o acordo em Kwanzas e confirme a conclusão.',
                  'Compare quotes, lock private Kwanza agreements, and confirm completion.'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('create-request')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#081C41] dark:bg-[#1D6FE5] hover:opacity-90 text-white text-xs font-semibold transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Novo Pedido', 'New Request')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              {
                id: 'ALL',
                label: `${t('Todos', 'All')} (${requests.filter((r) => r.state !== 'CANCELLED').length})`,
              },
              {
                id: 'PROPOSALS',
                label: `${t('Com Propostas', 'With Quotes')} (${requestsWithProposals.length})`,
              },
              {
                id: 'ACTIVE',
                label: `${t('Em Execução', 'In Execution')} (${executingRequests.length})`,
              },
              {
                id: 'CONFIRM',
                label: `${t('Aguardar Confirmação', 'Needs Confirmation')} (${confirmPendingRequests.length})`,
              },
              {
                id: 'COMPLETED',
                label: `${t('Concluídos', 'Completed')} (${completedRequestsList.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRequestFilter(tab.id as typeof requestFilter)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  requestFilter === tab.id
                    ? 'bg-[#081C41] text-white border-[#081C41] dark:bg-[#1D6FE5] dark:border-[#1D6FE5]'
                    : 'bg-[#F8FAFC] dark:bg-[#060E20] text-[#475569] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#1E325C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#F8FAFC] dark:bg-[#060E20] border border-dashed border-[#CBD5E1] dark:border-[#1E325C] text-center space-y-3">
              <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
                {t(
                  'Nenhum pedido nesta fase no momento.',
                  'No requests in this stage right now.'
                )}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('create-request')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('Publicar Pedido', 'Post Request')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredRequests.map((req) => {
                const pendingQuotes = req.proposals.filter((p) => p.status !== 'DECLINED');
                const ctaLabel =
                  req.state === 'COMPLETION_PENDING'
                    ? t('Confirmar Conclusão & Fechar', 'Confirm Completion & Close')
                    : pendingQuotes.length > 0 &&
                        ['OPEN', 'PROPOSALS_RECEIVED'].includes(req.state)
                      ? `${t('Comparar', 'Compare')} ${pendingQuotes.length} ${
                          pendingQuotes.length === 1
                            ? t('Proposta', 'Quote')
                            : t('Propostas', 'Quotes')
                        }`
                      : ['NEGOTIATING', 'AGREEMENT_CONFIRMED', 'IN_PROGRESS'].includes(
                            req.state
                          )
                        ? t('Acompanhar & Negociar', 'Track & Negotiate')
                        : t('Abrir Pedido', 'Open Request');

                return (
                  <article
                    key={req.id}
                    className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#1D6FE5] rounded-xl space-y-3 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <RequestStateTag state={req.state} />
                        <span className="text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA]">
                          {translateCategory(req.category, lang)}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
                        {req.municipality} · {req.createdAt}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-base font-bold text-[#081C41] dark:text-[#F8FAFC]">
                        {req.title}
                      </h3>
                      <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1 line-clamp-2">
                        {req.description}
                      </p>
                    </div>

                    {/* Received Proposals Preview */}
                    {pendingQuotes.length > 0 &&
                      ['OPEN', 'PROPOSALS_RECEIVED'].includes(req.state) && (
                        <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-lg p-3 space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                            {t('Propostas recebidas prontas a escolher', 'Quotes ready for review')}
                          </p>
                          <div className="space-y-1.5">
                            {pendingQuotes.slice(0, 2).map((prop) => (
                              <div
                                key={prop.id}
                                className="flex items-center justify-between gap-3 text-xs py-1 border-b last:border-b-0 border-[#F1F5F9] dark:border-[#1E325C]"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <SafeAvatar
                                    src={prop.providerAvatar}
                                    alt={prop.providerName}
                                    sizeClass="w-6 h-6"
                                  />
                                  <span className="font-semibold text-[#081C41] dark:text-white truncate">
                                    {prop.providerName}
                                  </span>
                                  {prop.providerVerified && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#1D6FE5] shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0 font-mono tabular-nums">
                                  <span className="text-[#64748B] dark:text-[#94A3B8]">
                                    {prop.estimatedDays}d
                                  </span>
                                  <span className="font-bold text-[#F97316]">
                                    {formatKwanza(prop.suggestedPriceKz, lang)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E325C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs font-mono tabular-nums text-[#334155] dark:text-[#CBD5E1]">
                        {req.agreement ? (
                          <span>
                            {t('Acordo privado:', 'Private agreement:')}{' '}
                            <strong className="text-[#081C41] dark:text-white">
                              {formatKwanza(req.agreement.agreedPriceKz, lang)}
                            </strong>{' '}
                            · {req.agreement.providerName}
                          </span>
                        ) : (
                          <span>
                            {t('Orçamento:', 'Budget:')}{' '}
                            <strong className="text-[#081C41] dark:text-white">
                              {formatKwanza(req.budgetKz, lang)}
                            </strong>{' '}
                            · {req.proposals.length}{' '}
                            {req.proposals.length === 1
                              ? t('proposta', 'quote')
                              : t('propostas', 'quotes')}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectRequest(req.id)}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
                          req.state === 'COMPLETION_PENDING'
                            ? 'bg-[#F97316] hover:bg-[#EA580C]'
                            : 'bg-[#1D6FE5] hover:bg-[#1558B8]'
                        }`}
                      >
                        <span>{ctaLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* RIGHT RAIL: ACCOUNT SUMMARY, PUBLISH HELP CTA, RECENT ACTIVITY */}
      <aside className="xl:col-span-4 space-y-5 xl:sticky xl:top-24">
        {/* 1. Account Summary Card */}
        <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#081C41] dark:text-[#F8FAFC]">
              {t('Resumo da sua conta', 'Account summary')}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('customer-profile')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
            >
              <span>{t('Ver detalhes', 'View details')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Circular Progress Ring + Description */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
                <circle
                  cx="40"
                  cy="40"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-[#E2E8F0] dark:text-[#1E325C]"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={ringRadius}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <span className="absolute font-display font-extrabold text-base text-[#081C41] dark:text-white tabular-nums">
                {profilePct}%
              </span>
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="font-display font-bold text-sm text-[#081C41] dark:text-white">
                {t('Perfil completo', 'Profile complete')}
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-snug">
                {t(
                  'Mais visibilidade e confiança para os seus pedidos!',
                  'Higher visibility and trust for your requests!'
                )}
              </p>
            </div>
          </div>

          {/* 3-Column Metric Divider Row */}
          <div className="grid grid-cols-3 pt-3 border-t border-[#E2E8F0] dark:border-[#1E325C] divide-x divide-[#E2E8F0] dark:divide-[#1E325C] text-center">
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 font-display font-extrabold text-base text-[#081C41] dark:text-white tabular-nums">
                <Handshake className="w-4 h-4 text-[#1D6FE5]" />
                <span>{completedCount + activeRequests.length}</span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {t('Trabalhos', 'Jobs')}
              </p>
            </div>
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 font-display font-extrabold text-base text-[#081C41] dark:text-white tabular-nums">
                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                <span>4.8</span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {t('Avaliação', 'Rating')}
              </p>
            </div>
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 font-display font-extrabold text-base text-[#081C41] dark:text-white tabular-nums">
                <VerifiedShieldSprite className="w-4 h-4" />
                <span>98%</span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {t('Confiabilidade', 'Reliability')}
              </p>
            </div>
          </div>
        </div>

        {/* 2. NEED HELP / PUBLISH REQUEST CTA CARD */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#061534] via-[#0B2252] to-[#081C41] text-white p-5 shadow-sm border border-[#1B356C]">
          {/* Decorative Orange Horizon Arc */}
          <svg
            viewBox="0 0 320 160"
            fill="none"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M170 160 Q245 100 330 40 L330 160 Z"
              fill="#F97316"
              fillOpacity="0.88"
            />
            <path
              d="M195 160 Q260 112 330 62"
              stroke="#FDBA74"
              strokeWidth="2"
              strokeOpacity="0.6"
            />
          </svg>

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="space-y-2.5 max-w-[65%]">
              <h2 className="font-display font-bold text-base text-white leading-tight">
                {t('Precisa de ajuda?', 'Need help?')}
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                {t(
                  'Publique um pedido e receba propostas de profissionais.',
                  'Publish a request and receive quotes from verified pros.'
                )}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('create-request')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>{t('Publicar Pedido', 'Publish Request')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Support Specialist Sprite extracted from SALU UI Kit */}
            <div className="shrink-0 w-24 h-24 rounded-full bg-[#061A40] border-2 border-white/20 overflow-hidden shadow-inner">
              <img
                src="/assets/sprites/support-agent.png"
                alt={t('Apoio ao Cliente SALU', 'SALU Support Specialist')}
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        {/* 3. RECENT ACTIVITY CARD */}
        <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#081C41] dark:text-[#F8FAFC]">
              {t('Atividade recente', 'Recent activity')}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('notifications')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
            >
              <span>{t('Ver todas', 'View all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {notifications.slice(0, 4).map((n) => {
              const iconStyle =
                n.category === 'completion'
                  ? {
                      bg: 'bg-[#10B981]/15 text-[#10B981]',
                      Icon: CheckCircle2,
                    }
                  : n.category === 'message'
                    ? {
                        bg: 'bg-[#1D6FE5]/15 text-[#1D6FE5] dark:text-[#60A5FA]',
                        Icon: MessageSquare,
                      }
                    : n.category === 'proposal'
                      ? {
                          bg: 'bg-[#F97316]/15 text-[#F97316]',
                          Icon: Star,
                        }
                      : {
                          bg: 'bg-[#6366F1]/15 text-[#6366F1]',
                          Icon: ShieldCheck,
                        };
              const Icon = iconStyle.Icon;

              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() =>
                    n.targetId ? onSelectRequest(n.targetId) : onNavigate(n.targetScreen)
                  }
                  className="w-full flex items-start justify-between gap-3 pb-3 border-b last:border-b-0 last:pb-0 border-[#E2E8F0] dark:border-[#1E325C] text-left group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconStyle.bg}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#081C41] dark:text-[#F8FAFC] truncate group-hover:text-[#1D6FE5]">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                        {n.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#94A3B8] whitespace-nowrap shrink-0">
                    {n.timestamp}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

interface CreateRequestProps {
  defaultMunicipality: string;
  initialTitle?: string;
  onCreateRequest: (
    req: Omit<
      ServiceRequest,
      | 'id'
      | 'createdAt'
      | 'proposals'
      | 'timeline'
      | 'customerConfirmedCompletion'
      | 'providerConfirmedCompletion'
      | 'customerId'
      | 'customerName'
      | 'customerReliabilityScore'
    >
  ) => void;
  onCancel: () => void;
}

export function CreateServiceRequest({
  defaultMunicipality,
  initialTitle = '',
  onCreateRequest,
  onCancel,
}: CreateRequestProps) {
  const { lang, t } = useLang();
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [municipality, setMunicipality] = useState<string>(defaultMunicipality);
  const [neighborhood, setNeighborhood] = useState('');
  const [budgetStr, setBudgetStr] = useState('');
  const [inspectionNeeded, setInspectionNeeded] = useState(false);
  const [urgency, setUrgency] = useState<UrgencyLevel>('This Week');
  const [availability, setAvailability] = useState(
    lang === 'pt'
      ? 'Dias úteis após as 14:00 ou sábado de manhã'
      : 'Weekdays after 14:00 or Saturday morning',
  );
  const [photos, setPhotos] = useState<string[]>([
    lang === 'pt' ? 'Foto do local 1' : 'Site condition photo 1',
  ]);
  const [newPhotoLabel, setNewPhotoLabel] = useState('');
  const [error, setError] = useState('');

  const addPhotoTag = () => {
    const label =
      newPhotoLabel.trim() ||
      (lang === 'pt' ? `Foto do local ${photos.length + 1}` : `Site photo ${photos.length + 1}`);
    setPhotos((prev) => [...prev, label]);
    setNewPhotoLabel('');
  };

  const handleSubmit = (asDraft: boolean) => {
    if (!title.trim() || !description.trim()) {
      setError(
        t(
          'Por favor, indique o título do pedido e uma descrição clara do problema.',
          'Please provide both a request title and a clear problem description.',
        ),
      );
      return;
    }
    setError('');
    const parsedBudget = budgetStr.trim()
      ? Number(budgetStr.replace(/[^0-9]/g, ''))
      : undefined;
    onCreateRequest({
      title: title.trim(),
      category,
      description: description.trim(),
      location: neighborhood.trim()
        ? `${neighborhood.trim()}, ${municipality}`
        : municipality,
      municipality,
      distanceKm: 2.5,
      budgetKz: parsedBudget && !Number.isNaN(parsedBudget) ? parsedBudget : undefined,
      urgency,
      availability: availability.trim() || (lang === 'pt' ? 'Flexível' : 'Flexible'),
      state: asDraft ? 'DRAFT' : 'OPEN',
      photos,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          {t('Publicar Pedido de Serviço', 'Publish a Service Request')}
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
          {t(
            'Descreva o que precisa de resolver. A localização aproximada é mostrada para correspondência; a morada exata só é partilhada quando confirmar o acordo.',
            'Describe what needs to be solved. Approximate location is shown for matching; exact street details are shared only when you confirm an agreement.',
          )}
        </p>
      </div>

      <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-5 shadow-xs">
        <div>
          <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
            {t('Título do Pedido *', 'Request Title *')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t(
              'ex.: Instalar inversor solar 5kVA e proteção do quadro principal',
              'e.g. Install 5kVA Solar Inverter & Main Breaker Protection',
            )}
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#1D6FE5]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Categoria do Serviço *', 'Service Category *')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#1D6FE5]"
            >
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {translateCategory(c, lang)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Urgência *', 'Urgency *')}
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#1D6FE5]"
            >
              <option value="Flexible">{t('Prazo Flexível', 'Flexible Timeline')}</option>
              <option value="This Week">{t('Esta Semana', 'This Week')}</option>
              <option value="Urgent (48h)">{t('Urgente (Dentro de 48h)', 'Urgent (Within 48 hours)')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
            {t('Descrição do Problema e Âmbito *', 'Problem Description & Scope *')}
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t(
              'Explique o problema, materiais já disponíveis no local, horários de acesso e resultado esperado...',
              'Explain the issue, materials already on site, access hours, and expected outcome...',
            )}
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#1D6FE5]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Município / Cidade *', 'Municipality / City *')}
            </label>
            <select
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#1D6FE5]"
            >
              {ANGOLA_MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Bairro Aproximado', 'Approximate Neighborhood')}
            </label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder={t('ex.: Benfica, Alvalade, Quarteirão J', 'e.g. Benfica, Alvalade, Quarteirão J')}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#1D6FE5]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Orçamento Estimado em Kwanza (Opcional)', 'Estimated Budget in Kwanza (Optional)')}
            </label>
            <input
              type="text"
              value={budgetStr}
              onChange={(e) => setBudgetStr(e.target.value)}
              placeholder={t('ex.: 150000 (deixe em branco para receber orçamentos)', 'e.g. 150000 (leave blank for open quotes)')}
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#1D6FE5]"
            />
            <div className="mt-2.5 p-3 rounded-xl border border-dashed border-[#F97316]/40 bg-[#FFF7ED] dark:bg-[#F97316]/10">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inspectionNeeded}
                  onChange={(e) => setInspectionNeeded(e.target.checked)}
                  className="mt-0.5 rounded text-[#F97316] focus:ring-[#F97316]"
                />
                <div>
                  <div className="text-xs font-bold text-[#081C41] dark:text-[#F8FAFC]">
                    {t('Requer Vistoria Técnica no Local', 'Requires On-Site Technical Inspection')}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-tight mt-0.5">
                    {t(
                      'Recomendado para avarias de canalização, eletricidade ou frio: o técnico faz diagnóstico presencial antes de fechar o custo de peças e materiais.',
                      'Recommended for complex repairs: provider checks on-site before finalizing parts and materials.'
                    )}
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Disponibilidade Preferida no Local', 'Preferred Site Availability')}
            </label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#1D6FE5]"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E325C] space-y-2.5">
          <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1]">
            {t('Fotografias de Referência (Opcional)', 'Reference Photographs (Optional)')}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newPhotoLabel}
              onChange={(e) => setNewPhotoLabel(e.target.value)}
              placeholder={t('Legenda da foto (ex.: Quadro elétrico)', 'Photo caption (e.g. Breaker panel)')}
              className="flex-1 min-w-[200px] px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            />
            <button
              type="button"
              onClick={addPhotoTag}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#F1F5F9] dark:bg-[#132347] rounded-lg hover:bg-[#E2E8F0] dark:hover:bg-[#1E325C]"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t('Anexar Foto', 'Attach Photo')}</span>
            </button>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {photos.map((p, idx) => (
                <div
                  key={`${p}-${idx}`}
                  className="flex items-center justify-between px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] rounded-lg"
                >
                  <span className="truncate">{p}</span>
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-[#64748B] hover:text-red-600"
                    aria-label={t('Remover foto', 'Remove photo')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E325C] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#132347] rounded-lg"
          >
            {t('Cancelar', 'Cancel')}
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-4 py-2.5 text-sm font-medium border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#132347]"
            >
              {t('Guardar Rascunho', 'Save as Draft')}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('Publicar Pedido', 'Publish Request')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfessionalDiscoveryProps {
  professionals: Professional[];
  initialSearch?: string;
  initialCategory?: string;
  initialMunicipality?: string;
  onSelectProfessional: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStartChat: (pro: Professional) => void;
}

export function ProfessionalDiscovery({
  professionals,
  initialSearch = '',
  initialCategory = 'ALL',
  initialMunicipality = 'ALL',
  onSelectProfessional,
  onToggleFavorite,
  onStartChat,
}: ProfessionalDiscoveryProps) {
  const { lang, t } = useLang();
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory || 'ALL');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>(initialMunicipality || 'ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setCategoryFilter(initialCategory || 'ALL');
  }, [initialCategory]);

  useEffect(() => {
    setMunicipalityFilter(initialMunicipality || 'ALL');
  }, [initialMunicipality]);

  const filtered = professionals.filter((pro) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      pro.name.toLowerCase().includes(q) ||
      pro.serviceTitle.toLowerCase().includes(q) ||
      pro.profession.toLowerCase().includes(q) ||
      pro.category.toLowerCase().includes(q) ||
      pro.location.toLowerCase().includes(q) ||
      pro.skills.some((s) => s.toLowerCase().includes(q));
    const matchesCategory = categoryFilter === 'ALL' || pro.category === categoryFilter;
    const areaQuery = municipalityFilter.toLowerCase();
    const matchesArea =
      municipalityFilter === 'ALL' ||
      pro.municipality.toLowerCase().includes(areaQuery) ||
      pro.location.toLowerCase().includes(areaQuery);
    const matchesVerified = !verifiedOnly || pro.verified;
    return matchesSearch && matchesCategory && matchesArea && matchesVerified;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Filter Sidebar */}
      <aside className="lg:col-span-3 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-4 space-y-5 lg:sticky lg:top-[72px] shadow-xs">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {t('Mercado de Serviços', 'Service Marketplace')}
          </h1>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategoryFilter('ALL');
              setMunicipalityFilter('ALL');
              setVerifiedOnly(false);
            }}
            className="text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
          >
            {t('Limpar', 'Reset')}
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Pesquisar serviço ou técnico...', 'Search service or trade...')}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#1D6FE5]"
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
            {t('Município', 'Municipality')}
          </p>
          <select
            value={municipalityFilter}
            onChange={(e) => setMunicipalityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
          >
            <option value="ALL">{t('Todas as Zonas em Angola', 'All Locations in Angola')}</option>
            <option value="Luanda">{t('Luanda (Todas as Zonas)', 'Luanda (All Areas)')}</option>
            {ANGOLA_MUNICIPALITIES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-[#334155] dark:text-[#CBD5E1]">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="accent-[#1D6FE5]"
          />
          <span>{t('Apenas profissionais verificados', 'Verified professionals only')}</span>
        </label>

        <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#1E325C]">
          <p className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
            {t('Categorias', 'Categories')}
          </p>
          <div className="flex lg:flex-col gap-1.5 lg:gap-1 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setCategoryFilter('ALL')}
              className={`lg:w-full text-left px-3 lg:px-2.5 py-2 lg:py-1.5 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === 'ALL'
                  ? 'bg-[#1D6FE5]/10 text-[#1D6FE5] dark:text-[#60A5FA] font-semibold'
                  : 'text-[#334155] dark:text-[#CBD5E1] bg-[#F8FAFC] lg:bg-transparent dark:bg-[#060E20] lg:dark:bg-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#132347]'
              }`}
            >
              {t('Todas as Categorias', 'All Categories')}
            </button>
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`lg:w-full text-left px-3 lg:px-2.5 py-2 lg:py-1.5 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-[#1D6FE5]/10 text-[#1D6FE5] dark:text-[#60A5FA] font-semibold'
                    : 'text-[#334155] dark:text-[#CBD5E1] bg-[#F8FAFC] lg:bg-transparent dark:bg-[#060E20] lg:dark:bg-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#132347]'
                }`}
              >
                {translateCategory(cat, lang)}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Dense Marketplace Grid */}
      <div className="lg:col-span-9 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
            {t('A mostrar', 'Showing')}{' '}
            <strong className="font-mono text-[#0F172A] dark:text-white">
              {filtered.length}
            </strong>{' '}
            {t('serviços & prestadores verificados', 'verified services & providers')}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl text-center space-y-2">
            <p className="text-sm font-medium text-[#0F172A] dark:text-white">
              {t('Nenhum serviço corresponde aos filtros selecionados.', 'No services match your current filters.')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('ALL');
                setMunicipalityFilter('ALL');
                setVerifiedOnly(false);
              }}
              className="text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
            >
              {t('Limpar filtros', 'Clear all filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((pro) => (
              <div
                key={pro.id}
                className="group bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#1D6FE5] rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-150 shadow-xs"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full bg-[#E2E8F0] dark:bg-[#132347] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onSelectProfessional(pro.id)}
                      className="w-full h-full block"
                    >
                      <SafeBannerImage
                        src={pro.showcaseImageUrl}
                        alt={pro.serviceTitle}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(pro.id)}
                      aria-label={pro.isFavorite ? 'Unsave contact' : 'Save contact'}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur border transition-colors ${
                        pro.isFavorite
                          ? 'bg-[#1D6FE5] text-white border-[#1D6FE5]'
                          : 'bg-white/95 text-[#0F172A] border-white/50 hover:bg-white'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <button
                      type="button"
                      onClick={() => onSelectProfessional(pro.id)}
                      className="text-left block w-full"
                    >
                      <h2 className="font-display font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC] line-clamp-2 leading-snug group-hover:text-[#1D6FE5]">
                        {pro.serviceTitle}
                      </h2>
                    </button>

                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-mono tabular-nums text-base font-bold text-[#F97316]">
                        {t('Desde', 'From')} {formatKwanza(pro.startingPriceKz, lang)}
                      </p>
                      <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                        {pro.responseTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-[#334155] dark:text-[#CBD5E1]">
                      <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
                      <span className="font-semibold">{pro.rating}</span>
                      <span>·</span>
                      <span>
                        {pro.completedJobs} {t('concluídos', 'completed')}
                      </span>
                      <span>·</span>
                      <span>
                        {pro.reliability.punctuality}% {t('pontualidade', 'on-time')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E325C] flex items-center gap-2">
                      <SafeAvatar
                        src={pro.avatarUrl}
                        alt={pro.name}
                        sizeClass="w-7 h-7"
                        roundedClass="rounded-md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] truncate">
                            {pro.name}
                          </p>
                          {pro.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#1D6FE5] dark:text-[#60A5FA] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                          {pro.location} · {pro.distanceKm} km
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-3.5 pb-3.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectProfessional(pro.id)}
                    className="flex-1 min-h-[44px] sm:min-h-0 py-2 sm:py-1.5 text-xs font-medium border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#132347]"
                  >
                    {t('Perfil', 'Profile')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartChat(pro)}
                    className="flex-1 min-h-[44px] sm:min-h-0 py-2 sm:py-1.5 text-xs font-medium text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
                  >
                    {t('Mensagem', 'Message')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CustomerProfileViewProps {
  customer: CustomerSummary;
  requests: ServiceRequest[];
  reviews: ReviewItem[];
  onSwitchToProvider: () => void;
  onSelectRequest: (id: string) => void;
}

export function CustomerProfileView({
  customer,
  requests,
  reviews,
  onSwitchToProvider,
  onSelectRequest,
}: CustomerProfileViewProps) {
  const { lang, t } = useLang();
  const customerReviews = reviews.filter((r) => r.targetRole === 'customer');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl overflow-hidden shadow-xs">
        <div className="h-24 bg-[#081C41] relative overflow-hidden">
          <CornerCraftMotif />
        </div>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {customer.name}
              </h1>
              {customer.verified && (
                <ShieldCheck className="w-5 h-5 text-[#1D6FE5] dark:text-[#60A5FA]" />
              )}
            </div>
            <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
              {t('Perfil Cliente', 'Customer Profile')} · {customer.location} ·{' '}
              {t('Membro desde', 'Member since')} {customer.memberSince}
            </p>
            <p className="text-xs font-mono tabular-nums text-[#64748B] dark:text-[#94A3B8]">
              {customer.completedRequests} {t('serviços concluídos', 'completed engagements')}
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToProvider}
            className="px-4 py-2 text-xs font-semibold text-[#F97316] border border-[#F97316] rounded-lg hover:bg-[#F97316]/10 whitespace-nowrap shrink-0"
          >
            {t('Mudar para Perfil de Prestador', 'Switch to Provider Profile')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
          <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            {t('Índice de Fiabilidade Bilateral', 'Bilateral Reliability Standing')}
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
            {t(
              'Avaliado por profissionais independentes e empresas após acordos concluídos.',
              'Evaluated by independent professionals and businesses after completed agreements.',
            )}
          </p>
          <div className="space-y-3 pt-1">
            <ReliabilityBar
              label={t('Clareza do Âmbito e Requisitos', 'Scope Clarity & Requirements')}
              value={customer.reliability.qualityOrClarity}
            />
            <ReliabilityBar
              label={t('Rapidez na Comunicação', 'Communication Responsiveness')}
              value={customer.reliability.communication}
            />
            <ReliabilityBar
              label={t('Confirmação Pontual de Conclusão', 'Timely Completion Sign-off')}
              value={customer.reliability.punctuality}
            />
            <ReliabilityBar
              label={t('Taxa de Recontratação por Prestadores', 'Provider Re-engagement Rate')}
              value={customer.reliability.repeatRate}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
          <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            {t('Avaliações de Profissionais', 'Feedback from Professionals')}
          </h2>
          {customerReviews.length === 0 ? (
            <p className="text-sm text-[#64748B]">
              {t('Ainda sem avaliações de prestadores.', 'No provider feedback yet.')}
            </p>
          ) : (
            <div className="space-y-4">
              {customerReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="pb-4 border-b last:border-b-0 last:pb-0 border-[#E2E8F0] dark:border-[#1E325C] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F172A] dark:text-white">{rev.authorName}</span>
                    <span className="text-[#64748B]">{rev.date}</span>
                  </div>
                  <p className="text-xs text-[#1D6FE5] dark:text-[#60A5FA]">
                    {rev.requestTitle}
                  </p>
                  <p className="text-sm text-[#334155] dark:text-[#CBD5E1]">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
        <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
          {t('Pedidos de Serviço Recentes', 'Recent Service Requests')}
        </h2>
        <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
          {requests.slice(0, 5).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRequest(r.id)}
              className="w-full py-3 flex items-center justify-between gap-4 text-left hover:opacity-80"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#0F172A] dark:text-white truncate">{r.title}</p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  {translateCategory(r.category, lang)} · {r.municipality}
                </p>
              </div>
              <RequestStateTag state={r.state} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
