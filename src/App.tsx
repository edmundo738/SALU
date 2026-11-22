import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout, PublicLayout } from './components/Layouts';
import { useI18n } from './i18n';
import { HomePage } from './pages/Home';
import { Spinner } from './components/ui/Base';
import { ErrorBoundary } from './app/ErrorBoundary';
import { UpdateNotice } from './app/UpdateNotice';

const LoginPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.RegisterPage })));
const OnboardingPage = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.OnboardingPage })));
const DashboardPage = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const ExplorePage = lazy(() => import('./pages/Explore').then((m) => ({ default: m.ExplorePage })));
const ProviderProfilePage = lazy(() =>
  import('./pages/ProviderProfile').then((m) => ({ default: m.ProviderProfilePage })),
);
const MyProposalsPage = lazy(() => import('./pages/MyProposals').then((m) => ({ default: m.MyProposalsPage })));
const RequestsPage = lazy(() => import('./pages/Requests').then((m) => ({ default: m.RequestsPage })));
const RequestDetailPage = lazy(() => import('./pages/RequestDetail').then((m) => ({ default: m.RequestDetailPage })));
const CreateRequestPage = lazy(() => import('./pages/CreateRequest').then((m) => ({ default: m.CreateRequestPage })));
const OpportunitiesPage = lazy(() => import('./pages/Opportunities').then((m) => ({ default: m.OpportunitiesPage })));
const MessagesPage = lazy(() => import('./pages/Messages').then((m) => ({ default: m.MessagesPage })));
const AgreementDetailPage = lazy(() =>
  import('./pages/AgreementDetail').then((m) => ({ default: m.AgreementDetailPage })),
);
const NotificationsPage = lazy(() => import('./pages/Notifications').then((m) => ({ default: m.NotificationsPage })));
const MyProfilePage = lazy(() => import('./pages/MyProfile').then((m) => ({ default: m.MyProfilePage })));
const SettingsPage = lazy(() => import('./pages/Settings').then((m) => ({ default: m.SettingsPage })));
const ProviderEditorPage = lazy(() =>
  import('./pages/ProviderEditor').then((m) => ({ default: m.ProviderEditorPage })),
);
const SafetyPage = lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.SafetyPage })));
const HelpPage = lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.HelpPage })));
const LegalPage = lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.LegalPage })));
const NotFoundPage = lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.NotFoundPage })));

function RouteEffects() {
  const { pathname } = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const titles: Array<[RegExp, string]> = [
      [/^\/$/, `${t('app.name')} — ${t('app.tagline')}`],
      [/^\/entrar$/, t('auth.login.title')],
      [/^\/criar-conta$/, t('auth.register.title')],
      [/^\/bem-vindo$/, t('onboarding.title')],
      [/^\/inicio$/, t('nav.dashboard')],
      [/^\/explorar$/, t('nav.explore')],
      [/^\/pedidos$/, t('nav.requests')],
      [/^\/propostas$/, t('nav.proposals')],
      [/^\/pedidos\//, t('request.title')],
      [/^\/publicar-pedido$/, t('request.publish')],
      [/^\/oportunidades$/, t('nav.opportunities')],
      [/^\/mensagens/, t('nav.messages')],
      [/^\/acordos\//, t('agreement.title')],
      [/^\/notificacoes$/, t('nav.notifications')],
      [/^\/definicoes$/, t('nav.settings')],
      [/^\/meu-perfil$/, t('nav.myProfile')],
      [/^\/perfil-profissional$/, t('nav.providerProfile')],
      [/^\/prestadores\//, t('provider.formTitle')],
      [/^\/ajuda$/, t('nav.help')],
      [/^\/seguranca$/, t('nav.safety')],
      [/^\/termos$/, t('footer.terms')],
      [/^\/privacidade$/, t('footer.privacy')],
      [/^\/cookies$/, t('legal.cookies')],
    ];
    const found = titles.find(([pattern]) => pattern.test(pathname));
    document.title = found ? `${found[1]} · SALU` : 'Página não encontrada · SALU';
    const main = document.getElementById('conteudo');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  }, [pathname, t]);

  return null;
}

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#F8FAFC] dark:bg-[#060E20]">
      <Spinner label="A carregar…" />
    </div>
  );
}

function PublicInfo({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

export function App() {
  return (
    <ErrorBoundary>
      <UpdateNotice />
      <RouteEffects />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/criar-conta" element={<RegisterPage />} />
          <Route path="/bem-vindo" element={<OnboardingPage />} />

          <Route element={<AppLayout />}>
            <Route path="/inicio" element={<DashboardPage />} />
            <Route path="/explorar" element={<ExplorePage />} />
            <Route path="/prestadores/:id" element={<ProviderProfilePage />} />
            <Route path="/pedidos" element={<RequestsPage />} />
            <Route path="/propostas" element={<MyProposalsPage />} />
            <Route path="/pedidos/:id" element={<RequestDetailPage />} />
            <Route path="/publicar-pedido" element={<CreateRequestPage />} />
            <Route path="/oportunidades" element={<OpportunitiesPage />} />
            <Route path="/mensagens" element={<MessagesPage />} />
            <Route path="/mensagens/:id" element={<MessagesPage />} />
            <Route path="/acordos/:id" element={<AgreementDetailPage />} />
            <Route path="/notificacoes" element={<NotificationsPage />} />
            <Route path="/definicoes" element={<SettingsPage />} />
            <Route path="/meu-perfil" element={<MyProfilePage />} />
            <Route path="/perfil-profissional" element={<ProviderEditorPage />} />
          </Route>

          <Route
            path="/seguranca"
            element={
              <PublicInfo>
                <SafetyPage />
              </PublicInfo>
            }
          />
          <Route
            path="/ajuda"
            element={
              <PublicInfo>
                <HelpPage />
              </PublicInfo>
            }
          />
          <Route
            path="/termos"
            element={
              <PublicInfo>
                <LegalPage kind="terms" />
              </PublicInfo>
            }
          />
          <Route
            path="/privacidade"
            element={
              <PublicInfo>
                <LegalPage kind="privacy" />
              </PublicInfo>
            }
          />
          <Route
            path="/cookies"
            element={
              <PublicInfo>
                <LegalPage kind="cookies" />
              </PublicInfo>
            }
          />
          <Route
            path="*"
            element={
              <PublicInfo>
                <NotFoundPage />
              </PublicInfo>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
