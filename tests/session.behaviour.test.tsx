// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { I18nProvider } from '../src/i18n';
import { ThemeProvider } from '../src/app/ThemeProvider';
import { ToastProvider } from '../src/app/ToastProvider';
import { AuthProvider } from '../src/app/AuthProvider';
import { AppLayout } from '../src/components/Layouts';

it('quando a API está indisponível não diz que a sessão terminou', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('rede indisponível')));
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  try {
    await act(async () => {
      root.render(
        <I18nProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <MemoryRouter initialEntries={['/inicio']}>
                  <Routes>
                    <Route element={<AppLayout />}>
                      <Route path="/inicio" element={<p>Painel</p>} />
                    </Route>
                    <Route path="/entrar" element={<p>Página de login</p>} />
                  </Routes>
                </MemoryRouter>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </I18nProvider>,
      );
    });
    expect(container.textContent).toContain('Não conseguimos falar com o servidor');
    expect(container.textContent).toContain('Tentar novamente');
    expect(container.textContent).not.toContain('Página de login');
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  }
});
