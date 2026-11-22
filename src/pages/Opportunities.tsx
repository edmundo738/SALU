import { useMemo, useState } from 'react';
import { BriefcaseBusiness, Search, Send } from 'lucide-react';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { api } from '../lib/api';
import { ProposalDialog } from '../components/ProposalDialog';
import { useApiData } from '../app/useApiData';
import { friendlyError } from '../lib/errors';
import {
  Alert,
  ButtonLink,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Select,
  Skeleton,
} from '../components/ui/Base';
import { RequestCard } from '../components/Cards';
import { Pagination } from '../components/Pagination';
import { CATEGORIES } from '../../shared/categories';
import { AVAILABLE_PROVINCES } from '../../shared/geo';
import type { RequestDetail } from '../../shared/types';

export function OpportunitiesPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [category, setCategory] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [submitted, setSubmitted] = useState({ category: '', municipality: '' });
  const [page, setPage] = useState(1);
  const data = useApiData(
    () => api.requests({ scope: 'open', ...submitted, page: String(page) }),
    [submitted.category, submitted.municipality, page],
  );
  const [selected, setSelected] = useState<RequestDetail | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const municipalities = useMemo(
    () =>
      AVAILABLE_PROVINCES.flatMap((province) =>
        province.municipalities.map((m) => ({ id: m.id, label: `${m.name} · ${province.name}` })),
      ),
    [],
  );
  const canPropose = Boolean(user?.providerProfile?.published);

  const opportunities = data.data?.requests.filter((request) => request.customerId !== user?.id) || [];

  return (
    <div>
      <PageHeader
        eyebrow={t('mode.provider')}
        title={t('opportunities.title')}
        subtitle={t('opportunities.subtitle')}
      />

      {!canPropose && (
        <div className="mb-5">
          <Alert tone="warning" title={t('dashboard.profileReminder')}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p>{t('request.needProfile')}</p>
              <ButtonLink to="/perfil-profissional" className="shrink-0" size="sm" variant="secondary">
                {t('dashboard.editProfile')}
              </ButtonLink>
            </div>
          </Alert>
        </div>
      )}

      {conversationId && (
        <div className="mb-5">
          <Alert tone="success" title={t('request.proposalSent')}>
            <ButtonLink to={`/mensagens/${conversationId}`} size="sm" variant="secondary">
              {t('request.contactProvider')}
            </ButtonLink>
          </Alert>
        </div>
      )}
      <Card className="p-4 mb-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label={t('opportunities.filterCategory')}
          >
            <option value="">
              {t('common.all')} · {t('common.category')}
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === 'pt' ? c.pt : c.en}
              </option>
            ))}
          </Select>
          <Select
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            aria-label={t('opportunities.filterMunicipality')}
          >
            <option value="">
              {t('common.all')} · {t('opportunities.filterMunicipality')}
            </option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
          <Button
            variant="secondary"
            onClick={() => {
              setPage(1);
              setSubmitted({ category, municipality });
            }}
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {t('common.filter')}
          </Button>
        </div>
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
      ) : !opportunities.length ? (
        <Card>
          <EmptyState icon={BriefcaseBusiness} title={t('opportunities.empty')} body={t('opportunities.emptyBody')} />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {opportunities.map((request) => (
            <div key={request.id} className="relative">
              <RequestCard request={request} canOpen={canPropose || Boolean(request.myProposal)} showProposal />
              <div className="mt-2">
                {request.myProposal ? (
                  <span className="inline-flex min-h-11 items-center rounded-xl bg-[#F1F5F9] px-3 text-xs font-bold text-[#475569] dark:bg-[#132347] dark:text-[#CBD5E1]">
                    {t('opportunities.already')}
                  </span>
                ) : (
                  <Button size="sm" onClick={() => setSelected(request)} disabled={!canPropose}>
                    <Send className="w-4 h-4" aria-hidden="true" /> {t('opportunities.propose')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!data.loading && !data.error && (
        <Pagination page={page} hasMore={Boolean(data.data?.hasMore)} onPage={setPage} />
      )}

      <ProposalDialog
        request={selected}
        onClose={() => setSelected(null)}
        onSent={(proposal) => {
          setSelected(null);
          setConversationId(proposal.conversationId || null);
          data.reload();
        }}
      />
    </div>
  );
}
