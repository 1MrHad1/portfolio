# Adding 21st.dev as an MCP server

21st.dev is a registry of React + Tailwind (shadcn-style) UI components. Its MCP server lets
Claude Code search that registry and write components straight into this repo.

## 1. Get an API key

Sign in at <https://21st.dev/mcp> and copy the key.

> Keys issued by the old "Magic" console were reset and no longer work — generate a fresh one.

## 2. Add the server

Recommended — the official installer:

```bash
npx @21st-dev/cli@latest init --client claude
```

Or add it to Claude Code by hand as a plain HTTP server:

```bash
claude mcp add --transport http 21st https://21st.dev/api/mcp --header "x-api-key: YOUR_KEY"
```

Add `--scope project` to write it into a shared `.mcp.json` instead of your user config.
Do **not** commit a real key — keep it in your user-scoped config, or use
`--header "x-api-key: ${TWENTYFIRST_API_KEY}"` and export the variable.

The legacy command still works as a proxy if you have old config lying around:

```bash
npx -y @21st-dev/magic@latest API_KEY="YOUR_KEY"
```

## 3. Verify

Run `/mcp` inside an interactive `claude` session — `21st` should be listed as connected.

## 4. Tools it exposes

| Tool | What it does | Cost |
| --- | --- | --- |
| `search` | Browse components, themes and templates (metadata only) | free |
| `search_logo` | Find brand/UI SVG logos by name | free |
| `get_component` | Fetch a component's source by ID | paid |
| `get_inspiration` | Results ranked against your project's design context | paid |
| `generate` | Generate new UI from a text prompt | paid on the free tier |

`tools/list` on the server is the authoritative, current list.

## 5. How components land in THIS repo

This is an Astro site, so a 21st.dev component is used as a React island:

1. Save the component to `src/components/`.
2. It imports `cn` from `@/lib/utils` — already present.
3. It imports `framer-motion` or `motion/react` — both are installed, so either resolves.
4. Tailwind utilities are available; the site's design tokens are exposed to Tailwind in
   `src/styles/tailwind.css` (`bg-panel`, `text-acc`, `border-line`, …), so a pasted
   component can be made to match the theme without hard-coded hex values.
5. Render it from `index.astro` with a hydration directive:

```astro
---
import Thing from '../components/Thing.tsx';
---
<Thing client:visible />
```

Use `client:visible` (hydrate when scrolled into view) unless the component must work
above the fold, in which case use `client:load`.

## Gotchas found while wiring this up

- **Preflight is intentionally not imported.** `src/styles/tailwind.css` pulls in only
  `theme.css` and `utilities.css`. Importing full `tailwindcss` would reset the
  hand-written styles in `global.css`.
- **Pin `@astrojs/react` to the 4.x line** while this project is on Astro 5. Versions 5/6/7
  depend on Vite 7/8 and their Fast Refresh plugin crashes the Astro 5 dev server with
  `Missing field 'moduleType'`.
- **Don't alias `framer-motion` → `motion/react`.** `motion/react` re-exports from
  `framer-motion`, so the alias is circular and breaks the production build.
