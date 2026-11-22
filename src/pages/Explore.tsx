import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Search, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '../i18n';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import { AVAILABLE_PROVINCES } from '../../shared/geo';
import { CATEGORIES } from '../../shared/categories';
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
import { ProviderCard } from '../components/Cards';
import { Pagination } from '../components/Pagination';
import { friendlyError } from '../lib/errors';
import { useAuth } from '../app/AuthProvider';

export function ExplorePage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [submitted, setSubmitted] = useState({ q: '', category: '', municipality: '' });
  const [page, setPage] = useState(1);
  const providers = useApiData(
    () => api.providers({ ...submitted, page: String(page) }),
    [submitted.q, submitted.category, submitted.municipality, page],
  );

  const municipalities = useMemo(
    () =>
      AVAILABLE_PROVINCES.flatMap((province) =>
        province.municipalities.map((m) => ({ id: m.id, label: `${m.name} · ${province.name}` })),
      ),
    [],
  );

  function apply(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setSubmitted({ q: q.trim(), category, municipality });
  }

  return (
    <div>
      <PageHeader
        eyebrow={t('nav.explore')}
        title={t('explore.title')}
        subtitle={t('explore.subtitle')}
        action={
          user?.activeMode === 'provider' ? (
            <ButtonLink to="/perfil-profissional" variant="secondary">
              {t('nav.providerProfile')}
            </ButtonLink>
          ) : undefined
        }
      />

      <Card className="p-4 mb-5">
        <form onSubmit={apply} className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
              placeholder={t('explore.searchPlaceholder')}
              aria-label={t('common.search')}
            />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label={t('common.category')}>
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
          <Button type="submit">
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            {t('common.filter')}
          </Button>
        </form>
      </Card>

      {providers.loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-64" />
          ))}
        </div>
      ) : providers.error ? (
        <ErrorState
          message={friendlyError(new Error(providers.error), lang, t)}
          onRetry={providers.reload}
          retryLabel={t('common.retry')}
        />
      ) : !providers.data?.providers.length ? (
        <Card>
          <EmptyState
            icon={Compass}
            title={
              submitted.q || submitted.category || submitted.municipality
                ? t('explore.empty')
                : t('explore.noProviders')
            }
            body={
              submitted.q || submitted.category || submitted.municipality
                ? t('explore.emptyBody')
                : t('explore.noProvidersBody')
            }
            action={
              user?.activeMode === 'provider' ? (
                <ButtonLink to="/oportunidades">{t('dashboard.findWork')}</ButtonLink>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-3">
            {providers.data.providers.length} {lang === 'pt' ? 'perfis nesta página' : 'profiles on this page'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.data.providers.map((provider) => (
              <ProviderCard
                key={provider.userId}
                provider={provider.userId === user?.id && user.avatar ? { ...provider, avatar: user.avatar } : provider}
              />
            ))}
          </div>
        </>
      )}
      {!providers.loading && !providers.error && (
        <Pagination page={page} hasMore={Boolean(providers.data?.hasMore)} onPage={setPage} />
      )}
    </div>
  );
}
