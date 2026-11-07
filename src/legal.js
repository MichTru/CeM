import '@fontsource-variable/outfit/wght.css';
import './styles/main.css';
import './styles/legal.css';

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
document.querySelector('[data-cookie-reset]')?.addEventListener('click', (e) => {
  try { localStorage.removeItem('cm-consent'); } catch { /* ignorato */ }
  e.currentTarget.textContent = 'Consenso revocato';
});
