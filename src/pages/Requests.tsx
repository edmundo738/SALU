import { useState } from 'react';
import { FilePlus2, Search } from 'lucide-react';
import { useI18n } from '../i18n';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import { friendlyError } from '../lib/errors';
import {
  ButtonLink,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Skeleton,
} from '../components/ui/Base';
import { RequestCard } from '../components/Cards';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../app/AuthProvider';

const STATUSES = ['OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED', 'DISPUTED'];

export function RequestsPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState({ status: '', q: '' });
  const [page, setPage] = useState(1);
  const data = useApiData(
    () => api.requests({ scope: 'customer', ...submitted, page: String(page) }),
    [submitted.status, submitted.q, page],
  );

  const requests = data.data?.requests.filter((request) => request.customerId === user?.id) || [];

  return (
    <div>
      <PageHeader
        eyebrow={t('mode.customer')}
        title={t('request.myRequests')}
        subtitle={t('request.myRequestsSubtitle')}
        action={
          <ButtonLink to="/publicar-pedido">
            <FilePlus2 className="w-4 h-4" aria-hidden="true" />
            {t('request.publish')}
          </ButtonLink>
        }
      />

      <Card className="p-4 mb-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSubmitted({ status, q: q.trim() });
          }}
          className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"
        >
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
              placeholder={t('common.search')}
              aria-label={t('common.search')}
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t('common.status')}>
            <option value="">{t('common.all')}</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`status.request.${value}` as any)}
              </option>
            ))}
          </Select>
          <Button type="submit">{t('common.filter')}</Button>
        </form>
      </Card>

      {data.loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-44" />
          ))}
        </div>
      ) : data.error ? (
        <ErrorState
          message={friendlyError(new Error(data.error), lang, t)}
          onRetry={data.reload}
          retryLabel={t('common.retry')}
        />
      ) : !requests.length ? (
        <Card>
          <EmptyState
            icon={FilePlus2}
            title={t('request.empty')}
            body={t('request.emptyBody')}
            action={<ButtonLink to="/publicar-pedido">{t('request.publish')}</ButtonLink>}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}

      {!data.loading && !data.error && (
        <Pagination page={page} hasMore={Boolean(data.data?.hasMore)} onPage={setPage} />
      )}
    </div>
  );
}
