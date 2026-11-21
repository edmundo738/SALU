import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { friendlyError } from '../lib/errors';
import { Alert, Button, Card, Field, Input, Modal } from '../components/ui/Base';
import { SaluLogo } from '../components/SaluLogo';
import { useToast } from '../app/ToastProvider';

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr] bg-[#F8FAFC] dark:bg-[#060E20]">
      <div className="hidden lg:flex relative overflow-hidden bg-[#081C41] p-10 flex-col justify-between">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-[#1D6FE5]/35 blur-3xl" />
          <div className="absolute -bottom-24 -right-10 w-96 h-96 rounded-full bg-[#F97316]/30 blur-3xl" />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 800" fill="none" aria-hidden="true">
            <path d="M-40 620 Q220 520 420 700 T760 620" stroke="#F97316" strokeOpacity=".45" strokeWidth="2" />
            <path d="M-40 140 Q200 40 420 150 T760 80" stroke="#60A5FA" strokeOpacity=".35" strokeWidth="1.5" />
            {Array.from({ length: 12 }).map((_, index) => (
              <line
                key={index}
                x1={60 + index * 60}
                y1="0"
                x2={-80 + index * 60}
                y2="800"
                stroke="#93C5FD"
                strokeOpacity=".12"
              />
            ))}
          </svg>
        </div>
        <div className="relative">
          <SaluLogo />
        </div>
        <div className="relative max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FDBA74]">SALU</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-white leading-tight">
            Serviços com regras claras, do pedido à conclusão.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            Uma conta para contratar e para prestar. Sem números inventados. Sem promessas de pagamento que não
            conseguimos cumprir.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-white/60">
            <ShieldCheck className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            Sessão segura · dados persistentes
          </div>
        </div>
        <p className="relative text-[11px] text-white/40">© {new Date().getFullYear()} SALU · Angola</p>
      </div>
      <div className="flex flex-col min-h-screen">
        <div className="lg:hidden px-5 pt-5">
          <SaluLogo compact />
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className="pr-12" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-0 min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#132347]"
        aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function LoginPage() {
  const { user, loading, login, apiReachable } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const requestedNext = params.get('next') || '/inicio';
  // Só aceita caminho interno; nunca `//evil` nem URL absoluto.
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/inicio';

  if (!loading && user) return <Navigate to={next} replace />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!contact.trim() || !password) {
      setError(t('auth.fillBoth'));
      return;
    }
    setBusy(true);
    try {
      await login(contact, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#C2410C] dark:text-[#94A3B8] dark:hover:text-[#FDBA74]"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {t('common.back')}
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
        {t('auth.login.title')}
      </h1>
      <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('auth.login.subtitle')}</p>

      {apiReachable === false && (
        <div className="mt-4">
          <Alert tone="danger">{t('common.networkError')}</Alert>
        </div>
      )}
      {error && (
        <div className="mt-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label={t('auth.contact')} htmlFor="contact" required>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
            <Input
              id="contact"
              name="contact"
              autoComplete="username"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="pl-9"
              placeholder="nome@email.com ou 923 000 000"
            />
          </div>
        </Field>
        <Field label={t('auth.password')} htmlFor="password" required>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
            />
          </div>
        </Field>
        <Button type="submit" className="w-full" loading={busy}>
          {t('auth.loginAction')}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={() => setForgotOpen(true)}
          className="font-semibold text-[#1558B8] hover:underline dark:text-[#93C5FD]"
        >
          {t('auth.forgot')}
        </button>
        <Link to="/criar-conta" className="font-semibold text-[#C2410C] hover:underline dark:text-[#FDBA74]">
          {t('auth.noAccount')} {t('common.register')}
        </Link>
      </div>

      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)} title={t('auth.forgot')}>
        <p className="text-sm leading-relaxed text-[#475569] dark:text-[#CBD5E1]">{t('auth.forgotBody')}</p>
        <div className="mt-4">
          <Link
            to="/ajuda"
            className="text-sm font-semibold text-[#1558B8] underline underline-offset-4 dark:text-[#93C5FD]"
          >
            {t('help.contact')}
          </Link>
        </div>
      </Modal>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { user, loading, register } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', contact: '', password: '', passwordConfirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/inicio" replace />;

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setFields((current) => ({ ...current, [key]: '' }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const nextFields: Record<string, string> = {};
    if (form.name.trim().length < 2) nextFields.name = t('auth.fillName');
    if (!form.contact.trim()) nextFields.contact = t('auth.fillContact');
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      nextFields.password = t('validation.passwordMin');
    if (form.password !== form.passwordConfirm) nextFields.passwordConfirm = t('validation.passwordMatch');
    if (Object.keys(nextFields).length) {
      setFields(nextFields);
      return;
    }
    setBusy(true);
    try {
      await register(form.name, form.contact, form.password, form.passwordConfirm);
      toast.success(t('auth.welcomeBack'));
      navigate('/bem-vindo', { replace: true });
    } catch (err) {
      const message = friendlyError(err, lang, t);
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#C2410C] dark:text-[#94A3B8] dark:hover:text-[#FDBA74]"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {t('common.back')}
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
        {t('auth.register.title')}
      </h1>
      <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('auth.register.subtitle')}</p>

      {error && (
        <div className="mt-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label={t('auth.name')} htmlFor="name" required error={fields.name}>
          <div className="relative">
            <UserRound className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="pl-9"
              placeholder={t('auth.namePlaceholder')}
            />
          </div>
        </Field>
        <Field label={t('auth.contact')} htmlFor="contact" hint={t('auth.contactHint')} required error={fields.contact}>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
            <Input
              id="contact"
              name="contact"
              autoComplete="username"
              value={form.contact}
              onChange={(e) => update('contact', e.target.value)}
              className="pl-9"
              placeholder="nome@email.com ou 923 000 000"
            />
          </div>
        </Field>
        <Field
          label={t('auth.password')}
          htmlFor="password"
          hint={t('auth.passwordHint')}
          required
          error={fields.password}
        >
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="pl-9"
            />
          </div>
        </Field>
        <Field label={t('auth.passwordConfirm')} htmlFor="passwordConfirm" required error={fields.passwordConfirm}>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3.5 w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
            <PasswordInput
              id="passwordConfirm"
              name="passwordConfirm"
              autoComplete="new-password"
              value={form.passwordConfirm}
              onChange={(e) => update('passwordConfirm', e.target.value)}
              className="pl-9"
            />
          </div>
        </Field>
        <p className="text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
          {t('auth.terms')}{' '}
          <Link to="/termos" className="font-semibold underline underline-offset-4">
            {t('footer.terms')}
          </Link>{' '}
          ·{' '}
          <Link to="/privacidade" className="font-semibold underline underline-offset-4">
            {t('footer.privacy')}
          </Link>
        </p>
        <Button type="submit" className="w-full" loading={busy}>
          {t('auth.registerAction')}
        </Button>
      </form>

      <p className="mt-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
        {t('auth.haveAccount')}{' '}
        <Link to="/entrar" className="font-semibold text-[#C2410C] hover:underline dark:text-[#FDBA74]">
          {t('common.login')}
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-[#E2E8F0] bg-white p-4 dark:border-[#1E325C] dark:bg-[#0C1833]">
        <p className="flex items-center gap-2 text-xs font-bold text-[#334155] dark:text-[#E2E8F0]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
          {t('landing.honesty.title')}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8]">{t('landing.honesty.dont3')}</p>
      </div>
    </AuthShell>
  );
}
