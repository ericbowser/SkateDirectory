import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
const mode = modeArg?.split('=')[1] || process.env.NODE_ENV || 'development';

dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, `.env.${mode}`), override: true });

const siteUrl = (
  process.env.VITE_SITE_URL ||
  `https://${process.env.HOST || 'localhost'}:${process.env.PORT || 8006}`
).replace(/\/$/, '');

const routes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/suggest-park', changefreq: 'monthly', priority: '0.6' },
];

const lastmod = new Date().toISOString().slice(0, 10);

const urlEntries = routes
  .map(
    ({ path: routePath, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${routePath}</loc>
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

Sitemap: ${siteUrl}/sitemap.xml
`;

const publicDir = path.join(root, 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);

console.log(`Generated sitemap.xml and robots.txt for ${siteUrl}`);
