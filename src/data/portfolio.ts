// All page content lives here. index.astro only renders it.

export type Platform = 'sh' | 'nx' | 'wp' | 'cr';

export const PLATFORM_LABEL: Record<Platform, string> = {
  sh: 'Shopify',
  nx: 'Next.js',
  wp: 'WordPress',
  cr: 'Crypto / Media',
};

/** Client-work grid. Thumbnails live at public/thumbs/<slug>.jpg (600×375). */
export const sites: [domain: string, platform: Platform][] = [
  ['fameninja.com', 'nx'],
  ['pr.01wire.com', 'sh'], ['shop.rizely.net', 'sh'],
  ['kesariananta.com', 'sh'], ['banterkitchen.com', 'sh'], ['mimamsaa.com', 'sh'], ['stravage.in', 'sh'],
  ['the-culture.in', 'sh'], ['anythingvegan.ae', 'sh'],
  ['swingsaga.com', 'sh'], ['craftdelights.in', 'sh'], ['koora.com.au', 'sh'],
  ['artsncraftsindia.com', 'wp'], ['gogrowth.in', 'wp'],
  ['alhawaeanetwork.com', 'wp'], ['acquifin.us', 'wp'],
  ['thecryptoupdates.com', 'cr'], ['theblockopedia.com', 'cr'], ['theblockopedia.com/wiki', 'cr'],
  ['tbpmedia.io', 'cr'], ['defidraft.com', 'cr'],
];

export const profile = {
  heroSub:
    "I'm Haseeb Ahmed Danish. I build full-stack products end to end: React and Next.js apps, Shopify and WordPress stores, the APIs and databases behind them, and the AI automation that runs a 98\u2011site publishing network.",
  heroStack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Shopify', 'WordPress', 'PostgreSQL', 'Three.js', 'n8n', 'Claude MCP'],
  about:
    'Five years of shipping the whole stack: *React* and *Next.js* apps, *Shopify* stores built from scratch, *WordPress* and *WooCommerce* sites, and the *Node.js* APIs, headless CMSs and *Postgres* databases behind them. Front end, back end, commerce and deployment, handled by one engineer.',
  aboutLead:
    'Lately I pair that with <strong>AI automation</strong>: coding agents connected to live sites over MCP, and n8n pipelines with human approval gates for publishing, technical SEO and QA at network scale.',
};

export const slugify = (d: string) => d.replace(/[^a-z0-9]/g, '-');


export interface CaseStudy {
  id: string;
  name: string;
  kicker: string;
  summary: string;
  points: string[];
  stack: string[];
  links: { label: string; href: string }[];
  thumb?: string;
  status?: string;
  size: 'xl' | 'lg' | 'md';
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'fameninja',
    name: 'FameNinja',
    kicker: 'WordPress → Next.js re-platform',
    summary:
      'Moved a reputation-management agency off WordPress/Elementor onto a Next.js app on Vercel, backed by a headless Strapi 5 CMS, without losing a single ranking URL.',
    points: [
      'Next.js + TypeScript front end on Vercel; every legacy root-slug URL preserved 1:1',
      'Strapi 5 on Railway (PostgreSQL, Cloudinary media) for the blog, draft previews and lead capture',
      'Programmatic page clusters (press-release outlets, city ORM, article removal) from one parameterised template + per-page config',
      'Scripted SEO gates on every page: title length, canonicals, FAQPage / BreadcrumbList JSON-LD, dead links',
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Radix UI', 'Strapi 5', 'PostgreSQL', 'Railway', 'Vercel'],
    links: [{ label: 'fameninja.com', href: 'https://fameninja.com' }],
    thumb: '/work/fameninja.jpg',
    size: 'xl',
  },
  {
    id: 'rizely',
    name: 'Rizely',
    kicker: 'Shopify full build · NFC smart business cards',
    summary:
      'Built the Rizely store on Shopify from scratch: the theme, the catalogue and the purchase flow for an NFC business-card brand.',
    points: [
      'Custom Shopify theme in Liquid, from the header and Shop / Print / Custom / Platform navigation to product and cart templates',
      'Catalogue of NFC cards (PVC, metal, wood), print cards, wearables and counter displays, with pack-size variants from 1 to 100 cards and a structured SKU scheme',
      'Merchandising built around the brand promise: a free Rizely profile with every card, GST invoices and a free-shipping threshold',
    ],
    stack: ['Shopify', 'Liquid', 'Custom theme', 'JavaScript', 'CSS'],
    links: [{ label: 'shop.rizely.net', href: 'https://shop.rizely.net' }],
    thumb: '/work/rizely.jpg',
    size: 'lg',
  },
  {
    id: '01wire',
    name: '01Wire PR',
    kicker: 'Shopify full build · press-release marketplace',
    summary:
      'Built the 01Wire store on Shopify from scratch: a marketplace where every news outlet is a product you can buy, from the theme to the catalogue.',
    points: [
      'Custom Shopify theme in Liquid: catalogue, packages and pricing pages, search and a light/dark toggle',
      'Outlet-as-product catalogue with tiered variants by backlink count and SKUs keyed to the outlet domain',
      'National and regional-language outlets (Hindi, Marathi, Tamil, Telugu, Gujarati), each listing its link type, turnaround and delivery steps',
    ],
    stack: ['Shopify', 'Liquid', 'Custom theme', 'JavaScript', 'CSS'],
    links: [{ label: 'pr.01wire.com', href: 'https://pr.01wire.com' }],
    thumb: '/work/01wire.jpg',
    size: 'lg',
  },
];

export const capabilities = [
  { title: 'Front end', items: ['TypeScript', 'React 19', 'Next.js', 'Astro', 'Three.js / R3F', 'GSAP', 'Tailwind', 'Radix / shadcn'] },
  { title: 'Back end & data', items: ['Node.js', 'Strapi 5', 'Supabase', 'PostgreSQL', 'Prisma', 'MySQL', 'REST + GraphQL', 'PHP / WordPress'] },
  { title: 'Commerce', items: ['Shopify Liquid', 'Custom themes', 'Admin + Storefront API', 'Headless storefronts', 'WordPress + WooCommerce', 'Checkout CRO'] },
  { title: 'Infra & delivery', items: ['Vercel', 'Netlify', 'Railway', 'Cloudflare Workers', 'GitHub Actions', 'LiteSpeed tuning'] },
  { title: 'AI & automation', items: ['Claude Code + MCP', 'n8n pipelines', 'LLM quality gates', 'Telegram approvals', 'Programmatic SEO', 'Schema markup'] },
];

export const jobs = [
  { yr: 'Current', role: 'Developer', org: 'Rankkking', desc: 'Connected Claude Code to WordPress sites via MCP to automate SEO best practices — audits, broken-link detection, sitemap updates. Built AI-assisted multi-site publishing with human approval gates, plus high-converting funnels in custom code and FlexiFunnels.' },
  { yr: '2024 — 2026', role: 'Developer', org: 'GoGrowth Labs', desc: 'Built and maintained WooCommerce and Shopify solutions. Revamped breezyla.com, saving the client $1,000/month by implementing premium features natively. Applied CRO-driven UI/UX and technical SEO to lift conversions and rankings.' },
  { yr: '2023 — 2024', role: 'WordPress Developer', org: 'ArtsnCraftsIndia', desc: 'Optimized checkout flows and product pages, significantly reducing cart abandonment and increasing conversion through streamlined experiences.' },
  { yr: '2023', role: 'WordPress Developer', org: 'Peoplewoo', desc: 'Implemented UI/UX designs and developed custom page templates for distinct sections across various WordPress sites.' },
  { yr: '2022 — 2023', role: 'Front-End / WordPress Developer', org: 'Design Script', desc: 'Designed and built landing pages, e-commerce sites, and blogs for multiple clients.' },
];

export const automations = [
  {
    title: 'MainWP multi-site content network',
    tag: 'n8n · Cloudflare Workers · MainWP REST · LLM · Telegram',
    desc: 'One order fans out to a <span class="k">98-site WordPress network</span>. An AI quality gate screens each article, a Cloudflare Worker reverse-proxy relay gets past the origin bot wall, drafts land on every selected site, and a single Telegram approval publishes them all, with per-site failure handling.',
    flow: ['order form', 'Google Doc', 'AI QA gate', 'draft ×98', 'Telegram approve', 'publish all'],
    hot: [2, 4],
    result: 'one order → one approval → live across the network in minutes, not hours.',
  },
  {
    title: 'TheCryptoUpdates + TheBlockopedia order engine',
    tag: 'n8n · WordPress REST · Rank Math · LLM · Tally',
    desc: 'Client orders become <span class="k">scheduled, SEO-ready posts</span> on two high-traffic crypto publications: parse and route the target, ingest the doc, AI QA, process the featured image, write Rank Math meta with IST scheduling, then a Telegram approval to publish. Duplicate titles are caught automatically.',
    flow: ['Tally order', 'resolve site', 'AI QA gate', 'image + SEO', 'approve', 'schedule / publish'],
    hot: [2, 4],
    result: 'hands-off publishing with a human gate and consistent SEO metadata.',
  },
  {
    title: 'AI-driven SEO & security via MCP',
    tag: 'Claude (MCP) · WordPress · GSC · GA4',
    desc: 'Connected Claude to <span class="k">40+ live WordPress sites</span> through Model Context Protocol servers to run technical SEO audits, security hardening, broken-link detection and sitemap/metadata updates, with GSC + GA4 wired in as an SEO command center.',
    flow: ['Claude + MCP', '40+ WP sites', 'audit + fix', 'GSC / GA4 report'],
    hot: [2],
    result: 'network-wide audits and fixes executed programmatically.',
  },
  {
    title: 'Migration QA gates',
    tag: 'Node · Playwright · JSON-LD · Sitemaps',
    desc: 'Every <span class="k">WordPress → Next.js migration</span> ships behind scripted gates: status codes with no surprise redirects, title and canonical parity, schema present (or deliberately suppressed), sitemap inclusion and body-content parity, plus desktop and mobile layout checks.',
    flow: ['export WP', 'build Next.js', 'SEO QA', 'parity check', 'Playwright', 'ship'],
    hot: [2, 3],
    result: 'migrations that keep their rankings, verified by scripts instead of spot checks.',
  },
];

export const earlyWork = [
  { title: 'Task Tracker App', desc: 'A focused task manager with persistent state and a fast UI.', link: 'https://profound-cheesecake-894687.netlify.app', label: 'live demo ↗' },
  { title: 'Weather App', desc: 'Live conditions and forecasts from the OpenWeather API.', link: 'https://poetic-sorbet-b71dc5.netlify.app', label: 'live demo ↗' },
  { title: 'Workout Buddy', desc: 'Full-stack MERN app for logging and tracking workouts.', link: 'https://github.com/1MrHad1/WorkOut-Buddy-MERN-', label: 'source ↗' },
];

/** Get-in-touch popup. Submissions go to Netlify Forms (form name below). */
export const leadForm = {
  name: 'lead',
  title: 'Tell me about your project',
  intro: 'Share a few details and I’ll reply within one working day.',
  projectTypes: [
    'Shopify store',
    'WordPress / WooCommerce site',
    'React / Next.js app',
    'Full-stack web app',
    'Automation / AI pipeline',
    'Migration (WordPress → Next.js)',
    'Something else',
  ],
  success: 'Thanks, your request is in. I’ll get back to you within one working day.',
  error: 'That didn’t send. Please try again, or email me directly at',
  email: 'umaildanish776@gmail.com',
};

/**
 * Three.js lab: personal projects. Kept separate from client work on purpose. These are
 * self-directed builds, not paid Three.js engagements.
 */
export const LAB_URL = 'https://haseeb-threejs-configurators.netlify.app';
export const LAB_REPO = 'https://github.com/1MrHad1/threejs-configurators';

export const threeLab = {
  intro:
    'My Three.js work so far is personal: this portfolio’s particle field and two 3D product configurators. My client work hasn’t needed 3D yet, so I built these to show how I’d ship a configurator on a real store.',
  projects: [
    {
      id: 'nfc-card',
      name: 'NFC card configurator',
      summary: 'PVC, metal or wood; colours and finishes; live name, title and logo, printed or laser-engraved with real surface depth; front/back flip; pack pricing mirroring a live Shopify catalogue.',
      tags: ['Three.js', 'TypeScript', 'PBR materials', 'Canvas textures', 'Shopify Cart API'],
      path: '/card/',
      thumb: '/lab/nfc-card.jpg',
    },
    {
      id: 'lounge-chair',
      name: 'Lounge chair configurator',
      summary: 'Swap legs, arms and pillow; bouclé, velvet or leather; wood and metal finishes; three sizes with live dimensions. The GLB is compressed from 747 KB to 72 KB with meshopt.',
      tags: ['GLB / glTF', 'meshopt', 'Part variants', 'Hotspots', 'Camera animation'],
      path: '/chair/',
      thumb: '/lab/lounge-chair.jpg',
    },
  ],
  highlights: [
    'Renders only when something changes, so an idle page uses no GPU',
    'Parts, variants and hotspots driven by glTF extras, not hard-coded mesh names',
    'Configuration → Shopify variant + line-item properties via /cart/add.js, with a Liquid section',
  ],
};

/** Backend personal project, kept separate from client work (same framing as the Three.js lab). */
export const backendProject = {
  name: 'shopify-apparel-sync',
  kicker: 'Personal project · Shopify backend',
  summary:
    'A Shopify backend for an apparel brand that keeps the store, a PostgreSQL database and a warehouse in sync. It’s built to be safe when things go wrong: duplicate webhooks, rate limits, retries and sales landing mid-sync.',
  points: [
    'HMAC-verified, deduplicated webhooks for orders, inventory and products, handled as idempotent upserts in transactions',
    'Admin GraphQL client with cost-based throttling, retries and token refresh; client credentials grant with cached 24-hour tokens',
    'Warehouse stock over REST and SOAP, pushed to Shopify with compare-and-swap and idempotency keys, big jumps held for review, every change ledgered',
    'PostgreSQL schema for size × colour variants, stock, orders and a ledger; 33 tests, Docker, CI against a real Postgres 16',
  ],
  tags: ['Node.js', 'TypeScript', 'Fastify', 'PostgreSQL', 'Shopify Admin GraphQL', 'Webhooks', 'SOAP / XML', 'Vitest', 'Docker', 'GitHub Actions'],
  repo: 'https://github.com/1MrHad1/shopify-apparel-sync',
  demo: [
    '$ npm run demo',
    '▸ catalogue pull      { products: 3, variants: 30, levels: 30 }',
    '▸ orders/create       200 {"ok":true}',
    '▸ same delivery       200 {"duplicate":true}',
    '▸ forged signature    401 {"error":"invalid signature"}',
    '▸ reconcile (SOAP)    applied 17 · held 13 · failed 0',
    '▸ /api/stock/low      TL-CHN-KHK-32  Khaki 32   0 left',
  ],
};
