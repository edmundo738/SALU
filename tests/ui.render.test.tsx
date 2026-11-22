// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToPipeableStream } from 'react-dom/server';
import { Writable } from 'node:stream';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../src/App';
import { I18nProvider } from '../src/i18n';
import { ThemeProvider } from '../src/app/ThemeProvider';
import { ToastProvider } from '../src/app/ToastProvider';
import { AuthProvider } from '../src/app/AuthProvider';

function render(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = '';
    const output = new Writable({
      write(chunk, _encoding, callback) {
        html += String(chunk);
        callback();
      },
    });
    const stream = renderToPipeableStream(
      <I18nProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <MemoryRouter initialEntries={[path]}>
                <App />
              </MemoryRouter>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </I18nProvider>,
      {
        onAllReady() {
          stream.pipe(output);
        },
        onError(error) {
          reject(error);
        },
      },
    );
    output.on('finish', () => resolve(html));
    output.on('error', reject);
  });
}

beforeAll(() => {
  const originalError = console.error.bind(console);
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (String(args[0]).includes('useLayoutEffect does nothing on the server')) return;
    originalError(...args);
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} },
    configurable: true,
  });
  Object.defineProperty(globalThis, 'window', {
    value: { matchMedia: () => ({ matches: false }), scrollTo: () => {} },
    configurable: true,
  });
  Object.defineProperty(globalThis, 'document', {
    value: { documentElement: { lang: 'pt', classList: { toggle: () => {} }, style: {} } },
    configurable: true,
  });
});

describe('interface renderiza sem erros', () => {
  it('mostra a landing page pública', async () => {
    const html = await render('/');
    expect(html).toContain('SALU');
    expect(html).toContain('Começa pelo que precisas');
  });

  it('landing: os três passos aparecem todos e legíveis', async () => {
    const html = await render('/');
    // Regressão: a antiga secção pinada empilhava os actos em `absolute` e,
    // num ecrã baixo ou numa captura de página inteira, os três textos
    // sobrepunham-se. Agora são três blocos estáticos: todos presentes no HTML.
    for (const titulo of ['Diz o que precisas', 'Recebe propostas', 'Fecha com acordo']) {
      expect(html).toContain(titulo);
    }
    expect(html).not.toContain('cine-story-sticky');
    expect(html).not.toContain('cine-progress');
  });

  it('landing: o convite final não repete "Ver prestadores"', async () => {
    const html = await render('/');
    expect(html).not.toContain('Ver prestadores');
    expect(html).toContain('Começa pelo que precisas');
  });

  it('mostra entrar e criar conta', async () => {
    expect(await render('/entrar')).toContain('Entrar');
    expect(await render('/criar-conta')).toContain('Criar conta');
  });

  it('mostra páginas informativas e legais', async () => {
    expect((await render('/ajuda')).length).toBeGreaterThan(1000);
    expect((await render('/seguranca')).length).toBeGreaterThan(1000);
    expect((await render('/termos')).length).toBeGreaterThan(500);
    expect((await render('/privacidade')).length).toBeGreaterThan(500);
  });

  it('mostra 404 para rota desconhecida', async () => {
    expect(await render('/rota-que-nao-existe')).toContain('404');
  });

  it('não rebenta ao abrir uma rota protegida sem sessão', async () => {
    expect((await render('/inicio')).length).toBeGreaterThan(100);
  });
});
