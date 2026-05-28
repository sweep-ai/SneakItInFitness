import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

/** Canonical production origin. Override with VITE_SITE_URL or VERCEL_URL at build time. */
function siteOrigin() {
  const fromEnv = process.env.VITE_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, '')}`;
  }
  return 'https://sneakitinfitness.com';
}

const origin = siteOrigin();
const lastmod = new Date().toISOString().slice(0, 10);

/** Public routes worth indexing (excludes redirects and post-booking). */
const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/male/systems', changefreq: 'monthly', priority: '0.9' },
  { path: '/male/work', changefreq: 'monthly', priority: '0.9' },
  { path: '/male/cultural', changefreq: 'monthly', priority: '0.9' },
  { path: '/female/cultural', changefreq: 'monthly', priority: '0.9' },
  { path: '/female/work', changefreq: 'monthly', priority: '0.9' },
  { path: '/female/systems', changefreq: 'monthly', priority: '0.9' },
  { path: '/food', changefreq: 'monthly', priority: '0.9' },
  { path: '/male/food', changefreq: 'monthly', priority: '0.9' },
  { path: '/female/food', changefreq: 'monthly', priority: '0.9' },
  { path: '/yoyo', changefreq: 'monthly', priority: '0.9' },
  { path: '/male/yoyo', changefreq: 'monthly', priority: '0.9' },
  { path: '/female/yoyo', changefreq: 'monthly', priority: '0.9' },
  { path: '/booking', changefreq: 'monthly', priority: '0.8' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/disclaimer', changefreq: 'yearly', priority: '0.3' },
];

const urlEntries = routes
  .map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${origin}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Disallow: /post-booking

Sitemap: ${origin}/sitemap.xml
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(join(publicDir, 'robots.txt'), robots, 'utf8');

console.log(`Wrote sitemap.xml and robots.txt for ${origin}`);
