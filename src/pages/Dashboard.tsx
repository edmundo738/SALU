import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Compass, FilePlus2, MessageSquare, ShieldCheck, Star, UserRound } from 'lucide-react';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import {
  Alert,
  ButtonLink,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  Stat,
} from '../components/ui/Base';
import { ConversationRow, RequestCard } from '../components/Cards';
import { friendlyError } from '../lib/errors';

export function DashboardPage() {
  const { user, stats, refresh, apiReachable } = useAuth();
  const { t, lang } = useI18n();
  const requests = useApiData(() => api.requests({ scope: 'mine' }), []);
  const conversations = useApiData(() => api.conversations(), []);

  useEffect(() => {
    if (apiReachable) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;
  const provider = user.activeMode === 'provider';
  const isProviderProfilePublished = Boolean(user.providerProfile?.published);
  const name = user.name.split(' ')[0] || user.name;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={provider ? t('mode.provider') : t('mode.customer')}
        title={t('dashboard.greeting', { name })}
        subtitle={provider ? t('dashboard.providerSubtitle') : t('dashboard.customerSubtitle')}
        action={
          <div className="flex flex-wrap gap-2">
            {provider ? (
              <>
                <ButtonLink to="/oportunidades">
                  <BriefcaseBusiness className="w-4 h-4" aria-hidden="true" />
                  {t('dashboard.findWork')}
                </ButtonLink>
                <ButtonLink to="/perfil-profissional" variant="secondary">
                  <UserRound className="w-4 h-4" aria-hidden="true" />
                  {t('dashboard.editProfile')}
                </ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink to="/publicar-pedido">
                  <FilePlus2 className="w-4 h-4" aria-hidden="true" />
                  {t('dashboard.newRequest')}
                </ButtonLink>
                <ButtonLink to="/explorar" variant="secondary">
                  <Compass className="w-4 h-4" aria-hidden="true" />
                  {t('dashboard.explore')}
                </ButtonLink>
              </>
            )}
          </div>
        }
      />

      {provider && user.providerProfile == null && (
        <Alert tone="warning" title={t('dashboard.profileReminder')}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p>{t('dashboard.profileReminderBody')}</p>
            <ButtonLink to="/perfil-profissional" className="shrink-0" size="sm" variant="secondary">
              {t('dashboard.editProfile')}
            </ButtonLink>
          </div>
        </Alert>
      )}
      {provider && user.providerProfile && !isProviderProfilePublished && (
        <Alert tone="warning" title={t('provider.draft')}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p>{t('dashboard.profileReminderBody')}</p>
            <ButtonLink to="/perfil-profissional" className="shrink-0" size="sm" variant="secondary">
              {t('provider.publish')}
            </ButtonLink>
          </div>
        </Alert>
      )}
      {user.verificationLevel < 2 && (
        <Alert tone="info" title={t('dashboard.verifyReminder')}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p>{t('dashboard.verifyReminderBody')}</p>
            <ButtonLink to="/definicoes" className="shrink-0" size="sm" variant="secondary">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              {t('settings.verification')}
            </ButtonLink>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {provider ? (
          <>
            <Stat label={t('dashboard.stats.proposals')} value={stats?.proposalsAsProvider ?? 0} />
            <Stat label={t('dashboard.stats.active')} value={stats?.activeAgreements ?? 0} />
            <Stat label={t('dashboard.stats.completed')} value={stats?.completedAsProvider ?? 0} />
            <Stat
              label={t('dashboard.stats.rating')}
              value={stats?.rating != null ? `${stats.rating.toFixed(1)} / 5` : '—'}
              hint={
                stats?.reviewCount
                  ? t('dashboard.stats.reviews', { count: stats.reviewCount })
                  : t('dashboard.stats.none')
              }
            />
          </>
        ) : (
          <>
            <Stat label={t('dashboard.stats.requests')} value={stats?.requestsAsCustomer ?? 0} />
            <Stat label={t('dashboard.stats.open')} value={stats?.openRequests ?? 0} />
            <Stat label={t('dashboard.stats.active')} value={stats?.activeAgreements ?? 0} />
            <Stat label={t('dashboard.stats.completed')} value={stats?.completedAgreements ?? 0} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <section aria-labelledby="recent-requests">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 id="recent-requests" className="text-lg font-bold text-[#0F172A] dark:text-white">
              {t('dashboard.recentRequests')}
            </h2>
            <Link
              to={provider ? '/oportunidades' : '/pedidos'}
              className="text-xs font-bold text-[#1558B8] hover:underline dark:text-[#93C5FD]"
            >
              {t('common.view')}
            </Link>
          </div>
          {requests.loading ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {[1, 2].map((n) => (
                <Skeleton key={n} className="h-44" />
              ))}
            </div>
          ) : requests.error ? (
            <ErrorState
              message={friendlyError(new Error(requests.error), lang, t)}
              onRetry={requests.reload}
              retryLabel={t('common.retry')}
            />
          ) : !requests.data?.requests.length ? (
            <Card>
              <EmptyState
                icon={FilePlus2}
                title={provider ? t('opportunities.empty') : t('dashboard.emptyRequests')}
                body={
                  provider
                    ? t('opportunities.emptyBody')
                    : provider
                      ? t('opportunities.emptyBody')
                      : t('request.emptyBody')
                }
                action={
                  <ButtonLink to={provider ? '/oportunidades' : '/publicar-pedido'}>
                    {provider ? t('dashboard.findWork') : t('dashboard.newRequest')}
                  </ButtonLink>
                }
              />
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {requests.data.requests.slice(0, 4).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="recent-messages">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 id="recent-messages" className="text-lg font-bold text-[#0F172A] dark:text-white">
              {t('dashboard.recentMessages')}
            </h2>
            <Link to="/mensagens" className="text-xs font-bold text-[#1558B8] hover:underline dark:text-[#93C5FD]">
              {t('common.view')}
            </Link>
          </div>
          <Card className="p-2">
            {conversations.loading ? (
              <div className="p-4">
                <Skeleton className="h-12" />
              </div>
            ) : !conversations.data?.conversations.length ? (
              <EmptyState icon={MessageSquare} title={t('messages.empty')} body={t('dashboard.emptyMessages')} />
            ) : (
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
                {conversations.data.conversations.slice(0, 5).map((conversation) => (
                  <ConversationRow key={conversation.id} conversation={conversation} />
                ))}
              </div>
            )}
          </Card>
          {provider && stats?.rating != null && (
            <Card className="mt-3 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                {t('dashboard.stats.rating')}
              </p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-[#0F172A] dark:text-white">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" aria-hidden="true" />
                {stats.rating.toFixed(1)} / 5
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {t('dashboard.stats.reviews', { count: stats.reviewCount })}
              </p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
