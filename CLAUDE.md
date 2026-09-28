# CLAUDE.md

Astro 5 portfolio with a Three.js particle field behind every section. Static output, deployed on Netlify.

## Commands
- `npm run dev`: http://localhost:4321
- `npm run check`: build + QA gate. Must pass before committing.

## Where things live
- Content: `src/data/portfolio.ts` only. Don't hard-code copy in `index.astro`.
- 3D field: `src/scripts/field.ts`. Page behaviour (Lenis, GSAP, tilt, filters, theme): `src/scripts/app.ts`.
- Styles: `src/styles/global.css`. Its token names are bridged to Tailwind in `tailwind.css`, so keep them stable.

## Rules
- FameNinja is a **Next.js** site (platform `nx`), never WordPress. The QA gate enforces this.
- Rizely and 01Wire PR are **Shopify full builds from scratch** (theme + catalogue). Don't add other
  platforms or "programmatic" framing to them. The QA gate enforces this too.
- Only claim what is verifiable from the repos and stores; private repos get no source link.
- A section joins the 3D story with `data-formation` (0–4) and `data-intensity`. Formations are
  built once on the CPU and blended in the vertex shader. Never update position buffers per frame.
- Keep the performance guards: dynamic `import('./field')`, DPR cap 1.75, pause on hidden tab,
  reduced-motion path, `no-webgl` fallback.
- The lead popup (`src/components/LeadForm.astro`) must stay Netlify-detectable: static
  `data-netlify="true"`, hidden `form-name`, and fields named as in the QA gate.
- `@astrojs/react` stays on 4.x while on Astro 5 (see docs/21st-dev-mcp.md).

## Verifying visual changes
Check 1440×900 and 375×812 across hero, work, automation, clients and contact, in both themes.
Copy must stay readable over the field, and there must be no horizontal scroll.
