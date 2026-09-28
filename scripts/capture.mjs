// Screenshot automation.
//   node scripts/capture.mjs work    → public/work/<id>.jpg  (case-study hero shots, 1200×750)
//   node scripts/capture.mjs thumbs  → public/thumbs/<slug>.jpg (client grid, 600×375)
//   node scripts/capture.mjs og      → public/og.png (1200×630, from a running local preview)
// Run by .github/workflows/refresh-screenshots.yml on a schedule, which opens a PR with any changes.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const mode = process.argv[2] ?? 'work';

const WORK = {
  fameninja: 'https://fameninja.com',
  rizely: 'https://shop.rizely.net',
  '01wire': 'https://pr.01wire.com',
};

async function sitesFromData() {
  // Read the domains straight from the data file so the grid and the script never drift
  const src = await readFile(new URL('../src/data/portfolio.ts', import.meta.url), 'utf8');
  const block = src.slice(src.indexOf('export const sites'), src.indexOf('];', src.indexOf('export const sites')));
  return [...block.matchAll(/\['([^']+)',\s*'(?:sh|nx|wp|cr)'\]/g)].map((m) => m[1]);
}
const slugify = (d) => d.replace(/[^a-z0-9]/g, '-');

async function shoot(browser, url, path, { width, height, scale, type = 'jpeg' }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 }).catch(() => page.waitForTimeout(3000));
    // Dismiss the most common cookie / newsletter overlays without accepting anything
    await page.addStyleTag({ content: '[id*="cookie" i],[class*="cookie" i],[class*="popup" i],[id*="popup" i],[class*="klaviyo" i]{display:none!important}' });
    await page.waitForTimeout(mode === 'og' ? 2500 : 1200);
    await page.screenshot({ path, type, ...(type === 'jpeg' ? { quality: 74 } : {}) });
    console.log('✓', path);
  } catch (err) {
    console.warn('✗', url, err.message);
  } finally {
    await page.close();
  }
}

// Prefer Playwright's bundled Chromium (CI installs it); fall back to a local Chrome install.
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
if (mode === 'work') {
  for (const [id, url] of Object.entries(WORK)) {
    await shoot(browser, url, `public/work/${id}.jpg`, { width: 1440, height: 900, scale: 1200 / 1440 });
  }
} else if (mode === 'thumbs') {
  for (const dom of await sitesFromData()) {
    await shoot(browser, `https://${dom}`, `public/thumbs/${slugify(dom)}.jpg`, { width: 1200, height: 750, scale: 0.5 });
  }
} else if (mode === 'og') {
  const base = process.env.OG_URL ?? 'http://localhost:4321/?og';
  await shoot(browser, base, 'public/og.png', { width: 1200, height: 630, scale: 1, type: 'png' });
} else {
  console.error(`Unknown mode "${mode}". Use work | thumbs | og.`);
  process.exitCode = 1;
}
await browser.close();
