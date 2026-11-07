// Consenso per i contenuti esterni (mappa Google). Nessun cookie di profilazione.
const KEY = 'cm-consent';
const listeners = [];

function read() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
function write(v) {
  try { localStorage.setItem(KEY, v); } catch { /* ignorato */ }
}

export const hasConsent = () => read() === 'yes';
export const onConsent = (fn) => listeners.push(fn);

let pending = null;

function banner() {
  return document.getElementById('cookie');
}

function choose(ok) {
  write(ok ? 'yes' : 'no');
  const b = banner();
  if (b) b.hidden = true;
  listeners.forEach((fn) => fn(ok));
  pending?.(ok);
  pending = null;
}

// Chiede il consenso (es. dal bottone della mappa): se già dato risolve subito.
export function askConsent() {
  if (hasConsent()) return Promise.resolve(true);
  return new Promise((resolve) => {
    pending = resolve;
    const b = banner();
    b.hidden = false;
    b.querySelector('[data-consent="yes"]').focus();
  });
}

export function initConsent() {
  const b = banner();
  if (!b) return;
  b.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-consent]');
    if (btn) choose(btn.dataset.consent === 'yes');
  });
  document.querySelectorAll('[data-cookie-prefs]').forEach((btn) =>
    btn.addEventListener('click', () => { b.hidden = false; b.querySelector('[data-consent]').focus(); }));
  if (read() === null) setTimeout(() => { b.hidden = false; }, 3400);
}
