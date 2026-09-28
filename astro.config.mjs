import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Live Netlify site (canonical URLs + sitemap). Change this if a custom domain is added.
const SITE = 'https://portfolio-had.netlify.app';

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
