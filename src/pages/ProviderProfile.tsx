import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BriefcaseBusiness, Flag, Heart, MapPin, MessageSquare, Star } from 'lucide-react';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import { useAuth } from '../app/AuthProvider';
import { formatDate, useI18n } from '../i18n';
import { friendlyError } from '../lib/errors';
import {
  Avatar,
  Badge,
  ButtonLink,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  Textarea,
} from '../components/ui/Base';
import { categoryLabel } from '../../shared/categories';
import { useToast } from '../app/ToastProvider';
import { FileImage } from '../components/FileImage';

export function ProviderProfilePage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const toast = useToast();
  const data = useApiData(() => api.provider(id), [id]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState('other');
  const [details, setDetails] = useState('');
  const [reportBusy, setReportBusy] = useState(false);
  const [favorite, setFavorite] = useState<boolean | null>(null);

  if (data.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (data.error || !data.data) {
    return (
      <ErrorState
        message={friendlyError(new Error(data.error || 'not found'), lang, t)}
        onRetry={data.reload}
        retryLabel={t('common.retry')}
      />
    );
  }

  const { provider, reviews, reviewSummary } = data.data;
  const isFavorite = favorite ?? data.data.isFavorite;
  const isOwn = user?.id === provider.userId;

  async function toggleFavorite() {
    if (!user) return;
    try {
      const result = await api.favorite(provider.userId, !isFavorite);
      setFavorite(result.favorite);
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(friendlyError(error, lang, t));
    }
  }

  async function submitReport(event: React.FormEvent) {
    event.preventDefault();
    if (details.trim().length < 10) {
      toast.error(
        lang === 'pt'
          ? 'Descreve o problema com pelo menos 10 caracteres.'
          : 'Describe the problem in at least 10 characters.',
      );
      return;
    }
    setReportBusy(true);
    try {
      await api.report({ targetType: 'user', targetId: provider.userId, reason, details });
      toast.success(t('safety.reportSent'));
      setReportOpen(false);
      setDetails('');
    } catch (error) {
      toast.error(friendlyError(error, lang, t));
    } finally {
      setReportBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#081C41] via-[#1558B8] to-[#F97316]" aria-hidden="true" />
        <div className="p-5 sm:p-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="rounded-2xl ring-4 ring-white dark:ring-[#0C1833] w-fit">
              <Avatar file={provider.avatar} name={provider.displayName} size="xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
                  {provider.displayName}
                </h1>
                {provider.published && <Badge tone="green">{t('provider.published')}</Badge>}
              </div>
              <p className="mt-1 text-sm font-semibold text-[#475569] dark:text-[#CBD5E1]">{provider.headline}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {provider.locationLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isOwn ? (
                <ButtonLink to="/perfil-profissional" variant="secondary">
                  {t('provider.edit')}
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink to="/publicar-pedido">
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    {t('provider.startConversation')}
                  </ButtonLink>
                  <Button variant="secondary" onClick={toggleFavorite} aria-pressed={isFavorite}>
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} aria-hidden="true" />
                    {isFavorite ? (lang === 'pt' ? 'Guardado' : 'Saved') : lang === 'pt' ? 'Guardar' : 'Save'}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-[#F8FAFC] p-3 dark:bg-[#132347]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                {t('dashboard.stats.rating')}
              </p>
              <p className="mt-1 flex items-center gap-1 text-lg font-extrabold text-[#0F172A] dark:text-white">
                {provider.rating != null ? (
                  <>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden="true" />
                    {provider.rating.toFixed(1)}
                  </>
                ) : (
                  '—'
                )}
              </p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-3 dark:bg-[#132347]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                {t('provider.reviews')}
              </p>
              <p className="mt-1 text-lg font-extrabold text-[#0F172A] dark:text-white">{provider.reviewCount}</p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-3 dark:bg-[#132347]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                {t('dashboard.stats.completed')}
              </p>
              <p className="mt-1 text-lg font-extrabold text-[#0F172A] dark:text-white">{provider.completedJobs}</p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-3 dark:bg-[#132347]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                {t('provider.years')}
              </p>
              <p className="mt-1 text-lg font-extrabold text-[#0F172A] dark:text-white">{provider.yearsExperience}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">{t('provider.about')}</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-[#475569] dark:text-[#CBD5E1]">
              {provider.bio}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="blue">{categoryLabel(provider.categoryId, lang)}</Badge>
              <Badge tone="neutral">{t('explore.years', { count: provider.yearsExperience })}</Badge>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">{t('provider.portfolio')}</h2>
            {provider.portfolio.length === 0 ? (
              <EmptyState icon={BriefcaseBusiness} title={t('provider.noPortfolio')} />
            ) : (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {provider.portfolio.map((file) => (
                  <FileImage
                    key={file.id}
                    file={file}
                    className="w-full h-36 object-cover rounded-xl border border-[#E2E8F0] dark:border-[#1E325C]"
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">{t('provider.reviews')}</h2>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {t('explore.reviews', { count: provider.reviewCount })}
              </span>
            </div>
            {reviewSummary.rating != null && (
              <div className="mt-3 space-y-2 text-xs">
                {(
                  [
                    ['communication', t('agreement.reviewCommunication')],
                    ['reliability', t('agreement.reviewReliability')],
                    ['deadlines', t('agreement.reviewDeadlines')],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">{label}</span>
                      <span className="font-bold">{reviewSummary.breakdown[key]?.toFixed(1) ?? '—'}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#132347] overflow-hidden">
                      <div
                        className="h-full bg-[#F97316]"
                        style={{ width: `${((reviewSummary.breakdown[key] || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="mt-4 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('provider.noReviews')}</p>
            ) : (
              <ul className="mt-4 space-y-4 divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
                {reviews.map((review) => (
                  <li key={review.id} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-white">{review.authorName}</p>
                      <p className="flex items-center gap-1 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
                        {((review.communication + review.reliability + review.deadlines) / 3).toFixed(1)}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#94A3B8]">
                      {formatDate(review.createdAt, lang)} ·{' '}
                      {review.authorRole === 'customer' ? t('mode.customer') : t('mode.provider')}
                    </p>
                    {review.comment && (
                      <p className="mt-1 text-sm text-[#475569] dark:text-[#CBD5E1]">{review.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {!isOwn && (
            <Button variant="ghost" className="w-full text-[#64748B]" onClick={() => setReportOpen(true)}>
              <Flag className="w-4 h-4" aria-hidden="true" /> {t('provider.report')}
            </Button>
          )}
        </div>
      </div>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title={t('safety.reportTitle')}>
        <form onSubmit={submitReport} className="space-y-4">
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{t('safety.reportBody')}</p>
          <Field label={t('safety.reportReason')} required>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              {['abuse', 'fraud', 'impersonation', 'spam', 'safety', 'other'].map((key) => (
                <option key={key} value={key}>
                  {t(`safety.reasons.${key}` as any)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('safety.reportDetails')} required>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} minLength={10} maxLength={2000} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setReportOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={reportBusy}>
              {t('common.send')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
