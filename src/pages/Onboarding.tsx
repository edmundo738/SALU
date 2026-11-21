import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Check, Search, UserRound } from 'lucide-react';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { api } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { Alert, Button, Card, Spinner } from '../components/ui/Base';
import { LocationPicker, type LocationValue } from '../components/LocationPicker';
import { SaluLogo } from '../components/SaluLogo';
import { useToast } from '../app/ToastProvider';

export function OnboardingPage() {
  const { user, loading, refresh } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const toast = useToast();
  const [mode, setMode] = useState<'customer' | 'provider'>(user?.activeMode || 'customer');
  const [location, setLocation] = useState<LocationValue>({
    provinceId: user?.provinceId || '',
    municipalityId: user?.municipalityId || '',
    communeId: user?.communeId || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setMode(user.activeMode);
    setLocation((current) =>
      current.provinceId
        ? current
        : {
            provinceId: user.provinceId || '',
            municipalityId: user.municipalityId || '',
            communeId: user.communeId || '',
          },
    );
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#060E20]">
        <Spinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/entrar?next=/bem-vindo" replace />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!location.provinceId || !location.municipalityId || !location.communeId) {
      setError(t('validation.location'));
      return;
    }
    setBusy(true);
    try {
      await api.onboarding({ activeMode: mode, ...location });
      await refresh();
      toast.success(t('common.success'));
      navigate(mode === 'provider' ? '/perfil-profissional' : '/inicio', { replace: true });
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#EFF6FF] to-[#FFF7ED] dark:from-[#060E20] dark:via-[#081C41] dark:to-[#0C1833] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-center">
          <SaluLogo />
        </div>
        <Card className="mt-6 p-5 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C2410C] dark:text-[#FDBA74]">SALU</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            {t('onboarding.title')}
          </h1>
          <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('onboarding.subtitle')}</p>

          {error && (
            <div className="mt-4">
              <Alert tone="danger">{error}</Alert>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-7">
            <fieldset>
              <legend className="text-sm font-bold text-[#0F172A] dark:text-white">{t('onboarding.title')}</legend>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'customer' as const,
                    icon: UserRound,
                    title: t('onboarding.customer'),
                    body: t('onboarding.customerBody'),
                  },
                  {
                    id: 'provider' as const,
                    icon: BriefcaseBusiness,
                    title: t('onboarding.provider'),
                    body: t('onboarding.providerBody'),
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const selected = mode === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMode(option.id)}
                      className={`text-left rounded-2xl border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE5] ${
                        selected
                          ? 'border-[#1D6FE5] bg-[#EFF6FF] dark:border-[#F97316] dark:bg-[#132347]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] dark:border-[#1E325C] dark:bg-[#0C1833]'
                      }`}
                      aria-pressed={selected}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-[#1D6FE5] text-white' : 'bg-[#F1F5F9] text-[#475569] dark:bg-[#132347] dark:text-[#CBD5E1]'}`}
                        >
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        {selected && (
                          <span className="w-6 h-6 rounded-full bg-[#1D6FE5] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-bold text-[#0F172A] dark:text-white">{option.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">{option.body}</p>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-bold text-[#0F172A] dark:text-white">{t('onboarding.location')}</legend>
              <div className="mt-3">
                <LocationPicker value={location} onChange={setLocation} />
              </div>
            </fieldset>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button type="submit" size="lg" loading={busy}>
                {busy ? t('onboarding.finishing') : t('onboarding.finish')}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </form>
        </Card>
        <p className="mt-4 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
          <Search className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" />
          {t('onboarding.locationHint')}
        </p>
      </div>
    </div>
  );
}
