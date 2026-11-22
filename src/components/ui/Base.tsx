import React, { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import type { FileRecord } from '../../../shared/types';
import { api } from '../../lib/api';
import { useI18n } from '../../i18n';
import { FileImage } from '../FileImage';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'navy';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#F97316] text-white hover:bg-[#EA580C] focus-visible:ring-[#F97316] shadow-sm disabled:bg-orange-300 dark:disabled:bg-orange-900',
  secondary:
    'bg-white text-[#0F172A] border border-[#CBD5E1] hover:bg-[#F1F5F9] focus-visible:ring-[#1D6FE5] dark:bg-[#0C1833] dark:text-[#F8FAFC] dark:border-[#1E325C] dark:hover:bg-[#132347]',
  ghost:
    'bg-transparent text-[#334155] hover:bg-[#F1F5F9] focus-visible:ring-[#1D6FE5] dark:text-[#CBD5E1] dark:hover:bg-[#132347]',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300 dark:disabled:bg-red-900',
  navy: 'bg-[#081C41] text-white hover:bg-[#0C2A5B] focus-visible:ring-[#1D6FE5] dark:bg-[#1D6FE5] dark:hover:bg-[#1558B8]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 py-1.5 text-xs gap-1.5',
  md: 'min-h-11 px-4 py-2.5 text-sm gap-2',
  lg: 'min-h-12 px-6 py-3 text-base gap-2',
};

export function buttonClassName(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className = '') {
  return `inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#060E20] disabled:cursor-not-allowed disabled:opacity-70 ${buttonClasses[variant]} ${sizeClasses[size]} ${className}`;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, size, className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

/** Link com a aparência de botão — evita <a><button>, que é HTML inválido. */
export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'to' | 'className' | 'children'>) {
  return (
    <Link to={to} className={buttonClassName(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  return (
    <Tag
      className={`rounded-2xl border border-[#E2E8F0] bg-white shadow-sm dark:border-[#1E325C] dark:bg-[#0C1833] ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
        {label}
        {required && (
          <span className="ml-1 text-[#C2410C] dark:text-[#FDBA74]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const fieldBase =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] border-[#CBD5E1] focus:border-[#1D6FE5] focus:outline-none focus:ring-2 focus:ring-[#1D6FE5]/25 dark:bg-[#0C1833] dark:text-[#F8FAFC] dark:border-[#1E325C] dark:focus:border-[#F97316] dark:focus:ring-[#F97316]/25 disabled:opacity-60';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...props },
  ref,
) {
  return <input ref={ref} className={`${fieldBase} min-h-11 ${className}`} {...props} />;
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...props }, ref) {
    return <textarea ref={ref} className={`${fieldBase} min-h-28 ${className}`} {...props} />;
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', ...props }, ref) {
    return <select ref={ref} className={`${fieldBase} min-h-11 ${className}`} {...props} />;
  },
);

type Tone = 'neutral' | 'blue' | 'orange' | 'green' | 'amber' | 'red';

const tones: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#132347] dark:text-slate-300 dark:border-[#1E325C]',
  blue: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800',
  orange:
    'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-200 dark:border-orange-800',
  green:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800',
  amber: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800',
  red: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Avatar({
  file,
  name,
  size = 'md',
  className = '',
}: {
  file?: FileRecord | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const [failedId, setFailedId] = React.useState<string | null>(null);
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-16 h-16 text-lg', xl: 'w-24 h-24 text-2xl' };
  if (file && file.id !== failedId) {
    return (
      <FileImage
        file={file}
        alt={name}
        onGiveUp={() => setFailedId(file.id)}
        className={`${sizes[size]} rounded-xl object-cover border border-[#E2E8F0] dark:border-[#1E325C] shrink-0 ${className}`}
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <div
      className={`${sizes[size]} rounded-xl bg-gradient-to-br from-[#1D6FE5] to-[#081C41] text-white flex items-center justify-center font-bold shrink-0 ${className}`}
      aria-label={name}
      role="img"
    >
      {initials || '?'}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div
      className="flex items-center justify-center gap-3 py-10 text-sm text-[#64748B] dark:text-[#94A3B8]"
      role="status"
    >
      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      <span>{label ?? t('common.loading')}</span>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-[#132347] ${className}`} aria-hidden="true" />;
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12 px-4">
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-[#132347] flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-[#1D6FE5] dark:text-[#93C5FD]" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{title}</h3>
      {body && <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Tentar novamente',
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/40"
      role="alert"
    >
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-900 dark:text-red-100">Não foi possível carregar.</p>
          <p className="mt-1 text-sm text-red-800 dark:text-red-200">{message}</p>
          {onRetry && (
            <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100',
    warning:
      'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
    danger: 'border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100',
  };
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'danger' ? AlertCircle : AlertCircle;
  return (
    <div className={`rounded-xl border p-4 text-sm ${styles[tone]}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <div className="flex gap-2.5">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          {title && <p className="font-bold">{title}</p>}
          <div className={title ? 'mt-1' : ''}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ModalComponent({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => ref.current?.focus(), 20);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !ref.current) return;
      const focusables = ref.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl dark:border-[#1E325C] dark:bg-[#0C1833] focus:outline-none`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#E2E8F0] bg-white/95 px-5 py-4 backdrop-blur dark:border-[#1E325C] dark:bg-[#0C1833]/95">
          <h2 id={titleId} className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#132347]"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="sticky bottom-0 border-t border-[#E2E8F0] bg-white px-5 py-3 dark:border-[#1E325C] dark:bg-[#0C1833]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-widest text-[#C2410C] dark:text-[#FDBA74]">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-[#64748B] dark:text-[#94A3B8] max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8]">{hint}</p>}
    </Card>
  );
}

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap gap-2 mb-6" aria-label="Progresso">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo';
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                state === 'done'
                  ? 'bg-emerald-600 text-white'
                  : state === 'current'
                    ? 'bg-[#F97316] text-white'
                    : 'bg-[#E2E8F0] text-[#64748B] dark:bg-[#132347] dark:text-[#94A3B8]'
              }`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {index + 1}
            </span>
            <span
              className={`text-xs font-medium ${state === 'todo' ? 'text-[#64748B] dark:text-[#94A3B8]' : 'text-[#0F172A] dark:text-[#F8FAFC]'}`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <span className="text-[#CBD5E1] dark:text-[#1E325C]" aria-hidden="true">
                /
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export { ModalComponent as Modal };
