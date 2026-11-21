import { defineConfig } from 'vitest/config';

/**
 * Configuração de testes separada da configuração de build.
 *
 * Motivo concreto: o Vitest traz a sua própria versão do Vite, e misturar os
 * tipos dos dois no mesmo ficheiro gera um conflito que o `tsc` recusa.
 *
 * - `tests/api.*`: integração real com o servidor Express + SQLite.
 * - `tests/geo.test.ts`: divisão administrativa.
 * - `tests/ui.render.*`: renderização das páginas (jsdom no próprio ficheiro).
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    testTimeout: 30_000,
  },
});
