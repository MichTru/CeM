# Cassani & Martignani · sito

Proposta del nuovo sito per lo showroom di arredamento Cassani & Martignani (Lugo, RA).
Vite con HTML, CSS e JS vanilla; GSAP + ScrollTrigger, Lenis, Three.js caricato solo vicino alla sezione "Su misura".

## Comandi

```sh
npm install
npm run dev        # sviluppo su http://localhost:5173/CeM/
npm run build      # sito statico in dist/
npm run images     # rigenera foto AVIF/WebP, placeholder sfocati e render 3D in public/img
sh scripts/build-loops.sh       # loop video Ken Burns (ffmpeg)
node scripts/build-meta.mjs     # favicon, immagine Open Graph, robots, sitemap
node scripts/render-3d.mjs      # render statici della scena 3D (con npm run dev attivo)
```

La pubblicazione su GitHub Pages parte da `.github/workflows/deploy.yml` a ogni push.

## Struttura

- `index.html`: pagina principale. `<cm-img name="…">` viene espanso in un `<picture>` responsive (vedi `vite.config.js`).
- `src/js/`: un modulo per sezione (intro, hero, bento, ambienti, su misura, galleria, contatti…).
- `src/js/scene.js`: il modulo d'arredo in Three.js.
- `assets-src/`: sorgenti (logo, foto del sito attuale, render 3D, elenco foto Flickr).

## Da completare con il cliente

- `[NUMERO WHATSAPP]` in `index.html`
- `[ENDPOINT FORM]` (Formspree) in `index.html`: finché manca, il modulo apre l'app di posta
- Logo vettoriale originale (l'SVG attuale è ricostruito da un PNG di 350 px)
- Foto vere: falegnameria, showroom, Marco e Mauro, lavori realizzati, camere da letto, complementi, elettrodomestici
- Testi di privacy e cookie policy da verificare con il consulente
