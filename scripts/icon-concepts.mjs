// Quattro proposte di icona da confrontare (non fa parte della build).
import sharp from 'sharp';
import fs from 'node:fs';
const OUT = process.argv[2];
const g = (n) => fs.readFileSync(`assets-src/logo/${n}-icona.txt`, 'utf8');
const U = 48; // le tracce sono a 48 volte la risoluzione del logo originale
const glyph = { c: { d: g('c'), x: 0 }, amp: { d: g('amp'), x: 24 }, m: { d: g('m'), x: 53 } };
// "c&m" con le stesse distanze del logo, ma un po' più stretto
function cm(fill) {
  return ['c', 'amp', 'm'].map((k) => `<path fill="${fill}" fill-rule="evenodd" transform="translate(${glyph[k].x * U} 0)" d="${glyph[k].d}"/>`).join('');
}
const W_CM = 82 * U; // larghezza approssimativa del gruppo c&m
const S = 1000;
const place = (w, h, scale, cy = 500) => `translate(${S / 2 - (w * scale) / 2} ${cy - (h * scale) / 2}) scale(${scale})`;
const H_G = 32 * U;
const base = (inner, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 ${S} ${S}"><defs>
  <clipPath id="r"><rect width="${S}" height="${S}" rx="225"/></clipPath>
  <linearGradient id="cog" x1="0" x2="1"><stop offset="0" stop-color="#9a6440" stop-opacity="0"/><stop offset=".5" stop-color="#c48a5e"/><stop offset="1" stop-color="#9a6440" stop-opacity="0"/></linearGradient>
  <radialGradient id="esp" cx="30%" cy="20%" r="95%"><stop offset="0" stop-color="#3a2b21"/><stop offset=".6" stop-color="#1e1712"/><stop offset="1" stop-color="#130e0a"/></radialGradient>
  <linearGradient id="blade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd6aa" stop-opacity="0"/><stop offset=".5" stop-color="#ffd6aa" stop-opacity=".22"/><stop offset="1" stop-color="#ffd6aa" stop-opacity="0"/></linearGradient>
  <filter id="wood" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0035 0.09" numOctaves="4" seed="7"/><feColorMatrix values="0 0 0 0 .62  0 0 0 0 .44  0 0 0 0 .28  0 0 0 1.6 -.35"/></filter>
  <filter id="emb"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#2b1a0f" flood-opacity=".55"/></filter>
</defs><g clip-path="url(#r)">${bg}${inner}</g></svg>`;

const concepts = {
  // A · monogramma c&m del logo su espresso
  A: base(`<g transform="${place(W_CM, H_G, 0.66 * S / W_CM, 480)}">${cm('#f2ebe1')}</g><rect x="300" y="650" width="400" height="11" rx="5" fill="url(#cog)"/>`,
    `<rect width="${S}" height="${S}" fill="url(#esp)"/>`),
  // B · avorio: la & scura su carta, con la linea cognac
  B: base(`<g transform="${place(29 * U, H_G, 0.5 * S / (29 * U), 470)}"><path fill="#241b15" fill-rule="evenodd" d="${glyph.amp.d}"/></g><rect x="360" y="790" width="280" height="12" rx="6" fill="#9a6440"/>`,
    `<rect width="${S}" height="${S}" fill="#f2ebe1"/><rect width="${S}" height="${S}" fill="#d8c3a8" opacity=".25"/>`),
  // C · la tenda a lamelle dell'intro con la lama di luce e la & che si accende
  C: base(`<g transform="${place(29 * U, H_G, 0.46 * S / (29 * U), 500)}"><path fill="#f5efe6" fill-rule="evenodd" d="${glyph.amp.d}"/></g>`,
    `<rect width="${S}" height="${S}" fill="#120d0a"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${i * 167}" y="0" width="168" height="${S}" fill="#1b140f" opacity="${i % 2 ? 0.9 : 0.6}"/><rect x="${i * 167 + 150}" y="0" width="18" height="${S}" fill="#000" opacity=".25"/>`).join('')}<g transform="rotate(-30 500 500)"><rect x="-400" y="330" width="1800" height="300" fill="url(#blade)"/></g>`),
  // D · rovere: il legno della falegnameria con c&m in avorio inciso
  D: base(`<g filter="url(#emb)" transform="${place(W_CM, H_G, 0.66 * S / W_CM, 500)}">${cm('#f5efe6')}</g>`,
    `<rect width="${S}" height="${S}" fill="#8f6540"/><rect width="${S}" height="${S}" filter="url(#wood)" opacity=".85"/><rect width="${S}" height="${S}" fill="#000" opacity=".12"/>`),
};
for (const [k, svg] of Object.entries(concepts)) {
  fs.writeFileSync(`${OUT}/icona-${k}.svg`, svg);
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}/icona-${k}.png`);
}
console.log('ok');
