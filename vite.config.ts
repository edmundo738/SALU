import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { randomUUID } from 'node:crypto';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const buildId = randomUUID();
  return {
    define: { __SALU_BUILD_ID__: JSON.stringify(buildId) },
    plugins: [
      react(),
      {
        name: 'salu-build-version',
        apply: 'build',
        generateBundle() {
          this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: buildId }) });
        },
      },
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: process.env.SALU_API_URL || env.SALU_API_URL || 'http://127.0.0.1:3001',
          changeOrigin: true,
          // O proxy local é a origem do pedido perante a API de desenvolvimento.
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq, req) => {
              if (req.headers.origin) proxyReq.setHeader('Origin', 'http://localhost:5173');
            });
          },
        },
        // Mesma regra do netlify.toml, para as imagens funcionarem em desenvolvimento.
        '/media': {
          target: process.env.SALU_API_URL || env.SALU_API_URL || 'http://127.0.0.1:3001',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/media/, '/api/files'),
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      allowedHosts: true,
    },
    build: {
      chunkSizeWarningLimit: 900,
    },
  };
});
