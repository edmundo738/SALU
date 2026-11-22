import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: process.env.SALU_API_URL || env.SALU_API_URL || 'http://127.0.0.1:3001',
          changeOrigin: true,
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
