import { BriefcaseBusiness } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../app/AuthProvider';
import { useApiData } from '../app/useApiData';
import { RequestCard } from '../components/Cards';
import { Pagination } from '../components/Pagination';
import { ButtonLink, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '../components/ui/Base';
import { useI18n } from '../i18n';
import { api } from '../lib/api';
import { friendlyError } from '../lib/errors';

export function MyProposalsPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [page, setPage] = useState(1);
  const data = useApiData(() => api.requests({ scope: 'proposed', page: String(page) }), [page, user?.id]);
  // Protege a apresentação se o servidor ainda estiver na versão anterior.
  const requests =
    data.data?.requests.filter((request) => request.customerId !== user?.id && Boolean(request.myProposal)) || [];
  return (
    <div>
      <PageHeader
        eyebrow={t('mode.provider')}
        title={t('proposals.title')}
        subtitle={t('proposals.subtitle')}
        action={<ButtonLink to="/oportunidades">{t('dashboard.findWork')}</ButtonLink>}
      />
      {data.loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : data.error ? (
        <ErrorState
          message={friendlyError(new Error(data.error), lang, t)}
          onRetry={data.reload}
          retryLabel={t('common.retry')}
        />
      ) : requests.length === 0 ? (
        <Card>
          <EmptyState
            icon={BriefcaseBusiness}
            title={t('proposals.empty')}
            body={t('proposals.emptyBody')}
            action={<ButtonLink to="/oportunidades">{t('dashboard.findWork')}</ButtonLink>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} showProposal />
          ))}
        </div>
      )}
      {!data.loading && !data.error && (
        <Pagination page={page} hasMore={Boolean(data.data?.hasMore)} onPage={setPage} />
      )}
    </div>
  );
}
