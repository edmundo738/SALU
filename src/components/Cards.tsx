import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import type { Conversation, ProviderProfile, RequestDetail } from '../../shared/types';
import { categoryLabel } from '../../shared/categories';
import { formatKz, relativeTime, useI18n } from '../i18n';
import { Avatar, Badge, Card } from './ui/Base';
import { RequestStatusBadge } from './StatusBadge';

export function ProviderCard({ provider }: { provider: ProviderProfile }) {
  const { t, lang } = useI18n();
  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-start gap-3">
        <Avatar file={provider.avatar} name={provider.displayName} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#0F172A] dark:text-white truncate">{provider.displayName}</h3>
          <p className="text-sm text-[#475569] dark:text-[#CBD5E1] line-clamp-2">{provider.headline}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{provider.locationLabel}</span>
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="blue">{categoryLabel(provider.categoryId, lang)}</Badge>
        {provider.yearsExperience > 0 && (
          <Badge tone="neutral">{t('explore.years', { count: provider.yearsExperience })}</Badge>
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#1E325C] flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1 text-[#475569] dark:text-[#CBD5E1]">
          {provider.rating != null ? (
            <>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
              <strong>{provider.rating.toFixed(1)}</strong>
              <span className="text-[#94A3B8]">({provider.reviewCount})</span>
            </>
          ) : (
            <span className="text-[#94A3B8]">{t('dashboard.stats.none')}</span>
          )}
        </span>
        <span className="text-[#64748B] dark:text-[#94A3B8]">
          {t('explore.jobs', { count: provider.completedJobs })}
        </span>
      </div>
      <Link
        to={`/prestadores/${provider.userId}`}
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#CBD5E1] px-3 text-xs font-bold text-[#1558B8] hover:bg-[#EFF6FF] dark:border-[#1E325C] dark:text-[#93C5FD] dark:hover:bg-[#132347]"
      >
        {t('explore.profile')}
      </Link>
    </Card>
  );
}

export function RequestCard({ request }: { request: RequestDetail }) {
  const { t, lang } = useI18n();
  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#C2410C] dark:text-[#FDBA74]">
            {categoryLabel(request.categoryId, lang)}
          </p>
          <h3 className="mt-0.5 font-bold text-[#0F172A] dark:text-white leading-snug">{request.title}</h3>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>
      <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8] line-clamp-2">{request.description}</p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {request.locationLabel}
        </span>
        <span>{t('request.proposals', { count: request.proposalCount })}</span>
        <span>{relativeTime(request.createdAt, lang)}</span>
      </div>
      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-[#0F172A] dark:text-white">
          {request.budgetType === 'FIXED' ? formatKz(request.budgetAmount) : t('request.inspection')}
        </span>
        <Link
          to={`/pedidos/${request.id}`}
          className="text-xs font-bold text-[#1558B8] hover:underline dark:text-[#93C5FD]"
        >
          {t('common.open')}
        </Link>
      </div>
    </Card>
  );
}

export function ConversationRow({ conversation }: { conversation: Conversation }) {
  const { t, lang } = useI18n();
  return (
    <Link
      to={`/mensagens/${conversation.id}`}
      className="flex items-center gap-3 rounded-xl border border-transparent p-3 hover:border-[#E2E8F0] hover:bg-white dark:hover:border-[#1E325C] dark:hover:bg-[#0C1833]"
    >
      <Avatar file={conversation.otherPartyAvatar} name={conversation.otherPartyName} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold truncate text-[#0F172A] dark:text-white">{conversation.otherPartyName}</p>
          <span className="text-[10px] text-[#94A3B8] shrink-0">{relativeTime(conversation.lastMessageAt, lang)}</span>
        </div>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">{conversation.requestTitle}</p>
        <p className="text-xs text-[#475569] dark:text-[#CBD5E1] truncate">
          {conversation.lastMessage || t('messages.noMessages')}
        </p>
      </div>
      {conversation.unreadCount > 0 && (
        <span className="min-w-5 h-5 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center px-1.5">
          {conversation.unreadCount}
        </span>
      )}
    </Link>
  );
}
