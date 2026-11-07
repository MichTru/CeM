import { gsap, lenis, reduced } from './motion.js';

export function initNav() {
  const floatNav = document.getElementById('float-nav');
  const hero = document.getElementById('hero');
  const menu = document.getElementById('menu');
  const burgers = [...document.querySelectorAll('.burger')];

  // Header flottante: compare fuori dalla hero, si nasconde scendendo e ricompare risalendo
  let pastHero = false;
  let lastY = scrollY;
  let hidden = false;
  const update = () => {
    const y = lenis ? lenis.scroll : scrollY;
    const goingDown = y > lastY + 2;
    const goingUp = y < lastY - 2;
    if (goingDown) hidden = true;
    if (goingUp) hidden = false;
    lastY = y;
    floatNav.classList.toggle('is-visible', pastHero && (!hidden || document.body.classList.contains('menu-open')));
  };
  new IntersectionObserver(([e]) => {
    pastHero = !e.isIntersecting;
    hidden = false;
    update();
  }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  if (lenis) lenis.on('scroll', update);
  else addEventListener('scroll', update, { passive: true });
  floatNav.addEventListener('focusin', () => floatNav.classList.add('is-visible'));

  // Menu a schermo intero su mobile
  const links = [...menu.querySelectorAll('nav a')];
  const blade = menu.querySelector('.menu__blade');
  let isOpen = false;
  let lastFocus = null;

  function openMenu() {
    isOpen = true;
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.body.classList.add('menu-open');
    burgers.forEach((b) => { b.setAttribute('aria-expanded', 'true'); b.setAttribute('aria-label', 'Chiudi il menu'); });
    floatNav.classList.add('is-visible');
    lenis?.stop();
    if (!reduced) {
      gsap.fromTo(menu, { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo(blade, { xPercent: -60, opacity: 0 }, { xPercent: 10, opacity: 1, duration: 1.4, ease: 'expo.out', delay: 0.15 });
      gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.05, delay: 0.3 });
    }
    links[0]?.focus();
  }
  function closeMenu(restore = true) {
    if (!isOpen) return;
    isOpen = false;
    burgers.forEach((b) => { b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'Apri il menu'); });
    document.body.classList.remove('menu-open');
    lenis?.start();
    const end = () => { menu.hidden = true; if (restore) lastFocus?.focus(); };
    if (reduced) end();
    else gsap.to(menu, { opacity: 0, duration: 0.4, ease: 'power2.out', onComplete: () => { gsap.set(menu, { opacity: 1 }); end(); } });
  }
  burgers.forEach((b) => b.addEventListener('click', () => (isOpen ? closeMenu() : openMenu())));
  menu.addEventListener('click', (e) => e.target.closest('a') && closeMenu(false));
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab') {
      // focus trap tra le voci del menu e il bottone di chiusura
      const items = [...links, ...menu.querySelectorAll('.menu__foot a'), floatNav.querySelector('.burger')];
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items.at(-1).focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
}
