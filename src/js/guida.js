import { gsap, reduced, scrollToEl } from './motion.js';

// Percorso guidato: una domanda per volta, poi le proposte più adatte
// e la prenotazione già compilata con le risposte.
export function initGuida() {
  const root = document.getElementById('guida');
  const dataEl = document.getElementById('guida-data');
  if (!root || !dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const { domande } = data;
  let step = 0;
  let answers = {};

  const label = (q, v) => q.opzioni.find((o) => o.v === v)?.label || '';

  function animateIn() {
    if (reduced) return;
    gsap.fromTo(root.querySelector('.guida__q'), { clipPath: 'inset(0% 50% 0% 50%)', opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.8, ease: 'expo.inOut' });
    gsap.fromTo(root.querySelectorAll('.guida__opt, .guida__res .pcard'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, delay: 0.15 });
  }

  function transition(next) {
    const items = root.querySelectorAll('.guida__q, .guida__opt, .guida__res > *');
    if (reduced || !items.length) { next(); return; }
    gsap.to(items, { y: -16, opacity: 0, duration: 0.3, stagger: 0.02, ease: 'power2.in', onComplete: next });
  }

  function progress() {
    return `<div class="guida__progress" aria-hidden="true">${domande.map((_, i) => `<i class="${i < step ? 'is-done' : i === step ? 'is-now' : ''}"></i>`).join('')}</div>`;
  }

  function renderStep() {
    const q = domande[step];
    root.innerHTML = `
      ${progress()}
      <p class="guida__count">Domanda ${step + 1} di ${domande.length}</p>
      <h3 class="guida__q" tabindex="-1">${q.testo}</h3>
      <div class="guida__opts guida__opts--${q.opzioni.length}" role="group" aria-label="${q.testo}">
        ${q.opzioni.map((o) => `
        <button type="button" class="guida__opt${answers[q.id] === o.v ? ' is-on' : ''}" data-v="${o.v}" aria-pressed="${answers[q.id] === o.v}">
          <span class="guida__opt-label">${o.label}</span>
          ${o.nota ? `<span class="guida__opt-note">${o.nota}</span>` : ''}
          <span class="guida__opt-dot" aria-hidden="true"></span>
        </button>`).join('')}
      </div>
      <div class="guida__nav">
        ${step > 0 ? '<button type="button" class="linklike guida__back">Indietro</button>' : '<span></span>'}
      </div>`;
    animateIn();
  }

  function score(p) {
    let s = 0;
    domande.forEach((q) => {
      const a = answers[q.id];
      if (!a || !q.peso) return;
      const opt = q.opzioni.find((o) => o.v === a);
      if (opt?.jolly) { s += q.peso * 0.5; return; }
      const tags = p.tag?.[q.id];
      if (!tags) return;
      if (tags.includes(a)) s += q.peso;
    });
    return s;
  }

  function renderResults() {
    const ranked = data.proposte
      .map((p) => ({ p, s: score(p) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);
    const summary = domande.map((q) => label(q, answers[q.id])).filter(Boolean);
    const msg = [
      `Percorso guidato · ${data.nome}`,
      ...domande.map((q) => `${q.testo} ${label(q, answers[q.id])}`),
      ranked.length ? `Proposte che mi interessano: ${ranked.map((r) => r.p.titolo).join(', ')}.` : '',
    ].filter(Boolean).join('\n');

    root.innerHTML = `
      ${progress()}
      <p class="guida__count">Le tue risposte</p>
      <h3 class="guida__q" tabindex="-1">Ecco cosa ti proponiamo</h3>
      <ul class="guida__summary" aria-label="Le tue risposte">${summary.map((s) => `<li>${s}</li>`).join('')}</ul>
      <div class="guida__res"></div>
      <div class="guida__end">
        <button type="button" class="btn btn--light" data-prefill data-ambiente="${data.form}">Prenota con queste risposte</button>
        <button type="button" class="btn btn--ghost guida__again">Ricomincia</button>
      </div>`;
    root.querySelector('[data-prefill]').dataset.msg = msg;
    const res = root.querySelector('.guida__res');
    ranked.forEach(({ p }) => {
      const card = document.querySelector(`#proposte-grid [data-id="${p.id}"]`);
      if (!card) return;
      const c = card.cloneNode(true);
      c.classList.remove('reveal-card', 'is-hidden');
      c.removeAttribute('style');
      res.appendChild(c);
    });
    if (!ranked.length) res.innerHTML = '<p class="guida__none">Le tue risposte meritano una chiacchierata: in showroom ti mostriamo le soluzioni più adatte.</p>';
    animateIn();
  }

  function focusQ() {
    root.querySelector('.guida__q')?.focus({ preventScroll: true });
  }

  root.addEventListener('click', (e) => {
    const opt = e.target.closest('.guida__opt');
    if (opt) {
      const q = domande[step];
      answers[q.id] = opt.dataset.v;
      root.querySelectorAll('.guida__opt').forEach((b) => {
        b.classList.toggle('is-on', b === opt);
        b.setAttribute('aria-pressed', b === opt);
      });
      transition(() => {
        step += 1;
        if (step < domande.length) renderStep();
        else { renderResults(); scrollToEl(root); }
        focusQ();
      });
      return;
    }
    if (e.target.closest('.guida__back')) {
      transition(() => { step -= 1; renderStep(); focusQ(); });
      return;
    }
    if (e.target.closest('.guida__again')) {
      transition(() => { step = 0; answers = {}; renderStep(); focusQ(); });
      scrollToEl(document.getElementById('percorso'));
    }
  });

  renderStep();
}

// Tile dei tipi e filtri delle proposte
export function initProposte() {
  const grid = document.getElementById('proposte-grid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.pcard')];
  const chips = [...document.querySelectorAll('[data-pf]')];
  const apply = (f) => {
    chips.forEach((b) => {
      const on = b.dataset.pf === f;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
    });
    const before = new Map(cards.filter((c) => !c.classList.contains('is-hidden')).map((c) => [c, c.getBoundingClientRect()]));
    cards.forEach((c) => c.classList.toggle('is-hidden', f !== 'tutti' && c.dataset.tipo !== f));
    if (reduced) return;
    cards.forEach((c) => {
      if (c.classList.contains('is-hidden')) return;
      gsap.set(c, { clearProps: 'clipPath' });
      const a = before.get(c);
      const b = c.getBoundingClientRect();
      if (a) gsap.fromTo(c, { x: a.left - b.left, y: a.top - b.top }, { x: 0, y: 0, duration: 0.8, ease: 'expo.out', clearProps: 'transform' });
      else gsap.fromTo(c, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.7, clearProps: 'transform,opacity' });
    });
  };
  chips.forEach((b) => b.addEventListener('click', () => apply(b.dataset.pf)));
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tipo].tipo');
    if (t && chips.some((c) => c.dataset.pf === t.dataset.tipo)) apply(t.dataset.tipo);
  });
}
