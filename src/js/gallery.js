import { gsap, lenis, reduced } from './motion.js';
import images from '../data/images.json';

const BASE = import.meta.env.BASE_URL;

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

  // --- Rivelazione allo scroll ------------------------------------------------
  if (!reduced) {
    tiles.forEach((t) => {
      gsap.fromTo(t,
        { clipPath: 'inset(18% 0% 0% 0% round 20px)', opacity: 0.001 },
        {
          clipPath: 'inset(0% 0% 0% 0% round 20px)',
          opacity: 1,
          duration: 1.2,
          scrollTrigger: { trigger: t, start: 'top 92%', once: true },
          onComplete: () => gsap.set(t, { clearProps: 'clipPath' }),
        });
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
    if (reduced) return;
    tiles.forEach((t) => {
      if (t.classList.contains('is-hidden')) return;
      const a = before.get(t);
      const b = t.getBoundingClientRect();
      gsap.set(t, { clearProps: 'clipPath', opacity: 1 });
      if (a) {
        gsap.fromTo(t,
          { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height, transformOrigin: '0 0' },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.9, ease: 'expo.out', clearProps: 'transform' });
      } else {
        gsap.fromTo(t, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.1, clearProps: 'transform' });
      }
    });
  }
  filters.forEach((b) => b.addEventListener('click', () => apply(b.dataset.f)));
  // Le card e i marchi possono portare direttamente a un filtro
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

  function show(i, dir = 0) {
    index = (i + list.length) % list.length;
    const btn = list[index];
    const name = btn.dataset.full;
    setZoom(false);
    stage.innerHTML = pictureHTML(name);
    caption.textContent = `${images[name].alt} · ${index + 1} di ${list.length}`;
    if (!reduced) gsap.fromTo(stage.firstElementChild, { opacity: 0, x: dir * 40 }, { opacity: 1, x: 0, duration: 0.7 });
  }

  function open(btn) {
    list = items();
    opener = btn;
    box.hidden = false;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    show(list.indexOf(btn));
    if (!reduced) gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' });
    btnClose.focus();
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
    else gsap.to(box, { opacity: 0, duration: 0.35, ease: 'none', onComplete: end });
  }

  // Zoom: click per ingrandire, poi la foto segue il puntatore
  function setZoom(on, e) {
    zoomed = on;
    box.classList.toggle('is-zoomed', on);
    const img = stage.querySelector('img');
    if (!img) return;
    if (on && e) {
      const r = img.getBoundingClientRect();
      img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    }
    img.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    img.style.transform = on ? 'scale(2.2)' : '';
  }
  stage.addEventListener('click', (e) => {
    if (moved) return;
    if (e.target.tagName === 'IMG') setZoom(!zoomed, e);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!zoomed || e.pointerType !== 'mouse') return;
    const img = stage.querySelector('img');
    const r = stage.getBoundingClientRect();
    img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  });

  // Swipe su touch; con lo zoom attivo il trascinamento sposta la foto
  let sx = 0;
  let sy = 0;
  let moved = false;
  stage.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; moved = false; });
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' || !zoomed || !(e.buttons || e.pressure)) return;
    const img = stage.querySelector('img');
    const r = stage.getBoundingClientRect();
    img.style.transition = 'none';
    img.style.transformOrigin = `${100 - ((e.clientX - r.left) / r.width) * 100}% ${100 - ((e.clientY - r.top) / r.height) * 100}%`;
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
