import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { FileRecord } from '../../shared/types';
import { CATEGORIES, categoryLabel } from '../../shared/categories';
import { locationLabel } from '../../shared/geo';
import { useAuth } from '../app/AuthProvider';
import { useI18n } from '../i18n';
import { api } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { Alert, Button, Card, Field, Input, PageHeader, Select, Steps, Textarea } from '../components/ui/Base';
import { LocationPicker, type LocationValue } from '../components/LocationPicker';
import { FilePreview, MultiFileUpload } from '../components/FileUpload';
import { useToast } from '../app/ToastProvider';

export function CreateRequestPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<FileRecord[]>([]);
  const [location, setLocation] = useState<LocationValue>({
    provinceId: user?.provinceId || '',
    municipalityId: user?.municipalityId || '',
    communeId: user?.communeId || '',
  });
  const [budgetType, setBudgetType] = useState<'FIXED' | 'INSPECTION_NEEDED'>('INSPECTION_NEEDED');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [urgency, setUrgency] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const steps = [t('request.step1'), t('request.step2'), t('request.step3'), t('request.step4')];

  function validateStep(index: number): boolean {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (title.trim().length < 6) next.title = t('validation.minTitle');
      if (!categoryId) next.categoryId = lang === 'pt' ? 'Escolhe uma categoria.' : 'Choose a category.';
      if (description.trim().length < 20) next.description = t('validation.minDescription');
    }
    if (index === 2) {
      if (!location.provinceId || !location.municipalityId || !location.communeId)
        next.location = t('validation.location');
      if (budgetType === 'FIXED' && (!budgetAmount || Number(budgetAmount) <= 0))
        next.budgetAmount = t('validation.amount');
    }
    setFields(next);
    return !Object.keys(next).length;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (uploadingPhotos) return;
    if (step < steps.length - 1) {
      next();
      return;
    }
    if (!validateStep(0)) {
      setStep(0);
      return;
    }
    if (!validateStep(2)) {
      setStep(2);
      return;
    }
    setBusy(true);
    try {
      const result = await api.createRequest({
        title: title.trim(),
        categoryId,
        description: description.trim(),
        provinceId: location.provinceId,
        municipalityId: location.municipalityId,
        communeId: location.communeId,
        budgetType,
        budgetAmount: budgetType === 'FIXED' ? Number(budgetAmount) : 0,
        urgency,
        photoIds: photos.map((file) => file.id),
      });
      toast.success(t('request.published'));
      navigate(`/pedidos/${result.request.id}`, { replace: true });
    } catch (err) {
      setError(friendlyError(err, lang, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow={t('mode.customer')} title={t('request.newTitle')} subtitle={t('request.newSubtitle')} />
      <Steps steps={steps} current={step} />

      {error && (
        <div className="mb-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <Card className="p-5 sm:p-6">
        <form onSubmit={submit}>
          {step === 0 && (
            <div className="space-y-5">
              <Field label={t('request.title')} htmlFor="title" required error={fields.title}>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('request.titlePlaceholder')}
                  maxLength={140}
                />
              </Field>
              <Field label={t('request.category')} htmlFor="category" required error={fields.categoryId}>
                <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">{t('common.choose')}</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {lang === 'pt' ? category.pt : category.en}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label={t('request.description')}
                htmlFor="description"
                required
                error={fields.description}
                hint={
                  lang === 'pt'
                    ? 'Sê específico. Não precisas de escrever como um técnico.'
                    : 'Be specific. You do not need to write like a technician.'
                }
              >
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('request.descriptionPlaceholder')}
                  maxLength={3000}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('request.photos')}</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">{t('request.photosHint')}</p>
              </div>
              <MultiFileUpload
                purpose="request"
                files={photos}
                onChange={setPhotos}
                max={6}
                label={t('request.photos')}
                onBusyChange={setUploadingPhotos}
              />
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {lang === 'pt'
                  ? 'As fotografias são públicas: qualquer pessoa com o endereço da imagem pode vê-las. Não incluas dados privados.'
                  : 'Photos are public: anyone with the image address can view them. Do not include private information.'}
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('request.location')}</h2>
                <div className="mt-3">
                  <LocationPicker value={location} onChange={setLocation} />
                </div>
                {fields.location && (
                  <p className="mt-2 text-xs font-medium text-red-700 dark:text-red-300" role="alert">
                    {fields.location}
                  </p>
                )}
              </div>
              <fieldset>
                <legend className="text-sm font-bold text-[#0F172A] dark:text-white">{t('request.budgetType')}</legend>
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  {[
                    { id: 'INSPECTION_NEEDED' as const, label: t('request.budgetInspection') },
                    { id: 'FIXED' as const, label: t('request.budgetFixed') },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setBudgetType(option.id)}
                      className={`min-h-11 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold ${budgetType === option.id ? 'border-[#1D6FE5] bg-[#EFF6FF] text-[#1558B8] dark:border-[#F97316] dark:bg-[#132347] dark:text-[#FDBA74]' : 'border-[#CBD5E1] bg-white text-[#334155] dark:border-[#1E325C] dark:bg-[#0C1833] dark:text-[#CBD5E1]'}`}
                      aria-pressed={budgetType === option.id}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              {budgetType === 'FIXED' && (
                <Field label={t('request.budgetAmount')} htmlFor="budget" required error={fields.budgetAmount}>
                  <Input
                    id="budget"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1000}
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="Ex.: 35000"
                  />
                </Field>
              )}
              <Field label={t('request.urgency')}>
                <Select value={urgency} onChange={(e) => setUrgency(e.target.value as 'NORMAL' | 'URGENT')}>
                  <option value="NORMAL">{t('request.normal')}</option>
                  <option value="URGENT">{t('request.urgent')}</option>
                </Select>
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">{t('request.review')}</h2>
              <dl className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm dark:border-[#1E325C] dark:bg-[#132347]">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                    {t('request.title')}
                  </dt>
                  <dd className="mt-0.5 font-semibold text-[#0F172A] dark:text-white">{title}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                    {t('request.category')}
                  </dt>
                  <dd className="mt-0.5 text-[#0F172A] dark:text-white">{categoryLabel(categoryId, lang)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                    {t('request.location')}
                  </dt>
                  <dd className="mt-0.5 text-[#0F172A] dark:text-white">
                    {locationLabel(location.provinceId, location.municipalityId, location.communeId)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                    {t('request.budget')}
                  </dt>
                  <dd className="mt-0.5 text-[#0F172A] dark:text-white">
                    {budgetType === 'FIXED'
                      ? `Kz ${Number(budgetAmount).toLocaleString('pt-AO')}`
                      : t('request.inspection')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">
                    {t('request.photos')}
                  </dt>
                  <dd className="mt-0.5 text-[#0F172A] dark:text-white">{photos.length}</dd>
                </div>
              </dl>
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((file) => (
                    <FilePreview key={file.id} file={file} />
                  ))}
                </div>
              )}
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{t('request.photosHint')}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={uploadingPhotos}
              onClick={() => (step === 0 ? navigate(-1) : setStep((s) => s - 1))}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t('common.back')}
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={next} disabled={uploadingPhotos}>
                {t('common.next')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button type="submit" loading={busy} disabled={uploadingPhotos}>
                <Check className="w-4 h-4" aria-hidden="true" /> {busy ? t('request.publishing') : t('request.publish')}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
