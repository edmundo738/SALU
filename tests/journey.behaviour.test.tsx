// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../src/i18n';
import { ToastProvider } from '../src/app/ToastProvider';
import { AppLayout } from '../src/components/Layouts';
import { SaluLogo } from '../src/components/SaluLogo';
import { CinematicHero } from '../src/components/landing/Hero';
import { MyProfilePage } from '../src/pages/MyProfile';
import { RequestCard } from '../src/components/Cards';
import { DashboardPage } from '../src/pages/Dashboard';
import { OpportunitiesPage } from '../src/pages/Opportunities';
import { MyProposalsPage } from '../src/pages/MyProposals';
import { RequestDetailPage } from '../src/pages/RequestDetail';
import { api } from '../src/lib/api';
import type { RequestDetail } from '../shared/types';

const state = vi.hoisted(() => ({
  user: {
    id: 'usr_test',
    name: 'Edmundo Teste',
    contact: 'test@example.test',
    activeMode: 'provider',
    locale: 'pt',
    theme: 'light',
    provinceId: 'AO-LUA',
    municipalityId: 'AO-LUA-CAMAMA',
    communeId: 'AO-LUA-CAMAMA-CAMAMA',
    locationLabel: 'Camama, Luanda',
    avatar: {
      id: 'foto',
      name: 'foto.webp',
      url: '/api/files/foto',
      mime: 'image/webp',
      size: 10,
      visibility: 'public',
    },
    providerProfile: { published: true },
  },
}));
vi.mock('../src/app/AuthProvider', () => ({
  useAuth: () => ({
    user: state.user,
    loading: false,
    apiReachable: true,
    logout: vi.fn(),
    refresh: vi.fn(),
    stats: null,
    updateLocalUser: vi.fn(),
  }),
}));
let container: HTMLDivElement;
let root: Root;
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
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  state.user.activeMode = 'provider';
});
function shell(children: React.ReactNode) {
  return (
    <I18nProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/inicio']}>{children}</MemoryRouter>
      </ToastProvider>
    </I18nProvider>
  );
}
describe('percursos de utilizador', () => {
  it('o menu do prestador não oferece atalhos para pedidos próprios', async () => {
    await act(async () =>
      root.render(
        shell(
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/inicio" element={<p>Painel</p>} />
            </Route>
          </Routes>,
        ),
      ),
    );
    expect(container.querySelector('a[aria-label="SALU — Início"]')?.getAttribute('href')).toBe('/inicio');
    const profileButton = container.querySelector('button[aria-controls="menu-perfil"]') as HTMLButtonElement;
    await act(async () => profileButton.click());
    const menu = container.querySelector('#menu-perfil')!;
    expect(menu.querySelector('a[href="/meu-perfil"]')?.textContent).toContain('O meu perfil');
    expect(menu.querySelector('a[href="/publicar-pedido"]')).toBeNull();
    expect(menu.querySelector('a[href="/pedidos"]')).toBeNull();
    expect(container.querySelector('a[href="/oportunidades"]')).not.toBeNull();
    expect(container.querySelector('a[href="/propostas"]')).not.toBeNull();
  });
  it('a página de boas-vindas não pede registo a quem já entrou', async () => {
    await act(async () => root.render(shell(<CinematicHero />)));
    expect(container.querySelector('a[href="/inicio"]')).not.toBeNull();
    expect(container.querySelector('a[href="/publicar-pedido"]')).toBeNull();
    expect(container.querySelector('a[href="/oportunidades"]')).not.toBeNull();
    expect(container.querySelector('a[href="/criar-conta"]')).toBeNull();
    expect(container.querySelector('a[href="/entrar"]')).toBeNull();
  });
  it('o cliente mantém os atalhos para publicar e consultar pedidos', async () => {
    state.user.activeMode = 'customer';
    vi.spyOn(api, 'requests').mockResolvedValue({ requests: [] });
    vi.spyOn(api, 'conversations').mockResolvedValue({ conversations: [], unread: 0 });
    await act(async () =>
      root.render(
        shell(
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/inicio" element={<DashboardPage />} />
            </Route>
          </Routes>,
        ),
      ),
    );
    expect(container.querySelector('a[href="/pedidos"]')).not.toBeNull();
    expect(container.querySelector('a[href="/publicar-pedido"]')).not.toBeNull();
    expect(container.querySelector('a[href="/propostas"]')).toBeNull();
  });
  it('a conta tem um perfil próprio com fotografia e acesso ao perfil profissional', async () => {
    await act(async () => root.render(shell(<MyProfilePage />)));
    expect(container.textContent).toContain('Alterar fotografia');
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/media/foto');
    expect(container.querySelector('a[href="/prestadores/usr_test"]')?.textContent).toContain(
      'Ver perfil profissional',
    );
    expect(container.querySelector('a[href="/perfil-profissional"]')).not.toBeNull();
  });
  it('os cartões dos pedidos mostram a fotografia e a descrição', async () => {
    const request = {
      id: 'req_test',
      categoryId: 'electrical',
      title: 'Reparar tomadas',
      description: 'Preciso de reparar tomadas da casa',
      status: 'OPEN',
      locationLabel: 'Camama, Luanda',
      proposalCount: 0,
      createdAt: new Date().toISOString(),
      budgetType: 'INSPECTION_NEEDED',
      photos: [
        {
          id: 'pedido_foto',
          name: 'pedido.webp',
          url: '/api/files/pedido_foto',
          mime: 'image/webp',
          size: 10,
          visibility: 'public',
        },
      ],
    } as unknown as RequestDetail;
    await act(async () => root.render(shell(<RequestCard request={request} />)));
    expect(container.textContent).toContain('Preciso de reparar tomadas da casa');
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/media/pedido_foto');
    expect(container.querySelector('a[href="/pedidos/req_test"]')).not.toBeNull();
  });
  it('o painel separa pedidos próprios e propostas conforme o modo', async () => {
    const own = {
      id: 'own',
      customerId: 'usr_test',
      title: 'Pedido próprio',
      description: 'Descrição do pedido próprio',
      categoryId: 'electrical',
      status: 'OPEN',
      photos: [],
      proposalCount: 0,
      budgetType: 'INSPECTION_NEEDED',
      locationLabel: 'Camama',
      createdAt: new Date().toISOString(),
    } as unknown as RequestDetail;
    const other = {
      ...own,
      id: 'other',
      customerId: 'customer',
      title: 'Pedido do cliente',
      myProposal: { status: 'PENDING', conversationId: 'conv_1' },
    } as unknown as RequestDetail;
    const requests = vi.spyOn(api, 'requests').mockResolvedValue({ requests: [own, other] });
    vi.spyOn(api, 'conversations').mockResolvedValue({ conversations: [], unread: 0 });
    await act(async () => root.render(shell(<DashboardPage />)));
    expect(requests).toHaveBeenCalledWith({ scope: 'proposed' });
    expect(container.textContent).toContain('Pedido do cliente');
    expect(container.textContent).not.toContain('Pedido próprio');
    expect(container.querySelector('a[href="/publicar-pedido"]')).toBeNull();
    expect(container.querySelector('a[href="/mensagens/conv_1"]')).not.toBeNull();
    state.user.activeMode = 'customer';
    await act(async () => root.render(shell(<DashboardPage />)));
    expect(requests).toHaveBeenLastCalledWith({ scope: 'customer' });
    expect(container.textContent).toContain('Pedido próprio');
    expect(container.textContent).not.toContain('Pedido do cliente');
    expect(container.querySelector('a[href="/publicar-pedido"]')).not.toBeNull();
    expect(container.querySelector('a[href="/propostas"]')).toBeNull();
  });
  it('o vazio de oportunidades não sugere contratar outro prestador', async () => {
    vi.spyOn(api, 'requests').mockResolvedValue({ requests: [] });
    await act(async () => root.render(shell(<OpportunitiesPage />)));
    expect(container.querySelector('a[href="/explorar"]')).toBeNull();
    expect(container.textContent).toContain('filtros');
  });
  it('a lista de propostas dá acesso à conversa e ao acordo aceite', async () => {
    const request = {
      id: 'r',
      customerId: 'customer',
      title: 'Reparação',
      description: 'Reparação necessária',
      categoryId: 'electrical',
      status: 'ASSIGNED',
      photos: [],
      proposalCount: 1,
      budgetType: 'INSPECTION_NEEDED',
      locationLabel: 'Camama',
      createdAt: new Date().toISOString(),
      agreementId: 'agr_1',
      myProposal: { status: 'ACCEPTED', conversationId: 'conv_1' },
    } as unknown as RequestDetail;
    vi.spyOn(api, 'requests').mockResolvedValue({ requests: [request] });
    await act(async () => root.render(shell(<MyProposalsPage />)));
    expect(container.querySelector('a[href="/mensagens/conv_1"]')).not.toBeNull();
    expect(container.querySelector('a[href="/acordos/agr_1"]')).not.toBeNull();
  });
  it('o detalhe de um pedido aberto permite iniciar a proposta', async () => {
    const request = {
      id: 'r',
      customerId: 'customer',
      customerName: 'Cliente Teste',
      isOwner: false,
      title: 'Reparação',
      description: 'Reparação necessária em casa',
      categoryId: 'electrical',
      status: 'OPEN',
      photos: [],
      proposals: [],
      proposalCount: 0,
      budgetType: 'INSPECTION_NEEDED',
      locationLabel: 'Camama',
      createdAt: new Date().toISOString(),
      myProposal: null,
    } as unknown as RequestDetail;
    vi.spyOn(api, 'request').mockResolvedValue({ request });
    const send = vi
      .spyOn(api, 'propose')
      .mockResolvedValue({ proposal: { conversationId: 'conv_new' } as never, request });
    await act(async () =>
      root.render(
        shell(
          <Routes>
            <Route path="/inicio" element={<RequestDetailPage />} />
          </Routes>,
        ),
      ),
    );
    const button = [...container.querySelectorAll('button')].find((item) => item.textContent?.includes('proposta'));
    expect(button).toBeDefined();
    await act(async () => button?.click());
    expect(document.querySelector('[role="dialog"] form')).not.toBeNull();
    const form = document.querySelector('[role="dialog"] form') as HTMLFormElement;
    const inputs = form.querySelectorAll('input');
    const textarea = form.querySelector('textarea')!;
    const setValue = (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
      const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    };
    await act(async () => {
      setValue(inputs[0], '12000');
      setValue(inputs[1], '2');
      setValue(textarea, 'Posso fazer o trabalho amanhã.');
    });
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(send).toHaveBeenCalledWith('r', {
      amount: 12000,
      estimatedDays: 2,
      message: 'Posso fazer o trabalho amanhã.',
    });
    expect(container.querySelector('a[href="/mensagens/conv_new"]')).not.toBeNull();
  });
  it('o logo mantém a configuração inicial para uma conta ainda sem localização', async () => {
    const province = state.user.provinceId;
    state.user.provinceId = '';
    try {
      await act(async () => root.render(shell(<SaluLogo />)));
      expect(container.querySelector('a')?.getAttribute('href')).toBe('/bem-vindo');
    } finally {
      state.user.provinceId = province;
    }
  });
});
