import { useState } from 'react';
import { Flag } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { friendlyError } from '../lib/errors';
import { useToast } from '../app/ToastProvider';
import { Button, Field, Modal, Select, Textarea } from './ui/Base';

export function ReportButton({
  targetType,
  targetId,
  label,
  variant = 'ghost',
  className = '',
}: {
  targetType: 'user' | 'request' | 'agreement' | 'message' | 'review';
  targetId: string;
  label?: string;
  variant?: 'ghost' | 'secondary';
  className?: string;
}) {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('other');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (details.trim().length < 10) {
      setError(t('safety.reportDetails'));
      return;
    }
    setBusy(true);
    try {
      await api.report({ targetType, targetId, reason, details });
      toast.success(t('safety.reportSent'));
      setOpen(false);
      setDetails('');
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant={variant} className={className} onClick={() => setOpen(true)}>
        <Flag className="w-4 h-4" aria-hidden="true" /> {label ?? t('safety.report')}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={t('safety.reportTitle')}>
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{t('safety.reportBody')}</p>
          <Field label={t('safety.reportReason')} required>
            <Select value={reason} onChange={(event) => setReason(event.target.value)}>
              {['abuse', 'fraud', 'impersonation', 'spam', 'safety', 'other'].map((key) => (
                <option key={key} value={key}>
                  {t(`safety.reasons.${key}` as any)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('safety.reportDetails')} required hint="10–2000">
            <Textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              minLength={10}
              maxLength={2000}
            />
          </Field>
          {error && (
            <p className="text-sm text-red-700 dark:text-red-300" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={busy}>
              {t('common.send')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
