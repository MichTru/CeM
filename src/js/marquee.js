import { reduced } from './motion.js';

// Marquee infinito: il contenuto viene duplicato per un loop continuo.
export function initMarquee() {
  if (reduced) return;
  document.querySelectorAll('.marquee').forEach((m) => {
    const track = m.querySelector('.marquee__track');
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a').forEach((a) => (a.tabIndex = -1));
    m.append(clone);
  });
}
