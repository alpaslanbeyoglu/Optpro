import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { aistudioMediaPlugin } from '@google/aistudio-media-plugin';

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    base: '/Optpro/',
    plugins: [react(), tailwindcss(), aistudioMediaPlugin()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
  };
});
