import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        xray: resolve(__dirname, 'ai-xray.html'),
        questionnaire: resolve(__dirname, 'questionnaire.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
