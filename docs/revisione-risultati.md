# Revisione · risultati

Misure dell'8 novembre 2026 sulla build locale: Playwright con iPhone a 390 px e Lighthouse mobile. Il punto di partenza è in `docs/audit-fase1.md`.

## Prima e dopo

| Pagina | Schermate a 390 px | Foto ripetute nella pagina | "In showroom" ripetuto | Aree da toccare sotto 44 px |
|---|---|---|---|---|
| Home | 12,9 → 11,7 | 7 → 0 | 3 → 3 | 9 → 1 |
| Cucine | 16,0 → 6,8 | 6 → 0 | 11 → 2 | 9 → 0 |
| Divani e poltrone | 14,7 → 6,4 | 6 → 0 | 12 → 4 | 9 → 0 |
| Letti | 14,2 → 6,4 | 5 → 0 | 13 → 6 | 9 → 0 |
| Armadi | 10,5 → 4,7 | 4 → 0 | 6 → 2 | 8 → 0 |
| Camerette | 10,5 → 4,7 | 4 → 0 | 6 → 2 | 8 → 0 |
| Zona pranzo | 11,3 → 5,5 | 4 → 0 | 6 → 2 | 9 → 0 |
| Soggiorno | 11,3 → 5,6 | 4 → 0 | 6 → 2 | 9 → 0 |
| Su misura | 10,5 → 7,3 | 2 → 0 | 2 → 1 | 7 → 0 |
| Ristrutturi | 10,5 → 7,5 | 1 → 0 | 2 → 1 | 7 → 0 |
| Galleria (nuova) | 6,7 | 0 | 1 | 0 |

Le "In showroom" rimaste sono frasi del testo, per esempio "In showroom puoi provare…", non più l'elenco dei marchi ripetuto. L'area sotto i 44 px rimasta in home è il link "informativa privacy" dentro la frase del consenso, che è ammesso dalle linee guida.

**Lighthouse mobile.** Accessibilità, best practice e SEO restano a 100 su tutte le pagine; la pagina Crediti ha SEO 66 perché è esclusa dai motori di ricerca di proposito. Le prestazioni restano tra 92 e 99.

L'LCP in questo ambiente oscilla molto: la stessa home dà da 2,3 a 3,1 s. Su tre misure la mediana è:

| Pagina | Prima della revisione | Dopo |
|---|---|---|
| Home | 2,8 s | circa 3,0 s |
| Cucine | — | 2,4 s |
| Letti | — | 2,7 s |
| Divani e poltrone | — | 2,8 s |

Per la home i pesi di HTML, CSS e JS sono rimasti quasi uguali (il JS è sceso da 12,6 a 4,2 KB), quindi la differenza rientra nella variabilità della misura. L'obiettivo di 2,5 s non è ancora raggiunto in modo stabile: va verificato sul sito pubblicato con PageSpeed Insights (https://pagespeed.web.dev), che misura con condizioni più regolari.

## Cosa è cambiato

**Regole contro le ripetizioni, scritte nel generatore (`scripts/build-pages.mjs`)**
- Controllo a ogni build: se una foto compare due volte nella stessa pagina, la build lo segnala. Oggi il risultato è "nessuna foto ripetuta".
- Hero, proposte e tile usano foto diverse. I tipi (con isola, a penisola…) sono diventati i filtri delle proposte, con la loro descrizione, invece di una sezione a parte con le stesse foto.
- I marchi compaiono una volta sola, nell'introduzione. Nelle card restano solo se specifici, come per i materassi.
- Il su misura è una riga in fondo alle proposte, al posto del blocco "Serve un pezzo in più?".
- "Potrebbe interessarti anche" mostra 3 categorie affini, scelte in `categorie.json` (`correlate`).
- Un solo metodo di lavoro (planimetria, rilievo, progetto, falegnameria, montaggio) in Su misura e Ristrutturi.
- Nelle pagine interne, al posto del blocco contatti completo c'è un invito compatto, con il modulo in un pannello che si apre dal basso.

**Correzioni**
- Header flottante più coprente; saltando a una sezione il titolo non finisce più sotto l'header.
- Proposte a carosello orizzontale su mobile.
- In home 6 foto della galleria (scelte con `home: true` in `galleria.json`); tutte le foto sono nella nuova pagina /galleria/.
- Aree da toccare di almeno 44 px.
- Foto stock con una correzione colore comune più decisa.
- In "Chi siamo" il grande segnaposto vuoto è diventato una composizione con le due ditte che si uniscono nel logo.
- Poster e video in loop partono dopo il caricamento della pagina; le foto fuori dalla prima schermata scaricano a priorità bassa.

**Nuovo**
- Blocco recensioni "Dicono di noi", alimentato da `src/data/recensioni.json`, che compare solo con recensioni vere.
- Intro breve (circa 1,5 s) per chi apre la home una seconda volta nella stessa giornata.

## Da completare con i titolari

- 3 o 4 recensioni dalla scheda Google, con il link alla scheda (`src/data/recensioni.json`)
- `[NUMERO WHATSAPP]` e `[ENDPOINT FORM]`
- Foto vere: showroom (al posto della composizione in "Chi siamo"), falegnameria, Marco e Mauro, lavori finiti
- Quali marchi producono davvero divani, armadi e camerette
- Verifica di privacy e cookie policy
