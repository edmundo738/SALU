import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, ImagePlus, Upload } from 'lucide-react';
import type { ProviderProfile } from '../../shared/types';
import { CATEGORIES, categoryLabel } from '../../shared/categories';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import { friendlyError } from '../lib/errors';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Textarea,
} from '../components/ui/Base';
import { useToast } from '../app/ToastProvider';
import { FileImage } from '../components/FileImage';

export function ProviderEditorPage() {
  const { user, refresh, updateLocalUser } = useAuth();
  const { t, lang } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const data = useApiData(() => api.myProvider(), []);
  const avatarInput = useRef<HTMLInputElement>(null);
  const portfolioInput = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [form, setForm] = useState({
    displayName: '',
    headline: '',
    categoryId: '',
    bio: '',
    yearsExperience: '0',
    whatsapp: '',
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data.data?.provider) {
      setProfile(data.data.provider);
      setForm({
        displayName: data.data.provider.displayName,
        headline: data.data.provider.headline,
        categoryId: data.data.provider.categoryId,
        bio: data.data.provider.bio,
        yearsExperience: String(data.data.provider.yearsExperience),
        whatsapp: data.data.provider.whatsapp || '',
      });
    } else if (user) {
      setForm((current) => ({ ...current, displayName: current.displayName || user.name }));
    }
  }, [data.data, user?.id]);

  if (!user) return null;
  if (data.loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );

  if (data.error)
    return (
      <ErrorState
        message={friendlyError(new Error(data.error), lang, t)}
        onRetry={data.reload}
        retryLabel={t('common.retry')}
      />
    );

  const locationReady = Boolean(user.provinceId && user.municipalityId && user.communeId);

  async function save(publishAfter: boolean) {
    setError(null);
    setBusy(true);
    try {
      const result = await api.saveProvider({
        displayName: form.displayName.trim() || user?.name || '',
        headline: form.headline.trim(),
        categoryId: form.categoryId,
        bio: form.bio.trim(),
        yearsExperience: Number(form.yearsExperience) || 0,
        whatsapp: form.whatsapp.trim(),
        publish: publishAfter,
      });
      setProfile(result.provider);
      await refresh();
      toast.success(publishAfter ? t('provider.publishedToast') : t('provider.saved'));
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  async function unpublish() {
    setBusy(true);
    try {
      const result = await api.unpublishProvider();
      setProfile(result.provider);
      await refresh();
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  async function uploadAvatar(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadAvatar(file);
      updateLocalUser(result.user);
      toast.success(t('settings.photoUpdated'));
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    } finally {
      setUploading(false);
      if (avatarInput.current) avatarInput.current.value = '';
    }
  }

  async function uploadPortfolio(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadPortfolio(file);
      setProfile(result.provider);
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    } finally {
      setUploading(false);
      if (portfolioInput.current) portfolioInput.current.value = '';
    }
  }

  async function removePortfolio(fileId: string) {
    try {
      const result = await api.removePortfolio(fileId);
      setProfile(result.provider);
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    }
  }

  return (
    <div className="max-w-4xl">
      <Link
        to="/inicio"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#C2410C] dark:text-[#94A3B8]"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {t('common.back')}
      </Link>
      <PageHeader
        eyebrow={t('mode.provider')}
        title={t('provider.formTitle')}
        subtitle={t('provider.formSubtitle')}
        action={
          profile ? (
            <Badge tone={profile.published ? 'green' : 'neutral'}>
              {profile.published ? t('provider.published') : t('provider.draft')}
            </Badge>
          ) : undefined
        }
      />

      {!locationReady && (
        <div className="mb-5">
          <Alert tone="warning" title={t('settings.location')}>
            <p>{t('provider.required')}</p>
            <Link to="/definicoes" className="mt-2 inline-block text-sm font-bold underline">
              {t('settings.location')}
            </Link>
          </Alert>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar file={user.avatar || profile?.avatar} name={form.displayName || user.name} size="xl" />
            <div>
              <input
                ref={avatarInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => void uploadAvatar(e.target.files?.[0])}
                aria-label={t('provider.avatar')}
              />
              <Button variant="secondary" size="sm" loading={uploading} onClick={() => avatarInput.current?.click()}>
                <Upload className="w-4 h-4" aria-hidden="true" />
                {t('provider.avatar')}
              </Button>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">{t('provider.uploadHint')}</p>
            </div>
          </div>

          <Field label={t('provider.displayName')} required>
            <Input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              maxLength={80}
            />
          </Field>
          <Field label={t('provider.headline')} required hint={t('provider.headlinePlaceholder')}>
            <Input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              maxLength={120}
            />
          </Field>
          <Field label={t('provider.category')} required>
            <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">{t('common.choose')}</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === 'pt' ? c.pt : c.en}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('provider.bio')} required hint={t('provider.bioPlaceholder')}>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              minLength={20}
              maxLength={1200}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t('provider.years')} required>
              <Input
                type="number"
                min={0}
                max={70}
                value={form.yearsExperience}
                onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
              />
            </Field>
            <Field label={t('provider.whatsapp')} hint={t('provider.whatsappHint')}>
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="923 000 000"
                inputMode="tel"
              />
            </Field>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {t('settings.location')}: <strong>{user.locationLabel || '—'}</strong> ·{' '}
            <Link to="/definicoes" className="underline">
              {t('common.edit')}
            </Link>
          </p>
          <div className="flex flex-wrap gap-2 justify-end pt-2">
            {profile?.published && (
              <Button variant="secondary" loading={busy} onClick={() => void unpublish()}>
                <EyeOff className="w-4 h-4" aria-hidden="true" />
                {t('provider.unpublish')}
              </Button>
            )}
            <Button variant="secondary" loading={busy} onClick={() => void save(false)} disabled={!locationReady}>
              {profile?.published ? t('common.save') : t('provider.saveDraft')}
            </Button>
            <Button loading={busy} onClick={() => void save(true)} disabled={!locationReady}>
              <Eye className="w-4 h-4" aria-hidden="true" />
              {profile?.published ? t('provider.updatePublication') : t('provider.publish')}
            </Button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('provider.portfolio')}</h2>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">{t('provider.maxPortfolio')}</p>
            {!profile && (
              <p className="mt-2 text-sm text-[#475569] dark:text-[#CBD5E1]">{t('profile.saveBeforePortfolio')}</p>
            )}
            <input
              ref={portfolioInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => void uploadPortfolio(e.target.files?.[0])}
              aria-label={t('provider.portfolioUpload')}
            />
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              loading={uploading}
              onClick={() => portfolioInput.current?.click()}
              disabled={!profile || profile.portfolio.length >= 8}
            >
              <ImagePlus className="w-4 h-4" aria-hidden="true" />
              {t('provider.portfolioUpload')}
            </Button>
            {profile?.portfolio.length ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {profile.portfolio.map((file) => (
                  <div key={file.id} className="relative">
                    <FileImage
                      file={file}
                      className="w-full h-28 object-cover rounded-lg border border-[#E2E8F0] dark:border-[#1E325C]"
                    />
                    <button
                      type="button"
                      onClick={() => void removePortfolio(file.id)}
                      className="absolute top-1 right-1 min-h-11 min-w-11 rounded-lg bg-slate-950/70 text-white text-xs hover:bg-red-700"
                      aria-label={t('common.remove')}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('provider.noPortfolio')}</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('explore.profile')}</h2>
            <p className="mt-2 text-sm text-[#475569] dark:text-[#CBD5E1]">{form.headline || t('provider.headline')}</p>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              {form.categoryId ? categoryLabel(form.categoryId, lang) : t('provider.category')}
            </p>
            {profile?.userId && (
              <Link
                to={`/prestadores/${profile.userId}`}
                className="mt-3 inline-block text-xs font-bold text-[#1558B8] underline underline-offset-4 dark:text-[#93C5FD]"
              >
                {t('common.view')}
              </Link>
            )}
            <p className="mt-3 text-xs text-[#64748B] dark:text-[#94A3B8]">{t('landing.honesty.dont2')}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
