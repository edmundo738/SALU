import { Badge } from './ui/Base';
import { useI18n } from '../i18n';
import type { AgreementStatus, ProposalStatus, RequestStatus } from '../../shared/types';

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const { t } = useI18n();
  const tone =
    status === 'OPEN'
      ? 'blue'
      : status === 'ASSIGNED'
        ? 'orange'
        : status === 'COMPLETED'
          ? 'green'
          : status === 'DISPUTED'
            ? 'red'
            : 'neutral';
  return <Badge tone={tone}>{t(`status.request.${status}` as any)}</Badge>;
}

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const { t } = useI18n();
  const tone = status === 'ACCEPTED' ? 'green' : status === 'REJECTED' || status === 'WITHDRAWN' ? 'neutral' : 'amber';
  return <Badge tone={tone}>{t(`status.proposal.${status}` as any)}</Badge>;
}

export function AgreementStatusBadge({ status }: { status: AgreementStatus }) {
  const { t } = useI18n();
  const tone =
    status === 'ACTIVE'
      ? 'orange'
      : status === 'COMPLETED'
        ? 'green'
        : status === 'WORK_SUBMITTED'
          ? 'amber'
          : status === 'DISPUTED'
            ? 'red'
            : status === 'CANCELLED'
              ? 'neutral'
              : 'blue';
  return <Badge tone={tone}>{t(`status.agreement.${status}` as any)}</Badge>;
}
