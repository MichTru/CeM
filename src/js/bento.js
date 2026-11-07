import { gsap, reduced, finePointer } from './motion.js';

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

  // Hotspot: al passaggio del mouse o al tocco aprono l'etichetta
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
    btn.addEventListener('focus', () => open(s));
    btn.addEventListener('blur', () => close(s));
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && spots.forEach(close));
  document.addEventListener('click', (e) => !e.target.closest('.hotspot') && spots.forEach(close));
}
