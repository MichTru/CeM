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

## Contenuti (src/data)

- `categorie.json`: le 8 categorie (cucine, divani e poltrone, letti, armadi, camerette, zona pranzo, soggiorno, su misura) con testi, tipi e marchi
- `proposte.json`: le proposte di ogni categoria, con i tag usati dai percorsi guidati
- `percorsi.json`: le domande dei percorsi guidati di cucine, divani e letti
- `galleria.json`: la galleria della home
- `occasioni.json`, `storie.json`: compaiono solo quando contengono voci

Le pagine si rigenerano da sole a ogni build (`npm run build` lancia prima `scripts/build-pages.mjs`).

## Foto d'ispirazione

In attesa delle foto vere, 30 immagini sono foto CC0 (pubblico dominio) trovate con Openverse da StockSnap e Rawpixel: sono in `assets-src/stock`, con alt text in `alt.json` e crediti in `credits.json`, e sul sito portano la dicitura "Foto d'ispirazione". L'elenco completo è nella pagina `crediti.html`. Per sostituirne una basta mettere la foto vera al posto del file (stesso nome) e lanciare `npm run images`.

## Da completare con il cliente

- `[NUMERO WHATSAPP]` in `index.html`
- `[ENDPOINT FORM]` (Formspree) in `index.html`: finché manca, il modulo apre l'app di posta
- Logo vettoriale originale (l'SVG attuale è ricostruito da un PNG di 350 px)
- Foto vere al posto delle foto d'ispirazione; in particolare falegnameria, showroom, Marco e Mauro e lavori realizzati
- Testi di privacy e cookie policy da verificare con il consulente
