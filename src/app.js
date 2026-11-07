import { initScroll, ScrollTrigger } from './js/motion.js';
import { runIntro } from './js/intro.js';
import { initHero } from './js/hero.js';
import { initBento } from './js/bento.js';
import { initNav } from './js/nav.js';
import { initCursor } from './js/cursor.js';
import { initRooms } from './js/rooms.js';
import { initMisura } from './js/misura.js';
import { initGallery } from './js/gallery.js';
import { initMarquee } from './js/marquee.js';
import { initContacts } from './js/contacts.js';
import { initConsent } from './js/consent.js';
import { initReveals } from './js/reveal.js';

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

initScroll();
const hero = initHero();
initNav();
initConsent();

// Le sezioni sotto la piega si preparano quando il browser è libero,
// così la hero arriva a schermo prima.
const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 200));
let below = false;
const initBelow = () => {
  if (below) return;
  below = true;
  initCursor();
  initContacts();
  initMarquee();
  initRooms();
  initGallery();
  initMisura();
  initReveals();
  ScrollTrigger.refresh();
};
idle(initBelow);
// se si arriva da un link interno (es. #contatti) serve tutto subito
if (location.hash) initBelow();

runIntro().then(() => {
  initBento();
  hero.start();
  ScrollTrigger.refresh();
});
