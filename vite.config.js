import { defineConfig } from 'vite';
import fs from 'node:fs';
import { resolve } from 'node:path';

const BASE = '/CeM/';
const images = JSON.parse(fs.readFileSync('src/data/images.json', 'utf8'));
const logoInline = fs.readFileSync('src/assets/logo-inline.svg', 'utf8');
const categorie = JSON.parse(fs.readFileSync('src/data/categorie.json', 'utf8'));
const partial = (name) => fs.readFileSync(`src/partials/${name}.html`, 'utf8');

// <cm-img name="..." sizes="..." class="..." loading="lazy" fetchpriority="high" alt="...">
// diventa un <picture> con AVIF/WebP responsive e placeholder sfocato.
function picture(attrs) {
  const get = (k) => (attrs.match(new RegExp(`${k}="([^"]*)"`)) || [])[1];
  const name = get('name');
  const img = images[name];
  if (!img) throw new Error(`Immagine sconosciuta: ${name}`);
  const sizes = get('sizes') || '100vw';
  const loading = get('loading') || 'lazy';
  const cls = get('class') || '';
  const prio = get('fetchpriority');
  const alt = get('alt') ?? img.alt;
  const set = (ext) => img.widths.map((w) => `@base/img/${name}-${w}.${ext} ${w}w`).join(', ');
  const mid = img.widths.includes(1200) ? 1200 : img.widths.at(-1);
  return `<picture class="pic ${cls}" style="--lqip:url('${img.lqip}');aspect-ratio:${img.w}/${img.h}">` +
    `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
    `<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
    `<img src="@base/img/${name}-${mid}.webp" width="${img.w}" height="${img.h}" alt="${alt}" loading="${loading}" decoding="async"${prio ? ` fetchpriority="${prio}"` : ''}>` +
    `</picture>` +
    (img.stock && !/\bnobadge\b/.test(attrs) ? `<span class="ispirazione">Foto d'ispirazione</span>` : '');
}

function cmHtml() {
  let base = BASE;
  return {
    name: 'cm-html',
    configResolved(c) {
      base = c.base;
    },
    // in sviluppo, una modifica ai partial ricarica la pagina
    handleHotUpdate({ file, server }) {
      if (file.includes('/src/partials/')) server.ws.send({ type: 'full-reload' });
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html
          .replace(/<!--PARTIAL:([a-z]+)-->/g, (_, n) => partial(n))
          .replace(/<cm-img([^>]*)><\/cm-img>/g, (_, a) => picture(a))
          .replace('<!--LOGO-INTRO-->', logoInline)
          .replaceAll('@base/', base);
      },
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [cmHtml()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        cookie: resolve(import.meta.dirname, 'cookie.html'),
        ...Object.fromEntries(categorie.map((a) => [a.slug, resolve(import.meta.dirname, `${a.slug}/index.html`)])),
        crediti: resolve(import.meta.dirname, 'crediti.html'),
      },
    },
  },
});
