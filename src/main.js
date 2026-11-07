import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/outfit/wght.css';
import './styles/main.css';

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
initCursor();
initConsent();
initContacts();
initMarquee();
initRooms();
initGallery();
initMisura();
initReveals();

runIntro().then(() => {
  initBento();
  hero.start();
  ScrollTrigger.refresh();
});
