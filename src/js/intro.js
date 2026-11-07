import { gsap, lenis, reduced, EASE_MOVE } from './motion.js';

/**
 * Intro di circa 4,5 secondi:
 * 1. una lama di luce entra in diagonale, rallenta e si ferma come una tenda appena scostata;
 * 2. la lama si stende e diventa la linea del logo; le lettere di "cassani" e "martignani"
 *    si compongono una alla volta da lati opposti, la "&" si disegna in cognac;
 * 3. il logo sale nell'header e il fondo si apre a lamelle verticali, come una tenda a pannelli.
 */
export function runIntro() {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  if (!intro || root.classList.contains('no-intro') || location.hash || scrollY > 10) {
    root.classList.add('no-intro');
    intro?.remove();
    return Promise.resolve();
  }

  lenis?.stop();

  const svg = intro.querySelector('.cm-logo');
  const line = svg.querySelector('.cm-line');
  const amp = svg.querySelector('.cm-amp');
  const tag = svg.querySelector('.cm-tag');
  const left = [...svg.querySelectorAll('.cm-cassani .cm-l')];
  const right = [...svg.querySelectorAll('.cm-martignani .cm-l')];
  const logoBox = intro.querySelector('.intro-logo');
  const blade = intro.querySelector('.intro-blade');
  const slats = [...intro.querySelectorAll('.intro-slats i')];
  const headerLogo = document.getElementById('header-logo');
  const shell = document.querySelector('.shell');

  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      gsap.set(headerLogo, { opacity: 1 });
      gsap.set(shell, { clearProps: 'transform' });
      intro.remove();
      root.classList.add('no-intro');
      lenis?.start();
      resolve();
    };

    if (reduced) {
      // Movimento ridotto: una semplice dissolvenza del logo.
      gsap.set(svg.querySelectorAll('path'), { opacity: 1 });
      gsap.timeline({ onComplete: finish })
        .from(logoBox, { opacity: 0, duration: 0.6, ease: 'none' })
        .to(intro, { opacity: 0, duration: 0.6, ease: 'none' }, '+=0.6');
      intro.addEventListener('click', finish, { once: true });
      return;
    }

    // Ombre della tenda che si accendono con la luce
    const curtain = document.createElement('div');
    curtain.className = 'intro-curtain';
    curtain.innerHTML = '<i></i><i></i>';
    intro.querySelector('.intro-slats').after(curtain);

    gsap.set(headerLogo, { opacity: 0 });
    gsap.set(svg.querySelectorAll('path'), { opacity: 1 });
    gsap.set([line, tag, ...left, ...right], { opacity: 0 });
    gsap.set(blade, { x: 0, y: 0, rotation: -28, xPercent: -120, opacity: 0 });
    gsap.set(shell, { scale: 0.95, y: 26, transformOrigin: '50% 30%' });
    gsap.set(slats, { transformPerspective: 900, transformOrigin: '50% 50%' });

    const ampLen = amp.getTotalLength ? amp.getTotalLength() : 4000;
    gsap.set(amp, { fillOpacity: 0, stroke: '#9A6440', strokeWidth: 9, strokeDasharray: ampLen, strokeDashoffset: ampLen });

    // Geometrie per far diventare la lama la linea del logo
    const lineRect = line.getBoundingClientRect();
    const dy = lineRect.top + lineRect.height / 2 - innerHeight / 2;
    const unit = 4200 / svg.getBoundingClientRect().width; // unità SVG per pixel

    const tl = gsap.timeline({ onComplete: finish });

    // 1. La luce entra, rallenta e si ferma
    tl.to(blade, { opacity: 1, duration: 0.4, ease: 'none' }, 0)
      .to(blade, { xPercent: -3, duration: 1.15, ease: 'power3.out' }, 0)
      .fromTo(curtain, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'none' }, 0.2)
      .to(blade, { xPercent: 0, scaleY: 1.12, duration: 0.5, ease: 'sine.inOut' }, 1.1);

    // 2. La lama diventa la linea; le lettere si compongono verso la "&"
    tl.to(blade, {
      rotation: 0,
      y: dy,
      scaleY: 0.014,
      scaleX: lineRect.width / blade.offsetWidth,
      duration: 0.65,
      ease: EASE_MOVE,
    }, 1.6)
      .to(line, { opacity: 1, duration: 0.35, ease: 'none' }, 2.1)
      .to(blade, { opacity: 0, duration: 0.4, ease: 'none' }, 2.15)
      .fromTo(left,
        { x: -70 * unit, y: 26 * unit, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 0.9, stagger: 0.055 }, 2.05)
      .fromTo(right,
        { x: 70 * unit, y: 26 * unit, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 0.9, stagger: { each: 0.055, from: 'end' } }, 2.05)
      .to(amp, { strokeDashoffset: 0, duration: 0.75, ease: EASE_MOVE }, 2.7)
      .to(amp, { fillOpacity: 1, strokeOpacity: 0, duration: 0.4, ease: 'none' }, 3.35)
      .fromTo(tag, { opacity: 0, scaleX: 0.88, transformOrigin: '50% 50%' }, { opacity: 1, scaleX: 1, duration: 0.8 }, 3.25);

    // 3. Il logo sale nell'header, la tenda a pannelli si apre
    tl.add(() => {
      const from = logoBox.getBoundingClientRect();
      const to = headerLogo.getBoundingClientRect();
      gsap.to(logoBox, {
        x: to.left + to.width / 2 - (from.left + from.width / 2),
        y: to.top + to.height / 2 - (from.top + from.height / 2),
        scale: to.width / from.width,
        duration: 0.85,
        ease: EASE_MOVE,
      });
    }, 3.75)
      .to(curtain, { opacity: 0, duration: 0.6, ease: 'none' }, 3.8)
      .to(slats, {
        rotationY: 90,
        duration: 0.8,
        ease: 'power3.inOut',
        stagger: { each: 0.045, from: 'center' },
      }, 3.8)
      .to(shell, { scale: 1, y: 0, duration: 1.0 }, 3.85)
      .set(headerLogo, { opacity: 1 }, 4.6)
      .to(logoBox, { opacity: 0, duration: 0.15, ease: 'none' }, 4.6);

    // Si salta con un click o un tasto
    const skip = () => tl.progress(1);
    intro.addEventListener('click', skip, { once: true });
    addEventListener('keydown', skip, { once: true });
  });
}
