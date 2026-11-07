import { gsap, lenis, reduced } from './motion.js';
import images from '../data/images.json';

const BASE = import.meta.env.BASE_URL;
// Ritmo dell'impaginato: grande, due piccole, due medie, una a tutta larghezza...
const RHYTHM = ['g-xl', 'g-s', 'g-s', 'g-m', 'g-m', 'g-w', 'g-q', 'g-q', 'g-q'];

function pictureHTML(name) {
  const img = images[name];
  const set = (ext) => img.widths.map((w) => `${BASE}img/${name}-${w}.${ext} ${w}w`).join(', ');
  return `<picture class="pic"><source type="image/avif" srcset="${set('avif')}" sizes="100vw"><source type="image/webp" srcset="${set('webp')}" sizes="100vw"><img src="${BASE}img/${name}-${img.widths.at(-1)}.webp" width="${img.w}" height="${img.h}" alt="${img.alt}" draggable="false"></picture>`;
}

export function initGallery() {
  const grid = document.getElementById('grid');
  if (!grid) return;
  const tiles = [...grid.querySelectorAll('.tile')];
  const filters = [...document.querySelectorAll('.filter')];

  const layout = () => {
    let k = 0;
    tiles.forEach((t) => {
      RHYTHM.forEach((c) => t.classList.remove(c));
      if (!t.classList.contains('is-hidden')) t.classList.add(RHYTHM[k++ % RHYTHM.length]);
    });
  };
  layout();

  // --- Rivelazione a sipario, dal centro verso i lati ------------------------
  if (!reduced) {
    tiles.forEach((t) => {
      const media = t.querySelector('img, video, .ph');
      gsap.fromTo(t,
        { clipPath: 'inset(0% 50% 0% 50% round 20px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 20px)',
          duration: 1.3,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: t, start: 'top 92%', once: true },
          onComplete: () => gsap.set(t, { clearProps: 'clipPath' }),
        });
      if (media) {
        gsap.fromTo(media, { scale: 1.25 }, {
          scale: 1, duration: 1.8, ease: 'expo.out', clearProps: 'transform',
          scrollTrigger: { trigger: t, start: 'top 92%', once: true },
        });
      }
    });
  }

  // --- Filtri con riordino FLIP ----------------------------------------------
  function apply(f) {
    filters.forEach((b) => {
      const on = b.dataset.f === f;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
    });
    const before = new Map(tiles.filter((t) => !t.classList.contains('is-hidden')).map((t) => [t, t.getBoundingClientRect()]));
    tiles.forEach((t) => t.classList.toggle('is-hidden', f !== 'tutti' && t.dataset.cat !== f));
    layout();
    if (reduced) return;
    tiles.forEach((t) => {
      if (t.classList.contains('is-hidden')) return;
      const a = before.get(t);
      const b = t.getBoundingClientRect();
      gsap.set(t, { clearProps: 'clipPath' });
      if (a) {
        gsap.fromTo(t,
          { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height, transformOrigin: '0 0' },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.9, ease: 'expo.out', clearProps: 'transform' });
      } else {
        gsap.fromTo(t, { clipPath: 'inset(0% 50% 0% 50% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 0.9, ease: 'expo.inOut', clearProps: 'clipPath' });
      }
    });
  }
  filters.forEach((b) => b.addEventListener('click', () => apply(b.dataset.f)));
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-filter]');
    if (a) apply(a.dataset.filter);
  });

  initLightbox(tiles);
}

function initLightbox(tiles) {
  const box = document.getElementById('lightbox');
  const stage = box.querySelector('.lightbox__stage');
  const caption = box.querySelector('.lightbox__caption');
  const btnClose = box.querySelector('.lightbox__close');
  const btnPrev = box.querySelector('.lightbox__prev');
  const btnNext = box.querySelector('.lightbox__next');
  let list = [];
  let index = 0;
  let opener = null;
  let zoomed = false;

  const items = () => tiles.filter((t) => !t.classList.contains('is-hidden')).map((t) => t.querySelector('.tile__btn')).filter(Boolean);

  function setCaption(btn) {
    caption.innerHTML = `<span>${btn.dataset.catLabel || ''}</span><b>${btn.dataset.title || ''}</b><span>${index + 1} di ${list.length}</span>`;
  }

  // Cambio immagine: la nuova si apre a sipario dal centro
  function show(i, dir = 0) {
    index = (i + list.length) % list.length;
    const btn = list[index];
    setZoom(false);
    const old = stage.firstElementChild;
    stage.insertAdjacentHTML('beforeend', pictureHTML(btn.dataset.full));
    const pic = stage.lastElementChild;
    setCaption(btn);
    if (reduced || !old) { old?.remove(); return pic; }
    gsap.set(pic, { position: 'absolute', inset: 0 });
    gsap.fromTo(pic, { clipPath: 'inset(0% 50% 0% 50%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.9,
      ease: 'expo.inOut',
      onComplete: () => { old.remove(); gsap.set(pic, { clearProps: 'all' }); },
    });
    gsap.fromTo(pic.querySelector('img'), { scale: 1.12, x: dir * 30 }, { scale: 1, x: 0, duration: 1.3, ease: 'expo.out', clearProps: 'transform' });
    gsap.to(old, { opacity: 0.25, duration: 0.9, ease: 'power2.out' });
    return pic;
  }

  // Apertura: la foto cresce dalla sua posizione nella griglia (FLIP)
  function open(btn) {
    list = items();
    opener = btn;
    box.hidden = false;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    stage.innerHTML = '';
    index = list.indexOf(btn);
    const pic = show(index);
    btnClose.focus();
    if (reduced) return;
    gsap.fromTo(box, { backgroundColor: 'rgba(14,10,8,0)' }, { backgroundColor: 'rgba(14,10,8,0.94)', duration: 0.6, ease: 'none' });
    gsap.fromTo([btnClose, btnPrev, btnNext, caption], { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.35, ease: 'none' });
    const img = pic.querySelector('img');
    requestAnimationFrame(() => {
      const from = btn.getBoundingClientRect();
      const to = img.getBoundingClientRect();
      if (!to.width) return;
      gsap.fromTo(img,
        {
          x: from.left + from.width / 2 - (to.left + to.width / 2),
          y: from.top + from.height / 2 - (to.top + to.height / 2),
          scale: Math.max(from.width / to.width, from.height / to.height),
          clipPath: `inset(${Math.max(0, (1 - from.height / from.width * to.width / to.height) * 50)}% 0% round 20px)`,
        },
        { x: 0, y: 0, scale: 1, clipPath: 'inset(0% 0% round 16px)', duration: 0.9, ease: 'expo.inOut', clearProps: 'transform,clipPath' });
    });
  }
  function close() {
    const end = () => {
      box.hidden = true;
      stage.innerHTML = '';
      lenis?.start();
      document.documentElement.style.overflow = '';
      opener?.focus();
    };
    if (reduced) end();
    else gsap.to(box, { opacity: 0, duration: 0.35, ease: 'none', onComplete: () => { gsap.set(box, { clearProps: 'opacity' }); end(); } });
  }

  // Zoom: click per ingrandire, poi la foto segue il puntatore
  function setZoom(on, e) {
    zoomed = on;
    box.classList.toggle('is-zoomed', on);
    const img = stage.lastElementChild?.querySelector('img');
    if (!img) return;
    if (on && e) {
      const r = img.getBoundingClientRect();
      img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    }
    img.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    img.style.transform = on ? 'scale(2.2)' : '';
  }

  let sx = 0;
  let sy = 0;
  let moved = false;
  stage.addEventListener('click', (e) => {
    if (moved) return;
    if (e.target.tagName === 'IMG') setZoom(!zoomed, e);
  });
  stage.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; moved = false; });
  stage.addEventListener('pointermove', (e) => {
    if (!zoomed) return;
    const img = stage.lastElementChild?.querySelector('img');
    const r = stage.getBoundingClientRect();
    if (e.pointerType === 'mouse') {
      img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    } else if (e.buttons || e.pressure) {
      img.style.transition = 'none';
      img.style.transformOrigin = `${100 - ((e.clientX - r.left) / r.width) * 100}% ${100 - ((e.clientY - r.top) / r.height) * 100}%`;
    }
  });
  stage.addEventListener('pointerup', (e) => {
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) moved = true;
    if (!zoomed && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    setTimeout(() => (moved = false), 0);
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(index - 1, -1));
  btnNext.addEventListener('click', () => show(index + 1, 1));
  box.addEventListener('click', (e) => e.target === box && close());
  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(index + 1, 1);
    else if (e.key === 'ArrowLeft') show(index - 1, -1);
    else if (e.key === 'Tab') {
      const f = [btnClose, btnPrev, btnNext];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  tiles.forEach((t) => {
    const btn = t.querySelector('.tile__btn');
    btn?.addEventListener('click', () => open(btn));
  });
}
