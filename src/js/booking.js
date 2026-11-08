import { romeNow } from './contacts.js';
import { scrollToEl, lenis } from './motion.js';

// Prenotazione: giorno e fascia oraria tra gli orari di apertura (ora italiana).
// Mar–sab mattina e pomeriggio, lunedì solo pomeriggio, domenica chiuso.
const DAYS_AHEAD = 21;
const SLOTS = [
  { key: 'mattina', end: 12 * 60 + 30 },
  { key: 'pomeriggio', end: 19 * 60 },
];

function romeToday() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const [y, m, d] = p.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

function available(date, isToday, nowMin) {
  const dow = date.getUTCDay();
  return SLOTS.map((s, i) => {
    if (dow === 0) return false;
    if (dow === 1 && i === 0) return false;
    if (isToday && nowMin > s.end - 60) return false;
    return true;
  });
}

const fmt = (o) => new Intl.DateTimeFormat('it-IT', { timeZone: 'UTC', ...o });

export function initBooking() {
  const form = document.getElementById('form');
  const when = document.getElementById('when');
  if (!form || !when) return;
  const daysBox = document.getElementById('when-days');
  const slotInputs = [...when.querySelectorAll('input[name="fascia"]')];
  const summary = document.getElementById('when-summary');
  const hidden = document.getElementById('f-appuntamento');
  const today = romeToday();
  const now = romeNow();
  const avail = new Map();

  // Nelle pagine per ambiente il modulo parte già sull'ambiente giusto
  const pageAmb = document.body.dataset.ambiente;
  if (pageAmb) {
    const sel = form.querySelector('#f-amb');
    const opt = [...sel.options].find((o) => o.text === pageAmb);
    if (opt) sel.value = opt.text;
  }

  const html = [];
  for (let k = 0; k < DAYS_AHEAD; k++) {
    const d = new Date(today.getTime() + k * 864e5);
    const iso = d.toISOString().slice(0, 10);
    const a = available(d, k === 0, now.min);
    avail.set(iso, a);
    const open = a.some(Boolean);
    const long = fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(d);
    html.push(`<label class="day${open ? '' : ' is-closed'}"><input type="radio" name="giorno" value="${iso}"${open ? '' : ' disabled'} aria-label="${long}${open ? '' : ', chiuso'}"><span><small>${k === 0 ? 'oggi' : k === 1 ? 'domani' : fmt({ weekday: 'short' }).format(d)}</small><b>${fmt({ day: 'numeric' }).format(d)}</b><small>${open ? fmt({ month: 'short' }).format(d) : 'chiuso'}</small></span></label>`);
  }
  daysBox.innerHTML = html.join('');
  const dayInputs = [...daysBox.querySelectorAll('input')];

  function update() {
    const day = dayInputs.find((i) => i.checked);
    const a = day ? avail.get(day.value) : [true, true];
    slotInputs.forEach((s, i) => {
      s.disabled = !a[i];
      s.closest('.slot').classList.toggle('is-off', !a[i]);
      if (!a[i]) s.checked = false;
    });
    const slot = slotInputs.find((s) => s.checked);
    if (day && slot) {
      const d = new Date(`${day.value}T12:00:00Z`);
      const label = `${fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(d)}, ${slot.value.toLowerCase()}`;
      hidden.value = label;
      summary.textContent = `Ti aspettiamo ${label}. Ti richiamiamo per confermare l'orario.`;
    } else {
      hidden.value = '';
      summary.textContent = day
        ? 'Ora scegli la fascia: mattina o pomeriggio.'
        : "Scegli un giorno e una fascia: ti richiamiamo per confermare l'orario.";
    }
  }
  when.addEventListener('change', update);
  update();

  // La scelta del giorno si vede solo per le visite
  const kind = () => form.querySelector('input[name="richiesta"]:checked')?.value || '';
  const toggle = () => {
    const visita = kind().startsWith('Visita');
    when.hidden = !visita;
    form.querySelector('.form__title').textContent = visita ? 'Prenota una visita in showroom' : 'Chiedi un preventivo';
  };
  form.querySelectorAll('input[name="richiesta"]').forEach((r) => r.addEventListener('change', toggle));
  toggle();

  // Nelle pagine interne il modulo sta in un pannello che si apre dal basso
  const sheet = document.getElementById('sheet');
  const openSheet = () => {
    if (!sheet || sheet.open) return;
    document.dispatchEvent(new Event('cm:close-menu'));
    lenis?.stop();
    sheet.showModal();
    document.documentElement.classList.add('sheet-open');
    sheet.querySelector('.sheet__inner').scrollTop = 0;
  };
  const closeSheet = () => { if (sheet?.open) sheet.close(); };
  if (sheet) {
    sheet.addEventListener('close', () => { lenis?.start(); document.documentElement.classList.remove('sheet-open'); });
    sheet.addEventListener('click', (e) => { if (e.target === sheet || e.target.closest('[data-sheet-close]')) closeSheet(); });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-sheet-open]')) { e.preventDefault(); openSheet(); return; }
      const a = e.target.closest('a[href$="#contatti"]');
      if (a && !a.closest('#sheet') && !a.hasAttribute('data-prefill')) { e.preventDefault(); e.stopPropagation(); openSheet(); }
    }, true);
  }

  // Bottoni "La voglio vedere" e simili: precompilano il modulo
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-prefill]');
    if (!b) return;
    const amb = form.querySelector('#f-amb');
    if (b.dataset.ambiente) {
      const opt = [...amb.options].find((o) => o.text === b.dataset.ambiente);
      if (opt) amb.value = opt.text;
    }
    if (b.dataset.msg) form.querySelector('#f-msg').value = b.dataset.msg;
    const visita = form.querySelector('input[name="richiesta"][value^="Visita"]');
    visita.checked = true;
    toggle();
    if (sheet) { e.preventDefault(); openSheet(); return; }
    if (b.tagName !== 'A') {
      e.preventDefault();
      scrollToEl(document.getElementById('contatti'));
    }
  });
}

// Usato dal modulo prima dell'invio
export function bookingIncomplete(form) {
  const when = document.getElementById('when');
  if (!when || when.hidden) return null;
  const day = form.querySelector('input[name="giorno"]:checked');
  const slot = form.querySelector('input[name="fascia"]:checked');
  if (day && slot) return null;
  return day ? form.querySelector('input[name="fascia"]:not(:disabled)') : form.querySelector('input[name="giorno"]:not(:disabled)');
}
