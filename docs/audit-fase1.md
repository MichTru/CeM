# Audit · Fase 1

Misurato l'8 novembre 2026 sulla build locale, con Playwright (iPhone a 390 px, poi 768, 1280 e 1920 px) e Lighthouse mobile su tutte le 13 pagine.

## Numeri di partenza

| Pagina | Schermate a 390 px | Foto ripetute nella pagina | "In showroom" ripetuto | Lighthouse (prestazioni / LCP) |
|---|---|---|---|---|
| Home | 12,9 | 7 foto 2-3 volte | 3 | 94 / 2,7 s |
| Cucine | 16,0 | 6 foto 2 volte | 11 | 97 / 2,5 s |
| Divani e poltrone | 14,7 | 6 foto 2 volte | 12 | 97 / 2,4 s |
| Letti | 14,2 | 5 foto, una 3 volte | 13 | 98 / 2,2 s |
| Armadi | 10,5 | 4 foto, una 3 volte | 6 | 98 / 2,2 s |
| Camerette | 10,5 | 4 foto, una 3 volte | 6 | 99 / 2,1 s |
| Zona pranzo | 11,3 | 4 foto, una 3 volte | 6 | 99 / 2,1 s |
| Soggiorno | 11,3 | 4 foto, una 3 volte | 6 | 99 / 2,1 s |
| Su misura | 10,5 | 2 foto 2 volte | 2 | 98 / 2,2 s |
| Ristrutturi | 10,5 | 1 foto 2 volte | 2 | 97 / 2,5 s |

Accessibilità, best practice e SEO sono a 100 ovunque. Fa eccezione la pagina Crediti, con SEO 66, perché è esclusa dai motori di ricerca di proposito. Nessun errore in console e nessun elemento che esce dallo schermo.

## Problemi

| # | Gravità | Problema | Dove | Proposta |
|---|---|---|---|---|
| R1 | Alta | La foto di ogni tipo (per esempio "Con isola") ritorna identica nella prima proposta dello stesso tipo, e la foto della hero ritorna nelle proposte | Tutte le categorie | Una foto per ruolo: hero, tipi e proposte usano foto diverse; il generatore lo verifica e avvisa |
| R2 | Alta | "In showroom" con l'elenco dei marchi ripetuto in ogni card: da 6 a 13 volte per pagina | Categorie | Marchi una volta sola, nell'introduzione; nella card solo se specifici (`marchi` nella proposta) |
| R3 | Alta | Il dettaglio della maniglia in rovere (`su-misura-dettaglio-maniglia`) compare in quasi ogni pagina: bento, tile, menu, blocco "Serve un pezzo in più?" | Ovunque | Un solo richiamo al su misura per pagina; il blocco grande diventa una riga dentro le proposte |
| R4 | Alta | Pagine lunghe su mobile: 13–16 schermate per home e categorie principali | Home, Cucine, Divani, Letti | Proposte a carosello orizzontale, galleria in home ridotta, tipi più compatti |
| R5 | Media | Le categorie compaiono tre volte per pagina: menu, "Cos'altro cerchi?" (con 7-8 tile) e footer | Categorie | "Cos'altro cerchi?" con 3 categorie affini |
| R6 | Media | Due racconti del metodo: 4 fasi in Su misura e 5 tappe in Ristrutturi, con nomi diversi | Su misura, Ristrutturi, home | Un solo metodo con le stesse tappe ovunque |
| R7 | Media | Ritmo uniforme: 4–5 titoli giganti per pagina, sempre la stessa card | Tutte | Alternare tipi di sezione e grandezze dei titoli |
| R8 | Media | Il blocco contatti completo (mappa, orari, form) è in fondo a ogni pagina, più gli orari nel footer e nel menu | Tutte | Nelle categorie un invito compatto che apre il modulo |
| B1 | Media | Header flottante troppo trasparente sopra il testo | Tutte, su mobile | Fondo più coprente |
| B2 | Media | LCP della home a 2,7 s | Home | Accorciare la home e alleggerire la parte sotto la piega |
| B3 | Media | Aree da toccare piccole: logo alto 29–33 px, "Home" nel percorso 36×22, hotspot 30×30, bottoni piccoli alti 42 px, "Preferenze cookie" | Tutte | Minimo 44 px |
| B4 | Media | Foto stock di stili diversi e a circa 1000 px | Categorie | Correzione colore comune più decisa, sostituire le più stonate |
| B5 | Bassa | Segnaposto grandi in "Chi siamo" (showroom, Marco e Mauro) | Home | Ridurli finché non arrivano le foto |
| B6 | Bassa | Intro di 4,5 s a ogni apertura della home | Home | Da decidere con il cliente |
| B7 | Bassa | Placeholder aperti: WhatsApp, Formspree, privacy e cookie, marchi per categoria | Contatti e categorie | Dai titolari |
