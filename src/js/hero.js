import { gsap, ScrollTrigger, reduced, finePointer, EASE_MOVE } from './motion.js';

const SLIDES = [
  { title: ['Cucine su misura', 'a Lugo'], sub: 'Progettate con te e montate dalla nostra squadra.' },
  { title: ['Zona giorno', 'da vivere'], sub: 'Divani, pareti attrezzate e luci per stare bene in casa.' },
  { title: ['Camere da letto', 'su misura'], sub: 'Armadi, letti e cabine pensati per il riposo.' },
  { title: ['Falegnameria', 'propria'], sub: 'Mobili su misura costruiti a Massa Lombarda.' },
];
const AUTOPLAY = 6;
const MOBILE = matchMedia('(max-width: 860px)');

function wordsHTML(lines) {
  return lines
    .map((l) => l.split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' '))
    .join('<br>');
}

// Rettangolo arrotondato con il ritaglio in alto a destra e i raccordi a raggio inverso
function notchPath(W, H, nw, nh, R, r) {
  const x = W - nw;
  return [
    `M ${R} 0`,
    `H ${x - r}`,
    `A ${r} ${r} 0 0 1 ${x} ${r}`,
    `V ${nh - r}`,
    `A ${r} ${r} 0 0 0 ${x + r} ${nh}`,
    `H ${W - r}`,
    `A ${r} ${r} 0 0 1 ${W} ${nh + r}`,
    `V ${H - R}`,
    `A ${R} ${R} 0 0 1 ${W - R} ${H}`,
    `H ${R}`,
    `A ${R} ${R} 0 0 1 0 ${H - R}`,
    `V ${R}`,
    `A ${R} ${R} 0 0 1 ${R} 0`,
    'Z',
  ].join(' ');
}

export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return { start() {} };
  const tablist = hero.querySelector('[role="tablist"]');
  const tabs = [...hero.querySelectorAll('[role="tab"]')];
  const pill = hero.querySelector('.hero__pill');
  const progress = hero.querySelector('.hero__progress');
  const frame = hero.querySelector('.hero__frame');
  const media = hero.querySelector('.hero__media');
  const slides = [...hero.querySelectorAll('.hero__slide')];
  const title = document.getElementById('hero-title');
  const sub = document.getElementById('hero-sub');

  let current = 0;
  let busy = false;
  let auto = null;
  let autoplayOn = !reduced;
  let started = false;

  title.innerHTML = wordsHTML(SLIDES[0].title);

  // --- Ritaglio della foto attorno alle tab ---------------------------------
  function shape() {
    const W = frame.offsetWidth;
    const H = frame.offsetHeight;
    if (MOBILE.matches) {
      frame.style.clipPath = '';
    } else {
      const nw = tablist.offsetWidth;
      const nh = tablist.offsetHeight;
      frame.style.clipPath = `path('${notchPath(W, H, nw, nh, 20, 20)}')`;
    }
    placePill(false);
  }

  function placePill(animate) {
    const t = tabs[current];
    const props = { x: t.offsetLeft, y: t.offsetTop, width: t.offsetWidth };
    if (animate && !reduced) gsap.to(pill, { ...props, duration: 0.75, ease: 'expo.out' });
    else gsap.set(pill, props);
  }

  new ResizeObserver(shape).observe(frame);
  document.fonts?.ready.then(shape);
  shape();

  // --- Sipario a lamelle ------------------------------------------------------
  async function curtain(slide, forward, done) {
    const pic = slide.querySelector('.pic');
    const img = slide.querySelector('img');
    if (!img.complete || !img.naturalWidth) {
      try { await Promise.race([img.decode(), new Promise((r) => setTimeout(r, 900))]); } catch { /* ignorato */ }
    }
    const src = img.currentSrc || img.src;
    const W = slide.offsetWidth;
    const H = slide.offsetHeight;
    const nw = img.naturalWidth || 1600;
    const nh = img.naturalHeight || 900;
    const k = Math.max(W / nw, H / nh);
    const cw = nw * k;
    const ch = nh * k;
    const ox = (W - cw) / 2;
    const oy = (H - ch) / 2;
    const n = MOBILE.matches ? 5 : 9;
    const sw = W / n;

    const wrap = document.createElement('div');
    wrap.className = 'hero__slats';
    const strips = [];
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i');
      el.style.cssText = `left:${i * sw}px;width:${sw + 1}px;background-image:url("${src}");background-size:${cw}px ${ch}px;background-position:${ox - i * sw}px ${oy}px`;
      el.appendChild(document.createElement('b'));
      wrap.appendChild(el);
      strips.push(el);
    }
    slide.appendChild(wrap);
    pic.style.opacity = '0';

    const order = { each: 0.065, from: forward ? 'start' : 'end' };
    gsap.fromTo(wrap, { scale: 1.06 }, { scale: 1, duration: 1.5, ease: 'expo.out' });
    gsap.fromTo(strips.map((e) => e.firstChild), { opacity: 1 }, { opacity: 0, duration: 1.1, ease: 'power2.out', stagger: order });
    gsap.fromTo(strips,
      { rotationY: forward ? -88 : 88, transformPerspective: 1400, transformOrigin: forward ? '0% 50%' : '100% 50%' },
      {
        rotationY: 0,
        duration: 1.0,
        ease: 'power3.out',
        stagger: order,
        onComplete() {
          pic.style.opacity = '';
          wrap.remove();
          done();
        },
      });
  }

  // --- Cambio tab -------------------------------------------------------------
  function select(i, { user = false, focus = false } = {}) {
    if (user) stopAutoplay();
    if (i === current || busy) return;
    const prev = current;
    current = i;
    busy = true;

    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    frame.setAttribute('aria-labelledby', tabs[i].id);
    if (focus) tabs[i].focus();
    if (MOBILE.matches) {
      const t = tabs[i];
      tablist.scrollTo({ left: t.offsetLeft - 16, behavior: reduced ? 'auto' : 'smooth' });
    }
    placePill(true);

    const from = slides[prev];
    const to = slides[i];
    const forward = i > prev;
    to.classList.add('is-entering');

    const done = () => {
      from.classList.remove('is-active');
      gsap.set(from.querySelector('img'), { scale: 1 });
      to.classList.add('is-active');
      to.classList.remove('is-entering');
      gsap.set(to, { clearProps: 'opacity' });
      busy = false;
      if (autoplayOn && started) runAutoplay();
    };

    if (reduced) {
      gsap.fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'none', onComplete: done });
      title.innerHTML = wordsHTML(SLIDES[i].title);
      sub.textContent = SLIDES[i].sub;
      return;
    }

    // La nuova foto entra a lamelle verticali, come una tenda a pannelli
    curtain(to, forward, done);
    gsap.fromTo(from.querySelector('img'), { scale: 1 }, { scale: 1.05, duration: 1.2, ease: EASE_MOVE });

    // Il titolo si riscrive parola per parola
    const out = title.querySelectorAll('.w > span');
    gsap.to(out, {
      yPercent: -110,
      duration: 0.45,
      stagger: 0.03,
      ease: 'power2.in',
      onComplete() {
        title.innerHTML = wordsHTML(SLIDES[i].title);
        gsap.from(title.querySelectorAll('.w > span'), { yPercent: 110, duration: 0.9, stagger: 0.06 });
      },
    });
    gsap.to(sub, {
      opacity: 0,
      y: -8,
      duration: 0.35,
      ease: 'power2.in',
      onComplete() {
        sub.textContent = SLIDES[i].sub;
        gsap.fromTo(sub, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.25 });
      },
    });
  }

  // --- Rotazione automatica ---------------------------------------------------
  function runAutoplay() {
    auto?.kill();
    auto = gsap.fromTo(
      progress,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: AUTOPLAY,
        ease: 'none',
        onComplete: () => select((current + 1) % tabs.length),
      },
    );
    if (hover || !visible || document.hidden) auto.pause();
  }
  function stopAutoplay() {
    autoplayOn = false;
    auto?.kill();
    gsap.to(progress, { scaleX: 0, duration: 0.3, ease: 'power2.out' });
  }

  let hover = false;
  let visible = true;
  const pause = () => auto?.pause();
  const resume = () => { if (!hover && visible && !document.hidden) auto?.resume(); };
  hero.addEventListener('mouseenter', () => { hover = true; pause(); });
  hero.addEventListener('mouseleave', () => { hover = false; resume(); });
  hero.addEventListener('focusin', () => { hover = true; pause(); });
  hero.addEventListener('focusout', () => { hover = false; resume(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : resume()));
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? resume() : pause();
  }, { threshold: 0.25 }).observe(frame);

  // --- Interazione: click, tastiera, swipe ------------------------------------
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i, { user: true })));
  tablist.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const k = keys[e.key];
    const n = tabs.length;
    const next = k === 'first' ? 0 : k === 'last' ? n - 1 : (current + k + n) % n;
    select(next, { user: true, focus: true });
  });

  let sx = 0;
  let sy = 0;
  frame.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; }, { passive: true });
  frame.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse') return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - sy)) {
      const n = tabs.length;
      select((current + (dx < 0 ? 1 : -1) + n) % n, { user: true });
    }
  }, { passive: true });

  // --- Parallasse allo scroll e movimento col mouse --------------------------
  if (!reduced) {
    gsap.to(media, {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    if (finePointer) {
      const qx = gsap.quickTo(slides, 'x', { duration: 1.2, ease: 'power3.out' });
      const qy = gsap.quickTo(slides, 'y', { duration: 1.2, ease: 'power3.out' });
      frame.addEventListener('pointermove', (e) => {
        const r = frame.getBoundingClientRect();
        qx(((e.clientX - r.left) / r.width - 0.5) * -18);
        qy(((e.clientY - r.top) / r.height - 0.5) * -12);
      });
      frame.addEventListener('pointerleave', () => { qx(0); qy(0); });
    }
  }

  return {
    start() {
      started = true;
      shape();
      if (autoplayOn) runAutoplay();
      ScrollTrigger.refresh();
    },
  };
}
