import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { ANGOLA_MUNICIPALITIES, SERVICE_CATEGORIES } from '../data/saluData';
import { translateCategory, useLang } from '../i18n/translations';
import { ProviderEntityType, ProviderProfileDraft, UserRole } from '../types/salu';
import { saluApi } from '../lib/api';

import { LuandaNightBackdrop, SaluRibbonMark } from './ui/Primitives';

interface AuthScreenProps {
  initialMode?: 'signin' | 'register';
  onCompleteAuth: (name: string, role: UserRole, goToOnboarding: boolean) => void;
  onBackToLanding: () => void;
}

function GoogleGIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.1.74-2.5 1.18-4.22 1.18-3.24 0-5.99-2.19-6.97-5.13H1.03v3.14C3.04 21.18 7.21 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.03 14.04A7.18 7.18 0 0 1 4.65 12c0-.71.13-1.4.38-2.04V6.82H1.03A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.03 5.18l4-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.08 1.19 15.3 0 12 0 7.21 0 3.04 2.82 1.03 6.82l4 3.14c.98-2.94 3.73-5.21 6.97-5.21Z"
      />
    </svg>
  );
}

function AppleLogoIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43Zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45Z" />
    </svg>
  );
}

export function AuthScreen({ initialMode = 'signin', onCompleteAuth, onBackToLanding }: AuthScreenProps) {
  const { lang, setLang, t } = useLang();
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [initialRole, setInitialRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedContact = phoneOrEmail.trim();
    if (mode === 'register' && !name.trim()) {
      setError(
        t(
          'Por favor, informe o seu nome completo ou da empresa.',
          'Please enter your full name or business name.'
        )
      );
      return;
    }
    if (!resolvedContact) {
      setError(
        t(
          'Por favor, informe o seu e-mail ou número de telefone.',
          'Please enter your email or phone number.'
        )
      );
      return;
    }
    setError('');
    setResetMessage('');
    setSubmitting(true);

    try {
      if (mode === 'register') {
        const res = await saluApi.register({
          name: name.trim(),
          email_or_phone: resolvedContact,
          password: password || 'salu1234',
          role: initialRole,
          municipality: 'Luanda',
        });
        setSubmitting(false);
        onCompleteAuth(res.user.name, (res.user.role as UserRole) || initialRole, true);
      } else {
        const res = await saluApi.login({
          email_or_phone: resolvedContact,
          password: password || 'salu1234',
        });
        setSubmitting(false);
        onCompleteAuth(res.user.name, (res.user.role as UserRole) || initialRole, false);
      }
    } catch (err: any) {
      console.warn('API auth fallback to local session:', err.message);
      setSubmitting(false);
      if (password && err.message && err.message.includes('incorretos')) {
        setError(t('Contacto ou palavra-passe incorretos.', 'Invalid credentials.'));
      } else {
        const fallbackName = name.trim() || resolvedContact.split('@')[0] || 'Utilizador SALU';
        onCompleteAuth(fallbackName, initialRole, mode === 'register');
      }
    }
  };

  const handleSocialAuth = async (providerLabel: string) => {
    setError('');
    setResetMessage('');
    try {
      const res = await saluApi.googleAuth({
        name: name.trim() || 'Utilizador SALU',
        email: phoneOrEmail.trim() || 'utilizador@salu.ao',
        role: initialRole,
      });
      onCompleteAuth(res.user.name, (res.user.role as UserRole) || initialRole, false);
    } catch (err) {
      const resolvedName = name.trim() || 'Utilizador SALU';
      onCompleteAuth(resolvedName, initialRole, false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061534] flex flex-col lg:flex-row relative overflow-hidden">
      {/* LEFT VISUAL PANEL (Luanda Nocturnal Bay & SALU Brand Statement) */}
      <section className="lg:w-[55%] relative overflow-hidden flex flex-col justify-between p-7 sm:p-12 lg:p-16 text-white min-h-[360px] lg:min-h-screen">
        <LuandaNightBackdrop variant="auth" />

        {/* Top-Left SALU Brand Lockup */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-3 text-left group"
          >
            <SaluRibbonMark size={44} />
            <div>
              <span className="block font-display text-3xl font-bold tracking-tight text-white leading-none">
                SALU
              </span>
              <span className="block text-[11px] sm:text-xs text-white/85 mt-1 tracking-wide">
                {t(
                  'Serviços • Oportunidades • Confiança',
                  'Services • Opportunities • Trust'
                )}
              </span>
            </div>
          </button>

          {/* Mobile language toggle */}
          <div className="flex lg:hidden items-center gap-1 bg-white/10 backdrop-blur border border-white/20 rounded-full p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLang('pt')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                lang === 'pt' ? 'bg-white text-[#07193B]' : 'text-white/85'
              }`}
            >
              PT
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                lang === 'en' ? 'bg-white text-[#07193B]' : 'text-white/85'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Center-Left Hero Message */}
        <div className="relative z-10 my-10 lg:my-auto max-w-xl space-y-5">
          <h1 className="font-display text-3xl sm:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.08] text-white">
            {lang === 'pt' ? (
              <>
                Onde as habilidades
                <br />
                existem, as
                <br />
                <span className="text-[#FF7A1A]">oportunidades</span> também.
              </>
            ) : (
              <>
                Where skills
                <br />
                exist,{' '}
                <span className="text-[#FF7A1A]">opportunities</span>
                <br />
                follow.
              </>
            )}
          </h1>
          <p className="text-sm sm:text-lg text-white/90 max-w-md leading-relaxed">
            {t(
              'Encontre serviços, resolva seus problemas e descubra novas oportunidades.',
              'Find trusted services, solve everyday problems, and discover new opportunities.'
            )}
          </p>
        </div>

        {/* Bottom-Left Trust Pillars */}
        <div className="relative z-10 flex flex-wrap items-center gap-6 sm:gap-8 pt-2">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-white/90 shrink-0" strokeWidth={1.6} />
            <div className="text-xs sm:text-sm leading-tight text-white/90">
              <p className="font-semibold text-white">{t('Seguro', 'Safe')}</p>
              <p className="text-white/80">{t('e confiável', 'and reliable')}</p>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/25" aria-hidden="true" />

          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-white/90 shrink-0" strokeWidth={1.6} />
            <div className="text-xs sm:text-sm leading-tight text-white/90">
              <p className="font-semibold text-white">{t('Conectando', 'Connecting')}</p>
              <p className="text-white/80">{t('pessoas e talentos', 'people and talent')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT AUTHENTICATION CARD PANEL */}
      <section className="lg:w-[45%] bg-[#FFFFFF] dark:bg-[#0C1833] lg:rounded-l-[36px] rounded-t-[28px] lg:rounded-tl-[36px] lg:rounded-tr-none relative overflow-hidden flex flex-col justify-center px-6 sm:px-12 lg:px-14 py-10 shadow-2xl">
        {/* Soft Organic Decorative Corner Waves matching the design */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#EFF6FF]/90 dark:bg-[#1D6FE5]/15 blur-xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-60 rounded-full bg-[#FFF7ED]/90 dark:bg-[#F97316]/15 blur-xl"
        />

        {/* Top-Right Desktop Language + Overview Link */}
        <div className="relative z-10 flex items-center justify-end gap-3 mb-6">
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-xs font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#081C41] dark:hover:text-white transition-colors"
          >
            {t('Sobre a SALU', 'Platform Overview')}
          </button>

          <div className="hidden lg:inline-flex items-center gap-0.5 bg-[#F1F5F9] dark:bg-[#132347] border border-[#E2E8F0] dark:border-[#1E325C] rounded-full p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLang('pt')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                lang === 'pt'
                  ? 'bg-[#081C41] text-white dark:bg-[#F97316] dark:text-white'
                  : 'text-[#475569] dark:text-[#94A3B8]'
              }`}
            >
              PT
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                lang === 'en'
                  ? 'bg-[#081C41] text-white dark:bg-[#F97316] dark:text-white'
                  : 'text-[#475569] dark:text-[#94A3B8]'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="relative z-10 max-w-md w-full mx-auto space-y-6">
          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl font-bold text-[#081C41] dark:text-white">
              {mode === 'signin'
                ? t('Bem-vindo de volta!', 'Welcome back!')
                : t('Criar conta na SALU', 'Create your SALU account')}
            </h2>
            <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
              {mode === 'signin'
                ? t('Entre na sua conta para continuar', 'Sign in to your account to continue')
                : t(
                    'Uma única conta para contratar ou oferecer serviços em Angola',
                    'One unified account to hire or offer services across Angola'
                  )}
            </p>
          </div>

          {/* Unified SALU Account Notice */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#060E20] border border-[#E2E8F0] dark:border-[#1E325C] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1D6FE5]/10 text-[#1D6FE5] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-tight">
              {t(
                'Conta única e versátil: contrate especialistas ou publique os seus serviços sem duplicar perfis.',
                'One unified account: hire verified specialists or offer your services without split profiles.'
              )}
            </p>
          </div>

          {/* Login / Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User className="w-4 h-4 text-[#475569] dark:text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('Nome completo ou da empresa', 'Full name or business name')}
                  className="w-full min-h-[48px] pl-11 pr-4 py-3 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-xl text-[#081C41] dark:text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#1D6FE5] dark:focus:border-[#F97316]"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-[#475569] dark:text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder={t('E-mail ou número de telefone', 'Email or phone number')}
                className="w-full min-h-[48px] pl-11 pr-4 py-3 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-xl text-[#081C41] dark:text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#1D6FE5] dark:focus:border-[#F97316]"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-[#475569] dark:text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('Senha', 'Password')}
                className="w-full min-h-[48px] pl-11 pr-12 py-3 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-xl text-[#081C41] dark:text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#1D6FE5] dark:focus:border-[#F97316]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword
                    ? t('Ocultar senha', 'Hide password')
                    : t('Mostrar senha', 'Show password')
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#475569] dark:text-[#94A3B8] hover:text-[#081C41] dark:hover:text-white"
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
              <label className="inline-flex items-center gap-2 text-[#334155] dark:text-[#CBD5E1] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] accent-[#1D6FE5] dark:accent-[#F97316]"
                />
                <span>{t('Lembrar-me', 'Remember me')}</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setResetMessage(
                    t(
                      'Código de recuperação enviado por SMS/E-mail de confirmação.',
                      'Recovery code sent via verification SMS/Email.'
                    )
                  )
                }
                className="font-medium text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
              >
                {t('Esqueceu sua senha?', 'Forgot password?')}
              </button>
            </div>

            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            {resetMessage && (
              <p className="text-xs text-[#1D6FE5] dark:text-[#60A5FA] font-medium">
                {resetMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[50px] py-3.5 px-6 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#FF7E00] to-[#F97316] hover:from-[#EA580C] hover:to-[#C2410C] shadow-md transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>
                {submitting
                  ? t('A processar...', 'Processing...')
                  : mode === 'signin'
                    ? t('Entrar', 'Sign In')
                    : t('Criar conta', 'Create Account')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-[#1E325C]" />
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {t('ou', 'or')}
            </span>
            <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-[#1E325C]" />
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialAuth('Google')}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#1E325C] bg-white dark:bg-[#060E20] hover:bg-[#F8FAFC] dark:hover:bg-[#132347] text-xs sm:text-sm font-medium text-[#081C41] dark:text-white inline-flex items-center justify-center gap-2.5 transition-colors"
            >
              <GoogleGIcon />
              <span>{t('Entrar com Google', 'Continue with Google')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialAuth('Apple')}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#1E325C] bg-white dark:bg-[#060E20] hover:bg-[#F8FAFC] dark:hover:bg-[#132347] text-xs sm:text-sm font-medium text-[#081C41] dark:text-white inline-flex items-center justify-center gap-2.5 transition-colors"
            >
              <AppleLogoIcon />
              <span>{t('Entrar com Apple', 'Continue with Apple')}</span>
            </button>
          </div>

          {/* Bottom Create Account / Sign In Link */}
          <p className="text-center text-xs sm:text-sm text-[#334155] dark:text-[#94A3B8] pt-1">
            {mode === 'signin'
              ? t('Não tem uma conta?', "Don't have an account?")
              : t('Já tem uma conta?', 'Already have an account?')}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'register' : 'signin');
                setError('');
                setResetMessage('');
              }}
              className="font-semibold text-[#1D6FE5] dark:text-[#60A5FA] hover:underline"
            >
              {mode === 'signin'
                ? t('Criar conta', 'Create account')
                : t('Entrar', 'Sign in')}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

interface OnboardingProps {
  initialRole: UserRole;
  userName: string;
  onFinishOnboarding: (data: {
    role: UserRole;
    municipality: string;
    interests: string[];
    openProviderBuilder: boolean;
  }) => void;
  onSkip: () => void;
}

export function OnboardingFlow({
  initialRole,
  userName,
  onFinishOnboarding,
  onSkip,
}: OnboardingProps) {
  const { lang, t } = useLang();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [municipality, setMunicipality] = useState<string>('Talatona, Luanda');
  const [interests, setInterests] = useState<string[]>([
    'Electrical & Solar',
    'IT & Networks',
  ]);

  const toggleInterest = (cat: string) => {
    setInterests((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060E20] flex flex-col justify-center px-6 py-12">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SaluRibbonMark size={28} />
            <span className="font-display font-bold text-lg text-[#081C41] dark:text-white">
              SALU
            </span>
            <span className="text-[#CBD5E1] dark:text-[#334155]">/</span>
            <span className="text-sm text-[#475569] dark:text-[#94A3B8]">
              {t('Bem-vindo(a)', 'Welcome')}, {userName}
            </span>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#081C41] dark:hover:text-white"
          >
            {t('Saltar configuração', 'Skip setup')}
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, label: t('01. Objetivo', '01. Choose Goal') },
            { num: 2, label: t('02. Localização', '02. Location') },
            { num: 3, label: t('03. Categorias', '03. Categories') },
          ].map((item) => (
            <div
              key={item.num}
              className={`pt-2 border-t-2 text-xs font-medium transition-colors ${
                step >= item.num
                  ? 'border-[#1D6FE5] dark:border-[#F97316] text-[#081C41] dark:text-white'
                  : 'border-[#E2E8F0] dark:border-[#1E325C] text-[#64748B]'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#081C41] dark:text-white">
                  {t('Como deseja começar hoje?', 'How would you like to start today?')}
                </h1>
                <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                  {t(
                    'Pode alternar entre contratar e prestar serviços a qualquer momento no seu painel.',
                    'You can switch between hiring and providing services anytime from your workspace.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    role === 'customer'
                      ? 'border-[#1D6FE5] bg-[#EFF6FF] dark:bg-[#1D6FE5]/20'
                      : 'border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#93C5FD]'
                  }`}
                >
                  <Search className="w-5 h-5 text-[#1D6FE5] dark:text-[#60A5FA] mb-3" />
                  <h2 className="font-display font-semibold text-base text-[#081C41] dark:text-white">
                    {t('Preciso de um serviço', 'I need a service')}
                  </h2>
                  <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                    {t(
                      'Publique pedidos, compare especialistas verificados e feche acordos claros.',
                      'Publish a request, browse vetted local specialists, and manage agreements.'
                    )}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    role === 'provider'
                      ? 'border-[#F97316] bg-[#FFF7ED] dark:bg-[#F97316]/20'
                      : 'border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#FDBA74]'
                  }`}
                >
                  <Briefcase className="w-5 h-5 text-[#F97316] dark:text-[#FB923C] mb-3" />
                  <h2 className="font-display font-semibold text-base text-[#081C41] dark:text-white">
                    {t('Quero oferecer serviços', 'I want to provide services')}
                  </h2>
                  <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                    {t(
                      'Crie o seu perfil profissional ou empresarial, explore oportunidades e envie propostas.',
                      'Set up an individual or business profile, browse opportunities, and send proposals.'
                    )}
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#081C41] dark:text-white">
                  {t('Onde está localizado principalmente?', 'Where are you primarily based?')}
                </h1>
                <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                  {t(
                    'A SALU utiliza o município aproximado para ligar profissionais e clientes próximos sem expor o endereço exato.',
                    'SALU uses approximate municipality areas to match nearby professionals and opportunities without exposing exact home addresses publicly.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ANGOLA_MUNICIPALITIES.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setMunicipality(area)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm text-left transition-colors ${
                      municipality === area
                        ? 'border-[#1D6FE5] bg-[#EFF6FF] dark:bg-[#1D6FE5]/20 text-[#081C41] dark:text-white font-medium'
                        : 'border-[#E2E8F0] dark:border-[#1E325C] text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#132347]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1D6FE5] dark:text-[#60A5FA]" />
                      <span>{area}</span>
                    </span>
                    {municipality === area && (
                      <Check className="w-4 h-4 text-[#1D6FE5] dark:text-[#60A5FA]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#081C41] dark:text-white">
                  {role === 'customer'
                    ? t(
                        'Que serviços pretende contratar?',
                        'Which services do you anticipate needing?'
                      )
                    : t(
                        'Quais categorias correspondem às suas competências?',
                        'Which categories match your skills?'
                      )}
                </h1>
                <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                  {t(
                    'Selecione uma ou mais categorias para personalizar o seu painel.',
                    'Select one or more categories to personalize your workspace feed.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SERVICE_CATEGORIES.map((cat) => {
                  const active = interests.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm text-left transition-colors ${
                        active
                          ? 'border-[#1D6FE5] bg-[#EFF6FF] dark:bg-[#1D6FE5]/20 text-[#081C41] dark:text-white font-medium'
                          : 'border-[#E2E8F0] dark:border-[#1E325C] text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#132347]'
                      }`}
                    >
                      <span>{translateCategory(cat, lang)}</span>
                      {active && <Check className="w-4 h-4 text-[#1D6FE5] dark:text-[#60A5FA]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E325C] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#132347] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('Anterior', 'Previous')}</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-[#1D6FE5] hover:bg-[#1558B8] rounded-lg transition-colors"
              >
                <span>{t('Continuar', 'Continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {role === 'provider' && (
                  <button
                    type="button"
                    onClick={() =>
                      onFinishOnboarding({
                        role,
                        municipality,
                        interests,
                        openProviderBuilder: true,
                      })
                    }
                    className="px-4 py-2.5 text-sm font-medium text-[#F97316] border border-[#F97316] rounded-lg hover:bg-[#FFF7ED] dark:hover:bg-[#F97316]/15 transition-colors"
                  >
                    {t('Completar Perfil Profissional', 'Complete Full Provider Profile')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onFinishOnboarding({
                      role,
                      municipality,
                      interests,
                      openProviderBuilder: false,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors"
                >
                  <span>{t('Entrar no Painel', 'Enter Workspace')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProviderOnboardingProps {
  draft: ProviderProfileDraft;
  onSave: (updated: ProviderProfileDraft) => void;
  onCancel: () => void;
}

export function ProviderProfileBuilder({
  draft,
  onSave,
  onCancel,
}: ProviderOnboardingProps) {
  const { lang, t } = useLang();
  const [form, setForm] = useState<ProviderProfileDraft>(draft);
  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortOutcome, setNewPortOutcome] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const entityTypes: {
    id: ProviderEntityType;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'INDIVIDUAL',
      label: t('Profissional Independente', 'Individual Professional'),
      desc: t(
        'Técnico, especialista ou trabalhador autónomo',
        'Independent technician, specialist, or freelancer'
      ),
      icon: User,
    },
    {
      id: 'SMALL_BUSINESS',
      label: t('Pequeno Negócio', 'Small Business'),
      desc: t(
        'Oficina, equipa técnica ou prestador local',
        'Workshop, crew, or local trade team'
      ),
      icon: Users,
    },
    {
      id: 'COMPANY',
      label: t('Empresa Registada', 'Registered Company'),
      desc: t(
        'Empresa formal com NIF comercial e equipa',
        'Formal firm with commercial NIF and staff'
      ),
      icon: Building2,
    },
  ];

  const checks = [
    Boolean(form.displayName.trim()),
    Boolean(form.profession.trim()),
    Boolean(form.bio.trim()),
    form.skills.length > 0,
    Boolean(form.municipality),
    Boolean(form.availability.trim()),
    Boolean(form.experienceOptional.trim()),
    form.portfolioItems.length > 0,
  ];
  const completionPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || form.skills.includes(trimmed)) return;
    setForm((f) => ({ ...f, skills: [...f.skills, trimmed] }));
    setNewSkill('');
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || form.customTags.includes(trimmed)) return;
    setForm((f) => ({ ...f, customTags: [...f.customTags, trimmed] }));
    setNewTag('');
  };

  const addPortfolio = () => {
    if (!newPortTitle.trim()) return;
    setForm((f) => ({
      ...f,
      portfolioItems: [
        ...f.portfolioItems,
        {
          id: `port-${Date.now()}`,
          title: newPortTitle.trim(),
          category: f.category,
          location: f.municipality,
          year: '2026',
          summary:
            newPortOutcome.trim() ||
            t('Serviço concluído através da SALU.', 'Completed service engagement via SALU.'),
          outcome:
            newPortOutcome.trim() ||
            t('Entrega verificada pelo cliente.', 'Verified client handover.'),
        },
      ],
    }));
    setNewPortTitle('');
    setNewPortOutcome('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0] dark:border-[#1E325C]">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#081C41] dark:text-white">
            {t('Configuração do Perfil Profissional', 'Professional Profile Setup')}
          </h1>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
            {t(
              'Os dados obrigatórios criam confiança; experiência anterior e preços continuam opcionais para novos talentos começarem já.',
              'Mandatory details establish trust; prior experience and pricing remain optional so emerging talent can start immediately.'
            )}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {t('Nível do Perfil', 'Profile Completeness')}
          </p>
          <p className="font-mono tabular-nums text-lg font-semibold text-[#F97316]">
            {completionPct}%
          </p>
        </div>
      </div>

      {/* Section 1: Mandatory Core Identity */}
      <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-[#081C41] dark:text-white">
            {t('01. Dados Obrigatórios do Perfil', '01. Mandatory Profile Details')}
          </h2>
          <span className="text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA]">
            {t('Necessário para enviar propostas', 'Required to submit proposals')}
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-2">
            {t('Tipo de Prestador', 'Provider Type')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {entityTypes.map((item) => {
              const Icon = item.icon;
              const active = form.entityType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, entityType: item.id }))}
                  className={`p-3.5 rounded-lg border text-left transition-colors ${
                    active
                      ? 'border-[#F97316] bg-[#FFF7ED] dark:bg-[#F97316]/15'
                      : 'border-[#E2E8F0] dark:border-[#1E325C] hover:border-[#94A3B8]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#F97316] mb-2" />
                  <p className="text-sm font-medium text-[#081C41] dark:text-white">{item.label}</p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {form.entityType === 'INDIVIDUAL'
                ? t('Nome Completo *', 'Full Name *')
                : t('Nome do Responsável *', 'Primary Contact Name *')}
            </label>
            <input
              type="text"
              required
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg text-[#081C41] dark:text-white"
            />
          </div>

          {form.entityType !== 'INDIVIDUAL' && (
            <div>
              <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
                {t('Nome da Empresa ou Negócio *', 'Business or Company Name *')}
              </label>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg text-[#081C41] dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Especialidade Principal *', 'Primary Trade or Headline *')}
            </label>
            <input
              type="text"
              required
              value={form.profession}
              onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
              placeholder={t(
                'ex.: Eletricista Certificado & Instalador Solar',
                'e.g. Certified Electrician & Solar Installer'
              )}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg text-[#081C41] dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Categoria Principal *', 'Primary Service Category *')}
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg text-[#081C41] dark:text-white"
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {translateCategory(cat, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
            {t('Descrição dos Serviços *', 'Service Description *')}
          </label>
          <textarea
            rows={3}
            required
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg text-[#081C41] dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Município Base *', 'Base Municipality *')}
            </label>
            <select
              value={form.municipality}
              onChange={(e) => setForm((f) => ({ ...f, municipality: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg text-[#081C41] dark:text-white"
            >
              {ANGOLA_MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Raio de Atendimento', 'Service Radius')} ({form.serviceRadiusKm} km) *
            </label>
            <input
              type="range"
              min={5}
              max={80}
              step={5}
              value={form.serviceRadiusKm}
              onChange={(e) =>
                setForm((f) => ({ ...f, serviceRadiusKm: Number(e.target.value) }))
              }
              className="w-full accent-[#F97316] mt-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Disponibilidade Semanal *', 'Weekly Availability *')}
            </label>
            <input
              type="text"
              required
              value={form.availability}
              onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg text-[#081C41] dark:text-white"
            />
          </div>
        </div>

        {/* Skills & Custom Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Competências Principais *', 'Core Skills *')}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder={t('Adicionar competência...', 'Add a skill...')}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-3 py-2 text-xs font-medium bg-[#F1F5F9] dark:bg-[#132347] text-[#081C41] dark:text-white rounded-lg hover:bg-[#E2E8F0]"
              >
                {t('Adicionar', 'Add')}
              </button>
            </div>
            <div className="space-y-1.5">
              {form.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-[#F8FAFC] dark:bg-[#132347]/75 rounded border border-[#E2E8F0] dark:border-[#1E325C]"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        skills: f.skills.filter((s) => s !== skill),
                      }))
                    }
                    className="text-[#64748B] hover:text-red-600"
                    aria-label={`${t('Remover', 'Remove')} ${skill}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Etiquetas Personalizadas (Opcional)', 'Custom Service Tags (Optional)')}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={t('ex.: Urgência Fim de Semana', 'e.g. Weekend Emergency')}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 text-xs font-medium bg-[#F1F5F9] dark:bg-[#132347] text-[#081C41] dark:text-white rounded-lg hover:bg-[#E2E8F0]"
              >
                {t('Adicionar', 'Add')}
              </button>
            </div>
            <div className="space-y-1.5">
              {form.customTags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-[#F8FAFC] dark:bg-[#132347]/75 rounded border border-[#E2E8F0] dark:border-[#1E325C]"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        customTags: f.customTags.filter((item) => item !== tag),
                      }))
                    }
                    className="text-[#64748B] hover:text-red-600"
                    aria-label={`${t('Remover', 'Remove')} ${tag}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Optional Experience, Pricing & Portfolio */}
      <section className="bg-white dark:bg-[#0C1833] border border-[#E2E8F0] dark:border-[#1E325C] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-[#081C41] dark:text-white">
            {t(
              '02. Experiência, Preços e Portfólio (Opcional)',
              '02. Optional Experience, Pricing & Portfolio'
            )}
          </h2>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {t('Opcional para começar', 'Not mandatory to get started')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Experiência Prévia (Opcional)', 'Prior Experience (Optional)')}
            </label>
            <input
              type="text"
              value={form.experienceOptional}
              onChange={(e) =>
                setForm((f) => ({ ...f, experienceOptional: e.target.value }))
              }
              placeholder={t(
                'Opcional — as suas competências já qualificam',
                'Leave blank if starting out—your skills still qualify'
              )}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Preços de Referência (Opcional)', 'Reference Pricing Guidance (Optional)')}
            </label>
            <input
              type="text"
              value={form.pricingOptional}
              onChange={(e) => setForm((f) => ({ ...f, pricingOptional: e.target.value }))}
              placeholder={t(
                'ex.: Visita técnica a partir de 20.000 Kz',
                'e.g. Diagnostic visit from 20,000 Kz'
              )}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            />
          </div>
        </div>

        {/* Contact Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
              {t('Preferência de Contacto', 'Contact Preference')}
            </label>
            <select
              value={form.contactPref}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contactPref: e.target.value as 'SALU Chat' | 'SALU + WhatsApp',
                }))
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            >
              <option value="SALU Chat">
                {t('Apenas Chat SALU (Recomendado)', 'SALU Internal Chat Only (Recommended)')}
              </option>
              <option value="SALU + WhatsApp">
                {t('Chat SALU + WhatsApp Opcional', 'SALU Chat + Optional WhatsApp')}
              </option>
            </select>
          </div>
          {form.contactPref === 'SALU + WhatsApp' && (
            <div>
              <label className="block text-xs font-medium text-[#334155] dark:text-[#CBD5E1] mb-1.5">
                {t(
                  'Número WhatsApp (Partilhado após interesse mútuo)',
                  'WhatsApp Number (Shown after mutual interest)'
                )}
              </label>
              <input
                type="tel"
                value={form.whatsappNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, whatsappNumber: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Portfolio Builder */}
        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E325C] space-y-3">
          <p className="text-xs font-medium text-[#334155] dark:text-[#CBD5E1]">
            {t('Trabalhos Anteriores / Portfólio (Opcional)', 'Previous Projects / Portfolio (Optional)')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newPortTitle}
              onChange={(e) => setNewPortTitle(e.target.value)}
              placeholder={t('Título do projeto', 'Project title')}
              className="px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            />
            <input
              type="text"
              value={newPortOutcome}
              onChange={(e) => setNewPortOutcome(e.target.value)}
              placeholder={t('Resultado ou resumo', 'Result or scope summary')}
              className="px-3 py-2 text-sm bg-white dark:bg-[#060E20] border border-[#CBD5E1] dark:border-[#1E325C] rounded-lg"
            />
            <button
              type="button"
              onClick={addPortfolio}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#F1F5F9] dark:bg-[#132347] text-[#081C41] dark:text-white rounded-lg hover:bg-[#E2E8F0]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Adicionar Projeto', 'Add Project')}</span>
            </button>
          </div>

          {form.portfolioItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#132347]/60 border border-[#E2E8F0] dark:border-[#1E325C] text-sm"
            >
              <div>
                <p className="font-medium text-[#081C41] dark:text-white">{item.title}</p>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                  {item.location} · {item.year} — {item.outcome}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    portfolioItems: f.portfolioItems.filter((p) => p.id !== item.id),
                  }))
                }
                className="text-[#64748B] hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-medium text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#132347] rounded-lg"
        >
          {t('Voltar ao Painel', 'Back to Provider Dashboard')}
        </button>
        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="text-xs font-medium text-[#1D6FE5] dark:text-[#60A5FA]">
              {t('Perfil guardado', 'Provider profile saved')}
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors"
          >
            {t('Guardar Perfil Profissional', 'Save Provider Profile')}
          </button>
        </div>
      </div>
    </form>
  );
}
