import { gsap, reduced, finePointer, lenis } from './motion.js';
import { renderLikes } from './likes.js';

const BASE = import.meta.env.BASE_URL;

export function initBento() {
  const cards = [...document.querySelectorAll('.bento__card')];
  if (!reduced) {
    // Le card entrano in sequenza
    gsap.from(cards, {
      y: 40,
      opacity: 0,
      duration: 1.1,
      stagger: 0.12,
      scrollTrigger: { trigger: '.bento', start: 'top 92%', once: true },
    });
  }
  initHotspots();
  initSchede();
}

// "+" con le coordinate sulla foto intera (data-x/data-y in %): li riporta sul ritaglio
// che object-fit: cover lascia visibile. Se il punto esce dal ritaglio o finisce sotto
// i testi della hero, il "+" non compare.
function placeSpots(layer) {
  const W = +layer.dataset.w;
  const H = +layer.dataset.h;
  const cw = layer.offsetWidth;
  const ch = layer.offsetHeight;
  if (!cw || !ch) return;
  const img = layer.parentElement.querySelector('.pic img');
  const [px, py] = (img ? getComputedStyle(img).objectPosition : '50% 50%').split(' ').map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : 0.5));
  const s = Math.max(cw / W, ch / H);
  const dw = W * s;
  const dh = H * s;
  // l'ingombro vero dei testi (riga per riga), non il riquadro intero del blocco
  const avoid = [...layer.parentElement.querySelectorAll('.hero__copy > *, .hero__copy .phero__btns > *')].flatMap((el) => {
    if (el.classList.contains('phero__btns')) return [];
    const r = document.createRange();
    r.selectNodeContents(el);
    return [...r.getClientRects(), ...(el.matches('a, button') ? [el.getBoundingClientRect()] : [])];
  });
  const box = layer.getBoundingClientRect();
  const m = 26; // margine dai bordi
  layer.querySelectorAll('.hotspot[data-x]').forEach((spot) => {
    const x = (cw - dw) * px + (spot.dataset.x / 100) * dw;
    const y = (ch - dh) * py + (spot.dataset.y / 100) * dh;
    spot.style.left = `${x}px`;
    spot.style.top = `${y}px`;
    const vx = box.left + x;
    const vy = box.top + y;
    const inside = x > m && x < cw - m && y > m + 50 && y < ch - m;
    const covered = avoid.some((r) => vx > r.left - 44 && vx < r.right + 44 && vy > r.top - 36 && vy < r.bottom + 36);
    spot.hidden = !inside || covered;
    spot.classList.add('is-placed');
  });
}

export function initHotspots() {
  const layers = [...document.querySelectorAll('.hotspots[data-w]')];
  const place = () => layers.forEach(placeSpots);
  if (layers.length) {
    place();
    new ResizeObserver(place).observe(document.documentElement);
    document.fonts?.ready.then(place);
    setTimeout(place, 2000); // dopo l'entrata della hero, quando i testi sono al loro posto
  }

  // il "+" apre l'etichetta, l'etichetta apre la scheda del pezzo
  const spots = [...document.querySelectorAll('.hotspot')];
  const close = (s) => {
    s.classList.remove('is-open');
    s.querySelector('button').setAttribute('aria-expanded', 'false');
  };
  const open = (s) => {
    spots.forEach((o) => o !== s && close(o));
    s.classList.add('is-open');
    s.querySelector('button').setAttribute('aria-expanded', 'true');
  };
  spots.forEach((s) => {
    const btn = s.querySelector('button');
    // col mouse l'etichetta è già aperta dal passaggio: il click la tiene aperta
    btn.addEventListener('click', () => (s.classList.contains('is-open') && !finePointer ? close(s) : open(s)));
    if (finePointer) {
      s.addEventListener('mouseenter', () => open(s));
      s.addEventListener('mouseleave', () => close(s));
    }
    // con la tastiera l'etichetta si apre al focus; al tocco ci pensa il click
    btn.addEventListener('focus', () => { if (btn.matches(':focus-visible')) open(s); });
    s.addEventListener('focusout', (e) => { if (!s.contains(e.relatedTarget)) close(s); });
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && spots.forEach(close));
  document.addEventListener('click', (e) => !e.target.closest('.hotspot') && spots.forEach(close));
}

// Scheda del pezzo: foto ingrandita sul dettaglio, descrizione, materiali e prenotazione
export function initSchede() {
  const dlg = document.getElementById('scheda');
  const dataEl = document.getElementById('schede-data');
  if (!dlg || !dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const media = dlg.querySelector('.scheda__media');
  const $ = (id) => document.getElementById(id);

  function openScheda(key, from) {
    const d = data[key];
    if (!d) return;
    $('scheda-amb').textContent = d.ambiente;
    $('scheda-title').textContent = d.nome;
    $('scheda-text').textContent = d.testo;
    $('scheda-mat').innerHTML = (d.materiali || []).map((m) => `<li>${m}</li>`).join('');
    const link = $('scheda-link');
    const here = location.pathname.endsWith(`/${d.link.split('#')[0]}`) && !d.link.includes('#');
    link.hidden = here;
    link.href = `${BASE}${d.link}`;
    link.textContent = d.linkLabel;
    const pren = $('scheda-prenota');
    pren.dataset.ambiente = d.form;
    pren.dataset.msg = `Vorrei vedere in showroom: ${d.nome.toLowerCase()} (visto in foto sul sito).`;
    const like = $('scheda-like');
    if (like) {
      like.dataset.like = `scheda:${key}`;
      like.dataset.nome = d.nome;
      like.dataset.amb = d.ambiente;
      renderLikes();
    }

    // la stessa foto da cui si è partiti, ingrandita sul punto indicato
    const pic = from.closest('[data-scheda-host]')?.querySelector('.pic');
    media.innerHTML = '';
    if (pic) {
      const clone = pic.cloneNode(true);
      clone.querySelector('img').loading = 'eager';
      media.appendChild(clone);
      const img = clone.querySelector('img');
      const [x, y] = d.zoom || [50, 50];
      img.style.objectPosition = `${x}% ${y}%`;
      img.style.transformOrigin = `${x}% ${y}%`;
      if (!reduced) gsap.fromTo(img, { scale: 1 }, { scale: 1.9, duration: 1.2, ease: 'expo.out', delay: 0.1 });
      else img.style.transform = 'scale(1.9)';
    }
    lenis?.stop();
    dlg.showModal();
    dlg.querySelector('.sheet__inner').scrollTop = 0;
  }

  dlg.addEventListener('close', () => lenis?.start());
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-scheda-close]')) dlg.close();
    // "Lo voglio vedere": chiude la scheda e lascia che il modulo si precompili
    if (e.target.closest('#scheda-prenota') || e.target.closest('#scheda-link')) { lenis?.start(); dlg.close(); }
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-scheda]');
    if (b) openScheda(b.dataset.scheda, b);
  });
}
