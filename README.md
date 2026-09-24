# Haseeb Ahmed Danish — Developer Portfolio

Personal portfolio site. **Senior Developer** — Shopify, WordPress & React, with a focus on conversion-optimized e-commerce and AI automation.

Built with [Astro](https://astro.build) and vanilla CSS, with a small React island layer for
scroll-driven motion. Dark-first "Refined Minimal" design with a light-mode toggle and a teal accent.

## Stack

- **Astro 5** — static output, React islands
- **Vanilla CSS** — token-based theming (light + dark) in `src/styles/global.css`
- **React 19 + Tailwind 4 + motion** — only for the three animated islands, hydrated with `client:visible`
- **@astrojs/sitemap** — auto-generated `sitemap-index.xml`
- JSON-LD `Person` schema, OpenGraph/Twitter meta, canonical URLs

Components follow the shadcn/21st.dev convention (`cn` from `@/lib/utils`, Tailwind classes),
so components pulled from [21st.dev](https://21st.dev) drop in unmodified — see
[docs/21st-dev-mcp.md](docs/21st-dev-mcp.md) for the MCP setup and the constraints that matter here.

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

- `sites` — the client-work grid (`sh` = Shopify, `wp` = WordPress, `rc` = React, `cr` = Crypto/Media)
- `stack` — the scrolling tech strip under the intro
- `jobs` — experience timeline
- `automations` — the Automation & AI Engineering showcase cards
- `projects` — personal projects

Design tokens (colors, both themes) live in `src/styles/global.css`. Head/meta/schema live in `src/layouts/Layout.astro`.

## Animated islands

| Component | Used for |
| --- | --- |
| `ScrollReveal.tsx` | Word-by-word reveal on the intro paragraph |
| `VelocityMarquee.tsx` | Tech strip that speeds up and skews with scroll velocity |
| `CountUp.tsx` | The four metric tiles, counting up when scrolled into view |

All three respect `prefers-reduced-motion` and render their final state when motion is off.

## To do

- Add a real `public/og.png` social preview image (1200×630).
- Update `SITE` in `astro.config.mjs` to the live domain.
