import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        xray: resolve(__dirname, 'ai-xray.html'),
        questionnaire: resolve(__dirname, 'questionnaire.html'),
        // Client Cabinets
        'cabinet-race-expert': resolve(__dirname, 'cabinet/race-expert/index.html'),
        'cabinet-race-expert-survey': resolve(__dirname, 'cabinet/race-expert/survey.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
