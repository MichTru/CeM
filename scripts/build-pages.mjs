// Genera le pagine per ambiente (cucine/, zona-giorno/, …) dai dati in src/data.
// Parte da solo prima di ogni build (npm run build); a mano: node scripts/build-pages.mjs
import fs from 'node:fs';

const SITE = 'https://michtru.github.io/CeM/';
const read = (f) => JSON.parse(fs.readFileSync(`src/data/${f}`, 'utf8'));
const ambienti = read('ambienti.json');
const images = read('images.json');
const collezioni = read('collezioni.json').items;
const occasioni = read('occasioni.json').items;
const storie = read('storie.json').items;

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const img = (name, sizes, extra = '') => (images[name] ? `<cm-img name="${name}" sizes="${sizes}"${extra}></cm-img>` : '');
const ph = (label) => `<div class="ph" data-ph="${esc(label)}"><span>Foto da inserire · ${esc(label)}</span></div>`;
const media = (name, label, sizes) => img(name, sizes) || ph(label);

function prefill(form, msg, label) {
  return `<button type="button" class="btn btn--ghost btn--sm" data-prefill data-ambiente="${esc(form)}" data-msg="${esc(msg)}">${esc(label)}</button>`;
}

function productCard(a, p) {
  const mat = (p.materiali || []).map((m) => `<li>${esc(m)}</li>`).join('');
  return `
        <article class="pcard reveal-card">
          <div class="pcard__media">${media(p.immagine, `${p.marchio} · ${p.nome}`, '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw')}${p.in_showroom ? '<span class="tag pcard__flag">In showroom</span>' : ''}</div>
          <div class="pcard__body">
            <span class="pcard__brand">${esc(p.marchio)}</span>
            <h4 class="pcard__title">${esc(p.nome)}</h4>
            ${p.descrizione ? `<p>${esc(p.descrizione)}</p>` : ''}
            ${mat ? `<ul class="pcard__mat" aria-label="Materiali">${mat}</ul>` : ''}
            ${prefill(a.form, `Vorrei vedere in showroom: ${p.marchio}, ${p.nome}.`, 'Vienila a vedere')}
          </div>
        </article>`;
}

function brandTile(a, marchio) {
  return `
        <article class="btile reveal-card" id="marchio-${slugify(marchio)}">
          <span class="btile__kicker">In showroom</span>
          <h3 class="btile__name">${esc(marchio)}</h3>
          <p>Le collezioni arrivano presto anche qui: in showroom puoi già vederle dal vero.</p>
          ${prefill(a.form, `Vorrei vedere in showroom le collezioni ${marchio}.`, `Chiedi di ${marchio}`)}
        </article>`;
}

function collezioniSection(a) {
  if (!a.marchi.length) return '';
  const withItems = a.marchi.filter((m) => collezioni.some((c) => c.ambiente === a.slug && c.marchio === m));
  const without = a.marchi.filter((m) => !withItems.includes(m));
  const rows = withItems.map((m) => {
    const cards = collezioni.filter((c) => c.ambiente === a.slug && c.marchio === m).map((p) => productCard(a, p)).join('');
    return `
      <div class="brandrow" id="marchio-${slugify(m)}">
        <h3 class="brandrow__name">${esc(m)}</h3>
        <div class="brandrow__cards">${cards}
        </div>
      </div>`;
  }).join('');
  const tiles = without.length ? `
      <div class="btiles">${without.map((m) => brandTile(a, m)).join('')}
      </div>` : '';
  return `
    <section class="section collezioni" id="collezioni" aria-labelledby="collezioni-title">
      <div class="section__head">
        <h2 class="h-display" id="collezioni-title">Le collezioni</h2>
        <p class="lead">I marchi di ${esc(a.nome.toLowerCase())} che trovi nel nostro showroom di Lugo.</p>
      </div>${rows}${tiles}
    </section>`;
}

function occasioniSection(a) {
  if (a.slug === 'su-misura') return '';
  const items = occasioni.filter((o) => o.ambiente === a.slug);
  const cards = items.length
    ? items.map((o) => `
        <article class="pcard pcard--deal reveal-card">
          <div class="pcard__media">${media(o.immagine, `${o.marchio || ''} ${o.nome}`.trim(), '(max-width: 600px) 100vw, 33vw')}<span class="tag pcard__flag">Occasione</span></div>
          <div class="pcard__body">
            ${o.marchio ? `<span class="pcard__brand">${esc(o.marchio)}</span>` : ''}
            <h4 class="pcard__title">${esc(o.nome)}</h4>
            ${o.descrizione ? `<p>${esc(o.descrizione)}</p>` : ''}
            ${o.prezzo ? `<p class="pcard__price">${o.prezzo_listino ? `<s>${esc(o.prezzo_listino)}</s> ` : ''}<strong>${esc(o.prezzo)}</strong></p>` : ''}
            ${prefill(a.form, `Mi interessa l'occasione: ${o.marchio ? `${o.marchio}, ` : ''}${o.nome}.`, 'La voglio vedere')}
          </div>
        </article>`).join('')
    : [1, 2, 3].map(() => `
        <article class="pcard pcard--ph reveal-card">
          <div class="pcard__media">${ph('Occasione d\'esposizione')}<span class="tag pcard__flag">Occasione</span></div>
          <div class="pcard__body">
            <h4 class="pcard__title">Pezzo d'esposizione</h4>
            <p>Qui compariranno i pezzi d'esposizione e fine serie disponibili in showroom.</p>
          </div>
        </article>`).join('');
  return `
    <section class="section occasioni" id="occasioni" aria-labelledby="occasioni-title">
      <div class="section__head section__head--row">
        <h2 class="h-display" id="occasioni-title">Occasioni<br>in showroom</h2>
        <p class="lead">Pezzi d'esposizione e fine serie, da vedere e portare a casa.</p>
      </div>
      <div class="cards3">${cards}
      </div>
    </section>`;
}

function storieSection(a) {
  const items = storie.filter((s) => s.ambiente === a.slug);
  const cards = items.length
    ? items.map((s) => `
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
        </article>`).join('')
    : `
        <article class="story story--ph reveal-card">
          <div class="story__media">${ph('Storia di progetto')}</div>
          <div class="story__body">
            <h3 class="story__title">Storie di progetto</h3>
            <dl class="story__steps">
              <div><dt>La richiesta</dt><dd>Che cosa ci ha chiesto il cliente.</dd></div>
              <div><dt>Il progetto</dt><dd>Come l'abbiamo pensata, tra showroom e falegnameria.</dd></div>
              <div><dt>Il risultato</dt><dd>Le foto del lavoro finito, a casa sua.</dd></div>
            </dl>
          </div>
        </article>`;
  return `
    <section class="section storie" aria-labelledby="storie-title">
      <div class="section__head">
        <h2 class="h-display" id="storie-title">Dal progetto<br>alla casa</h2>
      </div>
      <div class="storie__list">${cards}
      </div>
    </section>`;
}

function misuraSections(a) {
  if (a.slug !== 'su-misura') {
    return `
    <section class="section plus" aria-label="Su misura">
      <a class="plus__card" href="@base/su-misura/">
        <div class="plus__media">${img('su-misura-dettaglio-maniglia', '(max-width: 860px) 100vw, 40vw', ' alt=""')}</div>
        <div class="plus__body">
          <span class="tag">Falegnameria propria</span>
          <h2 class="plus__title">Serve un pezzo in più?<br>Lo facciamo su misura.</h2>
          <p>Nella nostra falegnameria di Massa Lombarda adattiamo e completiamo i mobili, sulle misure di casa tua.</p>
          <span class="round-arrow" aria-hidden="true"><svg class="ico"><use href="#i-arrow"/></svg></span>
        </div>
      </a>
    </section>`;
  }
  const steps = [
    ['L\'idea', 'Si parte da te: come vivi la casa, che cosa ti serve, che cosa ti piace.'],
    ['Il progetto', 'Rilievo delle misure, disegno e scelta di legni, laccature e ferramenta.'],
    ['La falegnameria', 'A Massa Lombarda il progetto diventa mobile, pezzo per pezzo.'],
    ['Il montaggio', 'Marco e Mauro seguono consegna e montaggio, e restano al tuo fianco anche dopo.'],
  ];
  return `
    <section class="section percorso" aria-labelledby="percorso-title">
      <div class="section__head">
        <h2 class="h-display" id="percorso-title">Dall'idea<br>al montaggio</h2>
      </div>
      <ol class="percorso__list">${steps.map(([t, d], i) => `
        <li class="percorso__step reveal-card">
          <div class="percorso__media">${i === 1 ? img('su-misura-modulo-rovere', '(max-width: 860px) 100vw, 25vw', ' alt=""') : ph(['Idea e sopralluogo', '', 'Falegnameria di Massa Lombarda', 'Montaggio'][i])}</div>
          <h3>${t}</h3>
          <p>${d}</p>
        </li>`).join('')}
      </ol>
    </section>
    <section class="section officina" aria-labelledby="officina-title">
      <div class="officina__grid">
        <div class="officina__big">${ph('Falegnameria di Massa Lombarda')}</div>
        <div class="officina__small">${img('su-misura-dettaglio-maniglia', '(max-width: 860px) 100vw, 30vw')}</div>
        <div class="officina__small">${ph('Legni e finiture')}</div>
        <div class="officina__text">
          <h2 class="h-display" id="officina-title">La nostra<br>falegnameria</h2>
          <p>Un laboratorio vero, a pochi chilometri dallo showroom: per questo possiamo adattare un mobile di serie o costruirne uno nuovo, e seguirlo fino a casa tua.</p>
        </div>
      </div>
    </section>`;
}

function altriSection(a) {
  const others = ambienti.filter((o) => o.slug !== a.slug);
  return `
    <section class="section altri" aria-labelledby="altri-title">
      <h2 class="h-display altri__title" id="altri-title">Altri ambienti</h2>
      <ul class="altri__list">${others.map((o) => `
        <li>
          <a class="altri__card" href="@base/${o.slug}/">
            <div class="altri__media">${media(o.hero, o.nome, '(max-width: 600px) 50vw, 20vw')}</div>
            <span class="altri__name">${esc(o.nome)}</span>
            <span class="round-arrow" aria-hidden="true"><svg class="ico"><use href="#i-arrow"/></svg></span>
          </a>
        </li>`).join('')}
      </ul>
    </section>`;
}

function page(a) {
  const url = `${SITE}${a.slug}/`;
  const hero = images[a.hero];
  const srcset = hero ? hero.widths.map((w) => `@base/img/${a.hero}-${w}.avif ${w}w`).join(', ') : '';
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: a.nome, item: url },
        ],
      },
      {
        '@type': 'WebPage',
        name: a.title,
        description: a.description,
        url,
        about: { '@id': `${SITE}#store` },
        isPartOf: { '@type': 'WebSite', name: 'Cassani & Martignani', url: SITE },
      },
    ],
  };
  const brands = a.marchi.length
    ? `<ul class="brands brands--links" aria-label="Marchi">${a.marchi.map((m) => `<li><a href="#marchio-${slugify(m)}">${esc(m)}</a></li>`).join('')}</ul>`
    : '';

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(a.title)}</title>
  <meta name="description" content="${esc(a.description)}">
  <meta name="theme-color" content="#16110D">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="@base/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="@base/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="@base/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="Cassani &amp; Martignani">
  <meta property="og:title" content="${esc(a.title)}">
  <meta property="og:description" content="${esc(a.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <script>document.documentElement.classList.add('js','no-intro');if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reduced');</script>
  <link rel="preload" href="@base/fonts/archivo-expanded-maiuscole.woff2" as="font" type="font/woff2" crossorigin>
  ${hero ? `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset}" imagesizes="(max-width: 860px) 100vw, 96vw" fetchpriority="high">` : ''}
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <script type="module" src="/src/page.js"></script>
</head>
<body class="page page--${a.slug}" data-ambiente="${esc(a.form)}">
  <a class="skip" href="#contenuto">Vai al contenuto</a>
  <div class="ambient" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="grain" aria-hidden="true"></div>
  <!--PARTIAL:floatnav-->
  <!--PARTIAL:menu-->

  <main id="contenuto">
    <section class="shell" id="top" aria-label="${esc(a.nome)}">
      <header class="topbar">
        <a class="topbar__logo" href="@base/" aria-label="Cassani &amp; Martignani, home">
          <img src="@base/logo/logo-cassani-martignani-light.svg" alt="" width="190" height="42" id="header-logo">
        </a>
        <nav class="topbar__nav" aria-label="Principale">
          <ul>
            <li><a href="@base/#chi-siamo">Chi siamo</a></li>
            <li><a href="@base/#ambienti">Ambienti</a></li>
            <li><a href="@base/su-misura/"${a.slug === 'su-misura' ? ' aria-current="page"' : ''}>Su misura</a></li>
            <li><a href="@base/#galleria">Galleria</a></li>
          </ul>
        </nav>
        <a class="btn btn--light topbar__cta" href="#contatti">Prenota <svg class="ico" aria-hidden="true"><use href="#i-mail"/></svg></a>
        <button class="burger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
      </header>

      <div class="phero" id="hero">
        <div class="phero__frame">
          <div class="phero__media">${img(a.hero, '(max-width: 860px) 100vw, 96vw', ' loading="eager" fetchpriority="high"')}</div>
          <div class="hero__shade" aria-hidden="true"></div>
          <div class="hero__copy">
            <nav class="crumbs" aria-label="Percorso"><a href="@base/">Home</a><span aria-hidden="true">/</span><span aria-current="page">${esc(a.nome)}</span></nav>
            <h1 class="hero__title phero__title">${a.h1.map(esc).join('<br>')}</h1>
            <p class="hero__sub">${esc(a.sub)}</p>
            <div class="phero__btns">
              <a class="btn btn--light" href="#contatti" data-prefill data-ambiente="${esc(a.form)}">Prenota una visita</a>
              ${a.marchi.length ? '<a class="btn btn--ghost" href="#collezioni">Le collezioni</a>' : ''}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section pintro" aria-label="In showroom">
      <div class="pintro__grid">
        <p class="pintro__lead">${esc(a.lead)}</p>
        <div class="pintro__text">
          ${a.testo.map((t) => `<p>${esc(t)}</p>`).join('\n          ')}
          ${brands}
        </div>
      </div>
    </section>
${collezioniSection(a)}${occasioniSection(a)}${misuraSections(a)}${storieSection(a)}${altriSection(a)}

    <!--PARTIAL:contatti-->
  </main>

  <!--PARTIAL:footer-->
  <!--PARTIAL:tail-->
</body>
</html>
`;
}

for (const a of ambienti) {
  fs.mkdirSync(a.slug, { recursive: true });
  fs.writeFileSync(`${a.slug}/index.html`, page(a));
}
console.log('pagine:', ambienti.map((a) => a.slug).join(', '));
