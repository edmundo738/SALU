import { defineConfig } from 'vitest/config';

/**
 * Configuração de testes separada da configuração de build.
 *
 * Motivo concreto: o Vitest traz a sua própria versão do Vite, e misturar os
 * tipos dos dois no mesmo ficheiro gera um conflito que o `tsc` recusa. Separar
 * resolve-o sem prender versões que teriam de subir em conjunto.
 *
 * Os testes cobrem regras puras de domínio e a camada de dados: não precisam do
 * plugin de React nem de DOM.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
