import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CircleHelp, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n';
import { useAuth } from '../app/AuthProvider';
import { useApiData } from '../app/useApiData';
import { useToast } from '../app/ToastProvider';
import { api } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { SUPPORT_EMAIL } from '../lib/config';
import { Alert, Button, Card, Field, Modal, PageHeader, Textarea } from '../components/ui/Base';

export function SafetyPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const toast = useToast();
  const reports = useApiData(() => (user ? api.myReports() : Promise.resolve({ reports: [] })), [user?.id]);
  const [appealTarget, setAppealTarget] = useState<{ id: string } | null>(null);
  const [appealMessage, setAppealMessage] = useState('');
  const [appealBusy, setAppealBusy] = useState(false);
  const [appealError, setAppealError] = useState<string | null>(null);

  async function submitAppeal(event: React.FormEvent) {
    event.preventDefault();
    if (!appealTarget) return;
    setAppealError(null);
    setAppealBusy(true);
    try {
      await api.appealReport(appealTarget.id, appealMessage);
      toast.success(t('safety.appealSent'));
      setAppealTarget(null);
      setAppealMessage('');
      reports.reload();
    } catch (error) {
      setAppealError(friendlyError(error, lang, t));
    } finally {
      setAppealBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow={t('nav.safety')} title={t('safety.title')} subtitle={t('safety.subtitle')} />
      <div className="space-y-5">
        <Card className="p-5">
          <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('safety.trustTitle')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#475569] dark:text-[#CBD5E1]">{t('safety.trustBody')}</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            {['verification.level0', 'verification.level2', 'verification.level3', 'verification.level4'].map((key) => (
              <div key={key} className="flex items-start gap-2 rounded-xl bg-[#F8FAFC] p-3 dark:bg-[#132347]">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-[#1D6FE5] dark:text-[#93C5FD]" aria-hidden="true" />
                <span>{t(key as any)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Alert tone="warning" title={t('safety.adviceTitle')}>
          {t('safety.adviceBody')}
        </Alert>
        <Card className="p-5">
          <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('safety.report')}</h2>
          <p className="mt-2 text-sm text-[#475569] dark:text-[#CBD5E1]">{t('safety.reportBody')}</p>
          <p className="mt-2 text-sm text-[#475569] dark:text-[#CBD5E1]">
            {t('provider.report')}: {t('common.open')} {t('explore.profile')} → {t('provider.report')}.{' '}
            {t('agreement.dispute')}: {t('common.open')} {t('agreement.title')} → {t('agreement.dispute')}.
          </p>
        </Card>
        <Alert tone="danger" title={t('nav.safety')}>
          {t('safety.emergency')}
        </Alert>
        {user && (
          <Card className="p-5">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('safety.myReports')}</h2>
            {reports.loading ? (
              <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('common.loading')}</p>
            ) : !reports.data?.reports.length ? (
              <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('safety.noReports')}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {reports.data.reports.map((report) => (
                  <li key={report.id} className="rounded-xl border border-[#E2E8F0] p-3 text-sm dark:border-[#1E325C]">
                    <p className="font-semibold">
                      {t(`safety.reasons.${report.reason}` as any)} · {t(`safety.reportStatus.${report.status}` as any)}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">{report.details}</p>
                    {report.appeal_status && (
                      <p className="mt-1 text-xs font-semibold text-[#1558B8] dark:text-[#93C5FD]">
                        {t(`safety.appealStatus.${report.appeal_status}` as any)}
                      </p>
                    )}
                    {report.status === 'RESOLVED' && !report.appeal_status && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2"
                        onClick={() => setAppealTarget({ id: report.id })}
                      >
                        {t('safety.appeal')}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        <Link
          to="/ajuda"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1558B8] underline underline-offset-4 dark:text-[#93C5FD]"
        >
          <CircleHelp className="w-4 h-4" aria-hidden="true" /> {t('help.contact')}
        </Link>
      </div>
      <Modal open={Boolean(appealTarget)} onClose={() => setAppealTarget(null)} title={t('safety.appealTitle')}>
        <form onSubmit={submitAppeal} className="space-y-4">
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{t('safety.appealBody')}</p>
          <Field label={t('safety.reportDetails')} required>
            <Textarea
              value={appealMessage}
              onChange={(event) => setAppealMessage(event.target.value)}
              minLength={20}
              maxLength={2000}
            />
          </Field>
          {appealError && (
            <p className="text-sm text-red-700 dark:text-red-300" role="alert">
              {appealError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAppealTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={appealBusy}>
              {t('common.send')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function HelpPage() {
  const { t } = useI18n();
  const questions = [
    ['help.q1', 'help.a1'],
    ['help.q2', 'help.a2'],
    ['help.q3', 'help.a3'],
    ['help.q4', 'help.a4'],
    ['help.q5', 'help.a5'],
    ['help.q6', 'help.a6'],
  ] as const;
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow={t('nav.help')} title={t('help.title')} subtitle={t('help.subtitle')} />
      <div className="space-y-3">
        {questions.map(([q, a]) => (
          <details
            key={q}
            className="group rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#1E325C] dark:bg-[#0C1833]"
          >
            <summary className="cursor-pointer list-none font-semibold text-[#0F172A] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE5] rounded">
              {t(q)}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-[#475569] dark:text-[#CBD5E1]">{t(a)}</p>
          </details>
        ))}
      </div>
      <Card className="mt-6 p-5">
        <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('help.contact')}</h2>
        <p className="mt-1 text-sm text-[#475569] dark:text-[#CBD5E1]">{t('help.contactBody')}</p>
        {SUPPORT_EMAIL ? (
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-2 inline-block text-sm font-bold text-[#1558B8] underline underline-offset-4 dark:text-[#93C5FD]"
          >
            {SUPPORT_EMAIL}
          </a>
        ) : (
          <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('help.supportUnavailable')}</p>
        )}
      </Card>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#C2410C] dark:text-[#94A3B8]"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {t('notFound.home')}
      </Link>
    </div>
  );
}

export function LegalPage({ kind }: { kind: 'terms' | 'privacy' | 'cookies' }) {
  const { t } = useI18n();
  const title = kind === 'terms' ? t('legal.terms') : kind === 'privacy' ? t('legal.privacy') : t('legal.cookies');
  const body =
    kind === 'terms' ? t('legal.termsBody') : kind === 'privacy' ? t('legal.privacyBody') : t('legal.cookiesBody');
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow={t('nav.legal')} title={title} subtitle={t('legal.updated')} />
      <Card className="p-5 sm:p-7">
        <p className="text-sm leading-7 text-[#475569] dark:text-[#CBD5E1]">{body}</p>
        <div className="mt-6 rounded-xl bg-[#F8FAFC] p-4 text-sm dark:bg-[#132347]">
          <p className="font-semibold text-[#0F172A] dark:text-white">{t('agreement.paymentNote')}</p>
          <p className="mt-1 text-[#64748B] dark:text-[#94A3B8]">{t('safety.adviceBody')}</p>
        </div>
        <p className="mt-6 text-xs text-[#64748B] dark:text-[#94A3B8]">
          {t('help.contactBody')}{' '}
          {SUPPORT_EMAIL ? (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline">
              {SUPPORT_EMAIL}
            </a>
          ) : (
            <span>{t('help.supportUnavailable')}</span>
          )}
        </p>
      </Card>
      <div className="mt-4 flex gap-4 text-xs font-semibold">
        <Link to="/termos" className="text-[#1558B8] underline dark:text-[#93C5FD]">
          {t('footer.terms')}
        </Link>
        <Link to="/privacidade" className="text-[#1558B8] underline dark:text-[#93C5FD]">
          {t('footer.privacy')}
        </Link>
        <Link to="/cookies" className="text-[#1558B8] underline dark:text-[#93C5FD]">
          {t('legal.cookies')}
        </Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <p className="font-mono text-6xl font-extrabold text-[#F97316]">404</p>
      <h1 className="mt-3 text-2xl font-extrabold text-[#0F172A] dark:text-white">{t('notFound.title')}</h1>
      <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('notFound.body')}</p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white hover:bg-[#EA580C]"
      >
        {t('notFound.home')}
      </Link>
    </div>
  );
}
