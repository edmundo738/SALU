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

const titlesEn: Record<string, string> = {
  'Nova proposta recebida': 'New proposal received',
  'Proposta aceite': 'Proposal accepted',
  'Proposta não aceite': 'Proposal not accepted',
  'Acordo confirmado': 'Agreement confirmed',
  'Acordo recusado': 'Agreement declined',
  'Trabalho concluído — confirma': 'Work completed — confirm',
  'Serviço confirmado': 'Service confirmed',
  'Correcção pedida': 'Changes requested',
  'Disputa aberta': 'Dispute opened',
  'Acordo cancelado': 'Agreement cancelled',
  'Recebeste uma avaliação': 'You received a review',
  'Nova mensagem': 'New message',
  'Pedido recebido': 'Request received',
  'Verificação aprovada': 'Verification approved',
  'Verificação recusada': 'Verification declined',
  'Recurso aceite': 'Appeal accepted',
  'Recurso recusado': 'Appeal declined',
};

const bodiesEn: Record<string, string> = {
  'O prestador confirmou o acordo. O trabalho pode começar.': 'The provider confirmed the agreement. Work can start.',
  'O cliente confirmou o acordo.': 'The customer confirmed the agreement.',
  'O prestador recusou o acordo. O pedido voltou a estar aberto.':
    'The provider declined the agreement. The request is open again.',
  'O prestador submeteu a conclusão. Revê e confirma ou pede correcções.':
    'The provider submitted completion. Review it and confirm or request changes.',
  'O cliente confirmou a conclusão. Já podem avaliar-se.':
    'The customer confirmed completion. You can now review each other.',
  'A outra parte abriu uma disputa. A equipa SALU vai analisar.':
    'The other party opened a dispute. The SALU team will review it.',
  'O acordo foi cancelado antes do início.': 'The agreement was cancelled before it started.',
  'Uma avaliação foi publicada no teu perfil.': 'A review was published on your profile.',
  'Recebeste um anexo.': 'You received an attachment.',
  'A equipa SALU vai rever o documento. Não é uma verificação automática.':
    'The SALU team will review the document. This is not an automatic verification.',
  'O teu documento foi revisto e aprovado pela equipa SALU.':
    'Your document was reviewed and approved by the SALU team.',
  'O documento não foi aceite.': 'The document was not accepted.',
  'A denúncia vai ser revista novamente pela equipa SALU.': 'The report will be reviewed again by the SALU team.',
  'O recurso não foi aceite.': 'The appeal was not accepted.',
};

function localizeNotification(title: string, body: string, lang: 'pt' | 'en') {
  if (lang === 'pt') return { title, body };
  let nextBody = bodiesEn[body] || body;
  nextBody = nextBody
    .replace(/^Recebeste uma proposta para “(.+)”.$/, 'You received a proposal for “$1”.')
    .replace(
      /^O cliente aceitou a tua proposta para “(.+)”. Falta a tua confirmação.$/,
      'The customer accepted your proposal for “$1”. Your confirmation is pending.',
    )
    .replace(/^A proposta para “(.+)” não foi aceite.$/, 'The proposal for “$1” was not accepted.');
  return { title: titlesEn[title] || title, body: nextBody };
}

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
            const copy = localizeNotification(item.title, item.body, lang);
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
                    <span className="text-sm font-bold text-[#0F172A] dark:text-white">{copy.title}</span>
                    {!item.read && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#F97316]"
                        aria-label={t('messages.unread', { count: 1 })}
                      />
                    )}
                  </span>
                  <span className="block mt-0.5 text-sm text-[#475569] dark:text-[#CBD5E1]">{copy.body}</span>
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
