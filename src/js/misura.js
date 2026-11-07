import { ScrollTrigger, reduced } from './motion.js';

const MOBILE = matchMedia('(max-width: 860px)');

// Dispositivi poco potenti o movimento ridotto: sequenza di immagini statiche
function canRun3D() {
  if (reduced) return false;
  const nav = navigator;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory && nav.deviceMemory < 4) return false;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function initMisura() {
  const section = document.getElementById('su-misura');
  if (!section) return;
  const pin = section.querySelector('.misura__pin');
  const stage = document.getElementById('misura-stage');
  const canvas = stage.querySelector('canvas');
  const steps = [...section.querySelectorAll('.step')];
  const frames = [...stage.querySelectorAll('.misura__fallback img')];

  let p = 0;
  let step = -1;
  let scene = null;

  const setStep = (i) => {
    if (i === step) return;
    step = i;
    steps.forEach((s, k) => s.classList.toggle('is-on', MOBILE.matches ? k === i : k <= i));
    frames.forEach((f, k) => f.classList.toggle('is-on', k === i));
  };

  const onProgress = (v) => {
    p = v;
    setStep(Math.min(3, Math.floor(v * 4)));
    scene?.setProgress(v);
  };

  if (reduced) {
    // Nessun pin: i passaggi cambiano man mano che si scorre
    steps.forEach((s, i) => ScrollTrigger.create({
      trigger: s, start: 'top 70%', onEnter: () => setStep(i), onEnterBack: () => setStep(i),
    }));
    setStep(0);
    return;
  }

  ScrollTrigger.create({
    trigger: pin,
    start: 'top top',
    end: () => `+=${innerHeight * (MOBILE.matches ? 2.4 : 3)}`,
    pin: true,
    scrub: 0.6,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (st) => onProgress(st.progress),
  });
  setStep(0);

  if (!canRun3D()) return;

  // Three.js si carica solo quando la sezione si avvicina
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const { createScene } = await import('./scene.js');
    scene = createScene(canvas);
    const size = () => scene.resize(stage.clientWidth, stage.clientHeight);
    new ResizeObserver(size).observe(stage);
    size();
    scene.setProgress(p);
    requestAnimationFrame(() => stage.classList.add('has-3d'));
  }, { rootMargin: '600px 0px' });
  io.observe(stage);
}
