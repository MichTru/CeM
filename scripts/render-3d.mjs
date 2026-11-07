// Renderizza la scena 3D in PNG: fallback statico, tab "Su misura" e card del bento.
// Uso: npx vite (in un altro terminale) e poi node scripts/render-3d.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';

const URL = process.env.RENDER_URL || 'http://localhost:5173/CeM/render/index.html';
const OUT = 'assets-src/3d';
fs.mkdirSync(OUT, { recursive: true });

const shots = [
  { name: 'fase-1', p: 0.1, view: 'scroll', w: 1200, h: 1000 },
  { name: 'fase-2', p: 0.42, view: 'scroll', w: 1200, h: 1000 },
  { name: 'fase-3', p: 0.62, view: 'scroll', w: 1200, h: 1000 },
  { name: 'fase-4', p: 1, view: 'scroll', w: 1200, h: 1000 },
  { name: 'su-misura-modulo-rovere', p: 0.97, view: 'hero', w: 1600, h: 900, bg: true },
  { name: 'su-misura-dettaglio-maniglia', p: 0, view: 'detail', w: 1200, h: 800, bg: true },
];

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(URL);
await page.waitForFunction(() => window.ready);
for (const s of shots) {
  const data = await page.evaluate(({ p, view, w, h }) => window.shot(p, view, w, h), s);
  fs.writeFileSync(`${OUT}/${s.name}.png`, Buffer.from(data.split(',')[1], 'base64'));
  console.log('ok', s.name);
}
await browser.close();
