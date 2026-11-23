import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import i18nPages from './plugins/i18n-pages.js';

export default defineConfig({
  plugins: [tailwindcss(), i18nPages()],
  server: { open: '/' },
});
