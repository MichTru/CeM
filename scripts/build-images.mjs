// Prepara le foto del sito: correzione colore uniforme, tagli responsive
// AVIF/WebP e placeholder sfocato. Uso: npm run images
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const SRC = 'assets-src/sito';
const OUT = 'public/img';
const MANIFEST = 'src/data/images.json';
const WIDTHS = [480, 800, 1200, 1600];

const RENDERS = 'assets-src/3d';

// Render 3D del modulo su misura (scena Three.js del sito)
const renders = [
  {
    src: 'su-misura-modulo-rovere.png',
    name: 'su-misura-modulo-rovere',
    cat: 'misura',
    alt: 'Render di un modulo cucina su misura in rovere e laccato opaco, con anta aperta e cassetti estratti',
  },
  {
    src: 'su-misura-dettaglio-maniglia.png',
    name: 'su-misura-dettaglio-maniglia',
    cat: 'misura',
    alt: 'Render ravvicinato di un cassetto in rovere con maniglia in ottone',
  },
];

// Fondale caldo per i render: luce dall'alto a sinistra e pavimento appena più chiaro
function backdrop(w, h) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <radialGradient id="a" cx="28%" cy="18%" r="85%"><stop offset="0" stop-color="#4a3627"/><stop offset=".55" stop-color="#2a1f18"/><stop offset="1" stop-color="#17110d"/></radialGradient>
      <linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
      <linearGradient id="l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd6aa" stop-opacity="0"/><stop offset=".5" stop-color="#ffd6aa" stop-opacity=".07"/><stop offset="1" stop-color="#ffd6aa" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#a)"/>
    <rect y="62%" width="100%" height="38%" fill="url(#f)"/>
    <g transform="rotate(-24 ${w / 2} ${h / 2})"><rect x="-20%" y="20%" width="140%" height="9%" fill="url(#l)"/><rect x="-20%" y="38%" width="140%" height="5%" fill="url(#l)"/></g>
  </svg>`);
}

const photos = [
  {
    src: 'hs04-1600x888.jpg',
    name: 'cucina-isola-salvia-rovere-vetrine',
    cat: 'cucine',
    alt: 'Cucina con grande isola laccata verde salvia e vani a giorno in rovere, colonne con vetrine nere e forni a incasso',
  },
  {
    src: 'hs01-1600x888.jpg',
    name: 'cucina-loft-isola-cemento',
    cat: 'cucine',
    alt: 'Cucina in un loft con isola effetto cemento, colonne grigie e tavolo in legno con sedie colorate',
  },
  {
    src: 'hs02-1600x888.jpg',
    name: 'cucina-nera-penisola-legno',
    cat: 'cucine',
    alt: 'Cucina lineare nera opaca con penisola in legno, sgabelli alti e colonna forni',
  },
  {
    src: 'hs03-1-1600x888.jpg',
    name: 'cucina-bianca-angolo-legno-scuro',
    cat: 'cucine',
    alt: 'Cucina ad angolo bianca con mensole e colonne in legno scuro, pavimento in listoni chiari',
  },
  {
    src: 'hs06-1600x888.jpg',
    name: 'giorno-divano-velluto-verde-lampada',
    cat: 'giorno',
    alt: 'Soggiorno dai toni caldi con divano in velluto verde, poltrona girevole abbinata e lampada a sfere luminose',
  },
  {
    src: 'hs05-1600x888.jpg',
    name: 'giorno-divano-angolare-vetrata',
    cat: 'giorno',
    alt: 'Zona giorno con divano angolare grigio chiaro, tavolini neri e grande vetrata sul giardino',
  },
  {
    src: 'hs07-1600x888.jpg',
    name: 'giorno-parete-attrezzata-geometrica',
    cat: 'giorno',
    alt: 'Parete attrezzata sospesa con moduli geometrici in legno e laccato, mensole sagomate e mobile porta TV',
  },
  {
    src: 'home-chisiamo-1200x716-62.jpg',
    name: 'notte-armadio-bianco-maniglia-scura',
    cat: 'notte',
    alt: 'Armadio a tutta altezza bianco opaco con maniglia verticale in legno scuro, accanto a un tavolino in metallo',
  },
];

// Correzione uniforme: leggero riscaldamento del bianco, alte luci
// contenute e un filo di contrasto, perché le foto stiano sul fondo scuro.
function grade(img) {
  return img
    .recomb([
      [1.035, 0, 0],
      [0, 1.0, 0],
      [0, 0, 0.93],
    ])
    .linear(0.94, 4)
    .modulate({ saturation: 0.96 });
}

async function run() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  const manifest = {};
  for (const p of photos) {
    const file = path.join(SRC, p.src);
    const meta = await sharp(file).metadata();
    const widths = WIDTHS.filter((w) => w <= meta.width);
    if (!widths.includes(meta.width) && meta.width < WIDTHS.at(-1)) widths.push(meta.width);
    for (const w of widths) {
      const base = grade(sharp(file).resize({ width: w }));
      await base.clone().avif({ quality: 52, effort: 4 }).toFile(`${OUT}/${p.name}-${w}.avif`);
      await base.clone().webp({ quality: 74 }).toFile(`${OUT}/${p.name}-${w}.webp`);
    }
    const lqip = await grade(sharp(file).resize({ width: 24 })).blur(1.2).webp({ quality: 40 }).toBuffer();
    manifest[p.name] = {
      cat: p.cat,
      alt: p.alt,
      w: meta.width,
      h: meta.height,
      widths,
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    };
    console.log('ok', p.name, widths.join(','));
  }
  // Render con fondale per hero e bento
  for (const r of renders) {
    const file = path.join(RENDERS, r.src);
    const meta = await sharp(file).metadata();
    const flat = await sharp(backdrop(meta.width, meta.height)).composite([{ input: file }]).png().toBuffer();
    const widths = WIDTHS.filter((w) => w <= meta.width);
    for (const w of widths) {
      const base = sharp(flat).resize({ width: w });
      await base.clone().avif({ quality: 55, effort: 6 }).toFile(`${OUT}/${r.name}-${w}.avif`);
      await base.clone().webp({ quality: 78 }).toFile(`${OUT}/${r.name}-${w}.webp`);
    }
    const lqip = await sharp(flat).resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
    manifest[r.name] = { cat: r.cat, alt: r.alt, w: meta.width, h: meta.height, widths, lqip: `data:image/webp;base64,${lqip.toString('base64')}` };
    console.log('ok', r.name);
  }
  // Foto stock CC0 (Openverse) usate come foto d'ispirazione finché mancano quelle vere
  const STOCK = 'assets-src/stock';
  const alts = JSON.parse(await fs.readFile(`${STOCK}/alt.json`, 'utf8'));
  const credits = JSON.parse(await fs.readFile(`${STOCK}/credits.json`, 'utf8'));
  for (const [name, alt] of Object.entries(alts)) {
    const file = path.join(STOCK, `${name}.jpg`);
    const meta = await sharp(file).metadata();
    const widths = WIDTHS.filter((w) => w < meta.width);
    widths.push(meta.width);
    for (const w of widths) {
      const base = grade(sharp(file).resize({ width: w }));
      await base.clone().avif({ quality: 52, effort: 4 }).toFile(`${OUT}/${name}-${w}.avif`);
      await base.clone().webp({ quality: 76 }).toFile(`${OUT}/${name}-${w}.webp`);
    }
    const lqip = await grade(sharp(file).resize({ width: 24 })).blur(1.2).webp({ quality: 40 }).toBuffer();
    const c = credits[name] || {};
    manifest[name] = {
      cat: 'stock', alt, w: meta.width, h: meta.height, widths, stock: true,
      credit: { autore: c.creator || '', fonte: c.source || '', licenza: (c.license || '').toUpperCase(), link: c.foreign_landing_url || '' },
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    };
    console.log('ok', name, widths.join(','));
  }

  // Fallback statico della scena 3D: quattro fasi su fondo trasparente
  await fs.mkdir(`${OUT}/3d`, { recursive: true });
  for (let i = 1; i <= 4; i++) {
    await sharp(path.join(RENDERS, `fase-${i}.png`)).webp({ quality: 78, alphaQuality: 80 }).toFile(`${OUT}/3d/fase-${i}.webp`);
  }

  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 1));
}

run();
