import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// UPDATE this to your real Netlify domain once deployed (used for canonical + sitemap).
const SITE = 'https://haseebdanish.netlify.app';

export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
