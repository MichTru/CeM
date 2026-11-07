import { hasConsent, onConsent, askConsent } from './consent.js';
import { initBooking, bookingIncomplete } from './booking.js';

// Orari: mar–sab 9:30–12:30 e 15:00–19:00, lunedì solo pomeriggio, domenica chiuso.
const MORNING = [9 * 60 + 30, 12 * 60 + 30];
const AFTERNOON = [15 * 60, 19 * 60];
const DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

function slots(day) {
  if (day === 0) return [];
  if (day === 1) return [AFTERNOON];
  return [MORNING, AFTERNOON];
}
const hhmm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

export function romeNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, min: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function openStatus(now = romeNow()) {
  const { day, min } = now;
  const open = slots(day).find(([a, b]) => min >= a && min < b);
  if (open) return { open: true, text: `Aperto ora · chiude alle ${hhmm(open[1])}` };
  const later = slots(day).find(([a]) => min < a);
  if (later) return { open: false, text: `Chiuso ora · riapre oggi alle ${hhmm(later[0])}` };
  for (let k = 1; k <= 7; k++) {
    const d = (day + k) % 7;
    const s = slots(d);
    if (s.length) {
      const when = k === 1 ? 'domani' : DAYS[d];
      return { open: false, text: `Chiuso ora · riapre ${when} alle ${hhmm(s[0][0])}` };
    }
  }
  return { open: false, text: 'Chiuso' };
}

function initStatus() {
  const els = [...document.querySelectorAll('#status, .menu__status')];
  if (!els.length) return;
  const paint = () => {
    const s = openStatus();
    els.forEach((el) => {
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
      el.querySelector('.status__text').textContent = s.text;
    });
  };
  paint();
  setInterval(paint, 60 * 1000);
}

function initForm() {
  const form = document.getElementById('form');
  if (!form) return;
  const msg = document.getElementById('form-msg');
  const endpoint = form.getAttribute('action') || '';
  const hasEndpoint = /^https?:\/\//.test(endpoint);

  form.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
    invalid.forEach((el) => el.setAttribute('aria-invalid', 'true'));
    if (invalid.length) {
      msg.textContent = 'Controlla i campi evidenziati: nome, email e consenso privacy sono necessari.';
      invalid[0].focus();
      return;
    }
    const missing = bookingIncomplete(form);
    if (missing) {
      msg.textContent = 'Scegli il giorno e la fascia oraria della visita.';
      missing.focus();
      return;
    }
    const data = new FormData(form);
    const btn = form.querySelector('[type="submit"]');

    if (hasEndpoint) {
      btn.disabled = true;
      msg.textContent = 'Invio in corso…';
      try {
        const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        msg.textContent = 'Grazie, abbiamo ricevuto la richiesta. Ti ricontattiamo al più presto.';
        return;
      } catch {
        msg.textContent = 'Invio non riuscito: apriamo la tua app di posta con la richiesta già scritta.';
      } finally {
        btn.disabled = false;
      }
    }

    // Fallback: email precompilata
    const body = [
      `Richiesta: ${data.get('richiesta')}`,
      ...(data.get('appuntamento') && !document.getElementById('when')?.hidden ? [`Quando: ${data.get('appuntamento')}`] : []),
      `Nome: ${data.get('nome')}`,
      `Telefono: ${data.get('telefono') || '-'}`,
      `Email: ${data.get('email')}`,
      `Ambiente: ${data.get('ambiente')}`,
      '',
      data.get('messaggio') || '',
    ].join('\n');
    const subject = `${data.get('richiesta')} · ${data.get('nome')}`;
    location.href = `mailto:cassaniemartignani@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (!hasEndpoint) msg.textContent = 'Si apre la tua app di posta con la richiesta già scritta.';
  });
}

const MAP_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11399.108226106511!2d11.900762524539353!3d44.41722039212444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x477e032bbc00937b%3A0xb5db5fb704766b82!2sVia%20Francesco%20Baracca%2C%2070%2C%2048022%20Lugo%20RA!5e0!3m2!1sit!2sit!4v1589818193006!5m2!1sit!2sit';

function initMap() {
  const map = document.getElementById('map');
  const btn = document.getElementById('map-load');
  if (!map || !btn) return;
  const load = () => {
    if (map.querySelector('iframe')) return;
    const f = document.createElement('iframe');
    f.src = MAP_SRC;
    f.title = 'Mappa: Cassani & Martignani, via Francesco Baracca 70, Lugo';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.allowFullscreen = true;
    map.replaceChildren(f);
  };
  btn.addEventListener('click', () => askConsent().then((ok) => ok && load()));
  if (hasConsent()) {
    // carica la mappa solo quando la sezione si avvicina
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { load(); io.disconnect(); } }, { rootMargin: '400px' }).observe(map);
  }
  onConsent((ok) => ok && load());
}

export function initContacts() {
  initStatus();
  initBooking();
  initForm();
  initMap();
  // [NUMERO WHATSAPP] è ancora da completare con il cliente
  const wa = document.querySelector('[data-whatsapp]');
  if (wa && wa.getAttribute('href').includes('[')) {
    wa.addEventListener('click', (e) => {
      e.preventDefault();
      wa.setAttribute('title', 'Numero WhatsApp da completare');
    });
  }
}
