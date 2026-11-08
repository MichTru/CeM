// Lista "Mi piace": il cuore sulle proposte e nelle schede salva i pezzi sul dispositivo;
// la lista finisce nella richiesta di visita, così in showroom li trovi pronti.
const KEY = 'cm-mipiace';
let list = load();

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v.filter((x) => x && x.id && x.nome) : [];
  } catch {
    return [];
  }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* navigazione privata */ }
  renderLikes();
}
const has = (id) => list.some((l) => l.id === id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const getLikes = () => list.slice();
export function likesText() {
  return list.length ? `I miei Mi piace:\n${list.map((l) => `- ${l.nome}${l.amb ? ` (${l.amb})` : ''}`).join('\n')}` : '';
}

let toastEl;
let toastTimer;
function toast(text) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);
  }
  toastEl.innerHTML = text;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
}

// Aggiorna cuori, contatori e la lista dentro il modulo
export function renderLikes() {
  document.querySelectorAll('[data-like]').forEach((b) => {
    const on = has(b.dataset.like);
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? `Togli ${b.dataset.nome} dai Mi piace` : `Aggiungi ${b.dataset.nome} ai Mi piace`);
  });
  const n = list.length;
  document.querySelectorAll('[data-likes-count]').forEach((el) => (el.textContent = n));
  document.querySelectorAll('[data-likes-show]').forEach((el) => (el.hidden = !n));
  document.documentElement.classList.toggle('has-likes', n > 0);
  const box = document.getElementById('likes-box');
  if (box) {
    box.hidden = !n;
    box.querySelector('ul').innerHTML = list.map((l) => `
      <li><span>${esc(l.nome)}${l.amb ? ` <small>${esc(l.amb)}</small>` : ''}</span>
        <button type="button" data-unlike="${esc(l.id)}" aria-label="Togli ${esc(l.nome)}"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button></li>`).join('');
    const input = document.getElementById('f-likes');
    if (input) input.value = list.map((l) => l.nome).join('; ');
  }
}

export function initLikes() {
  document.body.insertAdjacentHTML('beforeend', `
  <a class="likes-pill" href="#contatti" data-likes-show hidden>
    <svg class="ico" aria-hidden="true"><use href="#i-heart"/></svg>
    <span><b data-likes-count>0</b> Mi piace</span>
    <span class="likes-pill__go">Prenota la visita</span>
  </a>`);

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-like]');
    if (b) {
      e.preventDefault();
      e.stopPropagation();
      const id = b.dataset.like;
      if (has(id)) {
        list = list.filter((l) => l.id !== id);
        toast(`Tolto dai Mi piace`);
      } else {
        list.push({ id, nome: b.dataset.nome, amb: b.dataset.amb || '' });
        toast(`<svg class="ico" aria-hidden="true"><use href="#i-heart"/></svg> Aggiunto ai Mi piace`);
      }
      save();
      return;
    }
    const u = e.target.closest('[data-unlike]');
    if (u) {
      list = list.filter((l) => l.id !== u.dataset.unlike);
      save();
    }
  });
  // la pillola sparisce quando il modulo è già a schermo
  const contatti = document.querySelector('.contatti');
  if (contatti) new IntersectionObserver(([en]) => document.documentElement.classList.toggle('contatti-in-vista', en.isIntersecting), { threshold: 0.15 }).observe(contatti);
  // stessa lista in più schede del browser
  addEventListener('storage', (e) => { if (e.key === KEY) { list = load(); renderLikes(); } });
  renderLikes();
}
