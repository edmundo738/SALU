import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Handshake,
  MapPin,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  Star,
  Wallet,
  X,
} from 'lucide-react';
import { ANGOLA_MUNICIPALITIES, SERVICE_CATEGORIES, formatKwanza } from '../data/saluData';
import { translateCategory, translateUrgency, useLang } from '../i18n/translations';
import {
  NotificationItem,
  Proposal,
  ProviderProfileDraft,
  ReviewItem,
  ScreenId,
  ServiceRequest,
} from '../types/salu';
import { LuandaNightBackdrop, ReliabilityBar, RequestStateTag } from './ui/Primitives';

interface ProviderDashboardProps {
  profileDraft: ProviderProfileDraft;
  requests: ServiceRequest[];
  reviews: ReviewItem[];
  notifications: NotificationItem[];
  onNavigate: (screen: ScreenId) => void;
  onSelectRequest: (id: string) => void;
  onOpenProposalModal: (req: ServiceRequest) => void;
}

export function ProviderDashboard({
  profileDraft,
  requests,
  reviews,
  notifications,
  onNavigate,
  onSelectRequest,
  onOpenProposalModal,
}: ProviderDashboardProps) {
  const { lang, t } = useLang();
  const [opportunityFilter, setOpportunityFilter] = useState<'ALL' | 'URGENT' | 'HIGHEST'>('ALL');

  const openOpportunities = requests.filter((r) =>
    ['OPEN', 'PROPOSALS_RECEIVED'].includes(r.state)
  );
  const currentJobs = requests.filter((r) =>
    ['NEGOTIATING', 'AGREEMENT_CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(
      r.state
    )
  );
  const completedJobs = requests.filter((r) => r.state === 'COMPLETED');
  const providerReviews = reviews.filter((r) => r.targetRole === 'provider');

  const totalOpenBudgetKz = openOpportunities.reduce((sum, r) => sum + (r.budgetKz || 0), 0);
  const totalAgreedKz = currentJobs.reduce(
    (sum, r) => sum + (r.agreement?.agreedPriceKz ?? r.budgetKz ?? 0),
    0
  );
  const proposalsSubmittedCount = requests.reduce((sum, r) => sum + r.proposals.length, 0);

  const urgentOpportunities = openOpportunities.filter((r) => r.urgency === 'Urgent (48h)');
  const visibleOpportunities =
    opportunityFilter === 'URGENT'
      ? urgentOpportunities
      : opportunityFilter === 'HIGHEST'
        ? [...openOpportunities].sort((a, b) => (b.budgetKz ?? 0) - (a.budgetKz ?? 0))
        : openOpportunities;

  const completionItems = [
    Boolean(profileDraft.displayName),
    Boolean(profileDraft.profession),
    Boolean(profileDraft.bio),
    profileDraft.skills.length > 0,
    Boolean(profileDraft.municipality),
    Boolean(profileDraft.availability),
    Boolean(profileDraft.experienceOptional),
    profileDraft.portfolioItems.length > 0,
  ];
  const completionPct = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100
  );

  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - completionPct / 100);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* CENTER WORKSPACE COLUMN */}
      <div className="xl:col-span-8 space-y-6 min-w-0">
        {/* 1. PROVIDER HERO BANNER */}
        <section className="relative overflow-hidden rounded-2xl bg-[#061534] text-white min-h-[210px] sm:min-h-[232px] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <LuandaNightBackdrop variant="hero" />

          <div className="relative z-10 max-w-xl space-y-2.5">
            <h1 className="font-display text-2xl sm:text-[30px] font-extrabold tracking-tight leading-[1.15] text-white">
              {t('Ganhe dinheiro ', 'Get paid ')}
              <em className="italic font-extrabold">{t('resolvendo', 'solving')}</em>
              {t(' problemas reais ', ' real problems ')}
              <span className="text-[#F97316]">{t('perto de si', 'near you')}</span>.
            </h1>
            <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed max-w-md">
              {t(
                'Escolha pedidos de serviço de clientes em Angola, envie o seu preço em Kwanzas e receba pelo trabalho concluído.',
                'Pick paid client requests across Angola, quote your rate in Kwanzas, and get paid upon completion.'
              )}
            </p>
          </div>

          <div className="relative z-10 pt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('opportunities')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold shadow-md transition-colors"
            >
              <span>
                {t('Ver Pedidos de Serviço', 'Browse Service Requests')} ({openOpportunities.length})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('provider-onboarding')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/18 border border-white/20 text-white text-xs font-semibold transition-colors"
            >
              <span>{t('Configurar Serviços & Preços', 'Configure Services & Rates')}</span>
            </button>
          </div>
        </section>

        {/* 2. PAID WORK PIPELINE KPI STRIP */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-4 space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              {t('Pedidos Abertos', 'Open Paid Jobs')}
            </p>
            <p className="font-display font-extrabold text-xl text-[#081C41] dark:text-white tabular-nums">
              {openOpportunities.length}
            </p>
            <p className="text-[11px] font-mono tabular-nums font-semibold text-[#F97316] truncate">
              {formatKwanza(totalOpenBudgetKz, lang)}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-4 space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              {t('Acordos Ativos', 'Active Agreements')}
            </p>
            <p className="font-display font-extrabold text-xl text-[#081C41] dark:text-white tabular-nums">
              {currentJobs.length}
            </p>
            <p className="text-[11px] font-mono tabular-nums font-semibold text-[#10B981] truncate">
              {formatKwanza(totalAgreedKz, lang)}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-4 space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              {t('Propostas Enviadas', 'Quotes Sent')}
            </p>
            <p className="font-display font-extrabold text-xl text-[#081C41] dark:text-white tabular-nums">
              {proposalsSubmittedCount}
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
              {t('Em análise pelos clientes', 'Under client review')}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-4 space-y-1 shadow-xs">
            <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              {t('Reputação & Seriedade', 'Standing & Trust')}
            </p>
            <p className="font-display font-extrabold text-xl text-[#081C41] dark:text-white tabular-nums inline-flex items-center gap-1">
              <span>{completedJobs.length > 0 ? '5.0' : '—'}</span>
              <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
              {completedJobs.length > 0
                ? `${completedJobs.length} ${t('trabalhos concluídos', 'jobs done')}`
                : t('Sem avaliações ainda', 'No reviews yet')}
            </p>
          </div>
        </section>

        {/* 3. OPEN PAID REQUESTS READY FOR QUOTES */}
        <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#081C41] dark:text-[#F8FAFC] inline-flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#F97316]" />
                <span>
                  {t('Pedidos de Serviço Disponíveis', 'Service Requests Ready to Quote')} ({visibleOpportunities.length})
                </span>
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {t(
                  'Envie a sua proposta com preço em Kwanzas e prazo de entrega.',
                  'Submit your Kwanza quote and delivery timeline directly to the client.'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('opportunities')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#F97316] hover:underline"
            >
              <span>{t('Ver todos', 'See all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: `${t('Todos', 'All')} (${openOpportunities.length})` },
              {
                id: 'URGENT',
                label: `${t('Urgente (48h)', 'Urgent (48h)')} (${urgentOpportunities.length})`,
              },
              { id: 'HIGHEST', label: t('Maior Orçamento', 'Highest Budget') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOpportunityFilter(tab.id as typeof opportunityFilter)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  opportunityFilter === tab.id
                    ? 'bg-[#081C41] text-white border-[#081C41] dark:bg-[#F97316] dark:border-[#F97316]'
                    : 'bg-[#F8FAFC] dark:bg-[#060E20] text-[#475569] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#1E325C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {visibleOpportunities.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#F97316] rounded-xl space-y-3 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#F97316]">
                    {translateCategory(req.category, lang)} · {translateUrgency(req.urgency, lang)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF7ED] dark:bg-[#F97316]/15 border border-[#FED7AA] dark:border-[#F97316]/30 text-xs font-mono tabular-nums font-bold text-[#EA580C] dark:text-[#FB923C]">
                      <Wallet className="w-3 h-3" />
                      {formatKwanza(req.budgetKz, lang)}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-[#64748B] dark:text-[#94A3B8] inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {req.distanceKm} km
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-base font-bold text-[#081C41] dark:text-[#F8FAFC]">
                  {req.title}
                </h3>
                <p className="text-sm text-[#475569] dark:text-[#94A3B8] line-clamp-2">
                  {req.description}
                </p>
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E325C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-[#475569] dark:text-[#94A3B8] flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                      {req.municipality}
                    </span>
                    <span>·</span>
                    <span>
                      {req.customerName} ({req.customerReliabilityScore}%)
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">
                      {req.proposals.length}{' '}
                      {req.proposals.length === 1 ? t('proposta', 'quote') : t('propostas', 'quotes')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectRequest(req.id)}
                      className="px-3.5 py-2 text-xs font-semibold border border-[#CBD5E1] dark:border-[#1E325C] bg-white dark:bg-[#0C1833] rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#132347]"
                    >
                      {t('Ver Pedido', 'View Brief')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenProposalModal(req)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg"
                    >
                      {t('Enviar Preço & Proposta', 'Send Quote')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT RAIL: ACCOUNT SUMMARY, BOOST PROFILE CTA, ACTIVE JOBS & ACTIVITY */}
      <aside className="xl:col-span-4 space-y-5 xl:sticky xl:top-24">
        {/* 1. Account Summary Card */}
        <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#081C41] dark:text-[#F8FAFC]">
              {t('Resumo da sua conta', 'Account summary')}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('provider-onboarding')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#F97316] hover:underline"
            >
              <span>{t('Editar', 'Edit')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

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
                  stroke="#F97316"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <span className="absolute font-display font-extrabold text-base text-[#081C41] dark:text-white tabular-nums">
                {completionPct}%
              </span>
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="font-display font-bold text-sm text-[#081C41] dark:text-white truncate">
                {profileDraft.entityType === 'INDIVIDUAL'
                  ? profileDraft.displayName
                  : profileDraft.businessName || profileDraft.displayName}
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-snug">
                {t(
                  'Complete o seu perfil e tarifas para receber mais pedidos de serviço.',
                  'Complete services & rates to win more paid requests.'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 pt-3 border-t border-[#E2E8F0] dark:border-[#1E325C] divide-x divide-[#E2E8F0] dark:divide-[#1E325C] text-center">
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 font-display font-extrabold text-base text-[#081C41] dark:text-white tabular-nums">
                <Handshake className="w-4 h-4 text-[#F97316]" />
                <span>{currentJobs.length}</span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {t('Ativos', 'Active')}
              </p>
            </div>
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 font-display font-extrabold text-base text-[#081C41] dark:text-white tabular-nums">
                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                <span>{completedJobs.length > 0 ? '5.0' : '—'}</span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {t('Avaliação', 'Rating')}
              </p>
            </div>
            <div className="px-2 space-y-0.5">
              <div className="flex items-center justify-center gap-1 font-display font-extrabold text-base text-[#081C41] dark:text-white tabular-nums">
                <ShieldCheck className="w-4 h-4 text-[#1D6FE5]" />
                <span>{completedJobs.length > 0 ? '100%' : '—'}</span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {t('Seriedade', 'Reliability')}
              </p>
            </div>
          </div>
        </div>

        {/* 2. PROVIDER BOOST / VERIFICATION CTA */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#061534] via-[#0B2252] to-[#081C41] text-white p-5 shadow-sm border border-[#1B356C] space-y-3">
          <div className="space-y-1.5">
            <h2 className="font-display font-bold text-base text-white">
              {t('Ganhe mais clientes e pedidos', 'Win more clients and requests')}
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              {t(
                'Envie propostas claras com preço em Kwanzas e prazo fechado para fechar acordos mais rápido.',
                'Send clear Kwanza quotes and fixed timelines to lock agreements faster.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('opportunities')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors"
          >
            <span>{t('Ver Pedidos de Serviço', 'Browse Service Requests')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. ACTIVE JOBS & AGREEMENTS */}
        <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#081C41] dark:text-[#F8FAFC]">
              {t('Trabalhos & Acordos Ativos', 'Active Jobs & Agreements')}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('requests')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#F97316] hover:underline"
            >
              <span>{t('Ver todos', 'View all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {currentJobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => onSelectRequest(job.id)}
                className="w-full text-left pb-3 border-b last:border-b-0 last:pb-0 border-[#E2E8F0] dark:border-[#1E325C] space-y-1 hover:opacity-80"
              >
                <div className="flex items-center justify-between gap-2">
                  <RequestStateTag state={job.state} />
                  <span className="text-[11px] font-mono tabular-nums font-bold text-[#10B981]">
                    {formatKwanza(job.agreement?.agreedPriceKz ?? job.budgetKz, lang)}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#081C41] dark:text-[#F8FAFC] truncate pt-0.5">
                  {job.title}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{job.customerName}</p>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E325C] space-y-2.5">
            <ReliabilityBar label={t('Comunicação', 'Communication')} value={98} />
            <ReliabilityBar label={t('Cumprimento de Prazos', 'Schedule Adherence')} value={97} />
          </div>
        </div>

        {/* 4. RECENT ACTIVITY / REVIEWS */}
        <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#081C41] dark:text-[#F8FAFC]">
              {t('Atividade recente', 'Recent activity')}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('notifications')}
              className="text-xs font-semibold text-[#F97316] hover:underline"
            >
              {t('Todas', 'All')}
            </button>
          </div>
          {notifications.slice(0, 2).map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-2.5 text-xs pb-2.5 border-b border-[#E2E8F0] dark:border-[#1E325C]"
            >
              <div className="w-8 h-8 rounded-full bg-[#1D6FE5]/15 text-[#1D6FE5] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                {n.category === 'message' ? (
                  <MessageSquare className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#081C41] dark:text-white truncate">{n.title}</p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{n.timestamp}</p>
              </div>
            </div>
          ))}
          {providerReviews.slice(0, 1).map((rev) => (
            <div key={rev.id} className="text-xs space-y-1">
              <p className="font-semibold text-[#081C41] dark:text-[#F8FAFC] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                <span>{rev.authorName}</span>
              </p>
              <p className="text-[#475569] dark:text-[#94A3B8] line-clamp-2">{rev.comment}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

interface OpportunityDiscoveryProps {
  requests: ServiceRequest[];
  initialSearch?: string;
  onSelectRequest: (id: string) => void;
  onOpenProposalModal: (req: ServiceRequest) => void;
}

export function OpportunityDiscovery({
  requests,
  initialSearch = '',
  onSelectRequest,
  onOpenProposalModal,
}: OpportunityDiscoveryProps) {
  const { lang, t } = useLang();
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [municipalityFilter, setMunicipalityFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const opportunities = requests.filter((r) => {
    const isDiscoverable = ['OPEN', 'PROPOSALS_RECEIVED'].includes(r.state);
    const q = search.toLowerCase();
    const matchesQuery =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesArea =
      municipalityFilter === 'ALL' || r.municipality === municipalityFilter;
    const matchesUrg = urgencyFilter === 'ALL' || r.urgency === urgencyFilter;
    return isDiscoverable && matchesQuery && matchesCat && matchesArea && matchesUrg;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <aside className="lg:col-span-3 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-4 space-y-4 lg:sticky lg:top-[72px] shadow-xs">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {t('Oportunidades', 'Opportunities')}
          </h1>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategoryFilter('ALL');
              setMunicipalityFilter('ALL');
              setUrgencyFilter('ALL');
            }}
            className="text-xs font-medium text-[#F97316] hover:underline"
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
            placeholder={t('Pesquisar trabalho ou zona...', 'Search job or area...')}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#F97316]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
            {t('Município', 'Municipality')}
          </label>
          <select
            value={municipalityFilter}
            onChange={(e) => setMunicipalityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
          >
            <option value="ALL">{t('Todas as Zonas', 'All Locations')}</option>
            {ANGOLA_MUNICIPALITIES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
            {t('Urgência', 'Urgency')}
          </label>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
          >
            <option value="ALL">{t('Qualquer Prazo', 'Any Timeline')}</option>
            <option value="Urgent (48h)">{t('Urgente (48h)', 'Urgent (48h)')}</option>
            <option value="This Week">{t('Esta Semana', 'This Week')}</option>
            <option value="Flexible">{t('Prazo Flexível', 'Flexible')}</option>
          </select>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#1E325C]">
          <p className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
            {t('Categorias', 'Categories')}
          </p>
          <div className="flex lg:flex-col gap-1.5 lg:gap-1 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setCategoryFilter('ALL')}
              className={`lg:w-full text-left px-3 lg:px-2.5 py-2 lg:py-1.5 text-xs rounded-md whitespace-nowrap shrink-0 ${
                categoryFilter === 'ALL'
                  ? 'bg-[#F97316]/12 text-[#F97316] font-semibold'
                  : 'text-[#334155] dark:text-[#CBD5E1] bg-[#F8FAFC] lg:bg-transparent dark:bg-[#060E20] lg:dark:bg-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#132347]'
              }`}
            >
              {t('Todas as Categorias', 'All Categories')}
            </button>
            {SERVICE_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoryFilter(c)}
                className={`lg:w-full text-left px-3 lg:px-2.5 py-2 lg:py-1.5 text-xs rounded-md whitespace-nowrap shrink-0 ${
                  categoryFilter === c
                    ? 'bg-[#F97316]/12 text-[#F97316] font-semibold'
                    : 'text-[#334155] dark:text-[#CBD5E1] bg-[#F8FAFC] lg:bg-transparent dark:bg-[#060E20] lg:dark:bg-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#132347]'
                }`}
              >
                {translateCategory(c, lang)}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="lg:col-span-9 space-y-4">
        <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
          <strong className="font-mono text-[#0F172A] dark:text-white">
            {opportunities.length}
          </strong>{' '}
          {t('pedidos abertos disponíveis para propostas', 'open customer requests available for proposals')}
        </p>

        {opportunities.length === 0 ? (
          <div className="p-10 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl text-center">
            <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
              {t('Nenhuma oportunidade aberta corresponde aos filtros atuais.', 'No open opportunities match those filters right now.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#F97316] rounded-xl p-5 flex flex-col justify-between gap-4 transition-colors shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#F97316]">
                      {translateCategory(opp.category, lang)} · {translateUrgency(opp.urgency, lang)}
                    </span>
                    <RequestStateTag state={opp.state} />
                  </div>

                  <h2 className="font-display text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {opp.title}
                  </h2>

                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] line-clamp-3 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#1E325C] text-xs">
                    <div>
                      <p className="text-[#64748B] dark:text-[#94A3B8]">{t('Orçamento Indicado', 'Disclosed Budget')}</p>
                      <p className="font-mono tabular-nums font-bold text-[#F97316] mt-0.5">
                        {formatKwanza(opp.budgetKz, lang)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#64748B] dark:text-[#94A3B8]">{t('Localização & Distância', 'Location & Distance')}</p>
                      <p className="font-medium text-[#0F172A] dark:text-white mt-0.5 truncate">
                        {opp.municipality} · {opp.distanceKm} km
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E325C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-[#475569] dark:text-[#94A3B8] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1D6FE5] dark:text-[#60A5FA] shrink-0" />
                    <span className="truncate">
                      {opp.customerName} ({opp.customerReliabilityScore}%)
                    </span>
                  </span>
                  <div className="grid grid-cols-2 sm:flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectRequest(opp.id)}
                      className="min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 text-xs font-medium border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#132347]"
                    >
                      {t('Inspecionar', 'Inspect')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenProposalModal(opp)}
                      className="min-h-[44px] sm:min-h-0 px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg"
                    >
                      {t('Propor', 'Propose')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProposalModalProps {
  request: ServiceRequest;
  providerName: string;
  providerProfession: string;
  onClose: () => void;
  onSubmitProposal: (
    requestId: string,
    proposal: Omit<Proposal, 'id' | 'submittedAt' | 'status'>
  ) => void;
}

export function ProposalSubmissionModal({
  request,
  providerName,
  providerProfession,
  onClose,
  onSubmitProposal,
}: ProposalModalProps) {
  const { lang, t } = useLang();
  const [message, setMessage] = useState(
    lang === 'pt'
      ? `Olá ${request.customerName.split(' ')[0]}, analisei o seu pedido em ${request.municipality} e terei todo o gosto em ajudar.`
      : `Hello ${request.customerName.split(' ')[0]}, I reviewed your request in ${request.municipality} and would be glad to help.`
  );
  const [approach, setApproach] = useState('');
  const [priceStr, setPriceStr] = useState(
    request.budgetKz ? String(request.budgetKz) : '120000'
  );
  const [days, setDays] = useState('2');
  const [questions, setQuestions] = useState('');
  const [proposeInspection, setProposeInspection] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !approach.trim()) {
      setError(
        t(
          'Por favor, inclua uma breve apresentação e como pretende resolver o problema.',
          'Please include a brief introduction and how you will solve the problem.'
        )
      );
      return;
    }
    const price = Number(priceStr.replace(/[^0-9]/g, '')) || 0;
    onSubmitProposal(request.id, {
      requestId: request.id,
      providerId: 'pro-current',
      providerName,
      providerProfession,
      providerAvatar: '/src/assets/images/pro_mateus_electrician_1795204346516.jpg',
      providerVerified: true,
      message: message.trim(),
      approach: approach.trim(),
      suggestedPriceKz: price,
      estimatedDays: Number(days) || 1,
      questions: questions.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061534]/65 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#F97316]">
              {t('Enviar Proposta', 'Submit Proposal')}
            </p>
            <h2 className="font-display text-lg font-bold text-[#0F172A] dark:text-white mt-0.5">
              {request.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            aria-label={t('Fechar janela', 'Close modal')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Apresentação *', 'Introduction *')}
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Como Vai Resolver Este Problema *', 'How You Will Solve This Problem *')}
            </label>
            <textarea
              rows={3}
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              placeholder={t(
                'Descreva etapas, verificações de segurança, materiais incluídos ou visita técnica necessária...',
                'Outline steps, safety checks, materials included, or site visit needed...'
              )}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="p-3 rounded-xl border border-dashed border-[#F97316]/40 bg-[#FFF7ED] dark:bg-[#F97316]/10">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={proposeInspection}
                onChange={(e) => {
                  setProposeInspection(e.target.checked);
                  if (e.target.checked && !approach) {
                    setApproach(lang === 'pt' ? 'Proposta de vistoria técnica prévia no local para diagnosticar avaria e quantificar materiais necessários.' : 'Technical on-site inspection proposed to diagnose and scope materials accurately.');
                  }
                }}
                className="mt-0.5 rounded text-[#F97316] focus:ring-[#F97316]"
              />
              <div>
                <div className="text-xs font-bold text-[#081C41] dark:text-[#F8FAFC]">
                  {t('Propor Vistoria Técnica / Orçamento a Confirmar no Local', 'Propose On-Site Inspection / Quote to Confirm on Site')}
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-tight mt-0.5">
                  {t(
                    'Marque se o valor final depender de inspecionar componentes e comprar peças após diagnóstico no terreno.',
                    'Check if final price depends on physical inspection and parts required.'
                  )}
                </p>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
                {t('Preço Sugerido (Kz) *', 'Suggested Price (Kz) *')}
              </label>
              <input
                type="text"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
                {t('Conclusão Estimada (Dias) *', 'Estimated Completion (Days) *')}
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Perguntas de Esclarecimento para o Cliente (Opcional)', 'Clarifying Questions for Customer (Optional)')}
            </label>
            <input
              type="text"
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder={t(
                'ex.: É necessário acesso ao prédio ou estacionamento antes das 09:00?',
                'e.g. Is parking or building access required before 09:00?'
              )}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#F97316]"
            />
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E325C] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#132347] rounded-lg"
            >
              {t('Cancelar', 'Cancel')}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('Enviar Proposta', 'Send Proposal')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
