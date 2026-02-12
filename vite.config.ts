import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        // Remover rollupOptions para deixar Vite fazer seu trabalho
        sourcemap: mode === 'production' ? false : true,
        chunkSizeWarningLimit: 1000,
      },
      define: {
        // Deixar import.meta.env.VITE_* funcionar automaticamente
        // Remove: 'process.env.API_KEY' pois não é mais necessário
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});