# Haseeb Ahmed Danish — Portfolio

Portfolio of a **senior full-stack developer**: Next.js apps, Shopify storefronts, Strapi and
Supabase back-ends, WordPress → Next.js migrations, and AI automation pipelines.

Built with [Astro](https://astro.build) and a single **Three.js** particle field that sits behind
every section and morphs as you scroll.

## The 3D field

`src/scripts/field.ts` renders one `THREE.Points` cloud (15,000 particles on desktop, 7,000 on
mobile) plus a 98-node network. Every formation is uploaded to the GPU once; the vertex shader
blends between them, so scrolling never re-uploads a buffer.

| Section | Formation | Why |
| --- | --- | --- |
| Hero, About | Network sphere with 98 linked nodes and light packets on every link | the 98-site publishing network |
| Work, Capabilities | Four stacked platters | the full stack |
| Automation | Particles streaming through a twisting tube | data moving through a pipeline |
| Client work | 21 tile outlines | the 21 client sites |
| Contact | Portal ring framing the call to action | |

Sections opt in with `data-formation="n"` and `data-intensity="0–1"`. Other touches: particles
move away from the cursor and switch colours and blending for the light theme.

Performance guards:
- `three` is loaded with a dynamic import after first paint, so it never blocks the LCP text
- 3 draw calls in total
- pixel ratio capped at 1.75
- rendering stops in background tabs
- `prefers-reduced-motion` slows the field and skips the tweens
- a CSS gradient fallback shows when WebGL isn't available

## Stack

- **Astro 5**: static output, React islands (`ScrollReveal`, `CountUp`)
- **Three.js**: custom `ShaderMaterial`s, no post-processing
- **GSAP ScrollTrigger + Lenis**: smooth scroll, reveals, section → formation triggers
- **Tailwind 4** (utilities only) for 21st.dev components; see [docs/21st-dev-mcp.md](docs/21st-dev-mcp.md)
- Hand-written CSS with light and dark tokens in `src/styles/global.css`

## Commands

```bash
npm install
npm run dev             # http://localhost:4321
npm run build           # static site in dist/
npm run qa              # QA gate against dist/ (run after build)
npm run check           # build + qa
npm run capture:work    # re-shoot case-study images from the live sites
npm run capture:thumbs  # re-shoot the 21 client-grid thumbnails
npm run capture:og      # re-shoot public/og.png from a running server (default http://localhost:4321/?og)
```

## Editing content

All copy lives in [`src/data/portfolio.ts`](src/data/portfolio.ts):

- `caseStudies`: the bento grid (`size: 'xl' | 'lg' | 'md'`)
- `capabilities`: the stacked capability layers
- `automations`: pipeline cards (`hot` = highlighted steps)
- `jobs`, `earlyWork`, `stack`
- `sites`: the client grid. Platform codes: `sh` Shopify, `nx` Next.js, `wp` WordPress, `cr` Crypto / Media. Filter counts are computed.

## Automations

| Where | What |
| --- | --- |
| `.github/workflows/ci.yml` | On every push and PR: `npm ci`, build, then the QA gate |
| same workflow, `lighthouse` job | Lighthouse CI on the built site. Accessibility and SEO ≥ 0.95 fail the build; performance and best practices warn |
| `.github/workflows/refresh-screenshots.yml` | Monthly (and on demand): re-captures every screenshot with Playwright and opens a PR if anything changed |
| `.github/dependabot.yml` | Weekly npm updates (Astro and Three grouped, `@astrojs/react` majors held back), monthly Actions updates |
| `scripts/qa.mjs` | Checks title and description length, a single `<h1>`, canonical URL, JSON-LD parsing, every `#anchor` target, every image file and its alt text, `og.png`, and content regressions (FameNinja must be tagged Next.js) |

The screenshot workflow needs **Settings → Actions → General → Allow GitHub Actions to create
and approve pull requests** turned on.

## Get-in-touch popup

`src/components/LeadForm.astro` is a `<dialog>` lead form with fields for first and last name,
email, phone, project type and request. Any element with `data-lead` opens it: the nav
"Let's talk" button, the hero "Get in touch" button and "Send a request" in the contact section.
Its copy lives in `leadForm` in `src/data/portfolio.ts`.

Submissions go to **Netlify Forms**. There's no backend and no API key. The form is in the static
HTML with `data-netlify="true"` and a honeypot field, and JS posts it with `fetch` so the visitor
stays on the page. If sending fails, the popup keeps what they typed and shows your email instead.

After the first deploy:
1. Netlify → **Forms**: enable form detection if it's off, then redeploy. A form named `lead`
   should appear.
2. **Forms → Form notifications → Add notification → Email notification**, and send it to your
   inbox so every lead reaches you.

The local dev server accepts the POST but doesn't store anything. Only the deployed site
records submissions.

## Deploy (Netlify)

`netlify.toml` sets the build command, `dist` as the publish directory, asset caching and
security headers. After the first deploy, set `SITE` in `astro.config.mjs` to the live domain so
canonical URLs and the sitemap use it.

## AI tooling used on this repo

See [docs/threejs-tooling.md](docs/threejs-tooling.md): the Three.js Resources MCP (shared in
`.mcp.json`), the Three.js Claude skills, Inspo for design references, and 21st.dev for components.
