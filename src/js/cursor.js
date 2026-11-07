import { gsap, finePointer, reduced } from './motion.js';

// Cursore discreto: si ingrandisce su link e foto. Solo con puntatore fine.
export function initCursor() {
  if (!finePointer || reduced) return;
  const el = document.querySelector('.cursor');
  if (!el) return;
  document.documentElement.classList.add('has-cursor');
  el.classList.add('is-hidden');
  addEventListener('pointermove', () => el.classList.remove('is-hidden'), { once: true });
  const qx = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
  const qy = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    qx(e.clientX);
    qy(e.clientY);
  }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target;
    const media = t.closest('.tile__btn, .bento__card, .hero__frame, .room__media');
    const link = t.closest('a, button, input, select, textarea, label');
    el.classList.toggle('is-media', !!media && !link?.matches('.hero__tab, .btn, .hotspot button'));
    el.classList.toggle('is-link', !!link && !el.classList.contains('is-media'));
  });
  document.addEventListener('pointerleave', () => el.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => el.classList.remove('is-hidden'));
}
