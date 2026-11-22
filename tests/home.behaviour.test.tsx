// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../src/i18n';
import { ThemeProvider } from '../src/app/ThemeProvider';
import { ToastProvider } from '../src/app/ToastProvider';
import { AuthProvider } from '../src/app/AuthProvider';
import { HomePage } from '../src/pages/Home';
import { PublicLayout } from '../src/components/Layouts';
import { api, ApiError } from '../src/lib/api';
import type { SessionUser } from '../shared/types';

let container: HTMLDivElement;
let root: Root;
function session(mode: 'customer' | 'provider', complete = true): SessionUser {
  return {
    user: {
      id: 'usr_test',
      name: 'Conta Teste',
      contact: 'test@example.test',
      activeMode: mode,
      locale: 'pt',
      theme: 'light',
      provinceId: complete ? 'AO-LUA' : '',
      municipalityId: complete ? 'AO-LUA-CAMAMA' : '',
      communeId: complete ? 'AO-LUA-CAMAMA-CAMAMA' : '',
    },
    stats: null,
  } as unknown as SessionUser;
}
function app(path = '/') {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={[path]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/inicio" element={<p>Painel da conta</p>} />
                <Route path="/bem-vindo" element={<p>Configuração inicial</p>} />
                <Route path="/pedidos/123" element={<p>Pedido específico</p>} />
                <Route
                  path="/ajuda"
                  element={
                    <PublicLayout>
                      <p>Ajuda</p>
                    </PublicLayout>
                  }
                />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('abertura do SALU', () => {
  it.each(['customer', 'provider'] as const)('abre directamente o painel com sessão de %s', async (mode) => {
    vi.spyOn(api, 'me').mockResolvedValue(session(mode));
    await act(async () => root.render(app()));
    expect(container.textContent).toContain('Painel da conta');
    expect(container.textContent).not.toContain('Começa pelo que precisas');
  });
  it('espera pela sessão antes de mostrar a página pública', async () => {
    let finish!: (value: SessionUser) => void;
    vi.spyOn(api, 'me').mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    await act(async () => root.render(app()));
    expect(container.textContent).not.toContain('Começa pelo que precisas');
    expect(container.textContent).not.toContain('Painel da conta');
    await act(async () => finish(session('provider')));
    expect(container.textContent).toContain('Painel da conta');
  });
  it('mantém a configuração inicial para conta ainda incompleta', async () => {
    vi.spyOn(api, 'me').mockResolvedValue(session('customer', false));
    await act(async () => root.render(app()));
    expect(container.textContent).toContain('Configuração inicial');
  });
  it('mostra Entrar na página pública quando não existe sessão', async () => {
    vi.spyOn(api, 'me').mockRejectedValue(new ApiError('Não autenticado', 401));
    await act(async () => root.render(app()));
    expect(container.textContent).toContain('Começa pelo que precisas');
    const login = container.querySelector('header a[href="/entrar"]');
    expect(login?.textContent).toContain('Entrar');
  });
  it('permite tentar novamente quando não consegue confirmar a sessão', async () => {
    vi.spyOn(api, 'me')
      .mockRejectedValueOnce(new ApiError('NETWORK_ERROR', 0))
      .mockResolvedValueOnce(session('provider'));
    await act(async () => root.render(app()));
    expect(container.textContent).toContain('Não conseguimos falar com o servidor');
    expect(container.textContent).not.toContain('Começa pelo que precisas');
    const retry = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Tentar novamente'),
    );
    expect(retry).toBeDefined();
    await act(async () => retry?.click());
    expect(container.textContent).toContain('Painel da conta');
  });
  it('preserva o acesso directo a um pedido', async () => {
    vi.spyOn(api, 'me').mockResolvedValue(session('customer'));
    await act(async () => root.render(app('/pedidos/123')));
    expect(container.textContent).toContain('Pedido específico');
  });
  it('o botão no cabeçalho público diz Entrar e abre a conta se já houver sessão', async () => {
    vi.spyOn(api, 'me').mockResolvedValue(session('provider'));
    await act(async () => root.render(app('/ajuda')));
    const buttons = [...container.querySelectorAll('header a[href="/inicio"]')];
    expect(buttons.some((button) => button.textContent?.includes('Entrar'))).toBe(true);
  });
});
