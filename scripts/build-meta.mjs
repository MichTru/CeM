// Favicon (dalla "&" del logo), immagine Open Graph, robots e sitemap.
import sharp from 'sharp';
import fs from 'node:fs';

const SITE = 'https://michtru.github.io/CeM/';
const svg = fs.readFileSync('src/assets/logo-inline.svg', 'utf8');
const amp = svg.match(/class="cm-amp" d="([^"]+)"/)[1];
const nums = amp.match(/-?\d+(\.\d+)?/g).map(Number);
const xs = nums.filter((_, i) => i % 2 === 0);
const ys = nums.filter((_, i) => i % 2 === 1);
const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
const size = Math.max(x1 - x0, y1 - y0) * 1.7;
const cx = (x0 + x1) / 2;
const cy = (y0 + y1) / 2;
const vb = `${cx - size / 2} ${cy - size / 2} ${size} ${size}`;
const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><rect x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}" rx="${size * 0.22}" fill="#16110D"/><path fill="#BBBAB5" fill-rule="evenodd" d="${amp}"/></svg>`;
fs.writeFileSync('public/favicon.svg', fav);
await sharp(Buffer.from(fav)).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(Buffer.from(fav)).resize(180, 180).png().toFile('public/apple-touch-icon.png');

// Open Graph 1200×630
const logo = await sharp('public/logo/logo-cassani-martignani-light.svg', { density: 300 }).resize(520).png().toBuffer();
const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#16110D" stop-opacity=".92"/><stop offset=".55" stop-color="#16110D" stop-opacity=".45"/><stop offset="1" stop-color="#16110D" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`);
await sharp('public/img/giorno-divano-velluto-verde-lampada-1600.webp')
  .resize(1200, 630, { fit: 'cover', position: 'right' })
  .composite([{ input: shade }, { input: logo, left: 64, top: 270 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/og-image.jpg');

fs.writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
const today = new Date().toISOString().slice(0, 10);
const pages = JSON.parse(fs.readFileSync('src/data/categorie.json', 'utf8'));
fs.writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  <url><loc>${SITE}ristrutturi/</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>
${pages.map((a) => `  <url><loc>${SITE}${a.slug}/</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`).join('\n')}
  <url><loc>${SITE}privacy.html</loc><lastmod>${today}</lastmod><priority>0.2</priority></url>
  <url><loc>${SITE}cookie.html</loc><lastmod>${today}</lastmod><priority>0.2</priority></url>
</urlset>
`);
console.log('ok meta');
