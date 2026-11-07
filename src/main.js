import '@fontsource-variable/outfit/wght.css';
import './styles/main.css';

// Prima il primo frame (hero e intro sono già nel CSS), poi animazioni e interazioni.
requestAnimationFrame(() => setTimeout(() => import('./app.js'), 0));
