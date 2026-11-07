import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

// Poche easing coerenti: expo.out per le entrate, power2 per i movimenti.
export const EASE_IN = 'expo.out';
export const EASE_MOVE = 'power2.inOut';
gsap.defaults({ ease: EASE_IN, duration: 0.9 });

export let lenis = null;

export function initScroll() {
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(500, 33);
  }

  // Ancore interne con scroll morbido e focus accessibile
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    scrollToEl(target);
    history.replaceState(null, '', id);
  });
}

export function scrollToEl(target) {
  const done = () => {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };
  if (lenis) lenis.scrollTo(target, { offset: target.id === 'top' ? 0 : -20, duration: 1.2, onComplete: done });
  else {
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    done();
  }
}

export { gsap, ScrollTrigger };
