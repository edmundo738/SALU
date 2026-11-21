import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Search, Send } from 'lucide-react';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import { friendlyError } from '../lib/errors';
import {
  Alert,
  ButtonLink,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  Textarea,
} from '../components/ui/Base';
import { RequestCard } from '../components/Cards';
import { CATEGORIES } from '../../shared/categories';
import { AVAILABLE_PROVINCES } from '../../shared/geo';
import { useToast } from '../app/ToastProvider';
import type { RequestDetail } from '../../shared/types';

export function OpportunitiesPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const toast = useToast();
  const [category, setCategory] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [submitted, setSubmitted] = useState({ category: '', municipality: '' });
  const data = useApiData(
    () => api.requests({ scope: 'open', ...submitted }),
    [submitted.category, submitted.municipality],
  );
  const [selected, setSelected] = useState<RequestDetail | null>(null);
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const municipalities = useMemo(
    () =>
      AVAILABLE_PROVINCES.flatMap((province) =>
        province.municipalities.map((m) => ({ id: m.id, label: `${m.name} · ${province.name}` })),
      ),
    [],
  );
  const canPropose = Boolean(user?.providerProfile?.published);

  function openProposal(request: RequestDetail) {
    setSelected(request);
    setAmount('');
    setDays('');
    setMessage('');
    setError(null);
  }

  async function submitProposal(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const parsedAmount = Number(amount);
    const parsedDays = Number(days);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(t('validation.amount'));
      return;
    }
    if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 365) {
      setError(lang === 'pt' ? 'Indica um prazo entre 1 e 365 dias.' : 'Enter a deadline between 1 and 365 days.');
      return;
    }
    if (message.trim().length < 10) {
      setError(
        lang === 'pt'
          ? 'Escreve uma mensagem com pelo menos 10 caracteres.'
          : 'Write a message with at least 10 characters.',
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.propose(selected.id, { amount: parsedAmount, estimatedDays: parsedDays, message: message.trim() });
      toast.success(t('request.proposalSent'));
      setSelected(null);
      data.reload();
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

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
          <Button variant="secondary" onClick={() => setSubmitted({ category, municipality })}>
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
      ) : !data.data?.requests.length ? (
        <Card>
          <EmptyState
            icon={BriefcaseBusiness}
            title={t('opportunities.empty')}
            body={t('opportunities.emptyBody')}
            action={
              <ButtonLink to="/explorar" variant="secondary">
                {t('dashboard.explore')}
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.data.requests.map((request) => (
            <div key={request.id} className="relative">
              <RequestCard request={request} />
              <div className="mt-2">
                {request.myProposal ? (
                  <span className="inline-flex min-h-11 items-center rounded-xl bg-[#F1F5F9] px-3 text-xs font-bold text-[#475569] dark:bg-[#132347] dark:text-[#CBD5E1]">
                    {t('opportunities.already')}
                  </span>
                ) : (
                  <Button size="sm" onClick={() => openProposal(request)} disabled={!canPropose}>
                    <Send className="w-4 h-4" aria-hidden="true" /> {t('opportunities.propose')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? selected.title : ''} wide>
        {selected && (
          <form onSubmit={submitProposal} className="space-y-4">
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{selected.description}</p>
            {error && <Alert tone="danger">{error}</Alert>}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('request.amount')} required>
                <Input
                  type="number"
                  min={500}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label={t('request.estimatedDays')} required>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="1"
                />
              </Field>
            </div>
            <Field label={t('request.message')} required hint={t('request.proposalHint')}>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} minLength={10} />
            </Field>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('agreement.paymentNote')}</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setSelected(null)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={busy}>
                {t('request.submitProposal')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
