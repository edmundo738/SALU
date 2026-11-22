import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';

declare const __SALU_BUILD_ID__: string;

/** A aplicação instalada é o site: não se força uma recarga enquanto alguém escreve. */
export function UpdateNotice() {
  const { lang } = useI18n();
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const dismissed = useRef<string | null>(null);

  useEffect(() => {
    const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!iosStandalone && !window.matchMedia('(display-mode: standalone)').matches) return;
    let active = true;
    async function check() {
      try {
        const response = await fetch('/version.json', { cache: 'no-store' });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return;
        const data: unknown = await response.json();
        if (
          active &&
          typeof data === 'object' &&
          data !== null &&
          'version' in data &&
          typeof data.version === 'string' &&
          data.version !== __SALU_BUILD_ID__ &&
          data.version !== dismissed.current
        ) {
          setNewVersion(data.version);
        }
      } catch {
        // Uma falha de rede não significa que existe uma actualização.
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    void check();
    const timer = window.setInterval(check, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!newVersion) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 inset-x-4 z-[90] mx-auto max-w-lg rounded-2xl bg-[#081C41] p-4 text-white shadow-xl"
    >
      <p className="text-sm font-bold">
        {lang === 'pt' ? 'Há uma nova versão do SALU.' : 'A new version of SALU is available.'}
      </p>
      <p className="mt-1 text-sm text-white/80">
        {lang === 'pt'
          ? 'Guarda o que estiveres a escrever antes de actualizar.'
          : 'Save any unfinished work before updating.'}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-11 rounded-xl bg-[#F97316] px-4 text-sm font-bold text-white"
        >
          {lang === 'pt' ? 'Actualizar agora' : 'Update now'}
        </button>
        <button
          type="button"
          onClick={() => {
            dismissed.current = newVersion;
            setNewVersion(null);
          }}
          className="min-h-11 rounded-xl px-4 text-sm font-semibold text-white underline"
        >
          {lang === 'pt' ? 'Mais tarde' : 'Later'}
        </button>
      </div>
    </div>
  );
}
