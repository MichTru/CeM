import { gsap, reduced } from './motion.js';

// Ambienti: le superfici si impilano e quella sotto arretra appena.
export function initRooms() {
  const rooms = [...document.querySelectorAll('.room')];
  rooms.forEach((r, i) => r.style.setProperty('--i', i));
  if (!reduced) {
    rooms.forEach((r, i) => {
      const next = rooms[i + 1];
      if (!next) return;
      gsap.to(r, {
        scale: 0.94,
        '--dim': 0.5,
        ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true },
      });
    });
  }
  initLoops();
}

// I video in loop partono solo quando sono visibili
export function initLoops() {
  const vids = [...document.querySelectorAll('video.loop')];
  if (reduced) return; // con movimento ridotto restano i poster statici
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
        v.play().catch(() => {});
      } else v.pause();
    });
  }, { rootMargin: '200px 0px' });
  vids.forEach((v) => io.observe(v));
}
