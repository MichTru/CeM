import '@fontsource-variable/outfit/wght.css';
import './styles/main.css';
import './styles/page.css';

// Pagine per ambiente: prima il primo frame, poi interazioni e animazioni.
requestAnimationFrame(() => setTimeout(() => import('./page-app.js'), 0));
