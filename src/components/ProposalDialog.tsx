import { useState } from 'react';
import { useI18n } from '../i18n';
import { api } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { useToast } from '../app/ToastProvider';
import type { Proposal, RequestDetail } from '../../shared/types';
import { Alert, Button, Field, Input, Modal, Textarea } from './ui/Base';

export function ProposalDialog({
  request,
  onClose,
  onSent,
}: {
  request: RequestDetail | null;
  onClose: () => void;
  onSent: (proposal: Proposal) => void;
}) {
  return request ? <ProposalForm key={request.id} request={request} onClose={onClose} onSent={onSent} /> : null;
}
function ProposalForm({
  request,
  onClose,
  onSent,
}: {
  request: RequestDetail;
  onClose: () => void;
  onSent: (proposal: Proposal) => void;
}) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submitProposal(event: React.FormEvent) {
    event.preventDefault();
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
      const result = await api.propose(request.id, {
        amount: parsedAmount,
        estimatedDays: parsedDays,
        message: message.trim(),
      });
      toast.success(t('request.proposalSent'));
      onSent(result.proposal);
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={busy ? () => {} : onClose} title={request.title} wide>
      <form onSubmit={submitProposal} className="space-y-4">
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{request.description}</p>
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t('request.amount')} required>
            <Input type="number" min={1} step={1} required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label={t('request.estimatedDays')} required>
            <Input type="number" min={1} max={365} required value={days} onChange={(e) => setDays(e.target.value)} />
          </Field>
        </div>
        <Field label={t('request.message')} required hint={t('request.proposalHint')}>
          <Textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            minLength={10}
          />
        </Field>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('agreement.paymentNote')}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={busy}>
            {t('request.submitProposal')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
