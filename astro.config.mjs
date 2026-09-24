import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// UPDATE this to your real Netlify domain once deployed (used for canonical + sitemap).
const SITE = 'https://haseebdanish.netlify.app';

export default defineConfig({
  site: SITE,
  integrations: [sitemap(), react()],
  build: { inlineStylesheets: 'auto' },
  // 21st.dev components ship importing either "framer-motion" (older) or
  // "motion/react" (current). Both packages are installed, so either import
  // resolves natively — no alias needed (aliasing them at each other is a
  // circular re-export and breaks the build).
  vite: {
    plugins: [tailwindcss()],
  },
});
