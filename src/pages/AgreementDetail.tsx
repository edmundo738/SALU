import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, MessageSquare, ShieldAlert, Star, Wallet } from 'lucide-react';
import type { FileRecord } from '../../shared/types';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import { useAuth } from '../app/AuthProvider';
import { formatDate, formatKz, useI18n } from '../i18n';
import { friendlyError } from '../lib/errors';
import {
  Alert,
  Avatar,
  ButtonLink,
  Button,
  Card,
  ErrorState,
  Field,
  Modal,
  PageHeader,
  Skeleton,
  Textarea,
} from '../components/ui/Base';
import { AgreementStatusBadge } from '../components/StatusBadge';
import { ReportButton } from '../components/ReportButton';
import { FileUpload, FilePreview } from '../components/FileUpload';
import { useToast } from '../app/ToastProvider';

export function AgreementDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const toast = useToast();
  const data = useApiData(() => api.agreement(id), [id]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState<FileRecord[]>([]);
  const [changesOpen, setChangesOpen] = useState(false);
  const [changesNote, setChangesNote] = useState('');
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ratings, setRatings] = useState({ communication: 0, reliability: 0, deadlines: 0 });
  const [reviewComment, setReviewComment] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (data.loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
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

  const agreement = data.data.agreement;
  const role = agreement.myRole;
  const isCustomer = role === 'customer';
  const otherName = isCustomer ? agreement.providerName : agreement.customerName;
  const otherAvatar = isCustomer ? agreement.providerAvatar : agreement.customerAvatar;
  const otherId = isCustomer ? agreement.providerId : agreement.customerId;

  async function act(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    try {
      await action();
      toast.success(success);
      data.reload();
    } catch (err) {
      const message = friendlyError(err, lang, t);
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    setReviewError(null);
    if (!ratings.communication || !ratings.reliability || !ratings.deadlines) {
      setReviewError(t('validation.ratings'));
      return;
    }
    setReviewBusy(true);
    try {
      await api.review(agreement.id, { ...ratings, comment: reviewComment.trim() });
      toast.success(t('agreement.reviewThanks'));
      data.reload();
    } catch (err) {
      setReviewError(friendlyError(err, lang, t));
    } finally {
      setReviewBusy(false);
    }
  }

  const canReview = agreement.status === 'COMPLETED' && !agreement.myReview;
  const reviewLabels = isCustomer
    ? [t('agreement.reviewCommunication'), t('agreement.reviewReliability'), t('agreement.reviewDeadlines')]
    : [
        t('agreement.reviewCommunication'),
        lang === 'pt' ? 'Clareza do pedido' : 'Clarity of the request',
        lang === 'pt' ? 'Respeito e seriedade' : 'Respect and reliability',
      ];

  return (
    <div className="max-w-4xl">
      <Link
        to="/inicio"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#C2410C] dark:text-[#94A3B8]"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {t('common.back')}
      </Link>
      <PageHeader
        eyebrow={t('agreement.title')}
        title={agreement.requestTitle}
        subtitle={t('agreement.subtitle')}
        action={<AgreementStatusBadge status={agreement.status} />}
      />

      {error && (
        <div className="mb-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <Wallet className="w-4 h-4 mt-0.5 text-[#1D6FE5]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('agreement.amount')}</p>
                  <p className="font-extrabold">{formatKz(agreement.amount)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="w-4 h-4 mt-0.5 text-[#1D6FE5]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('agreement.deadline')}</p>
                  <p className="font-extrabold">{formatDate(agreement.deadline, lang)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#1D6FE5]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('agreement.status')}</p>
                  <p className="font-extrabold">
                    {agreement.customerAccepted
                      ? lang === 'pt'
                        ? 'Cliente confirmou'
                        : 'Customer confirmed'
                      : lang === 'pt'
                        ? 'Cliente por confirmar'
                        : 'Customer pending'}{' '}
                    ·{' '}
                    {agreement.providerAccepted
                      ? lang === 'pt'
                        ? 'Prestador confirmou'
                        : 'Provider confirmed'
                      : lang === 'pt'
                        ? 'Prestador por confirmar'
                        : 'Provider pending'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">{t('agreement.scope')}</h2>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-[#475569] dark:text-[#CBD5E1]">
                {agreement.scope}
              </p>
            </div>
            {agreement.completionNote && (
              <div className="mt-4 rounded-xl bg-[#F8FAFC] p-4 dark:bg-[#132347]">
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{t('agreement.completionNote')}</h3>
                <p className="mt-1 text-sm whitespace-pre-line text-[#475569] dark:text-[#CBD5E1]">
                  {agreement.completionNote}
                </p>
                {agreement.completionPhotos.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {agreement.completionPhotos.map((file) => (
                      <a key={file.id} href={api.fileUrl(file)} target="_blank" rel="noreferrer">
                        <img
                          src={api.fileUrl(file)}
                          alt={file.name}
                          className="w-full h-28 object-cover rounded-lg border border-[#E2E8F0] dark:border-[#1E325C]"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('agreement.timeline')}</h2>
            <ol className="mt-3 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D6FE5] mt-1.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{t('agreement.awaitingProvider')}</p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{formatDate(agreement.createdAt, lang)}</p>
                </div>
              </li>
              {agreement.customerAccepted && (
                <li className="flex gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">
                      {lang === 'pt' ? 'Cliente confirmou o acordo' : 'Customer confirmed the agreement'}
                    </p>
                  </div>
                </li>
              )}
              {agreement.providerAccepted && (
                <li className="flex gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">
                      {lang === 'pt' ? 'Prestador confirmou o acordo' : 'Provider confirmed the agreement'}
                    </p>
                  </div>
                </li>
              )}
              {agreement.providerCompleted && (
                <li className="flex gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">{t('agreement.workSubmitted')}</p>
                  </div>
                </li>
              )}
              {agreement.customerCompleted && (
                <li className="flex gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">{t('agreement.complete')}</p>
                  </div>
                </li>
              )}
              {agreement.status === 'DISPUTED' && (
                <li className="flex gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">{t('status.agreement.DISPUTED')}</p>
                  </div>
                </li>
              )}
            </ol>
          </Card>

          {canReview && (
            <Card className="p-5">
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('agreement.reviewTitle')}</h2>
              <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('agreement.reviewSubtitle')}</p>
              {reviewError && (
                <div className="mt-3">
                  <Alert tone="danger">{reviewError}</Alert>
                </div>
              )}
              <form onSubmit={submitReview} className="mt-4 space-y-4">
                {(['communication', 'reliability', 'deadlines'] as const).map((key, index) => (
                  <fieldset key={key}>
                    <legend className="text-sm font-semibold text-[#0F172A] dark:text-white">
                      {reviewLabels[index]}
                    </legend>
                    <div className="mt-1 flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRatings((current) => ({ ...current, [key]: value }))}
                          className={`min-h-11 min-w-11 rounded-xl border font-bold ${ratings[key] >= value ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200' : 'border-[#CBD5E1] bg-white text-[#64748B] dark:border-[#1E325C] dark:bg-[#0C1833] dark:text-[#94A3B8]'}`}
                          aria-label={`${reviewLabels[index]}: ${value}`}
                          aria-pressed={ratings[key] === value}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <Field label={t('agreement.reviewComment')}>
                  <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} maxLength={1000} />
                </Field>
                <Button type="submit" loading={reviewBusy}>
                  {t('agreement.reviewSubmit')}
                </Button>
              </form>
            </Card>
          )}

          {agreement.myReview && (
            <Alert tone="success" title={t('agreement.alreadyReviewed')}>
              <p className="flex items-center gap-1">
                <Star className="w-4 h-4" aria-hidden="true" />
                {(
                  (agreement.myReview.communication + agreement.myReview.reliability + agreement.myReview.deadlines) /
                  3
                ).toFixed(1)}{' '}
                / 5
              </p>
              {agreement.myReview.comment && <p className="mt-1 text-xs">{agreement.myReview.comment}</p>}
            </Alert>
          )}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
              {isCustomer ? t('agreement.provider') : t('agreement.customer')}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Avatar file={otherAvatar} name={otherName} size="lg" />
              <div className="min-w-0">
                {isCustomer ? (
                  <Link
                    to={`/prestadores/${otherId}`}
                    className="font-bold text-[#0F172A] dark:text-white hover:underline truncate block"
                  >
                    {otherName}
                  </Link>
                ) : (
                  <span className="font-bold text-[#0F172A] dark:text-white truncate block">{otherName}</span>
                )}
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {isCustomer ? agreement.providerHeadline : t('mode.customer')}
                </p>
              </div>
            </div>
            {agreement.conversationId && (
              <ButtonLink to={`/mensagens/${agreement.conversationId}`} variant="secondary" className="mt-3 w-full">
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                {t('agreement.openChat')}
              </ButtonLink>
            )}
          </Card>

          <Alert tone="info" title={t('agreement.paymentNote')}>
            <p className="text-xs">{t('safety.adviceBody')}</p>
          </Alert>

          <Card className="p-4 space-y-2">
            {agreement.status === 'PENDING_PROVIDER' && !isCustomer && (
              <>
                <Button
                  className="w-full"
                  loading={busy}
                  onClick={() => void act(() => api.acceptAgreement(agreement.id), t('agreement.accepted'))}
                >
                  {t('agreement.accept')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  loading={busy}
                  onClick={() => void act(() => api.declineAgreement(agreement.id), t('agreement.declined'))}
                >
                  {t('agreement.decline')}
                </Button>
              </>
            )}
            {agreement.status === 'PENDING_PROVIDER' && isCustomer && (
              <>
                <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">{t('agreement.awaitingProvider')}</p>
                <Button
                  variant="secondary"
                  className="w-full"
                  loading={busy}
                  onClick={() => void act(() => api.cancelAgreement(agreement.id), t('agreement.cancelled'))}
                >
                  {t('agreement.cancel')}
                </Button>
              </>
            )}
            {agreement.status === 'ACTIVE' && !isCustomer && (
              <Button className="w-full" onClick={() => setCompletionOpen(true)}>
                {t('agreement.submitCompletion')}
              </Button>
            )}
            {agreement.status === 'ACTIVE' && isCustomer && (
              <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">
                {t('agreement.active')}.{' '}
                {lang === 'pt'
                  ? 'O prestador vai submeter a conclusão quando terminar.'
                  : 'The provider will submit completion when finished.'}
              </p>
            )}
            {agreement.status === 'WORK_SUBMITTED' && isCustomer && (
              <>
                <Button className="w-full" onClick={() => setConfirmOpen(true)}>
                  {t('agreement.confirmCompletion')}
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => setChangesOpen(true)}>
                  {t('agreement.requestChanges')}
                </Button>
              </>
            )}
            {agreement.status === 'WORK_SUBMITTED' && !isCustomer && (
              <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">{t('agreement.awaitingCustomer')}</p>
            )}
            {['ACTIVE', 'WORK_SUBMITTED'].includes(agreement.status) && (
              <>
                <ReportButton
                  targetType="agreement"
                  targetId={agreement.id}
                  label={t('safety.report')}
                  className="w-full"
                />
                <Button
                  variant="ghost"
                  className="w-full text-red-700 dark:text-red-300"
                  onClick={() => setDisputeOpen(true)}
                >
                  <ShieldAlert className="w-4 h-4" aria-hidden="true" /> {t('agreement.dispute')}
                </Button>
              </>
            )}
            {agreement.status === 'DISPUTED' && (
              <p className="text-sm text-red-700 dark:text-red-300">
                {t('agreement.disputed')}{' '}
                {lang === 'pt' ? 'A equipa SALU vai analisar.' : 'The SALU team will review it.'}
              </p>
            )}
            {agreement.status === 'COMPLETED' && (
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{t('agreement.completed')}</p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={completionOpen}
        onClose={() => setCompletionOpen(false)}
        title={t('agreement.submitCompletion')}
        wide
      >
        <div className="space-y-4">
          <Field label={t('agreement.completionNote')} required>
            <Textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              minLength={10}
              maxLength={1500}
            />
          </Field>
          <div>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white">{t('agreement.completionPhotos')}</p>
            {completionPhotos.length > 0 && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {completionPhotos.map((file) => (
                  <FilePreview
                    key={file.id}
                    file={file}
                    onRemove={() => setCompletionPhotos((files) => files.filter((f) => f.id !== file.id))}
                  />
                ))}
              </div>
            )}
            {completionPhotos.length < 6 && (
              <div className="mt-2">
                <FileUpload
                  purpose="completion"
                  label={t('agreement.completionPhotos')}
                  onUploaded={(file) => setCompletionPhotos((files) => [...files, file])}
                  accept="image/jpeg,image/png,image/webp"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCompletionOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              loading={busy}
              onClick={() =>
                void act(async () => {
                  await api.submitCompletion(agreement.id, {
                    note: completionNote,
                    photoIds: completionPhotos.map((f) => f.id),
                  });
                  setCompletionOpen(false);
                }, t('agreement.completionSubmitted'))
              }
            >
              {t('common.send')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t('agreement.confirmCompletion')}>
        <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">{t('agreement.confirmCompletionBody')}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            loading={busy}
            onClick={() =>
              void act(async () => {
                await api.confirmCompletion(agreement.id);
                setConfirmOpen(false);
              }, t('agreement.completed'))
            }
          >
            {t('common.confirm')}
          </Button>
        </div>
      </Modal>

      <Modal open={changesOpen} onClose={() => setChangesOpen(false)} title={t('agreement.requestChanges')}>
        <div className="space-y-4">
          <Field label={t('agreement.changesNote')} required>
            <Textarea
              value={changesNote}
              onChange={(e) => setChangesNote(e.target.value)}
              minLength={5}
              maxLength={1000}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setChangesOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              loading={busy}
              onClick={() =>
                void act(async () => {
                  await api.requestChanges(agreement.id, changesNote);
                  setChangesOpen(false);
                }, t('agreement.changesRequested'))
              }
            >
              {t('common.send')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={disputeOpen} onClose={() => setDisputeOpen(false)} title={t('agreement.dispute')}>
        <div className="space-y-4">
          <p className="text-sm text-[#475569] dark:text-[#CBD5E1]">{t('agreement.disputeBody')}</p>
          <Field label={t('safety.reportDetails')} required>
            <Textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              minLength={10}
              maxLength={1500}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDisputeOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={() =>
                void act(async () => {
                  await api.dispute(agreement.id, disputeReason);
                  setDisputeOpen(false);
                }, t('agreement.disputed'))
              }
            >
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
