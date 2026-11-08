import { gsap, reduced, finePointer, lenis } from './motion.js';

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

  // Hotspot: il "+" apre l'etichetta, l'etichetta apre la scheda del pezzo
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
    btn.addEventListener('click', () => (s.classList.contains('is-open') ? close(s) : open(s)));
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

  initSchede();
}

// Scheda del pezzo: foto ingrandita sul dettaglio, descrizione, materiali e prenotazione
function initSchede() {
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
    link.href = `${BASE}${d.link}`;
    link.textContent = d.linkLabel;
    const pren = $('scheda-prenota');
    pren.dataset.ambiente = d.form;
    pren.dataset.msg = `Vorrei vedere in showroom: ${d.nome.toLowerCase()} (dalla foto "Da vicino").`;

    // la stessa foto della card, ingrandita sul punto indicato
    const pic = from.closest('.bento__card').querySelector('.pic');
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
