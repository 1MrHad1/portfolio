# Haseeb Ahmed Danish — Developer Portfolio

Personal portfolio site. **Senior Developer** — Shopify, WordPress & React, with a focus on conversion-optimized e-commerce and AI automation.

Built with [Astro](https://astro.build) and vanilla CSS (near-zero JS) for a 90+/near-100 Lighthouse score. Dark-first "Refined Minimal" design with a light-mode toggle and a teal accent.

## Stack

- **Astro 5** — static output, islands-ready
- **Vanilla CSS** — token-based theming (light + dark), no framework runtime
- **@astrojs/sitemap** — auto-generated `sitemap-index.xml`
- JSON-LD `Person` schema, OpenGraph/Twitter meta, canonical URLs

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
```

## Build

```bash
npm run build    # outputs to ./dist
npm run preview  # preview the production build locally
```

## Deploy to Netlify

This repo includes `netlify.toml` (build command `npm run build`, publish dir `dist`, asset caching + security headers).

1. On Netlify: **Add new site → Import from GitHub**, pick this repo.
2. Build settings are auto-detected from `netlify.toml`. Deploy.
3. After you have your Netlify domain, update `SITE` in `astro.config.mjs` so canonical URLs and the sitemap use the real host, then redeploy.

## Editing content

Everything is data-driven in `src/pages/index.astro`:

- `sites` — the client-work grid (`sh` = Shopify, `wp` = WordPress, `cr` = Crypto/Media)
- `jobs` — experience timeline
- `automations` — the Automation & AI Engineering showcase cards
- `projects` — personal projects

Design tokens (colors, both themes) live in `src/styles/global.css`. Head/meta/schema live in `src/layouts/Layout.astro`.

## To do

- Add a real `public/og.png` social preview image (1200×630).
- Swap the client-work letter tiles for real screenshots if desired (`public/thumbs/…`).
- Update `SITE` in `astro.config.mjs` to the live domain.
