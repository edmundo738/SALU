import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Bookmark,
  Check,
  CheckCircle2,
  FileWarning,
  Globe,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
  Upload,
} from 'lucide-react';
import { ANGOLA_MUNICIPALITIES } from '../data/saluData';
import { useLang } from '../i18n/translations';
import {
  CustomerSummary,
  ModerationCase,
  NotificationItem,
  Professional,
  ReviewItem,
  ScreenId,
  ServiceRequest,
  UserRole,
} from '../types/salu';
import { ReliabilityBar, SafeAvatar } from './ui/Primitives';

interface ReviewsProps {
  reviews: ReviewItem[];
  completedRequests: ServiceRequest[];
  activeRole: UserRole;
  userName: string;
  onAddReview: (rev: Omit<ReviewItem, 'id' | 'date'>) => void;
}

export function ReviewsAndReputation({
  reviews,
  completedRequests,
  activeRole,
  userName,
  onAddReview,
}: ReviewsProps) {
  const { lang, t } = useLang();
  const [selectedReqId, setSelectedReqId] = useState(completedRequests[0]?.id || '');
  const [comm, setComm] = useState(5);
  const [punct, setPunct] = useState(5);
  const [qual, setQual] = useState(5);
  const [wouldWorkAgain, setWouldWorkAgain] = useState(true);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetReq = completedRequests.find((r) => r.id === selectedReqId);
    if (!comment.trim() || !targetReq) return;
    onAddReview({
      requestId: targetReq.id,
      requestTitle: targetReq.title,
      authorName: userName,
      authorRole: activeRole,
      targetName:
        activeRole === 'customer'
          ? targetReq.agreement?.providerName || 'Mateus Sebastião'
          : targetReq.customerName,
      targetRole: activeRole === 'customer' ? 'provider' : 'customer',
      communication: comm,
      punctuality: punct,
      qualityOrClarity: qual,
      wouldWorkAgain,
      comment: comment.trim(),
    });
    setComment('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
          {t('Avaliações Bilaterais & Reputação', 'Bilateral Reviews & Reputation')}
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
          {t(
            'A reputação na SALU vai além de estrelas simples — avalia comunicação, pontualidade, clareza do âmbito e colaboração recorrente.',
            'Reputation on SALU goes beyond single star ratings—evaluating communication, punctuality, scope clarity, and repeat collaboration.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
            <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
              {t('O Seu Índice de Fiabilidade', 'Your Reliability Standing')}
            </h2>
            <div className="space-y-3">
              <ReliabilityBar
                label={t('Rapidez na Comunicação', 'Communication Responsiveness')}
                value={97}
              />
              <ReliabilityBar
                label={t('Cumprimento de Prazos & Pontualidade', 'Schedule & Punctuality')}
                value={95}
              />
              <ReliabilityBar
                label={
                  activeRole === 'customer'
                    ? t('Clareza do Âmbito & Requisitos', 'Scope & Requirement Clarity')
                    : t('Qualidade & Rigor do Trabalho', 'Work Quality & Standards')
                }
                value={96}
              />
              <ReliabilityBar
                label={t('Voltaria a Colaborar', 'Would Collaborate Again')}
                value={94}
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs"
          >
            <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
              {t('Avaliar um Serviço Concluído', 'Evaluate a Completed Engagement')}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {activeRole === 'customer'
                ? t('A avaliar como Cliente → Prestador de Serviços', 'Evaluating as Customer → Service Provider')
                : t('A avaliar como Prestador → Cliente', 'Evaluating as Service Provider → Customer')}
            </p>

            <div>
              <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1">
                {t('Serviço Concluído', 'Completed Service')}
              </label>
              <select
                value={selectedReqId}
                onChange={(e) => setSelectedReqId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
              >
                {completedRequests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[#475569] dark:text-[#94A3B8] mb-1">
                  {t('Comunicação', 'Communication')}
                </label>
                <select
                  value={comm}
                  onChange={(e) => setComm(Number(e.target.value))}
                  className="w-full px-2 py-1.5 font-mono bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-md"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}/5
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#475569] dark:text-[#94A3B8] mb-1">
                  {t('Pontualidade', 'Punctuality')}
                </label>
                <select
                  value={punct}
                  onChange={(e) => setPunct(Number(e.target.value))}
                  className="w-full px-2 py-1.5 font-mono bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-md"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}/5
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#475569] dark:text-[#94A3B8] mb-1">
                  {activeRole === 'customer' ? t('Qualidade', 'Quality') : t('Clareza', 'Clarity')}
                </label>
                <select
                  value={qual}
                  onChange={(e) => setQual(Number(e.target.value))}
                  className="w-full px-2 py-1.5 font-mono bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-md"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}/5
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#334155] dark:text-[#CBD5E1]">
              <input
                type="checkbox"
                checked={wouldWorkAgain}
                onChange={(e) => setWouldWorkAgain(e.target.checked)}
                className="accent-[#1D6FE5]"
              />
              <span>
                {activeRole === 'customer'
                  ? t('Voltaria a trabalhar com este prestador', 'I would work with this provider again')
                  : t('Voltaria a trabalhar com este cliente', 'I would work with this client again')}
              </span>
            </label>

            <div>
              <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1">
                {t('Comentário Escrito *', 'Written Review *')}
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t(
                  'Partilhe feedback objetivo sobre o âmbito, prazos e colaboração...',
                  'Share factual feedback about scope, timing, and collaboration...'
                )}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg focus:outline-none focus:border-[#1D6FE5]"
              />
            </div>

            {submitted && (
              <p className="text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA]">
                {t('Avaliação bilateral registada no histórico verificado.', 'Bilateral review recorded in verified history.')}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
            >
              {t('Publicar Avaliação Verificada', 'Publish Verified Review')}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-5 shadow-xs">
          <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
            {t('Histórico Verificado de Trabalhos & Avaliações', 'Verified Work & Review History')} ({reviews.length})
          </h2>
          <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
            {reviews.map((rev) => {
              const authorLabel =
                lang === 'pt'
                  ? rev.authorRole === 'customer'
                    ? 'cliente'
                    : 'prestador'
                  : rev.authorRole;
              const targetLabel =
                lang === 'pt'
                  ? rev.targetRole === 'customer'
                    ? 'cliente'
                    : 'prestador'
                  : rev.targetRole;
              return (
                <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#0F172A] dark:text-white">
                      {rev.authorName} ({authorLabel}) → {rev.targetName} ({targetLabel})
                    </span>
                    <span className="font-mono text-[#64748B]">{rev.date}</span>
                  </div>
                  <p className="text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA]">
                    {rev.requestTitle}
                  </p>
                  <p className="text-sm text-[#334155] dark:text-[#CBD5E1]">{rev.comment}</p>
                  <div className="flex flex-wrap gap-4 text-xs font-mono tabular-nums text-[#64748B] dark:text-[#94A3B8]">
                    <span>{t('Com:', 'Comm:')} {rev.communication}/5</span>
                    <span>{t('Pontualidade:', 'Punctuality:')} {rev.punctuality}/5</span>
                    <span>
                      {rev.targetRole === 'provider'
                        ? t('Qualidade', 'Quality')
                        : t('Clareza', 'Clarity')}
                      : {rev.qualityOrClarity}/5
                    </span>
                    <span>
                      {rev.wouldWorkAgain
                        ? t('Voltaria a colaborar', 'Would collaborate again')
                        : t('Pontual', 'One-time')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FavoritesProps {
  professionals: Professional[];
  customers: CustomerSummary[];
  activeRole: UserRole;
  onToggleFavoritePro: (id: string) => void;
  onToggleFavoriteCustomer: (id: string) => void;
  onSelectProfessional: (id: string) => void;
  onStartChat: (pro: Professional) => void;
  onCreateRequest: () => void;
}

export function FavoritesAndContacts({
  professionals,
  customers,
  activeRole,
  onToggleFavoritePro,
  onToggleFavoriteCustomer,
  onSelectProfessional,
  onStartChat,
  onCreateRequest,
}: FavoritesProps) {
  const { t } = useLang();
  const savedPros = professionals.filter((p) => p.isFavorite);
  const savedCustomers = customers.filter((c) => c.isFavorite);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
          {t('Favoritos & Contactos de Confiança', 'Favorites & Trusted Contacts')}
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
          {t(
            'Acesso rápido a profissionais e clientes com quem estabeleceu relações de trabalho fiáveis.',
            'Quick access to professionals and clients with whom you have established reliable working relationships.'
          )}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-[#0F172A] dark:text-white">
          {t('Profissionais de Confiança', 'Trusted Professionals')} ({savedPros.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPros.map((pro) => (
            <div
              key={pro.id}
              className="p-5 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <SafeAvatar src={pro.avatarUrl} alt={pro.name} sizeClass="w-12 h-12" />
                  <div>
                    <p className="font-display font-semibold text-sm text-[#0F172A] dark:text-white">
                      {pro.name}
                    </p>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                      {pro.profession} · {pro.location}
                    </p>
                    <p className="text-xs font-mono tabular-nums text-[#1D6FE5] dark:text-[#60A5FA] mt-1">
                      {pro.completedJobs} {t('trabalhos concluídos', 'completed jobs')} ·{' '}
                      {pro.reliability.repeatRate}% {t('recontratação', 'repeat rate')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleFavoritePro(pro.id)}
                  className="text-xs text-[#64748B] hover:text-red-600"
                >
                  {t('Remover', 'Remove')}
                </button>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#1E325C]">
                <button
                  type="button"
                  onClick={() => onSelectProfessional(pro.id)}
                  className="flex-1 py-2 text-xs font-medium border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#132347]"
                >
                  {t('Perfil', 'Profile')}
                </button>
                <button
                  type="button"
                  onClick={() => onStartChat(pro)}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#1D6FE5] rounded-lg hover:bg-[#1558B8]"
                >
                  {t('Mensagem', 'Message')}
                </button>
                <button
                  type="button"
                  onClick={onCreateRequest}
                  className="py-2 px-3 text-xs font-semibold text-[#F97316] hover:underline"
                >
                  {t('Recontratar', 'Re-hire')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-[#0F172A] dark:text-white">
          {t('Clientes de Confiança', 'Trusted Customers')} ({savedCustomers.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedCustomers.map((cust) => (
            <div
              key={cust.id}
              className="p-5 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl flex items-start justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-display font-semibold text-sm text-[#0F172A] dark:text-white">
                    {cust.name}
                  </p>
                  {cust.verified && (
                    <ShieldCheck className="w-4 h-4 text-[#1D6FE5] dark:text-[#60A5FA]" />
                  )}
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {cust.location} · {cust.completedRequests} {t('serviços concluídos', 'completed engagements')}
                </p>
                <p className="text-xs font-mono tabular-nums text-[#475569] dark:text-[#CBD5E1]">
                  {t('Clareza:', 'Clarity:')} {cust.reliability.qualityOrClarity}% ·{' '}
                  {t('Confirmação rápida:', 'Prompt sign-off:')} {cust.reliability.punctuality}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleFavoriteCustomer(cust.id)}
                className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-red-600"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{activeRole === 'provider' ? t('Guardado', 'Saved') : t('Remover', 'Remove')}</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface NotificationsProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenTarget: (screen: ScreenId, targetId?: string) => void;
}

export function NotificationsCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onOpenTarget,
}: NotificationsProps) {
  const { t } = useLang();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const shown = notifications.filter((n) => (filter === 'ALL' ? true : !n.read));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
            {t('Centro de Notificações', 'Notification Center')}
          </h1>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
            {t(
              'Alertas unificados de propostas, mensagens, acordos, conclusões, avaliações e segurança.',
              'Unified alerts across proposals, messages, agreements, completions, reviews, and safety.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="px-3.5 py-2 text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA] border border-[#1D6FE5]/40 rounded-lg hover:bg-[#1D6FE5]/10"
        >
          {t('Marcar Todas como Lidas', 'Mark All Read')}
        </button>
      </div>

      <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] dark:bg-[#132347] rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            filter === 'ALL'
              ? 'bg-white dark:bg-[#0C1833] text-[#0F172A] dark:text-white shadow-xs'
              : 'text-[#475569] dark:text-[#94A3B8]'
          }`}
        >
          {t('Todas', 'All')} ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            filter === 'UNREAD'
              ? 'bg-white dark:bg-[#0C1833] text-[#0F172A] dark:text-white shadow-xs'
              : 'text-[#475569] dark:text-[#94A3B8]'
          }`}
        >
          {t('Não lidas', 'Unread')} ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl divide-y divide-[#E2E8F0] dark:divide-[#1E325C] shadow-xs">
        {shown.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">
            {t('Tudo atualizado.', 'All caught up.')}
          </div>
        ) : (
          shown.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.read ? 'opacity-75' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Bell className="w-3.5 h-3.5 text-[#1D6FE5] dark:text-[#60A5FA]" />
                  <span className="font-medium uppercase text-[11px] text-[#64748B]">
                    {n.category}
                  </span>
                  <span>·</span>
                  <span className="text-[#64748B]">{n.timestamp}</span>
                  {!n.read && (
                    <span className="text-[11px] font-semibold text-[#F97316]">
                      · {t('Não lida', 'Unread')}
                    </span>
                  )}
                </div>
                <p className="font-display font-semibold text-sm text-[#0F172A] dark:text-white">
                  {n.title}
                </p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">{n.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(n.id)}
                    className="px-2.5 py-1.5 text-xs text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#132347] rounded-md"
                  >
                    {t('Marcar Lida', 'Mark Read')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onMarkRead(n.id);
                    onOpenTarget(n.targetScreen, n.targetId);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-md"
                >
                  {t('Abrir', 'Open')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface SafetyProps {
  cases: ModerationCase[];
  initialReportSubject?: string;
  onSubmitReport: (report: Omit<ModerationCase, 'id' | 'status' | 'submittedAt'>) => void;
  onSubmitAppeal: (caseId: string, appealText: string) => void;
}

export function SafetyAndModeration({
  cases,
  initialReportSubject = '',
  onSubmitReport,
  onSubmitAppeal,
}: SafetyProps) {
  const { lang, t } = useLang();
  const [type, setType] = useState<'USER_REPORT' | 'LISTING_REPORT'>('USER_REPORT');
  const [subjectName, setSubjectName] = useState(initialReportSubject);
  const [reason, setReason] = useState(
    lang === 'pt' ? 'Discrepância de Qualidade ou Âmbito' : 'Workmanship or Scope Discrepancy'
  );
  const [details, setDetails] = useState('');
  const [evidenceFile, setEvidenceFile] = useState('');
  const [appealDrafts, setAppealDrafts] = useState<Record<string, string>>({});
  const [submittedMsg, setSubmittedMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !details.trim()) return;
    onSubmitReport({
      type,
      subjectName: subjectName.trim(),
      reason,
      details: details.trim(),
      evidenceFile: evidenceFile.trim() || undefined,
    });
    setSubjectName('');
    setDetails('');
    setEvidenceFile('');
    setSubmittedMsg(true);
    setTimeout(() => setSubmittedMsg(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
          {t('Segurança, Denúncias & Mediação', 'Safety, Reporting & Moderation')}
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
          {t(
            'Envie relatórios objetivos com provas, acompanhe processos de mediação ou apresente recurso sobre uma decisão.',
            'Submit factual reports with evidence, track mediation cases, or file an appeal on a moderation decision.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 h-fit shadow-xs"
        >
          <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
            {t('Submeter Denúncia ou Prova', 'Submit a Report or Evidence')}
          </h2>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('USER_REPORT')}
              className={`py-2 text-xs font-medium rounded-lg border ${
                type === 'USER_REPORT'
                  ? 'border-[#1D6FE5] bg-[#1D6FE5]/10 text-[#1D6FE5] dark:text-[#60A5FA]'
                  : 'border-[#E2E8F0] dark:border-[#1E325C] text-[#475569] dark:text-[#94A3B8]'
              }`}
            >
              {t('Denunciar Utilizador', 'Report User')}
            </button>
            <button
              type="button"
              onClick={() => setType('LISTING_REPORT')}
              className={`py-2 text-xs font-medium rounded-lg border ${
                type === 'LISTING_REPORT'
                  ? 'border-[#1D6FE5] bg-[#1D6FE5]/10 text-[#1D6FE5] dark:text-[#60A5FA]'
                  : 'border-[#E2E8F0] dark:border-[#1E325C] text-[#475569] dark:text-[#94A3B8]'
              }`}
            >
              {t('Anúncio Suspeito', 'Suspicious Listing')}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1">
              {t('Utilizador, Empresa ou Referência do Pedido *', 'User, Business, or Listing Reference *')}
            </label>
            <input
              type="text"
              required
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder={t('ex.: Pedido #REQ-107 ou Nome da Conta', 'e.g. Request #REQ-107 or Account Name')}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1">
              {t('Categoria', 'Category')}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            >
              <option>
                {t('Discrepância de Qualidade ou Âmbito', 'Workmanship or Scope Discrepancy')}
              </option>
              <option>
                {t('Pedido de Pagamento Antecipado Fora da Plataforma', 'Soliciting Off-Platform Advance Payment')}
              </option>
              <option>
                {t('Não Comparecimento ou Falta de Resposta Repetida', 'No-Show or Repeated Unresponsiveness')}
              </option>
              <option>
                {t('Credenciais ou Identidade Enganosas', 'Misleading Credentials or Identity')}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1">
              {t('Detalhes do Incidente *', 'Incident Details *')}
            </label>
            <textarea
              rows={3}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t(
                'Descreva datas, âmbito acordado e o que aconteceu...',
                'Describe dates, agreed scope, and what occurred...'
              )}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1">
              {t('Provas de Apoio (Opcional)', 'Supporting Evidence (Optional)')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={evidenceFile}
                onChange={(e) => setEvidenceFile(e.target.value)}
                placeholder={t('ex.: foto_fatura.jpg', 'e.g. invoice_photo.jpg')}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
              />
              <button
                type="button"
                onClick={() =>
                  setEvidenceFile(lang === 'pt' ? 'prova_inspecao_local.jpg' : 'site_inspection_evidence.jpg')
                }
                className="px-3 py-2 text-xs font-medium bg-[#F1F5F9] dark:bg-[#132347] rounded-lg inline-flex items-center gap-1 hover:bg-[#E2E8F0] dark:hover:bg-[#1E325C]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t('Anexar', 'Attach')}</span>
              </button>
            </div>
          </div>

          {submittedMsg && (
            <p className="text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA]">
              {t(
                'Caso registado na Equipa de Segurança & Mediação SALU.',
                'Case logged with SALU Safety & Mediation Desk.'
              )}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
          >
            {t('Submeter Denúncia', 'Submit Report')}
          </button>
        </form>

        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-4 shadow-xs">
            <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
              {t('Reclamações, Revisões & Recursos', 'Complaints, Reviews & Appeals')} ({cases.length})
            </h2>
            <div className="space-y-4">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#1E325C] space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold text-[#0F172A] dark:text-white">
                      {c.id} · {c.type.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-[#F97316]">
                      <FileWarning className="w-3.5 h-3.5" />
                      <span>{c.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <p className="font-display font-semibold text-sm text-[#0F172A] dark:text-white">
                    {c.subjectName} — {c.reason}
                  </p>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8]">{c.details}</p>
                  {c.evidenceFile && (
                    <p className="text-xs font-mono text-[#64748B]">
                      {t('Prova:', 'Evidence:')} {c.evidenceFile}
                    </p>
                  )}
                  {c.resolutionNote && (
                    <p className="text-xs text-[#1D6FE5] dark:text-[#60A5FA]">
                      {t('Nota da Mediação:', 'Desk Note:')} {c.resolutionNote}
                    </p>
                  )}

                  {c.status !== 'APPEAL_SUBMITTED' && (
                    <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E325C] flex gap-2">
                      <input
                        type="text"
                        value={appealDrafts[c.id] || ''}
                        onChange={(e) =>
                          setAppealDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                        placeholder={t('Adicionar esclarecimento ou nota de recurso...', 'Add clarification or appeal note...')}
                        className="flex-1 px-3 py-1.5 text-xs bg-[#F8FAFC] dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const txt = appealDrafts[c.id]?.trim();
                          if (!txt) return;
                          onSubmitAppeal(c.id, txt);
                          setAppealDrafts((prev) => ({ ...prev, [c.id]: '' }));
                        }}
                        className="px-3 py-1.5 text-xs font-medium border border-[#CBD5E1] dark:border-[#1E325C] rounded-md hover:bg-[#F8FAFC] dark:hover:bg-[#132347]"
                      >
                        {t('Enviar Recurso', 'Submit Appeal')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] dark:text-white">
              <AlertTriangle className="w-4 h-4 text-[#F97316]" />
              <span>
                {t('Política de Restrições de Conta & Revisão Justa', 'Account Restrictions & Fair Review Policy')}
              </span>
            </div>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              {t(
                'Restrições temporárias aplicam-se apenas a violações verificadas (anúncios fraudulentos, coação fora da plataforma ou incumprimento repetido de acordos). Todas as contas mantêm acesso total aos processos ativos e direito a recurso durante 14 dias.',
                'Temporary restrictions apply only to verified policy breaches (fraudulent listings, off-platform coercion, or repeated unfulfilled agreements). Every restricted account retains full access to view active cases and submit an appeal within 14 days.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingsProps {
  userName: string;
  municipality: string;
  activeRole: UserRole;
  darkMode: boolean;
  onToggleDark: () => void;
  onUpdateProfile: (name: string, municipality: string) => void;
  onSwitchRole: (role: UserRole) => void;
}

export function AccountSettings({
  userName,
  municipality,
  activeRole,
  darkMode,
  onToggleDark,
  onUpdateProfile,
  onSwitchRole,
}: SettingsProps) {
  const { lang, setLang, t } = useLang();
  const [nameInput, setNameInput] = useState(userName);
  const [areaInput, setAreaInput] = useState(municipality);
  const [hidePrices, setHidePrices] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(nameInput.trim() || userName, areaInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-white">
          {t('Definições de Conta & Modo', 'Account & Role Settings')}
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
          {t(
            'Gira a sua identidade unificada na SALU, idioma, privacidade, tema e modo ativo.',
            'Manage your unified SALU identity, language, privacy defaults, theme appearance, and active role.'
          )}
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-5 shadow-xs"
      >
        <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-white">
          {t('Identidade Geral da Conta', 'General Account Identity')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Nome de Exibição da Conta', 'Account Display Name')}
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Município Principal', 'Primary Municipality')}
            </label>
            <select
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            >
              {ANGOLA_MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E325C] space-y-3">
          <p className="text-xs font-medium text-[#334155] dark:text-[#CBD5E1]">
            {t('Acesso ao Ecossistema Duplo', 'Dual-Role Ecosystem Access')}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSwitchRole('customer')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
                activeRole === 'customer'
                  ? 'border-[#1D6FE5] bg-[#1D6FE5]/10 text-[#1D6FE5] dark:text-[#60A5FA]'
                  : 'border-[#E2E8F0] dark:border-[#1E325C]'
              }`}
            >
              {t('Ativo: Modo Cliente', 'Active: Customer Mode')}
            </button>
            <button
              type="button"
              onClick={() => onSwitchRole('provider')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
                activeRole === 'provider'
                  ? 'border-[#F97316] bg-[#F97316]/10 text-[#F97316]'
                  : 'border-[#E2E8F0] dark:border-[#1E325C]'
              }`}
            >
              {t('Ativo: Modo Prestador de Serviços', 'Active: Service Provider Mode')}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E325C] space-y-3">
          <p className="text-xs font-medium text-[#334155] dark:text-[#CBD5E1]">
            {t('Privacidade, Notificações, Idioma & Tema', 'Privacy, Notifications, Language & Theme')}
          </p>

          <label className="flex items-start gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={hidePrices}
              onChange={(e) => setHidePrices(e.target.checked)}
              className="accent-[#1D6FE5] mt-1"
            />
            <span>
              <strong className="font-medium text-[#0F172A] dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#1D6FE5] dark:text-[#60A5FA]" />
                {t('Manter os preços acordados privados por predefinição', 'Keep agreed service prices private by default')}
              </strong>
              <span className="block text-xs text-[#64748B] dark:text-[#94A3B8]">
                {t(
                  'Os valores finais negociados em Kwanzas são visíveis apenas para si e para a contraparte confirmada.',
                  'Final negotiated Kwanza values are visible only to you and the confirmed counterparty.'
                )}
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={notifSms}
              onChange={(e) => setNotifSms(e.target.checked)}
              className="accent-[#1D6FE5] mt-1"
            />
            <span>
              <strong className="font-medium text-[#0F172A] dark:text-white">
                {t(
                  'Receber alertas SMS para confirmações de acordos e pedidos de conclusão',
                  'Receive SMS alerts for agreement confirmations & completion requests'
                )}
              </strong>
            </span>
          </label>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-[#0F172A] dark:text-white inline-flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1D6FE5] dark:text-[#60A5FA]" />
              {t('Idioma da Plataforma', 'Platform Language')}
            </span>
            <div className="inline-flex items-center p-0.5 bg-[#F1F5F9] dark:bg-[#132347] border border-[#E2E8F0] dark:border-[#1E325C] rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setLang('pt')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  lang === 'pt'
                    ? 'bg-[#081C41] dark:bg-[#1D6FE5] text-white'
                    : 'text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                Português (PT)
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  lang === 'en'
                    ? 'bg-[#081C41] dark:bg-[#1D6FE5] text-white'
                    : 'text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                English (EN)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-[#0F172A] dark:text-white">
              {t('Tema da Interface', 'Interface Theme')}
            </span>
            <button
              type="button"
              onClick={onToggleDark}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#132347]"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#F97316]" /> : <Moon className="w-4 h-4 text-[#1D6FE5]" />}
              <span>
                {darkMode
                  ? t('Mudar para Modo Claro', 'Switch to Light Mode')
                  : t('Mudar para Modo Escuro', 'Switch to Dark Mode')}
              </span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E325C] flex items-center justify-between">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA]">
              <CheckCircle2 className="w-4 h-4" />
              {t('Definições guardadas', 'Settings saved')}
            </span>
          ) : (
            <span className="text-xs text-[#64748B]">
              {t('Telefone verificado:', 'Phone verified:')} +244 923 000 112
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg"
          >
            <Check className="w-4 h-4" />
            <span>{t('Guardar Alterações', 'Save Changes')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
