// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../src/i18n';
import { UpdateNotice } from '../src/app/UpdateNotice';
import { FileImage } from '../src/components/FileImage';
import type { FileRecord } from '../shared/types';

vi.mock('../src/lib/api', () => ({
  api: {
    fileUrl: (file: FileRecord) => `/media/${file.id}`,
    fileUrlDirect: (file: FileRecord) => `https://example.test/files/${file.id}`,
    fetchFileObjectUrl: vi.fn(() => Promise.reject(new Error('indisponível'))),
  },
}));

let container: HTMLDivElement;
let root: Root;
const file = (id: string): FileRecord => ({
  id,
  url: `/api/files/${id}`,
  name: 'foto.png',
  mime: 'image/png',
  size: 20,
  visibility: 'public',
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('__SALU_BUILD_ID__', 'versao-actual');
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('interface interactiva', () => {
  it('oferece actualização no modo instalado apenas quando existe nova versão', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ version: 'versao-nova' }), { headers: { 'content-type': 'application/json' } }),
        ),
    );
    await act(async () =>
      root.render(
        <I18nProvider>
          <UpdateNotice />
        </I18nProvider>,
      ),
    );
    expect(container.textContent).toContain('nova versão do SALU');
    expect(container.textContent).toContain('Guarda o que estiveres a escrever');
    expect(container.textContent).toContain('Actualizar agora');
  });

  it('não pede actualização quando a versão é igual', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ version: 'versao-actual' }), {
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    await act(async () =>
      root.render(
        <I18nProvider>
          <UpdateNotice />
        </I18nProvider>,
      ),
    );
    expect(container.textContent).not.toContain('Actualizar agora');
  });

  it('tenta a terceira via pública e reinicia as tentativas para outra foto', async () => {
    const giveUp = vi.fn();
    await act(async () => root.render(<FileImage file={file('a')} onGiveUp={giveUp} />));
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/media/a');
    await act(async () => container.querySelector('img')?.dispatchEvent(new Event('error')));
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://example.test/files/a');
    expect(giveUp).not.toHaveBeenCalled();
    await act(async () => container.querySelector('img')?.dispatchEvent(new Event('error')));
    expect(giveUp).toHaveBeenCalledTimes(1);
    await act(async () => root.render(<FileImage file={file('b')} onGiveUp={giveUp} />));
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/media/b');
  });
});
