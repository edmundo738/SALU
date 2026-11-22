import { useRef, useState } from 'react';
import { Camera, Settings, UserRound } from 'lucide-react';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { useToast } from '../app/ToastProvider';
import { api } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { Avatar, Badge, Button, ButtonLink, Card, PageHeader } from '../components/ui/Base';

/** Perfil privado da conta, diferente do perfil profissional partilhável. */
export function MyProfilePage() {
  const { user, updateLocalUser } = useAuth();
  const { t, lang } = useI18n();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  if (!user) return null;

  async function uploadAvatar(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadAvatar(file);
      updateLocalUser(result.user);
      toast.success(t('settings.photoUpdated'));
    } catch (error) {
      toast.error(friendlyError(error, lang, t));
    } finally {
      setUploading(false);
      if (input.current) input.current.value = '';
    }
  }

  const professional = user.providerProfile;
  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader title={t('nav.myProfile')} subtitle={t('profile.accountSubtitle')} />
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar file={user.avatar} name={user.name} size="xl" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold break-words text-[#0F172A] dark:text-white">{user.name}</h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-[#CBD5E1]">
              {user.locationLabel || t('profile.noLocation')}
            </p>
            <div className="mt-2">
              <Badge tone="blue">{t(`mode.${user.activeMode}`)}</Badge>
            </div>
          </div>
          <div>
            <input
              ref={input}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label={t('profile.changePhoto')}
              onChange={(event) => void uploadAvatar(event.target.files?.[0])}
            />
            <Button variant="secondary" loading={uploading} onClick={() => input.current?.click()}>
              <Camera className="h-4 w-4" aria-hidden="true" /> {t('profile.changePhoto')}
            </Button>
            <p className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">{t('provider.uploadHint')}</p>
          </div>
        </div>
      </Card>
      <div className="grid sm:grid-cols-2 gap-5">
        {user.activeMode === 'provider' && (
          <Card className="p-5">
            <h2 className="font-bold text-[#0F172A] dark:text-white">{t('profile.professionalTitle')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#64748B] dark:text-[#CBD5E1]">
              {professional
                ? t(professional.published ? 'profile.professionalPublished' : 'profile.professionalDraft')
                : t('profile.professionalEmpty')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {professional && (
                <ButtonLink to={`/prestadores/${user.id}`}>
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  {t('profile.viewProfessional')}
                </ButtonLink>
              )}
              <ButtonLink to="/perfil-profissional" variant="secondary">
                {professional ? t('provider.edit') : t('profile.createProfessional')}
              </ButtonLink>
            </div>
          </Card>
        )}
        <Card className="p-5">
          <h2 className="font-bold text-[#0F172A] dark:text-white">{t('profile.accountActions')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#64748B] dark:text-[#CBD5E1]">
            {t('profile.accountActionsBody')}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink to="/definicoes" variant="secondary">
              <Settings className="h-4 w-4" aria-hidden="true" />
              {t('nav.settings')}
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
