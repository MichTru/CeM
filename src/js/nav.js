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
  const blade = menu.querySelector('.menu__blade');
  const closeBtn = menu.querySelector('.menu__close');
  const items = () => [...menu.querySelectorAll('.menu__cats li, .menu__links li, .menu__cta, .menu__info')];
  const here = location.pathname.replace(/index\.html$/, '');
  menu.querySelectorAll('a[href]').forEach((a) => {
    const u = new URL(a.href, location.href);
    if (!u.hash && u.pathname === here) a.setAttribute('aria-current', 'page');
  });
  const homeItem = menu.querySelector('.menu__home');
  if (homeItem && document.getElementById('intro') !== null) homeItem.remove();
  if (homeItem && here.replace(/\/$/, '') === (import.meta.env.BASE_URL || '/').replace(/\/$/, '')) homeItem.remove();
  let isOpen = false;
  let lastFocus = null;

  function openMenu() {
    isOpen = true;
    lastFocus = document.activeElement;
    menu.hidden = false;
    menu.scrollTop = 0;
    document.body.classList.add('menu-open');
    burgers.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    if (!reduced) {
      gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'none' });
      gsap.fromTo(blade, { xPercent: -50, opacity: 0 }, { xPercent: 10, opacity: 1, duration: 1.4, ease: 'expo.out' });
      gsap.fromTo(items(), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.035, delay: 0.08 });
    }
    closeBtn.focus();
  }
  function closeMenu(restore = true) {
    if (!isOpen) return;
    isOpen = false;
    burgers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    document.body.classList.remove('menu-open');
    document.documentElement.style.overflow = '';
    lenis?.start();
    const end = () => { menu.hidden = true; gsap.set(menu, { clearProps: 'opacity' }); if (restore) lastFocus?.focus(); };
    if (reduced) end();
    else gsap.to(menu, { opacity: 0, duration: 0.3, ease: 'power2.out', onComplete: end });
  }
  burgers.forEach((b) => b.addEventListener('click', () => (isOpen ? closeMenu() : openMenu())));
  closeBtn.addEventListener('click', () => closeMenu());
  document.addEventListener('cm:close-menu', () => closeMenu(false));
  menu.addEventListener('click', (e) => e.target.closest('a') && closeMenu(false));
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab') {
      const f = [...menu.querySelectorAll('a[href], button')].filter((el) => el.offsetParent !== null);
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
}
