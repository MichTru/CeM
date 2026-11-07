// Favicon (dalla "&" del logo), immagine Open Graph, robots e sitemap.
import sharp from 'sharp';
import fs from 'node:fs';

const SITE = 'https://michtru.github.io/CeM/';
const svg = fs.readFileSync('src/assets/logo-inline.svg', 'utf8');
// la "&" del logo, ritracciata con più ammorbidimento per le icone grandi
const amp = fs.readFileSync('assets-src/logo/amp-icona.txt', 'utf8').replace(/-?\d+\.\d+/g, (n) => (+n).toFixed(1));
const nums = amp.match(/-?\d+(\.\d+)?/g).map(Number);
const xs = nums.filter((_, i) => i % 2 === 0);
const ys = nums.filter((_, i) => i % 2 === 1);
const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
// Icona: la "&" del logo su fondo espresso, con la luce della tenda e la linea cognac
function icon(px, { maskable = false, rounded = true } = {}) {
  const S = 1000;
  const scale = maskable ? 0.5 : 0.62;              // la "&" occupa il centro (zona sicura per maskable)
  const w = x1 - x0, h = y1 - y0;
  const k = (S * scale) / Math.max(w, h);
  const tx = S / 2 - (x0 + w / 2) * k;
  const ty = S / 2 - (y0 + h / 2) * k - S * 0.03;
  const lineY = S / 2 + (h * k) / 2 + S * 0.05;
  const lineW = S * (maskable ? 0.36 : 0.46);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="bg" cx="28%" cy="18%" r="95%"><stop offset="0" stop-color="#3a2b21"/><stop offset=".55" stop-color="#211913"/><stop offset="1" stop-color="#140f0b"/></radialGradient>
    <linearGradient id="blade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd6aa" stop-opacity="0"/><stop offset=".5" stop-color="#ffd6aa" stop-opacity=".13"/><stop offset="1" stop-color="#ffd6aa" stop-opacity="0"/></linearGradient>
    <linearGradient id="amp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5efe6"/><stop offset="1" stop-color="#d8c3a8"/></linearGradient>
    <linearGradient id="line" x1="0" x2="1"><stop offset="0" stop-color="#9a6440" stop-opacity="0"/><stop offset=".5" stop-color="#c48a5e"/><stop offset="1" stop-color="#9a6440" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="${S}" height="${S}" rx="${rounded ? S * 0.22 : 0}" fill="url(#bg)"/>
  <g transform="rotate(-28 500 500)"><rect x="-300" y="300" width="1600" height="170" fill="url(#blade)"/><rect x="-300" y="560" width="1600" height="70" fill="url(#blade)"/></g>
  <path transform="translate(${tx} ${ty}) scale(${k})" fill="url(#amp)" fill-rule="evenodd" d="${amp}"/>
  <rect x="${S / 2 - lineW / 2}" y="${lineY}" width="${lineW}" height="${S * 0.012}" rx="${S * 0.006}" fill="url(#line)"/>
</svg>`;
}
fs.writeFileSync('public/favicon.svg', icon(64));
const png = (svg, size, file) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
await png(icon(32), 32, 'public/favicon-32.png');
await png(icon(180, { rounded: false }), 180, 'public/apple-touch-icon.png');
await png(icon(192), 192, 'public/icon-192.png');
await png(icon(512), 512, 'public/icon-512.png');
await png(icon(512, { maskable: true, rounded: false }), 512, 'public/icon-maskable-512.png');
fs.writeFileSync('public/manifest.webmanifest', JSON.stringify({
  name: 'Cassani & Martignani',
  short_name: 'C&M Arredi',
  description: 'Showroom di arredamento a Lugo con falegnameria propria a Massa Lombarda.',
  lang: 'it',
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: '#16110D',
  theme_color: '#16110D',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));

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
