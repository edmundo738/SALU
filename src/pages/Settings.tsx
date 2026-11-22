import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, LogOut, Moon, ShieldCheck, Sun, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { useTheme } from '../app/ThemeProvider';
import { api } from '../lib/api';
import { useApiData } from '../app/useApiData';
import { friendlyError } from '../lib/errors';
import { Alert, Avatar, Button, Card, Field, Input, Modal, PageHeader, Select, Skeleton } from '../components/ui/Base';
import { LocationPicker, type LocationValue } from '../components/LocationPicker';
import { useToast } from '../app/ToastProvider';

const levelLabels: Record<number, string> = {
  0: 'verification.level0',
  1: 'verification.level1',
  2: 'verification.level2',
  3: 'verification.level3',
  4: 'verification.level4',
};

export function SettingsPage() {
  const { user, stats, logout, clearSession, applySession } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const verification = useApiData(() => api.verification(), []);
  const photoInput = useRef<HTMLInputElement>(null);
  const docInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState<LocationValue>({
    provinceId: user?.provinceId || '',
    municipalityId: user?.municipalityId || '',
    communeId: user?.communeId || '',
  });
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [verifyKind, setVerifyKind] = useState<'identity' | 'qualification'>('identity');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function saveAccount() {
    setSaving(true);
    setError(null);
    try {
      const result = await api.updateMe({ name: name.trim() });
      applySession(result);
      toast.success(t('settings.saved'));
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setSaving(false);
    }
  }

  async function saveLocation() {
    setSaving(true);
    setError(null);
    try {
      const result = await api.updateMe(location);
      applySession(result);
      toast.success(t('settings.saved'));
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setSaving(false);
    }
  }

  async function changeMode(mode: 'customer' | 'provider') {
    try {
      const result = await api.updateMe({ activeMode: mode });
      applySession(result);
      toast.success(t('settings.saved'));
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    }
  }

  async function changeLanguage(next: 'pt' | 'en') {
    setLang(next);
    try {
      const result = await api.updateMe({ locale: next });
      applySession(result);
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    }
  }

  async function changeTheme(next: 'light' | 'dark') {
    setTheme(next);
    try {
      const result = await api.updateMe({ theme: next });
      applySession(result);
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    }
  }

  async function uploadPhoto(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await api.uploadAvatar(file);
      applySession({
        user: result.user,
        stats: stats || {
          requestsAsCustomer: 0,
          openRequests: 0,
          activeAgreements: 0,
          completedAgreements: 0,
          proposalsAsProvider: 0,
          completedAsProvider: 0,
          rating: null,
          reviewCount: 0,
        },
      });
      toast.success(t('settings.photoUpdated'));
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
      if (photoInput.current) photoInput.current.value = '';
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.changePassword({ currentPassword, newPassword });
      toast.success(t('settings.passwordChanged'));
      setPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  async function submitVerification(event: React.FormEvent) {
    event.preventDefault();
    if (!verifyFile) {
      setError(lang === 'pt' ? 'Anexa um documento.' : 'Attach a document.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.requestVerification(verifyFile, verifyKind, verifyNotes);
      toast.success(t('settings.verificationSent'));
      setVerifyOpen(false);
      setVerifyFile(null);
      setVerifyNotes('');
      verification.reload();
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  async function exportData() {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'salu-dados.json';
      link.click();
      URL.revokeObjectURL(url);
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(friendlyError(err, lang, t));
    }
  }

  async function deleteAccount(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.deleteAccount(deletePassword);
      toast.success(t('settings.deleted'));
      clearSession();
      navigate('/', { replace: true });
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      {error && (
        <div className="mb-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <div className="space-y-5">
        <Card className="p-5">
          <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('settings.account')}</h2>
          <div className="mt-4 flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col items-center gap-2">
              <Avatar file={user.avatar} name={user.name} size="xl" />
              <input
                ref={photoInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => void uploadPhoto(e.target.files?.[0])}
                aria-label={t('settings.uploadPhoto')}
              />
              <Button size="sm" variant="secondary" loading={busy} onClick={() => photoInput.current?.click()}>
                <Upload className="w-4 h-4" aria-hidden="true" />
                {t('settings.uploadPhoto')}
              </Button>
            </div>
            <div className="flex-1 space-y-4">
              <Field label={t('settings.name')} htmlFor="settings-name">
                <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
              </Field>
              <Field label={t('settings.contact')}>
                <Input value={user.contact} readOnly disabled />
              </Field>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label={t('settings.mode')} hint={t('settings.modeHint')}>
                  <Select
                    value={user.activeMode}
                    onChange={(e) => void changeMode(e.target.value as 'customer' | 'provider')}
                  >
                    <option value="customer">{t('settings.customerMode')}</option>
                    <option value="provider">{t('settings.providerMode')}</option>
                  </Select>
                </Field>
                <div className="flex items-end">
                  <Button variant="secondary" className="w-full" loading={saving} onClick={() => void saveAccount()}>
                    {t('common.save')}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {t('settings.memberSince', {
                  date: new Date(user.createdAt).toLocaleDateString(lang === 'pt' ? 'pt-AO' : 'en-GB'),
                })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('settings.location')}</h2>
          <div className="mt-4">
            <LocationPicker value={location} onChange={setLocation} />
          </div>
          <div className="mt-3 flex justify-end">
            <Button loading={saving} onClick={() => void saveLocation()}>
              {t('common.save')}
            </Button>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 gap-5">
          <Card className="p-5">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('settings.language')}</h2>
            <div className="mt-3 flex gap-2">
              <Button variant={lang === 'pt' ? 'primary' : 'secondary'} onClick={() => void changeLanguage('pt')}>
                {t('settings.portuguese')}
              </Button>
              <Button variant={lang === 'en' ? 'primary' : 'secondary'} onClick={() => void changeLanguage('en')}>
                {t('settings.english')}
              </Button>
            </div>
            <p className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
              {lang === 'pt'
                ? 'A interface inteira muda, incluindo mensagens do sistema.'
                : 'The whole interface changes, including system messages.'}
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('settings.theme')}</h2>
            <div className="mt-3 flex gap-2">
              <Button variant={theme === 'light' ? 'primary' : 'secondary'} onClick={() => void changeTheme('light')}>
                <Sun className="w-4 h-4" aria-hidden="true" />
                {t('settings.light')}
              </Button>
              <Button variant={theme === 'dark' ? 'primary' : 'secondary'} onClick={() => void changeTheme('dark')}>
                <Moon className="w-4 h-4" aria-hidden="true" />
                {t('settings.dark')}
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('settings.security')}</h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('settings.logoutBody')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setPasswordOpen(true)}>
                {t('settings.changePassword')}
              </Button>
              <Button variant="ghost" onClick={() => void logout()}>
                <LogOut className="w-4 h-4" aria-hidden="true" />
                {t('common.logout')}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('settings.verification')}</h2>
          <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('settings.verificationBody')}</p>
          {verification.loading ? (
            <Skeleton className="mt-4 h-40" />
          ) : verification.error ? (
            <p className="mt-3 text-sm text-red-700 dark:text-red-300">
              {friendlyError(new Error(verification.error), lang, t)}
            </p>
          ) : (
            <>
              <ul className="mt-4 space-y-2">
                {verification.data?.levels.map((level) => {
                  const currentLevel = verification.data?.currentLevel ?? 0;
                  const reached =
                    currentLevel >= level.level || (level.level === 4 && verification.data?.historyLevel === 4);
                  return (
                    <li key={level.level} className="flex items-center gap-2 text-sm">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${reached ? 'bg-emerald-600 text-white' : 'bg-[#E2E8F0] text-[#64748B] dark:bg-[#132347] dark:text-[#94A3B8]'}`}
                      >
                        {level.level}
                      </span>
                      <span
                        className={
                          reached
                            ? 'font-semibold text-[#0F172A] dark:text-white'
                            : 'text-[#64748B] dark:text-[#94A3B8]'
                        }
                      >
                        {t(levelLabels[level.level] as any)}
                      </span>
                      {!level.available && (
                        <span className="text-[10px] rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[#64748B] dark:bg-[#132347] dark:text-[#94A3B8]">
                          {t('verification.notAvailable')}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {verification.data?.requests.length ? (
                <ul className="mt-4 space-y-2">
                  {verification.data.requests.map((request) => (
                    <li
                      key={request.id}
                      className="rounded-lg border border-[#E2E8F0] p-3 text-xs dark:border-[#1E325C]"
                    >
                      <p className="font-semibold">
                        {request.kind === 'identity' ? t('verification.level2') : t('verification.level3')}
                      </p>
                      <p className="text-[#64748B] dark:text-[#94A3B8]">
                        {request.status === 'PENDING'
                          ? t('settings.verificationPending')
                          : request.status === 'APPROVED'
                            ? t('settings.verificationApproved')
                            : t('settings.verificationRejected')}
                      </p>
                      {request.review_note && <p className="mt-1">{request.review_note}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-[#64748B] dark:text-[#94A3B8]">{t('verification.none')}</p>
              )}
              <Button variant="secondary" className="mt-4" onClick={() => setVerifyOpen(true)}>
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                {t('settings.requestVerification')}
              </Button>
            </>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('settings.data')}</h2>
          <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('settings.exportHint')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void exportData()}>
              <Download className="w-4 h-4" aria-hidden="true" />
              {t('settings.export')}
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              {t('settings.deleteAccount')}
            </Button>
          </div>
        </Card>
      </div>

      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title={t('settings.changePassword')}>
        <form onSubmit={changePassword} className="space-y-4">
          <Field label={t('settings.currentPassword')} required>
            <Input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Field>
          <Field label={t('settings.newPassword')} required>
            <Input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setPasswordOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={busy}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t('settings.deleteAccount')}>
        <form onSubmit={deleteAccount} className="space-y-4">
          <Alert tone="danger">{t('settings.deleteBody')}</Alert>
          <Field label={t('settings.deleteConfirm')} required>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="danger" loading={busy}>
              {t('settings.deleteAccount')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={verifyOpen} onClose={() => setVerifyOpen(false)} title={t('settings.requestVerification')}>
        <form onSubmit={submitVerification} className="space-y-4">
          <Field label={t('settings.verification')} required>
            <Select value={verifyKind} onChange={(e) => setVerifyKind(e.target.value as 'identity' | 'qualification')}>
              <option value="identity">{t('verification.level2')}</option>
              <option value="qualification">{t('verification.level3')}</option>
            </Select>
          </Field>
          <Field label={t('settings.verificationDocument')} required>
            <input
              ref={docInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setVerifyFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-[#475569] file:mr-3 file:rounded-lg file:border-0 file:bg-[#EFF6FF] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#1558B8] dark:text-[#CBD5E1] dark:file:bg-[#132347] dark:file:text-[#93C5FD]"
              aria-label={t('settings.verificationDocument')}
            />
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">{t('provider.uploadHint')}</p>
          </Field>
          <Field label={t('settings.verificationNotes')}>
            <Input value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} maxLength={800} />
          </Field>
          <Alert tone="info">{t('settings.verificationBody')}</Alert>
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setVerifyOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={busy}>
              {t('common.send')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
