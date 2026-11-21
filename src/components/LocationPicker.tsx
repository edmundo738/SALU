import { useMemo } from 'react';
import { AVAILABLE_PROVINCES, getProvince } from '../../shared/geo';
import { Select, Field } from './ui/Base';
import { useI18n } from '../i18n';

export interface LocationValue {
  provinceId: string;
  municipalityId: string;
  communeId: string;
}

export function LocationPicker({
  value,
  onChange,
  disabled = false,
  required = true,
}: {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  const { lang, t } = useI18n();
  const province = useMemo(() => getProvince(value.provinceId), [value.provinceId]);
  const municipality = province?.municipalities.find((m) => m.id === value.municipalityId);
  const commune = municipality?.communes.find((c) => c.id === value.communeId);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label={t('geo.province')} required={required}>
        <Select
          value={value.provinceId}
          disabled={disabled}
          onChange={(event) => onChange({ provinceId: event.target.value, municipalityId: '', communeId: '' })}
          aria-label={t('geo.province')}
        >
          <option value="">{t('common.choose')}</option>
          {AVAILABLE_PROVINCES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t('geo.municipality')} required={required}>
        <Select
          value={value.municipalityId}
          disabled={disabled || !province}
          onChange={(event) => onChange({ ...value, municipalityId: event.target.value, communeId: '' })}
          aria-label={t('geo.municipality')}
        >
          <option value="">{province ? t('common.choose') : t('geo.chooseProvince')}</option>
          {province?.municipalities.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t('geo.commune')} required={required}>
        <Select
          value={value.communeId}
          disabled={disabled || !municipality}
          onChange={(event) => onChange({ ...value, communeId: event.target.value })}
          aria-label={t('geo.commune')}
        >
          <option value="">{municipality ? t('common.choose') : t('geo.chooseMunicipality')}</option>
          {municipality?.communes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      {commune && (
        <p className="sm:col-span-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
          {[commune.name, municipality?.name, province?.name].filter(Boolean).join(' · ')}
        </p>
      )}
      {!value.provinceId && (
        <p className="sm:col-span-3 text-xs text-[#64748B] dark:text-[#94A3B8]">{t('onboarding.locationHint')}</p>
      )}
    </div>
  );
}
