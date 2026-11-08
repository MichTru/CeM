import { gsap, reduced } from './motion.js';

// Rivelazioni allo scroll per titoli e blocchi di testo delle sezioni.
export function initReveals() {
  const els = document.querySelectorAll('.section__head, .room__body, .chi__text, .people > *, .contatti__info, .form, .footer');
  els.forEach((el) => el.classList.add('reveal'));
  els.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: reduced ? 0.6 : 1.1,
      ease: reduced ? 'none' : 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  const due = document.querySelector('.chi__due');
  if (due) new IntersectionObserver(([e], io) => { if (e.isIntersecting) { due.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.35 }).observe(due);
}
