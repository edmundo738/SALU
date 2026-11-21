import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { useAuth } from '../app/AuthProvider';

const STATUSES = ['OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED', 'DISPUTED'];

export function RequestsPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState({ status: '', q: '' });
  const data = useApiData(() => api.requests({ scope: 'mine', ...submitted }), [submitted.status, submitted.q]);

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
      ) : !data.data?.requests.length ? (
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
          {data.data.requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}

      {user?.activeMode === 'provider' && (
        <div className="mt-6 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 text-sm dark:border-[#1D6FE5]/40 dark:bg-[#132347]">
          <p className="font-semibold text-[#0F172A] dark:text-white">{t('opportunities.title')}</p>
          <p className="mt-1 text-[#475569] dark:text-[#CBD5E1]">{t('opportunities.subtitle')}</p>
          <Link
            to="/oportunidades"
            className="mt-2 inline-block text-xs font-bold text-[#1558B8] underline underline-offset-4 dark:text-[#93C5FD]"
          >
            {t('dashboard.findWork')}
          </Link>
        </div>
      )}
    </div>
  );
}
