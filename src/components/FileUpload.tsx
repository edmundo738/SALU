import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Paperclip, Trash2 } from 'lucide-react';
import type { FileRecord } from '../../shared/types';
import { api, ApiError } from '../lib/api';
import { useToast } from '../app/ToastProvider';
import { useI18n } from '../i18n';
import { FileImage } from './FileImage';

const IMAGES = 'image/jpeg,image/png,image/webp';
const ACCEPT = `${IMAGES},application/pdf`;
const MAX = 6 * 1024 * 1024;

type TFn = ReturnType<typeof useI18n>['t'];
function validate(file: File, t: TFn, purpose: string): string | null {
  if (file.size > MAX) return t('validation.fileSize');
  if (!ACCEPT.split(',').includes(file.type)) return t('validation.fileType');
  if (file.type === 'application/pdf' && !['message', 'completion', 'report'].includes(purpose)) {
    return t('validation.fileType');
  }
  return null;
}

export function FileUpload({
  purpose,
  label,
  onUploaded,
  accept,
  compact = false,
  onBusyChange,
}: {
  purpose: 'avatar' | 'portfolio' | 'request' | 'message' | 'completion' | 'report';
  label: string;
  onUploaded: (file: FileRecord) => void;
  accept?: string;
  compact?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { t } = useI18n();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    const problem = validate(file, t, purpose);
    if (problem) {
      setError(problem);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError(null);
    setBusy(true);
    onBusyChange?.(true);
    try {
      const result = await api.upload(file, purpose);
      onUploaded(result.file);
      toast.success(t('common.success'));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('common.networkError');
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
      onBusyChange?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept ?? (purpose === 'avatar' || purpose === 'portfolio' || purpose === 'request' ? IMAGES : ACCEPT)}
        className="sr-only"
        onChange={(event) => void handle(event.target.files?.[0])}
        aria-label={label}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] font-semibold hover:border-[#1D6FE5] hover:bg-[#EFF6FF] disabled:opacity-60 dark:border-[#1E325C] dark:bg-[#0C1833] dark:text-[#CBD5E1] dark:hover:border-[#F97316] dark:hover:bg-[#132347] ${
          compact ? 'min-h-11 px-3 py-2 text-xs' : 'w-full min-h-28 px-4 py-5 text-sm'
        }`}
      >
        {busy ? (
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        ) : compact ? (
          <Paperclip className="w-4 h-4" aria-hidden="true" />
        ) : (
          <ImagePlus className="w-6 h-6" aria-hidden="true" />
        )}
        <span>{busy ? t('common.uploading') : label}</span>
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FilePreview({ file, onRemove }: { file: FileRecord; onRemove?: () => void }) {
  const { t } = useI18n();
  const isImage = file.mime.startsWith('image/');
  return (
    <div className="relative rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] dark:border-[#1E325C] dark:bg-[#132347]">
      {isImage ? (
        <FileImage
          file={file}
          className="w-full h-32 object-cover"
          fallback={<p className="p-3 text-sm text-[#64748B]">{t('common.imageUnavailable')}</p>}
        />
      ) : (
        <div className="h-32 flex flex-col items-center justify-center gap-2 p-3 text-center">
          <Paperclip className="w-6 h-6 text-[#64748B]" aria-hidden="true" />
          <span className="text-xs text-[#475569] dark:text-[#94A3B8] break-all">{file.name}</span>
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1.5 right-1.5 min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg bg-slate-950/75 text-white hover:bg-red-700"
          aria-label={t('common.remove')}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function MultiFileUpload({
  purpose,
  files,
  onChange,
  max = 6,
  label,
  onBusyChange,
}: {
  purpose: 'request' | 'completion';
  files: FileRecord[];
  onChange: (files: FileRecord[]) => void;
  max?: number;
  label: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((file) => (
            <FilePreview key={file.id} file={file} onRemove={() => onChange(files.filter((f) => f.id !== file.id))} />
          ))}
        </div>
      )}
      {files.length < max && (
        <FileUpload
          purpose={purpose}
          label={label}
          onBusyChange={onBusyChange}
          onUploaded={(file) => onChange([...files, file])}
          accept="image/jpeg,image/png,image/webp"
        />
      )}
      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
        {files.length}/{max} ficheiros · JPG, PNG ou WebP até 6 MB
      </p>
    </div>
  );
}
