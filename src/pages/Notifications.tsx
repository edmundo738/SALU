import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, MessageSquare, ShieldCheck, Star } from 'lucide-react';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import { relativeTime, useI18n } from '../i18n';
import { friendlyError } from '../lib/errors';
import { Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '../components/ui/Base';
import { useToast } from '../app/ToastProvider';

const icons: Record<string, typeof Bell> = {
  message: MessageSquare,
  review: Star,
  verification: ShieldCheck,
};

export function NotificationsPage() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const data = useApiData(() => api.notifications(), []);

  async function markAll() {
    try {
      await api.readAllNotifications();
      toast.success(t('notifications.marked'));
      data.reload();
    } catch (error) {
      toast.error(friendlyError(error, lang, t));
    }
  }

  async function open(item: { id: string; link: string; read: boolean }) {
    try {
      if (!item.read) await api.readNotification(item.id);
      navigate(item.link);
    } catch (error) {
      toast.error(friendlyError(error, lang, t));
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={t('nav.notifications')}
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
        action={
          data.data?.notifications.length ? (
            <Button variant="secondary" onClick={() => void markAll()}>
              <CheckCheck className="w-4 h-4" aria-hidden="true" />
              {t('notifications.markAll')}
            </Button>
          ) : undefined
        }
      />

      {data.loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-20" />
          ))}
        </div>
      ) : data.error ? (
        <ErrorState
          message={friendlyError(new Error(data.error), lang, t)}
          onRetry={data.reload}
          retryLabel={t('common.retry')}
        />
      ) : !data.data?.notifications.length ? (
        <Card>
          <EmptyState icon={Bell} title={t('notifications.empty')} />
        </Card>
      ) : (
        <Card className="divide-y divide-[#E2E8F0] dark:divide-[#1E325C]">
          {data.data.notifications.map((item) => {
            const Icon = icons[item.kind] || Bell;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => void open(item)}
                className={`w-full text-left flex items-start gap-3 p-4 hover:bg-[#F8FAFC] dark:hover:bg-[#132347] ${item.read ? '' : 'bg-[#EFF6FF]/70 dark:bg-[#1D6FE5]/10'}`}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.read ? 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#132347] dark:text-[#94A3B8]' : 'bg-[#EFF6FF] text-[#1D6FE5] dark:bg-[#1D6FE5]/20 dark:text-[#93C5FD]'}`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0F172A] dark:text-white">{item.title}</span>
                    {!item.read && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#F97316]"
                        aria-label={t('messages.unread', { count: 1 })}
                      />
                    )}
                  </span>
                  <span className="block mt-0.5 text-sm text-[#475569] dark:text-[#CBD5E1]">{item.body}</span>
                  <span className="block mt-1 text-[10px] text-[#94A3B8]">{relativeTime(item.createdAt, lang)}</span>
                </span>
              </button>
            );
          })}
        </Card>
      )}
    </div>
  );
}
