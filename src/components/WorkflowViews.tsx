import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Lock,
  MapPin,
  MessageSquare,
  PlayCircle,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { formatKwanza } from '../data/saluData';
import {
  translateCategory,
  translateRequestState,
  translateUrgency,
  useLang,
} from '../i18n/translations';
import {
  Agreement,
  Professional,
  Proposal,
  RequestState,
  ReviewItem,
  ServiceRequest,
  UserRole,
} from '../types/salu';
import {
  REQUEST_STATE_META,
  ReliabilityBar,
  RequestStateTag,
  SafeAvatar,
} from './ui/Primitives';

const ALL_STATES: ('ALL' | RequestState)[] = [
  'ALL',
  'DRAFT',
  'OPEN',
  'PROPOSALS_RECEIVED',
  'NEGOTIATING',
  'AGREEMENT_CONFIRMED',
  'IN_PROGRESS',
  'COMPLETION_PENDING',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
];

interface RequestsListProps {
  requests: ServiceRequest[];
  activeRole: UserRole;
  onSelectRequest: (id: string) => void;
  onCreateRequest: () => void;
  onBrowseOpportunities: () => void;
}

export function RequestsManagementList({
  requests,
  activeRole,
  onSelectRequest,
  onCreateRequest,
  onBrowseOpportunities,
}: RequestsListProps) {
  const { lang, t } = useLang();
  const [stateFilter, setStateFilter] = useState<'ALL' | RequestState>('ALL');

  const filtered = requests.filter(
    (r) => stateFilter === 'ALL' || r.state === stateFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
            {activeRole === 'customer'
              ? t('Pedidos de Serviço & Acordos', 'Service Requests & Agreements')
              : t('Propostas, Acordos & Trabalhos', 'Proposals, Agreements & Jobs')}
          </h1>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
            {t(
              'Acompanhe cada etapa desde o rascunho e comparação de propostas até ao acordo confirmado e conclusão.',
              'Inspect every stage from draft and proposal comparison to confirmed agreement and completion.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={activeRole === 'customer' ? onCreateRequest : onBrowseOpportunities}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg whitespace-nowrap shrink-0 ${
            activeRole === 'provider'
              ? 'bg-[#F97316] hover:bg-[#EA580C]'
              : 'bg-[#1D6FE5] hover:bg-[#1558B8]'
          }`}
        >
          {activeRole === 'customer'
            ? t('Publicar Novo Pedido', 'Publish New Request')
            : t('Procurar Novas Oportunidades', 'Find New Opportunities')}
        </button>
      </div>

      {/* Explicit 10-State Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {ALL_STATES.map((st) => {
          const count =
            st === 'ALL'
              ? requests.length
              : requests.filter((r) => r.state === st).length;
          const active = stateFilter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStateFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#081C41] text-white border-[#081C41] dark:bg-[#1D6FE5] dark:border-[#1D6FE5]'
                  : 'bg-white dark:bg-[#0C1833] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#1E325C] hover:bg-[#F8FAFC] dark:hover:bg-[#132347]'
              }`}
            >
              {st === 'ALL'
                ? t('Todos', 'All')
                : translateRequestState(st, REQUEST_STATE_META[st].shortLabel, lang)}{' '}
              <span className="font-mono tabular-nums opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl text-center space-y-2 shadow-xs">
          <p className="text-sm font-medium text-[#0F172A] dark:text-white">
            {t('Nenhum item no estado', 'No items in state')}{' '}
            {stateFilter === 'ALL'
              ? t('selecionado', 'selected')
              : translateRequestState(stateFilter, REQUEST_STATE_META[stateFilter].shortLabel, lang)}.
          </p>
          <button
            type="button"
            onClick={() => setStateFilter('ALL')}
            className="text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
          >
            {t('Mostrar Todos os Pedidos', 'Show All Requests')}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl divide-y divide-[#E2E8F0] dark:divide-[#1E325C] shadow-xs">
          {filtered.map((req) => (
            <button
              key={req.id}
              type="button"
              onClick={() => onSelectRequest(req.id)}
              className="w-full text-left p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#132347]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <RequestStateTag state={req.state} showCode />
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {translateCategory(req.category, lang)} · {req.municipality} · {req.createdAt}
                  </span>
                </div>
                <h2 className="font-display font-semibold text-base text-[#0F172A] dark:text-white truncate">
                  {req.title}
                </h2>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  {req.proposals.length}{' '}
                  {req.proposals.length === 1
                    ? t('proposta', 'proposal')
                    : t('propostas', 'proposals')}
                  {req.agreement
                    ? ` · ${t('Acordo com', 'Agreement with')} ${req.agreement.providerName}`
                    : ` · ${t('Orçamento indicativo:', 'Target budget:')} ${formatKwanza(req.budgetKz, lang)}`}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA] shrink-0">
                {t('Abrir Área de Trabalho →', 'Open Workspace →')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface RequestDetailProps {
  request: ServiceRequest;
  activeRole: UserRole;
  onBack: () => void;
  onSelectProfessional: (id: string) => void;
  onOpenChat: (requestId: string, partyName: string, partyId: string) => void;
  onPublishDraft: (requestId: string) => void;
  onAcceptProposalToNegotiate: (requestId: string, proposal: Proposal) => void;
  onDeclineProposal: (requestId: string, proposalId: string) => void;
  onUpdateAgreement: (requestId: string, agreement: Agreement) => void;
  onAcceptAgreement: (requestId: string, role: UserRole) => void;
  onStartWork: (requestId: string) => void;
  onMarkComplete: (requestId: string, role: UserRole) => void;
  onCancelRequest: (requestId: string) => void;
  onReportDispute: (requestId: string) => void;
  onGoToReview: (requestId: string) => void;
  onOpenProposalModal: (req: ServiceRequest) => void;
}

export function RequestDetailAndTracking({
  request,
  activeRole,
  onBack,
  onSelectProfessional,
  onOpenChat,
  onPublishDraft,
  onAcceptProposalToNegotiate,
  onDeclineProposal,
  onUpdateAgreement,
  onAcceptAgreement,
  onStartWork,
  onMarkComplete,
  onCancelRequest,
  onReportDispute,
  onGoToReview,
  onOpenProposalModal,
}: RequestDetailProps) {
  const { lang, t } = useLang();
  const [editingAgreement, setEditingAgreement] = useState(false);
  const [draftAgr, setDraftAgr] = useState<Agreement | undefined>(request.agreement);

  const TRACKING_STEPS: { state: RequestState; label: string }[] = [
    { state: 'OPEN', label: t('A Aguardar Propostas', 'Waiting for Proposals') },
    { state: 'NEGOTIATING', label: t('Em Negociação', 'Under Negotiation') },
    { state: 'AGREEMENT_CONFIRMED', label: t('Acordo Confirmado', 'Agreement Confirmed') },
    { state: 'IN_PROGRESS', label: t('Em Execução', 'In Progress') },
    { state: 'COMPLETION_PENDING', label: t('Aguardar Confirmação', 'Awaiting Confirmation') },
    { state: 'COMPLETED', label: t('Concluído', 'Completed') },
  ];

  React.useEffect(() => {
    setDraftAgr(request.agreement);
  }, [request.agreement]);

  const currentStepIndex = (() => {
    if (request.state === 'DRAFT') return -1;
    if (request.state === 'OPEN' || request.state === 'PROPOSALS_RECEIVED') return 0;
    if (request.state === 'NEGOTIATING') return 1;
    if (request.state === 'AGREEMENT_CONFIRMED') return 2;
    if (request.state === 'IN_PROGRESS') return 3;
    if (request.state === 'COMPLETION_PENDING') return 4;
    if (request.state === 'COMPLETED') return 5;
    return -1;
  })();

  const handleSaveAgreementEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftAgr) return;
    onUpdateAgreement(request.id, draftAgr);
    setEditingAgreement(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Todos os Pedidos', 'All Requests')}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {request.state === 'DRAFT' && activeRole === 'customer' && (
            <button
              type="button"
              onClick={() => onPublishDraft(request.id)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
            >
              {t('Publicar Pedido Agora', 'Publish Request Now')}
            </button>
          )}
          {['OPEN', 'PROPOSALS_RECEIVED'].includes(request.state) &&
            activeRole === 'provider' && (
              <button
                type="button"
                onClick={() => onOpenProposalModal(request)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg"
              >
                {t('Enviar Proposta', 'Submit Proposal')}
              </button>
            )}
          {!['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(request.state) && (
            <>
              <button
                type="button"
                onClick={() => onReportDispute(request.id)}
                className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                {t('Reportar Problema', 'Report Problem')}
              </button>
              {activeRole === 'customer' && (
                <button
                  type="button"
                  onClick={() => onCancelRequest(request.id)}
                  className="px-3 py-1.5 text-xs font-medium text-[#475569] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#132347]"
                >
                  {t('Cancelar Pedido', 'Cancel Request')}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Request Summary Header */}
      <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <RequestStateTag state={request.state} showCode />
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {translateCategory(request.category, lang)} · {translateUrgency(request.urgency, lang)} ·{' '}
              {t('Criado', 'Created')} {request.createdAt}
            </span>
          </div>
          <span className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">
            ID: {request.id.toUpperCase()}
          </span>
        </div>

        <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
          {request.title}
        </h1>
        <p className="text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
          {request.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E2E8F0] dark:border-[#1E325C] text-xs">
          <div>
            <p className="text-[#64748B] dark:text-[#94A3B8]">{t('Localização', 'Location')}</p>
            <p className="font-medium text-[#0F172A] dark:text-white mt-0.5">
              {request.location}
            </p>
          </div>
          <div>
            <p className="text-[#64748B] dark:text-[#94A3B8]">{t('Orçamento Indicativo', 'Target Budget')}</p>
            <p className="font-mono tabular-nums font-medium text-[#0F172A] dark:text-white mt-0.5">
              {formatKwanza(request.budgetKz, lang)}
            </p>
          </div>
          <div>
            <p className="text-[#64748B] dark:text-[#94A3B8]">{t('Disponibilidade', 'Availability')}</p>
            <p className="font-medium text-[#0F172A] dark:text-white mt-0.5">
              {request.availability}
            </p>
          </div>
          <div>
            <p className="text-[#64748B] dark:text-[#94A3B8]">{t('Cliente', 'Customer')}</p>
            <p className="font-medium text-[#0F172A] dark:text-white mt-0.5">
              {request.customerName} ({request.customerReliabilityScore}% {t('fiabilidade', 'reliability')})
            </p>
          </div>
        </div>
      </section>

      {/* Service Progress Tracking Bar */}
      <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
            {t('Progresso do Serviço & Acompanhamento', 'Service Progress & Completion Tracking')}
          </h2>
          {request.state === 'DISPUTED' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>{t('Revisão de mediação ativa', 'Mediation review active')}</span>
            </span>
          )}
          {request.state === 'CANCELLED' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              <XCircle className="w-4 h-4" />
              <span>{t('Pedido cancelado', 'Request cancelled')}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {TRACKING_STEPS.map((step, idx) => {
            const reached = currentStepIndex >= idx;
            const current = currentStepIndex === idx;
            return (
              <div
                key={step.state}
                className={`p-3 rounded-lg border text-xs transition-colors ${
                  current
                    ? 'border-[#1D6FE5] bg-[#1D6FE5]/10 text-[#1D6FE5] dark:text-[#60A5FA] font-semibold'
                    : reached
                    ? 'border-[#1D6FE5]/30 dark:border-[#60A5FA]/35 bg-[#1D6FE5]/5 dark:bg-[#1D6FE5]/15 text-[#0F172A] dark:text-[#E2E8F0]'
                    : 'border-[#E2E8F0] dark:border-[#1E325C] text-[#64748B] dark:text-[#94A3B8]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono">0{idx + 1}</span>
                  {reached && <Check className="w-3.5 h-3.5" />}
                </div>
                <p>{step.label}</p>
              </div>
            );
          })}
        </div>

        {['AGREEMENT_CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED'].includes(
          request.state
        ) && (
          <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-sm text-[#0F172A] dark:text-white">
                {request.state === 'AGREEMENT_CONFIRMED' &&
                  t('Acordo fechado. Pronto para iniciar o trabalho.', 'Agreement locked. Ready to begin work.')}
                {request.state === 'IN_PROGRESS' &&
                  t('Trabalho em andamento. Marque como concluído após finalizar o âmbito.', 'Work is underway. Mark complete once scope is fulfilled.')}
                {request.state === 'COMPLETION_PENDING' &&
                  t('Confirmação bilateral de conclusão em curso', 'Bilateral Completion Sign-off in Progress')}
                {request.state === 'COMPLETED' &&
                  t('Serviço verificado como concluído por ambas as partes', 'Service Verified Complete by Both Parties')}
              </p>
              <p className="text-[#475569] dark:text-[#94A3B8]">
                {t('Prestador confirmou:', 'Provider Confirmed:')}{' '}
                <strong className="text-[#0F172A] dark:text-white">
                  {request.providerConfirmedCompletion ? t('Sim', 'Yes') : t('Pendente', 'Pending')}
                </strong>{' '}
                · {t('Cliente confirmou:', 'Customer Confirmed:')}{' '}
                <strong className="text-[#0F172A] dark:text-white">
                  {request.customerConfirmedCompletion ? t('Sim', 'Yes') : t('Pendente', 'Pending')}
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {request.state === 'AGREEMENT_CONFIRMED' && activeRole === 'provider' && (
                <button
                  type="button"
                  onClick={() => onStartWork(request.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{t('Marcar Trabalho Iniciado', 'Mark Work Started')}</span>
                </button>
              )}

              {['IN_PROGRESS', 'COMPLETION_PENDING'].includes(request.state) && (
                <>
                  {activeRole === 'provider' && !request.providerConfirmedCompletion && (
                    <button
                      type="button"
                      onClick={() => onMarkComplete(request.id, 'provider')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('Confirmar Conclusão (Prestador)', 'Confirm Provider Completion')}</span>
                    </button>
                  )}
                  {activeRole === 'customer' && !request.customerConfirmedCompletion && (
                    <button
                      type="button"
                      onClick={() => onMarkComplete(request.id, 'customer')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('Confirmar Trabalho Concluído', 'Confirm Work Completed')}</span>
                    </button>
                  )}
                </>
              )}

              {request.state === 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => onGoToReview(request.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
                >
                  {t('Deixar Avaliação Bilateral', 'Leave Bilateral Review')}
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {request.agreement && (
            <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-[#1E325C]">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1D6FE5] dark:text-[#60A5FA]" />
                    <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
                      {t('Acordo de Serviço SALU', 'SALU Service Agreement')}
                    </h2>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {t(
                        `Registo privado entre ${request.agreement.customerName} e ${request.agreement.providerName}. O preço acordado nunca é exibido publicamente.`,
                        `Private record between ${request.agreement.customerName} and ${request.agreement.providerName}. Agreed price is never publicly displayed.`
                      )}
                    </span>
                  </p>
                </div>

                {request.state === 'NEGOTIATING' && (
                  <button
                    type="button"
                    onClick={() => setEditingAgreement((v) => !v)}
                    className="text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
                  >
                    {editingAgreement ? t('Cancelar Edição', 'Cancel Edit') : t('Ajustar Termos', 'Adjust Terms')}
                  </button>
                )}
              </div>

              {editingAgreement && draftAgr ? (
                <form onSubmit={handleSaveAgreementEdits} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
                        {t('Preço Acordado (Kz)', 'Agreed Price (Kz)')}
                      </label>
                      <input
                        type="number"
                        value={draftAgr.agreedPriceKz}
                        onChange={(e) =>
                          setDraftAgr({ ...draftAgr, agreedPriceKz: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
                        {t('Prazo Final', 'Deadline')}
                      </label>
                      <input
                        type="date"
                        value={draftAgr.deadline}
                        onChange={(e) =>
                          setDraftAgr({ ...draftAgr, deadline: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
                      {t('Âmbito do Trabalho', 'Scope of Work')}
                    </label>
                    <textarea
                      rows={3}
                      value={draftAgr.scopeOfWork}
                      onChange={(e) =>
                        setDraftAgr({ ...draftAgr, scopeOfWork: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
                      {t('Condições Adicionais', 'Additional Conditions')}
                    </label>
                    <input
                      type="text"
                      value={draftAgr.additionalConditions}
                      onChange={(e) =>
                        setDraftAgr({ ...draftAgr, additionalConditions: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
                  >
                    {t('Guardar Termos Atualizados', 'Save Updated Terms')}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C]">
                    <div>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        {t('Preço Acordado (Privado)', 'Agreed Price (Private)')}
                      </p>
                      <p className="font-mono tabular-nums text-base font-bold text-[#0F172A] dark:text-white mt-0.5">
                        {formatKwanza(request.agreement.agreedPriceKz, lang)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('Prazo Final', 'Deadline')}</p>
                      <p className="font-mono tabular-nums font-medium text-[#0F172A] dark:text-white mt-0.5">
                        {request.agreement.deadline}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('Local do Serviço', 'Site Location')}</p>
                      <p className="font-medium text-[#0F172A] dark:text-white mt-0.5 truncate">
                        {request.agreement.location}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                      {t('Âmbito de Trabalho Acordado', 'Agreed Scope of Work')}
                    </p>
                    <p className="text-[#334155] dark:text-[#CBD5E1] mt-1">
                      {request.agreement.scopeOfWork}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                        {t('Responsabilidades do Prestador', 'Provider Responsibilities')}
                      </p>
                      <p className="text-xs text-[#334155] dark:text-[#CBD5E1] mt-1">
                        {request.agreement.providerResponsibilities}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                        {t('Responsabilidades do Cliente', 'Customer Responsibilities')}
                      </p>
                      <p className="text-xs text-[#334155] dark:text-[#CBD5E1] mt-1">
                        {request.agreement.customerResponsibilities}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                      {t('Condições Adicionais', 'Additional Conditions')}
                    </p>
                    <p className="text-xs text-[#334155] dark:text-[#CBD5E1] mt-1">
                      {request.agreement.additionalConditions}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E325C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs space-y-1">
                      <p>
                        {t('Cliente', 'Customer')} ({request.agreement.customerName}):{' '}
                        <span
                          className={
                            request.agreement.customerAccepted
                              ? 'text-[#1D6FE5] dark:text-[#60A5FA] font-semibold'
                              : 'text-[#F97316] font-semibold'
                          }
                        >
                          {request.agreement.customerAccepted
                            ? t('Aceite', 'Accepted')
                            : t('Aceitação Pendente', 'Pending Acceptance')}
                        </span>
                      </p>
                      <p>
                        {t('Prestador', 'Provider')} ({request.agreement.providerName}):{' '}
                        <span
                          className={
                            request.agreement.providerAccepted
                              ? 'text-[#1D6FE5] dark:text-[#60A5FA] font-semibold'
                              : 'text-[#F97316] font-semibold'
                          }
                        >
                          {request.agreement.providerAccepted
                            ? t('Aceite', 'Accepted')
                            : t('Aceitação Pendente', 'Pending Acceptance')}
                        </span>
                      </p>
                    </div>

                    {request.state === 'NEGOTIATING' && (
                      <div className="flex items-center gap-2">
                        {activeRole === 'customer' && !request.agreement.customerAccepted && (
                          <button
                            type="button"
                            onClick={() => onAcceptAgreement(request.id, 'customer')}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
                          >
                            {t('Aceitar Acordo (Cliente)', 'Accept Agreement (Customer)')}
                          </button>
                        )}
                        {activeRole === 'provider' && !request.agreement.providerAccepted && (
                          <button
                            type="button"
                            onClick={() => onAcceptAgreement(request.id, 'provider')}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg"
                          >
                            {t('Aceitar Acordo (Prestador)', 'Accept Agreement (Provider)')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Proposals Comparison */}
          <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
                {t('Propostas', 'Proposals')} ({request.proposals.length})
              </h2>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {t('Compare âmbito, prazo e fiabilidade', 'Compare scope, timeline, and reliability')}
              </span>
            </div>

            {request.proposals.length === 0 ? (
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] py-4">
                {t(
                  `Ainda não foram enviadas propostas. Especialistas verificados em ${request.municipality} podem manifestar interesse.`,
                  `No proposals submitted yet. Verified specialists in ${request.municipality} can express interest.`
                )}
              </p>
            ) : (
              <div className="space-y-4">
                {request.proposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#1E325C] space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <SafeAvatar src={prop.providerAvatar} alt={prop.providerName} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectProfessional(prop.providerId)}
                              className="font-display font-semibold text-sm text-[#0F172A] dark:text-white hover:text-[#1D6FE5]"
                            >
                              {prop.providerName}
                            </button>
                            {prop.providerVerified && (
                              <ShieldCheck className="w-4 h-4 text-[#1D6FE5] dark:text-[#60A5FA]" />
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                            {prop.providerProfession} · {t('Enviada', 'Submitted')} {prop.submittedAt}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono tabular-nums font-bold text-sm text-[#F97316]">
                          {formatKwanza(prop.suggestedPriceKz, lang)}
                        </p>
                        <p className="font-mono tabular-nums text-xs text-[#64748B] dark:text-[#94A3B8]">
                          {t('Est.', 'Est.')} {prop.estimatedDays}{' '}
                          {prop.estimatedDays === 1 ? t('dia', 'day') : t('dias', 'days')} ·{' '}
                          {prop.status}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-[#334155] dark:text-[#CBD5E1]">{prop.message}</p>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                      <strong className="text-[#0F172A] dark:text-[#F8FAFC]">
                        {t('Abordagem:', 'Approach:')}
                      </strong>{' '}
                      {prop.approach}
                    </p>
                    {prop.questions && (
                      <p className="text-xs text-[#F97316]">
                        <strong>{t('Pergunta:', 'Question:')}</strong> {prop.questions}
                      </p>
                    )}

                    <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E325C] flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenChat(request.id, prop.providerName, prop.providerId)
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#334155] dark:text-[#CBD5E1] hover:text-[#1D6FE5]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{t('Mensagem na SALU', 'Message in SALU')}</span>
                      </button>

                      {activeRole === 'customer' &&
                        prop.status !== 'DECLINED' &&
                        prop.status !== 'ACCEPTED' &&
                        ['OPEN', 'PROPOSALS_RECEIVED'].includes(request.state) && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onDeclineProposal(request.id, prop.id)}
                              className="px-3 py-1.5 text-xs font-medium text-[#475569] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#1E325C] rounded-md hover:bg-[#F8FAFC] dark:hover:bg-[#132347]"
                            >
                              {t('Recusar', 'Decline')}
                            </button>
                            <button
                              type="button"
                              onClick={() => onAcceptProposalToNegotiate(request.id, prop)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-md"
                            >
                              {t('Negociar & Redigir Acordo', 'Negotiate & Draft Agreement')}
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right 5 Cols: Event Timeline */}
        <div className="lg:col-span-5">
          <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
            <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
              {t('Cronologia Verificada de Atividade', 'Verified Activity Timeline')}
            </h2>
            <div className="space-y-4">
              {request.timeline.map((ev) => (
                <div
                  key={ev.id}
                  className="pb-4 border-b last:border-b-0 last:pb-0 border-[#E2E8F0] dark:border-[#1E325C] space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#0F172A] dark:text-white">
                      {ev.label}
                    </span>
                    <span className="font-mono tabular-nums text-[#64748B] shrink-0">
                      {ev.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8]">{ev.detail}</p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{t('Por', 'By')} {ev.actor}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

interface ProfessionalProfileDetailProps {
  professional: Professional;
  reviews: ReviewItem[];
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onStartChat: (pro: Professional) => void;
  onInviteToRequest: () => void;
  onReportUser: (name: string) => void;
}

export function ProfessionalProfileDetail({
  professional,
  reviews,
  onBack,
  onToggleFavorite,
  onStartChat,
  onInviteToRequest,
  onReportUser,
}: ProfessionalProfileDetailProps) {
  const { lang, t } = useLang();
  const proReviews = reviews.filter((r) => r.targetName === professional.name);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Voltar', 'Back')}</span>
        </button>

        <button
          type="button"
          onClick={() => onReportUser(professional.name)}
          className="text-xs text-[#64748B] hover:text-red-600"
        >
          {t('Reportar Perfil', 'Report Profile')}
        </button>
      </div>

      {/* Header Card */}
      <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <SafeAvatar
              src={professional.avatarUrl}
              alt={professional.name}
              sizeClass="w-20 h-20"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
                  {professional.name}
                </h1>
                {professional.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{professional.verificationLabel}</span>
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-[#334155] dark:text-[#CBD5E1]">
                {professional.businessName
                  ? `${professional.profession} · ${professional.businessName}`
                  : professional.profession}
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                  {professional.location} ({t('atua num raio de', 'serves')} {professional.serviceRadiusKm} km)
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {t('Resposta', 'Response')} {professional.responseTime}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {professional.availability}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(professional.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border ${
                professional.isFavorite
                  ? 'border-[#1D6FE5] bg-[#1D6FE5]/10 text-[#1D6FE5] dark:text-[#60A5FA]'
                  : 'border-[#CBD5E1] dark:border-[#1E325C] text-[#334155] dark:text-[#CBD5E1]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>
                {professional.isFavorite
                  ? t('Guardado', 'Saved')
                  : t('Guardar Contacto', 'Save Contact')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onStartChat(professional)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t('Mensagem na SALU', 'Message in SALU')}</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
          {professional.bio}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2E8F0] dark:border-[#1E325C] text-xs">
          <div>
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              {t('Competências & Especialidades', 'Skills & Capabilities')}
            </p>
            <p className="text-[#0F172A] dark:text-white font-medium mt-1">
              {professional.skills.join(' · ')}
            </p>
            {professional.customTags.length > 0 && (
              <p className="text-[#64748B] dark:text-[#94A3B8] mt-1">
                {t('Etiquetas:', 'Tags:')} {professional.customTags.join(' · ')}
              </p>
            )}
          </div>
          <div>
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              {t('Orientação & Opções de Contacto', 'Guidance & Contact Options')}
            </p>
            <p className="text-[#0F172A] dark:text-white font-medium mt-1">
              {professional.pricingGuidance || t('Orçamentado conforme o âmbito', 'Quoted per project scope')}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onInviteToRequest}
                className="text-xs font-semibold text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
              >
                {t('Criar Pedido para este Especialista →', 'Create Request for this Specialist →')}
              </button>
              {professional.whatsappNumber && (
                <a
                  href={`https://wa.me/${professional.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A]"
                >
                  <span>{t('Opção WhatsApp', 'WhatsApp option')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
          <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
            {t('Fiabilidade Verificada', 'Verified Reliability')} ({professional.completedJobs}{' '}
            {t('Trabalhos', 'Jobs')})
          </h2>
          <div className="space-y-3">
            <ReliabilityBar
              label={t('Qualidade & Rigor Técnico', 'Work Quality & Standards')}
              value={professional.reliability.qualityOrClarity}
            />
            <ReliabilityBar
              label={t('Pontualidade & Prazos', 'Punctuality & Schedule')}
              value={professional.reliability.punctuality}
            />
            <ReliabilityBar
              label={t('Comunicação', 'Communication')}
              value={professional.reliability.communication}
            />
            <ReliabilityBar
              label={t('Taxa de Clientes Recorrentes', 'Repeat Customer Rate')}
              value={professional.reliability.repeatRate}
            />
          </div>
        </div>

        <div className="md:col-span-7 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
          <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
            {t('Portfólio & Trabalhos Anteriores', 'Portfolio & Previous Work')}
          </h2>
          <div className="space-y-4">
            {professional.portfolio.map((item) => (
              <div
                key={item.id}
                className="pb-4 border-b last:border-b-0 last:pb-0 border-[#E2E8F0] dark:border-[#1E325C] space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
                  <span>
                    {translateCategory(item.category, lang)} · {item.location}
                  </span>
                  <span className="font-mono">{item.year}</span>
                </div>
                <p className="font-display font-semibold text-sm text-[#0F172A] dark:text-white">
                  {item.title}
                </p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">{item.summary}</p>
                <p className="text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA]">
                  {t('Resultado:', 'Outcome:')} {item.outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
        <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
          {t('Avaliações de Clientes', 'Customer Reviews')}
        </h2>
        {proReviews.length === 0 ? (
          <p className="text-sm text-[#64748B]">
            {t(
              'Trabalhos concluídos e avaliações verificadas de clientes aparecem aqui.',
              'Completed engagements and verified customer evaluations appear here.'
            )}
          </p>
        ) : (
          <div className="space-y-4">
            {proReviews.map((rev) => (
              <div
                key={rev.id}
                className="pb-4 border-b last:border-b-0 last:pb-0 border-[#E2E8F0] dark:border-[#1E325C] space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F172A] dark:text-white">
                    {rev.authorName} · {rev.requestTitle}
                  </span>
                  <span className="text-[#64748B]">{rev.date}</span>
                </div>
                <p className="text-sm text-[#334155] dark:text-[#CBD5E1]">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
