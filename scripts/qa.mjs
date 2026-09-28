// Post-build QA gate. Runs in CI after `astro build`; exits non-zero on any failure.
//   node scripts/qa.mjs [distDir]
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const html = await readFile(join(dist, 'index.html'), 'utf8');
const failures = [];
const check = (ok, msg) => (ok ? console.log('  ✓', msg) : (failures.push(msg), console.log('  ✗', msg)));
const exists = (p) => access(p).then(() => true, () => false);

console.log(`QA ${dist}/index.html`);

const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
check(title.length > 0 && title.length <= 60, `title is 1–60 chars (${title.length}): "${title}"`);

const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
check(desc.length >= 70 && desc.length <= 160, `meta description is 70–160 chars (${desc.length})`);

check((html.match(/<h1[\s>]/g) ?? []).length === 1, 'exactly one <h1>');
check(/<link rel="canonical" href="https:\/\//.test(html), 'absolute canonical URL');

for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  let ok = true;
  try { JSON.parse(json); } catch { ok = false; }
  check(ok, 'JSON-LD parses');
}

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchors = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))];
const missing = anchors.filter((a) => !ids.has(a));
check(missing.length === 0, `every #anchor has a target${missing.length ? ` (missing: ${missing.join(', ')})` : ''}`);

const imgs = [...new Set([...html.matchAll(/<img[^>]+src="(\/[^"]+)"/g)].map((m) => m[1]))];
const broken = [];
for (const src of imgs) if (!(await exists(join(dist, src)))) broken.push(src);
check(broken.length === 0, `all ${imgs.length} local images exist${broken.length ? ` (missing: ${broken.join(', ')})` : ''}`);

const noAlt = (html.match(/<img(?![^>]*\salt=")[^>]*>/g) ?? []).length;
check(noAlt === 0, 'every <img> has alt text');

check(await exists(join(dist, 'og.png')), 'og.png social image exists');

// Regression: FameNinja runs on Next.js, never label it WordPress again
const fnCard = html.match(/<a[^>]+data-plat="(\w+)"[^>]+href="https:\/\/fameninja\.com"|<a[^>]+href="https:\/\/fameninja\.com"[^>]+data-plat="(\w+)"/);
check((fnCard?.[1] ?? fnCard?.[2]) === 'nx', 'fameninja.com is tagged Next.js in the client grid');
const fnCase = html.match(/id="cs-fameninja"[\s\S]*?<\/article>/)?.[0] ?? '';
check(fnCase.includes('Next.js') && !/WordPress developer|built (on|with) WordPress/i.test(fnCase), 'FameNinja case study describes the Next.js build');

for (const name of ['Rizely', '01Wire PR']) check(html.includes(`>${name}</h3>`), `${name} case study is present`);

if (failures.length) {
  console.error(`\n${failures.length} QA check(s) failed.`);
  process.exit(1);
}
console.log('\nAll QA checks passed.');
