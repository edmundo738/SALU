import { Navigate } from 'react-router-dom';
import { useAuth } from '../app/AuthProvider';
import { Button, Spinner } from '../components/ui/Base';
import { useI18n } from '../i18n';
import { LandingPage } from './Landing';

/** Espera a confirmação da sessão antes de escolher entre a página pública e a conta. */
export function HomePage() {
  const { user, loading, apiReachable, refresh } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#060E20]">
        <Spinner label={t('common.loading')} />
      </div>
    );
  }

  if (user) {
    const ready = user.provinceId && user.municipalityId && user.communeId;
    return <Navigate to={ready ? '/inicio' : '/bem-vindo'} replace />;
  }

  if (apiReachable === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#060E20] p-6">
        <div className="max-w-md text-center" role="alert">
          <p className="text-[#334155] dark:text-white">{t('common.networkError')}</p>
          <Button className="mt-4" onClick={() => void refresh()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
