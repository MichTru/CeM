// Genera le pagine di categoria (cucine/, divani-e-poltrone/, …), la griglia delle categorie
// e il partial della galleria dai dati in src/data. Parte da solo prima di ogni build.
import fs from 'node:fs';

const SITE = 'https://michtru.github.io/CeM/';
const read = (f) => JSON.parse(fs.readFileSync(`src/data/${f}`, 'utf8'));
const categorie = read('categorie.json');
const images = read('images.json');
const proposte = read('proposte.json').items;
const percorsi = read('percorsi.json');
const occasioni = read('occasioni.json').items;
const storie = read('storie.json').items;
const ristr = read('ristrutturi.json');

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const img = (name, sizes, extra = '') => (images[name] ? `<cm-img name="${name}" sizes="${sizes}"${extra}></cm-img>` : '');
const ph = (label) => `<div class="ph" data-ph="${esc(label)}"><span>Foto da inserire · ${esc(label)}</span></div>`;
const media = (name, label, sizes, extra = '') => img(name, sizes, extra) || ph(label);
const arrow = '<span class="round-arrow" aria-hidden="true"><svg class="ico"><use href="#i-arrow"/></svg></span>';

function prefill(form, msg, label, cls = 'btn btn--ghost btn--sm') {
  return `<button type="button" class="${cls}" data-prefill data-ambiente="${esc(form)}" data-msg="${esc(msg)}">${esc(label)}</button>`;
}

// --- Blocchi della pagina di categoria ----------------------------------------

function proposalCard(c, p) {
  const tipo = c.tipi.find((t) => t.id === p.tipo);
  const marchi = p.marchi || []; // i marchi della categoria stanno una volta sola nell'introduzione
  return `
        <article class="pcard reveal-card" data-tipo="${p.tipo}" data-id="${p.id}">
          <div class="pcard__media">${media(p.img, p.titolo, '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw', ' alt=""')}</div>
          <div class="pcard__body">
            ${tipo ? `<span class="pcard__brand">${esc(tipo.nome)}</span>` : ''}
            <h3 class="pcard__title">${esc(p.titolo)}</h3>
            <p>${esc(p.testo)}</p>
            ${marchi.length ? `<p class="pcard__brands"><span>In showroom</span> ${marchi.map(esc).join(' · ')}</p>` : ''}
            ${prefill(c.form, `Vorrei vedere in showroom: ${p.titolo} (${c.nome.toLowerCase()}).`, 'La voglio vedere')}
          </div>
        </article>`;
}

function proposteSection(c) {
  const items = proposte.filter((p) => p.cat === c.slug);
  if (!items.length) return '';
  const chips = c.tipi.length > 1
    ? `<div class="filters" role="group" aria-label="Filtra per tipo">
          <button type="button" class="filter is-on" aria-pressed="true" data-pf="tutti" data-desc="">Tutte</button>${c.tipi.filter((t) => items.some((p) => p.tipo === t.id)).map((t) => `
          <button type="button" class="filter" aria-pressed="false" data-pf="${t.id}" data-desc="${esc(t.testo)}">${esc(t.nome)}</button>`).join('')}
        </div>`
    : '';
  return `
    <section class="section proposte" id="proposte" aria-labelledby="proposte-title">
      <div class="section__head section__head--row">
        <h2 class="h-display" id="proposte-title">${esc(c.tipiTitolo || 'Le proposte')}</h2>
        ${chips}
      </div>
      <p class="proposte__desc" id="proposte-desc" aria-live="polite"></p>
      <div class="cards3 proposte__grid" id="proposte-grid">${items.map((p) => proposalCard(c, p)).join('')}
      </div>
      <a class="proposte__misura" href="@base/su-misura/"><span>Ogni proposta si adatta alle tue misure: i pezzi che mancano li costruiamo nella nostra falegnameria di Massa Lombarda.</span> ${arrow}</a>
    </section>`;
}

function percorsoSection(c) {
  const p = c.percorso && percorsi[c.percorso];
  if (!p) return '';
  const data = { form: c.form, nome: c.nome, domande: p.domande, proposte: proposte.filter((x) => x.cat === c.slug).map(({ id, tipo, tag, titolo }) => ({ id, tipo, tag, titolo })) };
  return `
    <section class="section guida" id="percorso" aria-labelledby="guida-title">
      <div class="guida__card">
        <div class="guida__intro">
          <span class="tag">Percorso guidato</span>
          <h2 class="guida__title" id="guida-title">${esc(p.titolo)}</h2>
          <p>${esc(p.intro)}</p>
        </div>
        <div class="guida__app" id="guida" data-percorso="${c.percorso}">
          <noscript><p>Il percorso guidato funziona con JavaScript attivo: in alternativa sfoglia le proposte qui sotto.</p></noscript>
        </div>
      </div>
      <script type="application/json" id="guida-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
    </section>`;
}

const EXTRA = {
  elettrodomestici: {
    titolo: 'Elettrodomestici da incasso',
    testo: 'Li scegliamo insieme alla cucina, così misure, prese e scarichi sono pensati fin dall\'inizio, e li installa la nostra squadra. Forni, piani a induzione e a gas, cappe, frigoriferi, lavastoviglie e lavelli dei grandi marchi.',
    marchi: ['AEG', 'Electrolux', 'Siemens', 'Bosch', 'Whirlpool', 'Beko', 'Grundig', 'Miele', 'Franke', 'Foster'],
    img: 'stock-elettrodomestici',
    form: 'Elettrodomestici',
  },
  complementi: {
    titolo: 'Il tocco finale',
    testo: 'Carte da parati, specchi e complementi d\'arredo completano la stanza e la rendono tua. Li abbiniamo al progetto perché l\'insieme resti coerente.',
    marchi: ['LondonArt', 'Pezzani'],
    img: 'stock-complementi',
    form: 'Complementi',
  },
};

function extraSection(c) {
  const e = EXTRA[c.extra];
  if (!e) return '';
  return `
    <section class="section extra" aria-labelledby="extra-title">
      <div class="extra__card reveal-card">
        <div class="extra__media">${media(e.img, e.titolo, '(max-width: 860px) 100vw, 45vw', ' alt=""')}</div>
        <div class="extra__body">
          <h2 class="extra__title" id="extra-title">${esc(e.titolo)}</h2>
          <p>${esc(e.testo)}</p>
          <ul class="brands" aria-label="Marchi">${e.marchi.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
          ${prefill(e.form, `Vorrei informazioni su: ${e.titolo.toLowerCase()}.`, 'Chiedi informazioni')}
        </div>
      </div>
    </section>`;
}

function occasioniSection(c) {
  const items = occasioni.filter((o) => o.ambiente === c.slug);
  if (!items.length) return '';
  return `
    <section class="section occasioni" id="occasioni" aria-labelledby="occasioni-title">
      <div class="section__head section__head--row">
        <h2 class="h-display" id="occasioni-title">Occasioni<br>in showroom</h2>
        <p class="lead">Pezzi d'esposizione e fine serie, da vedere e portare a casa.</p>
      </div>
      <div class="cards3">${items.map((o) => `
        <article class="pcard pcard--deal reveal-card">
          <div class="pcard__media">${media(o.immagine, o.nome, '(max-width: 600px) 100vw, 33vw')}<span class="tag pcard__flag">Occasione</span></div>
          <div class="pcard__body">
            ${o.marchio ? `<span class="pcard__brand">${esc(o.marchio)}</span>` : ''}
            <h3 class="pcard__title">${esc(o.nome)}</h3>
            ${o.descrizione ? `<p>${esc(o.descrizione)}</p>` : ''}
            ${o.prezzo ? `<p class="pcard__price">${o.prezzo_listino ? `<s>${esc(o.prezzo_listino)}</s> ` : ''}<strong>${esc(o.prezzo)}</strong></p>` : ''}
            ${prefill(c.form, `Mi interessa l'occasione: ${o.marchio ? `${o.marchio}, ` : ''}${o.nome}.`, 'La voglio vedere')}
          </div>
        </article>`).join('')}
      </div>
    </section>`;
}

function storieSection(c) {
  const items = storie.filter((s) => s.ambiente === c.slug);
  if (!items.length) return '';
  return `
    <section class="section storie" aria-labelledby="storie-title">
      <div class="section__head">
        <h2 class="h-display" id="storie-title">Dal progetto<br>alla casa</h2>
      </div>
      <div class="storie__list">${items.map((s) => `
        <article class="story reveal-card">
          <div class="story__media">${media(s.immagini?.[0], s.titolo, '(max-width: 860px) 100vw, 60vw')}</div>
          <div class="story__body">
            <h3 class="story__title">${esc(s.titolo)}</h3>
            ${s.luogo ? `<p class="story__place">${esc(s.luogo)}</p>` : ''}
            <dl class="story__steps">
              <div><dt>La richiesta</dt><dd>${esc(s.richiesta)}</dd></div>
              <div><dt>Il progetto</dt><dd>${esc(s.progetto)}</dd></div>
              <div><dt>Il risultato</dt><dd>${esc(s.risultato)}</dd></div>
            </dl>
          </div>
        </article>`).join('')}
      </div>
    </section>`;
}

// Il metodo di lavoro: un solo racconto, con le stesse tappe, in Su misura e Ristrutturi
function metodoSection(titolo, sottotitolo) {
  return `
    <section class="section tappe" id="tappe" aria-labelledby="tappe-title">
      <div class="tappe__grid">
        <div class="tappe__head">
          <h2 class="h-display" id="tappe-title">${titolo}</h2>
          <p class="lead">${esc(sottotitolo)}</p>
          <div class="tappe__line" aria-hidden="true"><i></i></div>
        </div>
        <ol class="tappe__list">${ristr.tappe.map((t) => `
          <li class="tappa">
            <div class="tappa__media">${media(t.img, t.titolo, '(max-width: 860px) 100vw, 40vw', ' alt=""')}</div>
            <div class="tappa__body">
              <h3>${esc(t.titolo)}</h3>
              <p>${esc(t.testo)}</p>
            </div>
          </li>`).join('')}
        </ol>
      </div>
    </section>`;
}

function misuraSections(c) {
  if (c.slug !== 'su-misura') return ''; // nelle categorie il su misura è una riga dentro le proposte
  return metodoSection('Dal progetto<br>alla casa', 'Gli stessi passaggi, che tu stia arredando una stanza o tutta la casa.') + `
    <section class="section officina" aria-labelledby="officina-title">
      <div class="officina__grid">
        <div class="officina__big">${ph('Falegnameria di Massa Lombarda')}</div>
        <div class="officina__small">${img('su-misura-dettaglio-maniglia', '(max-width: 860px) 100vw, 30vw')}</div>
        <div class="officina__small">${media('stock-legno-tavole', 'Legni e finiture', '(max-width: 860px) 100vw, 30vw', ' alt=""')}</div>
        <div class="officina__text">
          <h2 class="officina__title" id="officina-title">La nostra falegnameria</h2>
          <p>Un laboratorio vero, a pochi chilometri dallo showroom: per questo possiamo adattare un mobile di serie o costruirne uno nuovo, e seguirlo fino a casa tua.</p>
        </div>
      </div>
    </section>`;
}

function altriSection(c) {
  const others = (c.correlate || []).map((k) => categorie.find((o) => o.slug === k)).filter(Boolean);
  if (!others.length) return '';
  return `
    <section class="section altri" aria-labelledby="altri-title">
      <h2 class="altri__title" id="altri-title">${c.altriTitolo || 'Potrebbe interessarti anche'}</h2>
      <ul class="altri__list">${others.map((o) => `
        <li>
          <a class="altri__card" href="@base/${o.slug}/">
            <div class="altri__media">${media(o.tile, o.nome, '(max-width: 600px) 50vw, 15vw', ' alt="" nobadge')}</div>
            <span class="altri__name">${esc(o.nome)}</span>
            ${arrow}
          </a>
        </li>`).join('')}
      </ul>
    </section>`;
}

function page(c) {
  const url = `${SITE}${c.slug}/`;
  const hero = images[c.hero];
  const srcset = hero ? hero.widths.map((w) => `@base/img/${c.hero}-${w}.avif ${w}w`).join(', ') : '';
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: c.nome, item: url },
      ] },
      { '@type': 'WebPage', name: c.title, description: c.description, url, about: { '@id': `${SITE}#store` }, isPartOf: { '@type': 'WebSite', name: 'Cassani & Martignani', url: SITE } },
    ],
  };
  const brands = c.marchi.length
    ? `<p class="pintro__label">${esc(c.marchiLabel)}</p><ul class="brands" aria-label="${esc(c.marchiLabel)}">${c.marchi.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`
    : '';

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(c.title)}</title>
  <meta name="description" content="${esc(c.description)}">
  <meta name="theme-color" content="#16110D">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="@base/favicon-v3.svg" type="image/svg+xml">
  <link rel="icon" href="@base/favicon-v3-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="@base/apple-touch-icon-v3.png">
  <link rel="manifest" href="@base/manifest.webmanifest?v=3">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="C&amp;M Arredi">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="Cassani &amp; Martignani">
  <meta property="og:title" content="${esc(c.title)}">
  <meta property="og:description" content="${esc(c.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <script>document.documentElement.classList.add('js','no-intro');if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reduced');</script>
  <link rel="preload" href="@base/fonts/archivo-expanded-maiuscole.woff2" as="font" type="font/woff2" crossorigin>
  ${hero ? `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset}" imagesizes="(max-width: 860px) 100vw, 96vw" fetchpriority="high">` : ''}
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <script type="module" src="/src/page.js"></script>
</head>
<body class="page page--${c.slug}" data-ambiente="${esc(c.form)}">
  <a class="skip" href="#contenuto">Vai al contenuto</a>
  <div class="ambient" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="grain" aria-hidden="true"></div>
  <!--PARTIAL:floatnav-->
  <!--PARTIAL:menu-->

  <main id="contenuto">
    <section class="shell" id="top" aria-label="${esc(c.nome)}">
      <header class="topbar">
        <a class="topbar__logo" href="@base/" aria-label="Cassani &amp; Martignani, home">
          <img src="@base/logo/logo-cassani-martignani-light.svg" alt="" width="190" height="42" id="header-logo">
        </a>
        <nav class="topbar__nav" aria-label="Principale">
          <ul>
            <li><a href="@base/#chi-siamo">Chi siamo</a></li>
            <li><a href="@base/#categorie">Prodotti</a></li>
            <li><a href="@base/su-misura/"${c.slug === 'su-misura' ? ' aria-current="page"' : ''}>Su misura</a></li>
            <li><a href="@base/ristrutturi/">Ristrutturi</a></li>
          </ul>
        </nav>
        <a class="btn btn--light topbar__cta" href="#contatti">Prenota <svg class="ico" aria-hidden="true"><use href="#i-mail"/></svg></a>
        <button class="burger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
      </header>

      <div class="phero" id="hero">
        <div class="phero__frame">
          <div class="phero__media">${img(c.hero, '(max-width: 860px) 100vw, 96vw', ' loading="eager" fetchpriority="high"')}</div>
          <div class="hero__shade" aria-hidden="true"></div>
          <div class="hero__copy">
            <nav class="crumbs" aria-label="Percorso"><a href="@base/">Home</a><span aria-hidden="true">/</span><span aria-current="page">${esc(c.nome)}</span></nav>
            <h1 class="hero__title phero__title">${c.h1.map(esc).join('<br>')}</h1>
            <p class="hero__sub">${esc(c.sub)}</p>
            <div class="phero__btns">
              ${c.percorso ? `<a class="btn btn--light" href="#percorso">${esc(percorsi[c.percorso].titolo)}</a>` : `<a class="btn btn--light" href="#contatti" data-prefill data-ambiente="${esc(c.form)}">Prenota una visita</a>`}
              ${c.tipi.length ? '<a class="btn btn--ghost" href="#proposte">Le proposte</a>' : ''}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section pintro" aria-label="In showroom">
      <div class="pintro__grid">
        <p class="pintro__lead">${esc(c.lead)}</p>
        <div class="pintro__text">
          ${c.testo.map((t) => `<p>${esc(t)}</p>`).join('\n          ')}
          ${brands}
        </div>
      </div>
    </section>
${percorsoSection(c)}${proposteSection(c)}${extraSection(c)}${misuraSections(c)}${occasioniSection(c)}${storieSection(c)}${altriSection(c)}

    <!--PARTIAL:prenota-->
  </main>

  <!--PARTIAL:footer-->
  <!--PARTIAL:tail-->
</body>
</html>
`;
}

// --- Galleria della home -------------------------------------------------------
const CATS = { cucine: 'Cucine', giorno: 'Zona giorno', notte: 'Zona notte', misura: 'Su misura' };
const galleria = read('galleria.json').items;
const tileHTML = (g) => {
  const cap = `<div class="tile__cap"><span>${CATS[g.cat]}</span><h3>${esc(g.titolo)}</h3></div>`;
  if (!g.img || !images[g.img]) return `
        <li class="tile tile--ph" data-cat="${g.cat}">
          ${ph(g.ph || g.titolo)}
          ${cap}
        </li>`;
  const sizes = '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 60vw';
  const inner = g.video
    ? `<video class="loop" muted loop playsinline preload="none" data-poster="@base/video/${g.video}-poster.webp" aria-hidden="true">
              <source src="@base/video/${g.video}.webm" type="video/webm">
              <source src="@base/video/${g.video}.mp4" type="video/mp4">
            </video>`
    : `<cm-img name="${g.img}" sizes="${sizes}" alt=""></cm-img>`;
  return `
        <li class="tile" data-cat="${g.cat}">
          <button type="button" class="tile__btn" data-full="${g.img}" data-title="${esc(g.titolo)}" data-cat-label="${CATS[g.cat]}"${images[g.img].stock ? ' data-stock' : ''} aria-label="Apri: ${esc(g.titolo)}">
            ${inner}
          </button>
          ${cap}
        </li>`;
};
const galleriaHome = galleria.filter((g) => g.home).slice(0, 6);
fs.writeFileSync('src/partials/galleria.html', `<ul class="grid grid--home" id="grid">${galleriaHome.map(tileHTML).join('')}
      </ul>
      <div class="galleria__more"><a class="btn btn--ghost" href="@base/galleria/">Vedi tutta la galleria <svg class="ico" aria-hidden="true"><use href="#i-arrow"/></svg></a></div>
`);

function galleriaPage() {
  const c = {
    slug: 'galleria', nome: 'Galleria', form: 'Casa intera',
    title: 'Galleria · Cassani & Martignani, arredamento a Lugo',
    description: 'Cucine, zona giorno, zona notte e su misura: le foto degli ambienti proposti nello showroom Cassani & Martignani di Lugo (RA).',
    h1: ['Galleria'], sub: 'Cucine, soggiorni, camere e su misura: gli ambienti da cui partire.',
    hero: 'stock-soggiorno-scuro', lead: '', testo: [], marchi: [], tipi: [], correlate: ['cucine', 'divani-e-poltrone', 'soggiorno'],
  };
  let html = page(c);
  const filters = `<div class="filters" role="group" aria-label="Filtra per ambiente">
          <button type="button" class="filter is-on" aria-pressed="true" data-f="tutti">Tutti</button>${Object.entries(CATS).map(([k, v]) => `
          <button type="button" class="filter" aria-pressed="false" data-f="${k}">${v}</button>`).join('')}
        </div>`;
  const body = `
    <section class="section galleria" id="galleria" aria-labelledby="galleria-title">
      <div class="section__head section__head--row">
        <h2 class="visually-hidden" id="galleria-title">Tutte le foto</h2>
        ${filters}
      </div>
      <ul class="grid" id="grid">${galleria.map(tileHTML).join('')}
      </ul>
    </section>`;
  html = html.replace(/\n    <section class="section pintro"[\s\S]*?<\/section>\n/, `\n${body}\n`);
  html = html.replace('<!--PARTIAL:tail-->', '<!--PARTIAL:lightbox-->\n  <!--PARTIAL:tail-->');
  fs.mkdirSync('galleria', { recursive: true });
  fs.writeFileSync('galleria/index.html', html);
}

// --- Griglia delle categorie in home -----------------------------------------
const catTiles = categorie.map((c, i) => {
  const inner = c.video
    ? `<video class="loop" muted loop playsinline preload="none" data-poster="@base/video/${c.video}-poster.webp" aria-hidden="true">
              <source src="@base/video/${c.video}.webm" type="video/webm">
              <source src="@base/video/${c.video}.mp4" type="video/mp4">
            </video>`
    : media(c.tile, c.nome, '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw', ' alt=""');
  return `
        <li class="cat cat--${i}">
          <a class="cat__link" href="@base/${c.slug}/">
            <div class="cat__media">${inner}</div>
            <div class="cat__body">
              <h3 class="cat__name">${esc(c.nome)}</h3>
              <p>${esc(c.sub)}</p>
            </div>
            ${arrow}
          </a>
        </li>`;
}).join('');
fs.writeFileSync('src/partials/categorie.html', `<ul class="cats" id="cats">${catTiles}\n      </ul>\n`);

// --- Crediti delle foto d'ispirazione -----------------------------------------
const stock = Object.entries(images).filter(([, v]) => v.stock);
fs.writeFileSync('src/partials/crediti.html', `<ul class="crediti">${stock.map(([k, v]) => `
      <li>
        <cm-img name="${k}" sizes="160px" alt="" nobadge></cm-img>
        <div>
          <p>${esc(v.alt)}</p>
          <p class="crediti__meta">${v.credit.autore ? `${esc(v.credit.autore)} · ` : ''}${esc(v.credit.fonte)} · ${esc(v.credit.licenza)}${v.credit.link ? ` · <a href="${esc(v.credit.link)}" target="_blank" rel="noopener">originale</a>` : ''}</p>
        </div>
      </li>`).join('')}
    </ul>\n`);

// --- Ristrutturi: pagina e fascia della home -----------------------------------
function ristrPage() {
  const c = {
    slug: 'ristrutturi', nome: 'Ristrutturi casa', form: 'Casa intera', title: ristr.title, description: ristr.description,
    h1: ristr.h1, sub: ristr.sub, hero: ristr.hero, lead: ristr.lead, testo: [], marchi: [], tipi: [],
    correlate: ristr.correlate, altriTitolo: 'Stanza per stanza',
  };
  let html = page(c);
  const body = metodoSection('Dal cantiere<br>alla casa finita', 'Cinque passaggi, un solo riferimento.') + `
    <section class="section servizi" aria-labelledby="servizi-title">
      <div class="servizi__grid">
        <div class="servizi__media">${img('stock-ristr-cantiere', '(max-width: 860px) 100vw, 40vw', ' alt=""')}</div>
        <div class="servizi__body">
          <h2 class="h-display" id="servizi-title">Cosa facciamo<br>per te</h2>
          <ul class="servizi__list">${ristr.servizi.map((v) => `
            <li><h3>${esc(v.titolo)}</h3><p>${esc(v.testo)}</p></li>`).join('')}
          </ul>
          <a class="btn btn--light" href="#contatti" data-prefill data-ambiente="Casa intera" data-msg="Sto ristrutturando casa e vorrei una consulenza per arredarla.">Prenota una consulenza</a>
        </div>
      </div>
    </section>`;
  // la pagina ristrutturi: tappe e servizi al posto dei blocchi di categoria
  html = html.replace(/(<\/section>\n\n    <section class="section pintro"[\s\S]*?<\/section>)/, `$1\n${body}`);
  html = html.replace(/<div class="phero__btns">[\s\S]*?<\/div>/, `<div class="phero__btns">
              <a class="btn btn--light" href="#contatti" data-prefill data-ambiente="Casa intera" data-msg="Sto ristrutturando casa e vorrei una consulenza per arredarla.">Prenota una consulenza</a>
              <a class="btn btn--ghost" href="#tappe">Come lavoriamo</a>
            </div>`);
  html = html.replace('<li><a href="@base/ristrutturi/">Ristrutturi</a></li>', '<li><a href="@base/ristrutturi/" aria-current="page">Ristrutturi</a></li>');
  fs.mkdirSync('ristrutturi', { recursive: true });
  fs.writeFileSync('ristrutturi/index.html', html);
}

fs.writeFileSync('src/partials/ristrutturi.html', `<a class="rhome" href="@base/ristrutturi/">
        <div class="rhome__media">${img(ristr.homeImg, '(max-width: 860px) 100vw, 50vw', ' alt=""')}</div>
        <div class="rhome__body">
          <span class="tag">Ristrutturi casa?</span>
          <h2 class="h-display rhome__title" id="ristrutturi-title">Dal cantiere<br>alla casa finita</h2>
          <p>Arrediamo tutta la casa insieme ai lavori: rilievo in cantiere, un unico preventivo, la nostra falegnameria per i pezzi su misura e i montaggi a fine lavori.</p>
          <ol class="rhome__steps" aria-label="Come lavoriamo">${ristr.tappe.map((t) => `<li>${esc(t.breve)}</li>`).join('')}</ol>
          <span class="btn btn--light">Come lavoriamo <svg class="ico" aria-hidden="true"><use href="#i-arrow"/></svg></span>
        </div>
      </a>
`);

// --- Menu mobile -------------------------------------------------------------
const chev = '<svg class="ico" aria-hidden="true"><use href="#i-chev"/></svg>';
fs.writeFileSync('src/partials/menu.html', `<!-- Menu mobile a schermo intero -->
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden data-lenis-prevent>
  <div class="menu__blade" aria-hidden="true"></div>
  <div class="menu__top">
    <a href="@base/" aria-label="Cassani &amp; Martignani, home"><img src="@base/logo/logo-cassani-martignani-light.svg" alt="" width="140" height="31"></a>
    <button type="button" class="menu__close" aria-label="Chiudi il menu"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg> Chiudi</button>
  </div>
  <div class="menu__body">
    <nav aria-label="Prodotti">
      <p class="menu__label">Prodotti</p>
      <ul class="menu__cats">${categorie.map((c) => `
        <li><a class="menu__cat" href="@base/${c.slug}/">${media(c.tile, c.nome, '170px', ' alt="" nobadge')}<span>${esc(c.nome)}</span></a></li>`).join('')}
      </ul>
    </nav>
    <nav aria-label="Menu principale">
      <ul class="menu__links">
        <li class="menu__home"><a href="@base/">Home ${chev}</a></li>
        <li><a href="@base/ristrutturi/">Ristrutturi casa? ${chev}</a></li>
        <li><a href="@base/#galleria">Galleria ${chev}</a></li>
        <li><a href="@base/#chi-siamo">Chi siamo ${chev}</a></li>
      </ul>
    </nav>
    <div class="menu__cta">
      <a class="btn btn--light" href="#contatti">Prenota una visita</a>
      <a class="btn btn--ghost" href="tel:+39054531440" aria-label="Chiama lo showroom"><svg class="ico" aria-hidden="true"><use href="#i-phone"/></svg> Chiama</a>
    </div>
    <div class="menu__info">
      <p class="status menu__status"><span class="status__dot"></span><span class="status__text">Orari dello showroom</span></p>
      <p>Via Francesco Baracca 70, 48022 Lugo (RA)</p>
      <p>Mar–sab 9:30–12:30 · 15:00–19:00 · Lun 15:00–19:00</p>
    </div>
  </div>
</div>
`);

// --- Recensioni: compaiono solo se ce ne sono di vere ------------------------
const recensioni = read('recensioni.json');
const stars = (n) => `<span class="rev__stars" aria-label="${n} stelle su 5">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`;
fs.writeFileSync('src/partials/recensioni.html', recensioni.items.length ? `<section class="section recensioni" id="recensioni" aria-labelledby="rev-title">
      <div class="section__head section__head--row">
        <h2 class="rev__title" id="rev-title">Dicono di noi</h2>
        ${recensioni.google_url ? `<a class="btn btn--ghost btn--sm" href="${esc(recensioni.google_url)}" target="_blank" rel="noopener">Tutte le recensioni su Google</a>` : ''}
      </div>
      <ul class="rev__list">${recensioni.items.map((r) => `
        <li class="rev">
          ${stars(r.stelle || 5)}
          <blockquote><p>${esc(r.testo)}</p></blockquote>
          <p class="rev__who">${esc(r.nome)}${r.quando ? ` · ${esc(r.quando)}` : ''}</p>
        </li>`).join('')}
      </ul>
    </section>
` : '<!-- recensioni: nessuna voce in src/data/recensioni.json -->\n');

// --- Schede dei pezzi indicati dai "+" -----------------------------------------
const schede = read('schede.json').items;
fs.writeFileSync('src/partials/schede.html', `<dialog class="sheet scheda" id="scheda" aria-labelledby="scheda-title" data-lenis-prevent>
  <div class="sheet__inner">
    <div class="sheet__top">
      <p class="sheet__title" id="scheda-kicker">Da vicino</p>
      <button type="button" class="menu__close" data-scheda-close aria-label="Chiudi la scheda"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg> Chiudi</button>
    </div>
    <div class="scheda__media"></div>
    <div class="scheda__body">
      <span class="pcard__brand" id="scheda-amb"></span>
      <h2 class="scheda__title" id="scheda-title"></h2>
      <p class="scheda__text" id="scheda-text"></p>
      <ul class="pcard__mat" id="scheda-mat" aria-label="Materiali"></ul>
      <div class="scheda__btns">
        <button type="button" class="btn btn--light" id="scheda-prenota" data-prefill>Lo voglio vedere in showroom</button>
        <a class="btn btn--ghost" id="scheda-link" href="#"></a>
      </div>
    </div>
  </div>
</dialog>
<script type="application/json" id="schede-data">${JSON.stringify(schede).replace(/</g, '\\u003c')}</script>
`);

// --- Regola: nessuna foto due volte nella stessa pagina --------------------------
// (il menu è escluso: è un pannello a parte). Avvisa durante la build.
const partials = (n) => (fs.existsSync(`src/partials/${n}.html`) ? fs.readFileSync(`src/partials/${n}.html`, 'utf8') : '');
function checkDupes(label, html) {
  let full = html;
  for (let k = 0; k < 3; k++) full = full.replace(/<!--PARTIAL:([a-z]+)-->/g, (_, n) => (n === 'menu' ? '' : partials(n)));
  const names = [...full.matchAll(/<cm-img name="([^"]+)"/g)].map((m) => m[1])
    .concat([...full.matchAll(/data-poster="@base\/video\/([^"]+)-poster/g)].map((m) => `video:${m[1]}`));
  const count = names.reduce((a, n) => ((a[n] = (a[n] || 0) + 1), a), {});
  const dup = Object.entries(count).filter(([, n]) => n > 1);
  if (dup.length) console.warn(`  ! foto ripetute in ${label}: ${dup.map(([n, k]) => `${n} ×${k}`).join(', ')}`);
  return dup.length;
}

// --- Pagine -------------------------------------------------------------------
for (const c of categorie) {
  fs.mkdirSync(c.slug, { recursive: true });
  fs.writeFileSync(`${c.slug}/index.html`, page(c));
}
ristrPage();
galleriaPage();
let dupPages = 0;
for (const slug of [...categorie.map((c) => c.slug), 'ristrutturi', 'galleria']) dupPages += checkDupes(slug, fs.readFileSync(`${slug}/index.html`, 'utf8')) ? 1 : 0;
dupPages += checkDupes('home', fs.readFileSync('index.html', 'utf8')) ? 1 : 0;
console.log(dupPages ? `regola foto: ${dupPages} pagine da sistemare` : 'regola foto: nessuna foto ripetuta');
console.log('pagine:', [...categorie.map((c) => c.slug), 'ristrutturi', 'galleria'].join(', '));
