import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Angola: ligações móveis caras e lentas. Vigiamos o peso do arranque.
    chunkSizeWarningLimit: 400,
  },
});
