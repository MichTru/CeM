import { gsap, reduced } from './motion.js';

// Campionario: le finiture scelte finiscono nel messaggio della richiesta
export function initFiniture() {
  const root = document.getElementById('fin');
  const go = document.getElementById('fin-go');
  const sel = document.getElementById('fin-sel');
  if (!root || !go) return;
  const update = () => {
    const on = [...root.querySelectorAll('.fin__item[aria-pressed="true"]')];
    go.disabled = !on.length;
    sel.innerHTML = on.length
      ? `<b>${on.length} ${on.length === 1 ? 'finitura' : 'finiture'}</b> · ${on.map((b) => b.dataset.fin).join(', ')}`
      : 'Nessuna finitura scelta';
    const byGroup = on.reduce((a, b) => ((a[b.dataset.gruppo] ||= []).push(b.dataset.fin), a), {});
    go.dataset.msg = `Vorrei vedere in showroom i campioni di queste finiture: ${Object.entries(byGroup).map(([g, l]) => `${g.toLowerCase()}: ${l.join(', ')}`).join('; ')}.`;
  };
  root.addEventListener('click', (e) => {
    const b = e.target.closest('.fin__item');
    if (!b) return;
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    update();
  });
  update();
}

// Prima e dopo: il cursore del confronto, con un piccolo invito quando entra a schermo
export function initPrimaDopo() {
  document.querySelectorAll('.pd').forEach((pd) => {
    const r = pd.querySelector('.pd__range');
    const set = (v) => pd.style.setProperty('--pos', `${v}%`);
    r.addEventListener('input', () => set(r.value));
    if (reduced) return;
    const o = { v: 50 };
    gsap.timeline({ scrollTrigger: { trigger: pd, start: 'top 70%', once: true } })
      .to(o, { v: 78, duration: 0.9, ease: 'power2.inOut', onUpdate: () => set(o.v) })
      .to(o, { v: 50, duration: 1.1, ease: 'expo.out', onUpdate: () => set(o.v), onComplete: () => (r.value = 50) });
  });
}
