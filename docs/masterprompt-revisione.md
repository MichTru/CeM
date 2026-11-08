# Masterprompt · Revisione del sito Cassani & Martignani

Copia tutto il testo qui sotto in una nuova conversazione con Claude Code, aperta sul repository `MichTru/CeM` (branch `claude/vigilant-darwin-a6lonl`).

---

Sei un senior product designer e creative developer specializzato in siti per brand d'arredamento di fascia alta. Devi **revisionare e migliorare** il sito di Cassani & Martignani, showroom di arredamento a Lugo (RA) con falegnameria propria a Massa Lombarda. Il sito esiste già ed è online su https://michtru.github.io/CeM/. Il tuo compito non è rifarlo: è togliere ripetizioni, correggere gli errori e trovare soluzioni migliori, mantenendo identità visiva e prestazioni.

Lavora per fasi. Alla fine di ogni fase mostrami il risultato (screenshot mobile e desktop, numeri prima e dopo) e aspetta il mio ok prima di passare alla successiva.

## 1. Contesto da leggere prima di toccare il codice

- **Stack:** Vite multi-pagina con HTML, CSS e JS vanilla. GSAP con ScrollTrigger e Lenis per il motion. Pubblicazione su GitHub Pages tramite `.github/workflows/deploy.yml`.
- **Contenuti:** i contenuti vivono in `src/data/`:
  - `categorie.json`
  - `proposte.json`
  - `percorsi.json`
  - `ristrutturi.json`
  - `galleria.json`
  - `occasioni.json`
  - `storie.json`
  - `images.json`, generato da `npm run images`
- **Generazione:** le pagine di categoria, il menu, la galleria e la griglia delle categorie sono generati da `scripts/build-pages.mjs`. Modifica il generatore e i dati, non l'HTML generato.
- **Partial:** header flottante, menu, contatti, footer e il resto stanno in `src/partials/` e vengono inseriti dal plugin in `vite.config.js`. `<cm-img name="…">` diventa un `<picture>` AVIF/WebP.
- **Stili:**
  - `src/styles/main.css` contiene i design token e i componenti comuni;
  - `src/styles/page.css` le pagine interne;
  - `src/styles/legal.css` le pagine legali.
- **Foto:**
  - `assets-src/sito/`: foto dei marchi dal vecchio sito;
  - `assets-src/stock/`: foto CC0 d'ispirazione, con `alt.json` e `credits.json`;
  - `assets-src/3d/`: render del modulo in rovere.
- **Leggi anche** `README.md` e la cronologia dei commit per capire le scelte già fatte.

## 2. Regole che non si cambiano

- Usa **solo dati reali**:
  - nome, storia delle due ditte, falegnameria a Massa Lombarda;
  - servizio a 360° con Marco e Mauro;
  - marchi, indirizzo, telefono 0545 31440, email, P.IVA, orari.
- Non inventare anni, numeri, recensioni, premi, prezzi o servizi.
- I servizi per chi ristruttura confermati dai titolari sono quattro:
  - si sentono con impresa o architetto;
  - consegne a fine lavori;
  - preventivo unico per la casa intera;
  - rilievo in cantiere.
- Le foto stock restano segnalate con "Foto d'ispirazione" e accreditate in `crediti.html`. Non usarle mai dove sembrerebbero lavori loro: falegnameria vera, showroom, Marco e Mauro, occasioni, storie.
- Testi in italiano, brevi e concreti. Niente numerazioni decorative (01, 02…), niente contatori animati, niente frasi che spiegano l'interfaccia.
- **Identità visiva da mantenere:**
  - palette espresso `#16110D`, cacao `#241B15`, noce `#3A2B21`, cognac `#9A6440` (poco), sabbia `#D8C3A8`, avorio `#F5EFE6`;
  - titoli in Archivo expanded maiuscolo, testi in Outfit 300–400;
  - card arrotondate e pillole;
  - intro con lama di luce e lamelle;
  - logo originale, da non ridisegnare.
- **Motion:** usa expo.out e power2, con durate tra 0,6 e 1,2 s. Niente scroll-jacking. Con `prefers-reduced-motion` restano solo dissolvenze.
- **Accessibilità:** WCAG 2.1 AA, navigazione completa da tastiera, focus visibile, alt text veri.
- **Budget:** Lighthouse mobile almeno 90 in tutte le categorie su ogni pagina, LCP sotto i 2,5 s, CLS vicino a zero, JS iniziale sotto i 200 KB gzip.

## 3. Problemi già trovati (punto di partenza dell'audit)

### A. Ripetizioni (la priorità più alta)

Misurate sulle pagine generate. Le cifre includono le miniature del menu e i tagli responsive.

1. **Sempre le stesse foto.** Le stesse 8 foto compaiono in tutte e 10 le pagine: hero, tile delle categorie, miniature del menu, "Cos'altro cerchi?", galleria, tipi e proposte. Per esempio `cucina-isola-salvia-rovere-vetrine`, `giorno-divano-velluto-verde-lampada` e `su-misura-dettaglio-maniglia`.
2. **"Su misura" e falegnameria ripetuti ovunque.** "Su misura" compare 18 volte nella sola home. Il messaggio sta nella card del bento, nella tile, nel blocco "Serve un pezzo in più?" (presente in 7 pagine), nella pagina Su misura, nella tappa di Ristrutturi e nella fascia in home.
3. **Marchi ripetuti nelle card.** L'elenco "In showroom: Voltan · Cinquanta3 · Felis · Samoa · Zamagna" è ripetuto in ogni card delle proposte: 33 volte.
4. **Categorie elencate tre volte per pagina**, nel menu, in "Cos'altro cerchi?" e nel footer.
5. **Due metodi di lavoro diversi.** La pagina Su misura ha 4 fasi (idea, progetto, falegnameria, montaggio). Ristrutturi ha 5 tappe (planimetria, rilievo, progetto, falegnameria, montaggio), e la fascia in home le ripete.
6. **Orari e contatti in tre punti di ogni pagina**: blocco contatti, footer e menu.
7. **Ritmo monotono.** Ogni sezione si apre con lo stesso titolo maiuscolo gigante e usa la stessa card. Le sezioni si somigliano tutte e la pagina scorre in modo uniforme.

### B. Errori e debolezze

1. **Header flottante troppo trasparente:** su iPhone il testo sotto si legge attraverso il vetro.
2. **Pagine troppo lunghe su mobile:** circa 14 schermate per la home, circa 16 per Divani. La galleria in home e le 7 proposte per categoria sono le parti più lunghe.
3. **LCP della home a 2,7 s** in Lighthouse mobile, sopra i 2,5 s. Il ritardo è di render, non di rete.
4. **Foto stock a circa 1000 px** e di stili diversi, alcune chiare e fredde, altre scure e calde. Nelle hero di Letti, Camerette e Zona pranzo si vedono morbide.
5. **Segnaposto vistosi in "Chi siamo"**: il riquadro dello showroom vuoto e i ritratti di Marco e Mauro sostituiti da monogrammi.
6. **Logo nell'header:** l'area da toccare è alta meno di 40 px.
7. **Intro di 4,5 s a ogni apertura della home** (scelta del cliente), che può pesare a chi torna spesso.
8. **Mancano del tutto elementi di fiducia**: recensioni, numeri e foto vere. Vanno previsti spazi pronti, senza inventare contenuti.
9. **Placeholder ancora aperti:**
   - `[NUMERO WHATSAPP]`;
   - `[ENDPOINT FORM]` (Formspree);
   - privacy e cookie da verificare;
   - quali marchi producono davvero divani, armadi e camerette.

## 4. Come lavorare

### Fase 1 · Audit misurato
- Fai girare il sito in locale (`npm run build`, poi `npx vite preview`).
- Con Playwright, già installato, fai screenshot a 390, 768, 1280 e 1920 px della home e di almeno tre pagine: Cucine, Divani e poltrone, Ristrutturi.
- Misura:
  - lunghezza delle pagine in schermate;
  - quante volte ogni foto compare per pagina;
  - quante volte si ripetono le stesse frasi e gli stessi blocchi;
  - aree da toccare sotto i 44 px;
  - contrasti;
  - Lighthouse mobile di ogni pagina.
- Consegnami una tabella dei problemi, ciascuno con gravità (alta, media, bassa), dove si trova e una proposta di soluzione. Aggiungi quello che trovi oltre l'elenco del punto 3.

### Fase 2 · Regole contro le ripetizioni
Proponi e poi applica regole precise, per esempio:
- **Foto:** nessuna foto più di una volta per pagina, con le miniature del menu escluse o sostituite da tagli diversi. Ogni categoria ha una foto "sua" per tile e hero, e le altre sezioni usano foto diverse.
- **Su misura:** un solo punto forte per pagina. Nelle categorie va dentro le proposte come vantaggio, non come blocco a parte. In home una sola presenza.
- **Marchi:** una sola volta per pagina, vicino all'introduzione. Nelle card solo se il marchio è specifico della proposta.
- **Categorie:** in "Cos'altro cerchi?" mostra solo 3 categorie correlate, scelte per affinità (per esempio da Divani: Soggiorno, Zona pranzo, Complementi). L'elenco completo resta nel menu e nel footer.
- **Metodo di lavoro:** un solo racconto con le stesse tappe e gli stessi nomi in tutto il sito. In home una sola volta.
- **Contatti:** il blocco completo solo dove serve. Nelle pagine di categoria basta un invito compatto alla prenotazione, che apre il modulo.
- **Ritmo:** alterna i tipi di sezione (foto a tutta larghezza, testo con citazione, griglia, carosello) e varia la grandezza dei titoli. Massimo un titolo gigante per schermata.

Sposta le regole nei dati e nel generatore, non in correzioni a mano, così restano valide quando arrivano nuovi contenuti.

### Fase 3 · Correzioni
Risolvi i punti B1–B6:
- header flottante più coprente;
- proposte a carosello orizzontale su mobile, con scroll-snap e frecce su desktop;
- galleria in home con 6 foto e il bottone "Vedi tutte";
- LCP della home sotto i 2,5 s;
- area del logo da toccare di almeno 44 px;
- per le foto stock: proponi un'uniformazione (correzione colore più decisa e uguale per tutte, o sostituzione delle più stonate con altre CC0 da Openverse) e mostrami un prima/dopo.

### Fase 4 · Nuove soluzioni
Per ogni idea proponimi 2-3 strade con pro e contro, prima di svilupparla:
- spazi pronti per la fiducia (recensioni Google, foto di lavori veri), visibili solo quando ci sono contenuti;
- un'intro più breve per chi torna, se il cliente è d'accordo;
- tutto quello che dall'audit ti sembra migliorabile per portare più persone a prenotare una visita.

### Fase 5 · Verifica e consegna
- Rifai le stesse misure della Fase 1 e mettile in una tabella prima/dopo.
- Fai il commit di ogni fase separatamente, con messaggi chiari in italiano.
- Pubblica sul branch e controlla che il workflow vada a buon fine.
- Elencami i placeholder ancora aperti e le cose da chiedere ai titolari.

## 5. Cosa voglio vedere alla fine

- Un sito che a ogni scroll mostra qualcosa di nuovo.
- Pagine più corte su mobile, senza perdere contenuti utili.
- Gli stessi punteggi Lighthouse o migliori.
- Nessun dato inventato.
- Un breve rapporto con cosa hai cambiato, perché, i numeri prima e dopo, e cosa resta da fare.
