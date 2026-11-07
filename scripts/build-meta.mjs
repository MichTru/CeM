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
// Icona della web app: il monogramma "c&m" con le lettere del logo (ritracciate morbide),
// in avorio su espresso con la linea cognac. La favicon minuscola usa solo la "&".
const U = 48;
const G = { c: { d: fs.readFileSync('assets-src/logo/c-icona.txt', 'utf8'), x: 0 }, amp: { d: amp, x: 24 }, m: { d: fs.readFileSync('assets-src/logo/m-icona.txt', 'utf8'), x: 53 } };
const W_CM = 82 * U;
const H_G = 32 * U;
function icon(px, { maskable = false, rounded = true, mono = true } = {}) {
  const S = 1000;
  const w = mono ? W_CM : 29 * U;
  const k = (S * (mono ? (maskable ? 0.52 : 0.66) : 0.62)) / w;
  const cy = mono ? 480 : 470;
  const tx = S / 2 - (w * k) / 2;
  const ty = cy - (H_G * k) / 2;
  const glyphs = mono
    ? ['c', 'amp', 'm'].map((n) => `<path fill="url(#ink)" fill-rule="evenodd" transform="translate(${G[n].x * U} 0)" d="${G[n].d}"/>`).join('')
    : `<path fill="url(#ink)" fill-rule="evenodd" d="${amp}"/>`;
  const lineW = mono ? (maskable ? 320 : 400) : 420;
  const lineY = mono ? (maskable ? 625 : 650) : 800;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="bg" cx="30%" cy="20%" r="95%"><stop offset="0" stop-color="#3a2b21"/><stop offset=".6" stop-color="#1e1712"/><stop offset="1" stop-color="#130e0a"/></radialGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5efe6"/><stop offset="1" stop-color="#e6d8c5"/></linearGradient>
    <linearGradient id="line" x1="0" x2="1"><stop offset="0" stop-color="#9a6440" stop-opacity="0"/><stop offset=".5" stop-color="#c48a5e"/><stop offset="1" stop-color="#9a6440" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="${S}" height="${S}" rx="${rounded ? S * 0.22 : 0}" fill="url(#bg)"/>
  <g transform="translate(${tx} ${ty}) scale(${k})">${glyphs}</g>
  <rect x="${S / 2 - lineW / 2}" y="${lineY}" width="${lineW}" height="${mono ? 11 : 30}" rx="6" fill="url(#line)"/>
</svg>`;
}
for (const f of fs.readdirSync('public')) if (/^(favicon|apple-touch-icon|icon)-v\d/.test(f)) fs.unlinkSync(`public/${f}`);
fs.writeFileSync('public/favicon-v3.svg', icon(64, { mono: false }));
const png = (svg, size, file) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
await png(icon(32, { mono: false }), 32, 'public/favicon-v3-32.png');
await png(icon(180, { rounded: false }), 180, 'public/apple-touch-icon-v3.png');
await png(icon(192), 192, 'public/icon-v3-192.png');
await png(icon(512), 512, 'public/icon-v3-512.png');
await png(icon(512, { maskable: true, rounded: false }), 512, 'public/icon-v3-maskable-512.png');
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
    { src: 'icon-v3-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-v3-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-v3-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
