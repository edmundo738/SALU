import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, MessageSquare, ShieldCheck, Users, Wallet } from 'lucide-react';
import { useAuth } from '../app/AuthProvider';
import { useI18n, formatKz, relativeTime } from '../i18n';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import { friendlyError } from '../lib/errors';
import {
  Alert,
  Avatar,
  Badge,
  ButtonLink,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Modal,
  PageHeader,
  Skeleton,
} from '../components/ui/Base';
import { ProposalStatusBadge, RequestStatusBadge } from '../components/StatusBadge';
import { ReportButton } from '../components/ReportButton';
import { categoryLabel } from '../../shared/categories';
import { useToast } from '../app/ToastProvider';
import type { Proposal } from '../../shared/types';

export function RequestDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const data = useApiData(() => api.request(id), [id]);
  const [accepting, setAccepting] = useState<Proposal | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (data.loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-56" />
      </div>
    );
  if (data.error || !data.data) {
    return (
      <ErrorState
        message={friendlyError(new Error(data.error || 'not found'), lang, t)}
        onRetry={data.reload}
        retryLabel={t('common.retry')}
      />
    );
  }

  const request = data.data.request;
  const owner = request.isOwner;

  async function accept() {
    if (!accepting) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api.acceptProposal(accepting.id);
      toast.success(t('request.accepted'));
      setAccepting(null);
      navigate(`/acordos/${result.agreement.id}`);
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  async function reject(proposal: Proposal) {
    try {
      await api.rejectProposal(proposal.id);
      toast.success(t('request.rejected'));
      data.reload();
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    }
  }

  async function withdraw(proposal: Proposal) {
    try {
      await api.withdrawProposal(proposal.id);
      toast.success(t('common.success'));
      data.reload();
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    }
  }

  async function cancelRequest() {
    setBusy(true);
    try {
      await api.cancelRequest(request.id);
      toast.success(t('request.cancelled'));
      setCancelOpen(false);
      data.reload();
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <Link
        to={owner ? '/pedidos' : '/oportunidades'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#C2410C] dark:text-[#94A3B8]"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {t('common.back')}
      </Link>
      <PageHeader
        eyebrow={categoryLabel(request.categoryId, lang)}
        title={request.title}
        subtitle={`${request.locationLabel} · ${relativeTime(request.createdAt, lang)}`}
        action={<RequestStatusBadge status={request.status} />}
      />

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('request.details')}</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-[#475569] dark:text-[#CBD5E1]">
              {request.description}
            </p>
            {request.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {request.photos.map((file) => (
                  <a key={file.id} href={api.fileUrl(file)} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={api.fileUrl(file)}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-xl border border-[#E2E8F0] dark:border-[#1E325C]"
                    />
                  </a>
                ))}
              </div>
            )}
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Wallet className="w-4 h-4 mt-0.5 text-[#1D6FE5]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('request.budget')}</p>
                  <p className="font-bold">
                    {request.budgetType === 'FIXED' ? formatKz(request.budgetAmount) : t('request.inspection')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="w-4 h-4 mt-0.5 text-[#1D6FE5]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('request.urgency')}</p>
                  <p className="font-bold">
                    {request.urgency === 'URGENT' ? t('request.urgent') : t('request.normal')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[#1D6FE5]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('common.location')}</p>
                  <p className="font-bold">{request.locationLabel}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-[#1D6FE5]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('request.proposals')}</p>
                  <p className="font-bold">{request.proposalCount}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
                {t('request.proposals', { count: request.proposals.length })}
              </h2>
              {request.agreementId && (
                <Link
                  to={`/acordos/${request.agreementId}`}
                  className="text-xs font-bold text-[#1558B8] underline underline-offset-4 dark:text-[#93C5FD]"
                >
                  {t('agreement.title')}
                </Link>
              )}
            </div>
            {request.proposals.length === 0 ? (
              <EmptyState icon={MessageSquare} title={t('request.noProposals')} body={t('request.noProposalsBody')} />
            ) : (
              <ul className="mt-4 space-y-3">
                {request.proposals.map((proposal) => (
                  <li key={proposal.id} className="rounded-xl border border-[#E2E8F0] p-4 dark:border-[#1E325C]">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <Avatar file={proposal.providerAvatar} name={proposal.providerName} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/prestadores/${proposal.providerId}`}
                            className="text-sm font-bold hover:underline"
                          >
                            {proposal.providerName}
                          </Link>
                          <ProposalStatusBadge status={proposal.status} />
                        </div>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{proposal.providerHeadline}</p>
                        {proposal.providerRating != null && (
                          <p className="mt-0.5 text-xs text-[#475569] dark:text-[#CBD5E1]">
                            {proposal.providerRating.toFixed(1)} / 5 ·{' '}
                            {t('explore.reviews', { count: proposal.providerReviewCount })}
                          </p>
                        )}
                        <p className="mt-2 text-sm whitespace-pre-line text-[#334155] dark:text-[#CBD5E1]">
                          {proposal.message}
                        </p>
                        <p className="mt-2 text-sm font-extrabold text-[#0F172A] dark:text-white">
                          {formatKz(proposal.amount)} · {t('request.days', { count: proposal.estimatedDays })}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {proposal.conversationId && (
                            <ButtonLink to={`/mensagens/${proposal.conversationId} `} size="sm" variant="secondary">
                              <MessageSquare className="w-4 h-4" aria-hidden="true" />
                              {t('request.contactProvider')}
                            </ButtonLink>
                          )}
                          {owner && proposal.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setAccepting(proposal);
                                  setError(null);
                                }}
                              >
                                {t('request.accept')}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => void reject(proposal)}>
                                {t('request.reject')}
                              </Button>
                            </>
                          )}
                          {!owner && proposal.status === 'PENDING' && (
                            <Button size="sm" variant="ghost" onClick={() => void withdraw(proposal)}>
                              {t('request.withdraw')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
              {t('agreement.customer')}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Avatar file={request.customerAvatar} name={request.customerName} size="lg" />
              <div>
                <p className="font-bold text-[#0F172A] dark:text-white">{request.customerName}</p>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{request.locationLabel}</p>
              </div>
            </div>
          </Card>

          {owner && request.status === 'OPEN' && (
            <Button variant="secondary" className="w-full" onClick={() => setCancelOpen(true)}>
              {t('request.cancelRequest')}
            </Button>
          )}

          <Alert tone="info" title={t('agreement.paymentNote')}>
            <p className="text-xs">{t('safety.adviceBody')}</p>
          </Alert>
          <ReportButton targetType="request" targetId={request.id} label={t('safety.report')} className="w-full" />
        </div>
      </div>

      <Modal open={Boolean(accepting)} onClose={() => setAccepting(null)} title={t('request.accept')}>
        {accepting && (
          <div className="space-y-4">
            <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">{t('request.acceptConfirm')}</p>
            <div className="rounded-xl bg-[#F8FAFC] p-3 text-sm dark:bg-[#132347]">
              <p className="font-bold">{accepting.providerName}</p>
              <p className="text-[#64748B] dark:text-[#94A3B8]">
                {formatKz(accepting.amount)} · {t('request.days', { count: accepting.estimatedDays })}
              </p>
            </div>
            {error && <Alert tone="danger">{error}</Alert>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAccepting(null)}>
                {t('common.cancel')}
              </Button>
              <Button loading={busy} onClick={() => void accept()}>
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title={t('request.cancelRequest')}>
        <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">{t('common.confirmDelete')}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancelOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" loading={busy} onClick={() => void cancelRequest()}>
            {t('common.confirm')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
