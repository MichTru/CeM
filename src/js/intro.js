import { gsap, lenis, reduced, EASE_MOVE } from './motion.js';

const KEY = 'cm-intro';

function markSeen() {
  try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* storage non disponibile */ }
}

/**
 * Intro di circa 3 secondi:
 * 1. una lama di luce attraversa il fondo in diagonale e accende le ombre della tenda;
 * 2. la lama si stende e diventa la linea del logo, "cassani" e "martignani"
 *    arrivano da lati opposti, la "&" si disegna in cognac;
 * 3. il logo sale nell'header, la card si posa e la foto si apre come un'anta.
 */
export function runIntro() {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  if (!intro || root.classList.contains('no-intro') || location.hash || scrollY > 10) {
    root.classList.add('no-intro');
    intro?.remove();
    return Promise.resolve();
  }

  markSeen();
  lenis?.stop();

  const svg = intro.querySelector('.cm-logo');
  const parts = {
    line: svg.querySelector('.cm-line'),
    cassani: svg.querySelector('.cm-cassani'),
    amp: svg.querySelector('.cm-amp'),
    martignani: svg.querySelector('.cm-martignani'),
    tag: svg.querySelector('.cm-tag'),
  };
  const logoBox = intro.querySelector('.intro-logo');
  const blade = intro.querySelector('.intro-blade');
  const headerLogo = document.getElementById('header-logo');
  const shell = document.querySelector('.shell');
  const door = document.querySelector('.hero__door');

  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      gsap.set(headerLogo, { opacity: 1 });
      gsap.set(shell, { clearProps: 'transform,opacity' });
      if (door) door.style.display = 'none';
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
        .to(intro, { opacity: 0, duration: 0.6, ease: 'none' }, '+=0.5');
      intro.addEventListener('click', finish, { once: true });
      return;
    }

    // Ombre della tenda che si accendono con la luce
    const curtain = document.createElement('div');
    curtain.className = 'intro-curtain';
    curtain.innerHTML = '<i></i><i></i>';
    intro.prepend(curtain);

    gsap.set(headerLogo, { opacity: 0 });
    gsap.set(svg.querySelectorAll('path'), { opacity: 1 });
    gsap.set([parts.line, parts.cassani, parts.martignani, parts.tag], { opacity: 0 });
    gsap.set(blade, { rotation: -28, xPercent: -120, opacity: 0 });
    gsap.set(shell, { scale: 0.94, y: 24, transformOrigin: '50% 30%' });
    if (door) {
      door.style.display = 'block';
      gsap.set(door, { rotationY: 0, transformPerspective: 1800 });
    }

    // Lunghezza della "&" per il tratto che si disegna
    const ampLen = parts.amp.getTotalLength ? parts.amp.getTotalLength() : 4000;
    gsap.set(parts.amp, {
      fillOpacity: 0,
      stroke: '#9A6440',
      strokeWidth: 9,
      strokeDasharray: ampLen,
      strokeDashoffset: ampLen,
    });

    // Geometrie per far diventare la lama la linea del logo
    const lineRect = parts.line.getBoundingClientRect();
    const bladeW = blade.offsetWidth;
    const dy = lineRect.top + lineRect.height / 2 - innerHeight / 2;
    const unit = 4200 / svg.getBoundingClientRect().width; // unità SVG per pixel

    const tl = gsap.timeline({ onComplete: finish });

    // 1. La luce entra
    tl.to(blade, { opacity: 1, duration: 0.35, ease: 'none' }, 0)
      .to(blade, { xPercent: 0, duration: 1.0, ease: 'power2.out' }, 0)
      .fromTo(curtain, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'none' }, 0.1);

    // 2. La lama si stende e diventa la linea; le due ditte si uniscono
    tl.to(blade, {
      rotation: 0,
      y: dy,
      scaleY: 0.025,
      scaleX: lineRect.width / bladeW,
      duration: 0.7,
      ease: EASE_MOVE,
    }, 0.8)
      .to(parts.line, { opacity: 1, duration: 0.35, ease: 'none' }, 1.3)
      .to(blade, { opacity: 0, duration: 0.4, ease: 'none' }, 1.35)
      .fromTo(parts.cassani, { x: -260 * unit, opacity: 0 }, { x: 0, opacity: 1, duration: 1.0 }, 1.1)
      .fromTo(parts.martignani, { x: 260 * unit, opacity: 0 }, { x: 0, opacity: 1, duration: 1.0 }, 1.1)
      .to(parts.amp, { strokeDashoffset: 0, duration: 0.7, ease: EASE_MOVE }, 1.35)
      .to(parts.amp, { fillOpacity: 1, strokeOpacity: 0, duration: 0.4, ease: 'none' }, 1.9)
      .fromTo(parts.tag, { opacity: 0, scaleX: 0.9, transformOrigin: '50% 50%' }, { opacity: 1, scaleX: 1, duration: 0.8 }, 1.65);

    // 3. Il logo sale nell'header, la card si posa, l'anta si apre
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
    }, 2.1)
      .to(intro, { backgroundColor: 'rgba(15,11,8,0)', duration: 0.7, ease: 'none' }, 2.15)
      .to(curtain, { opacity: 0, duration: 0.6, ease: 'none' }, 2.15)
      .to(shell, { scale: 1, y: 0, duration: 1.0 }, 2.15);
    if (door) tl.to(door, { rotationY: -104, duration: 1.05, ease: EASE_MOVE }, 2.3);
    tl.set(headerLogo, { opacity: 1 }, 2.95)
      .to(logoBox, { opacity: 0, duration: 0.15, ease: 'none' }, 2.95);

    // Si salta con un click o un tasto
    const skip = () => tl.progress(1);
    intro.addEventListener('click', skip, { once: true });
    addEventListener('keydown', skip, { once: true });
  });
}
