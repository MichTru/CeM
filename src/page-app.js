import { initScroll, gsap, ScrollTrigger, reduced } from './js/motion.js';
import { initNav } from './js/nav.js';
import { initCursor } from './js/cursor.js';
import { initConsent } from './js/consent.js';
import { initContacts } from './js/contacts.js';
import { initReveals } from './js/reveal.js';
import { initGuida, initProposte } from './js/guida.js';
import { initLoops } from './js/rooms.js';

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

initScroll();
initNav();
initConsent();
initCursor();
initContacts();
initReveals();
initGuida();
initProposte();
// la galleria (con l'elenco delle immagini) si carica solo dove c'è
if (document.getElementById('grid')) import('./js/gallery.js').then((m) => m.initGallery());
initLoops();

// Hero della pagina: entrata del titolo e parallasse leggera
const title = document.querySelector('.phero__title');
const media = document.querySelector('.phero__media');
if (!reduced) {
  gsap.from('.phero__frame', { clipPath: 'inset(6% 6% 6% 6% round 20px)', duration: 1.4 });
  gsap.from(media, { scale: 1.12, duration: 1.8 });
  if (title) gsap.from(title, { yPercent: 30, opacity: 0, duration: 1.2, delay: 0.2 });
  gsap.from('.phero .hero__sub, .phero__btns, .crumbs', { y: 20, opacity: 0, duration: 1, stagger: 0.08, delay: 0.4 });
  gsap.to(media, {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true },
  });
  // Card che entrano a sipario dal centro
  document.querySelectorAll('.reveal-card').forEach((c) => {
    gsap.fromTo(c,
      { clipPath: 'inset(0% 50% 0% 50% round 20px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 20px)',
        duration: 1.2,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: c, start: 'top 90%', once: true },
        onComplete: () => gsap.set(c, { clearProps: 'clipPath' }),
      });
  });
}
// Ristrutturi: la linea del tempo si riempie scorrendo, le tappe entrano a sipario
const line = document.querySelector('.tappe__line i');
if (line && !reduced) {
  gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.tappe__list', start: 'top 70%', end: 'bottom 70%', scrub: true } });
  document.querySelectorAll('.tappa').forEach((t) => {
    gsap.fromTo(t.querySelector('.tappa__media'), { clipPath: 'inset(0% 50% 0% 50% round 20px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.3, ease: 'expo.inOut',
      scrollTrigger: { trigger: t, start: 'top 80%', once: true },
    });
    gsap.from(t.querySelector('.tappa__body'), { y: 30, opacity: 0, duration: 1.1, delay: 0.2, scrollTrigger: { trigger: t, start: 'top 80%', once: true } });
  });
}
ScrollTrigger.refresh();
