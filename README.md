# Sycomo Digital

Sito vetrina per **Sycomo Digital**, uno studio indipendente ad Asti che progetta e sviluppa siti web e app su misura per le piccole attività — niente modelli riciclati.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS 4**
- Export statico (`output: "export"`) → GitHub Pages
- **EmailJS** per il modulo di contatto (nessun server nostro)
- Animazioni e scorrimento custom (in `src/components/`), zero dipendenze esterne di animazione

## Comandi

| comando | cosa fa |
| --- | --- |
| `npm run dev` | avvia il sito in locale (porta 3000) |
| `npm run build` | build di produzione (export statico) |
| `npm run lint` | ESLint |
| `npm test` | suite e2e su browser reale (vedi sotto) |

## Variabili d'ambiente (`NEXT_PUBLIC_*`)

Tutte sono **pubbliche** (finiscono nel codice che arriva al visitatore): non mettere segreti veri. Senza queste il sito funziona ma:

- il modulo di contatto va dritto al ripiego `mailto:` (`ModuloContatto`);
- la voce WhatsApp sotto il logo scompare (`SottoLogo`);
- le URL assolute dei metadati (`robots.ts`, `sitemap.ts`, OpenGraph) usano il fallback in `src/lib/sito.ts`.

| variabile | default se assente |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.sycomodigital.it` |
| `NEXT_PUBLIC_BASE_PATH` | `""` (locale) / `/sycomosite` (GitHub Pages) |
| `NEXT_PUBLIC_WHATSAPP` | nessuno (link WhatsApp nascosto) |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | nessuno (ripiego mail) |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | nessuno (ripiego mail) |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | nessuno (ripiego mail) |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_PC` | nessuno (ripiego mail) |

Per le build su GitHub Pages queste si impostano come **variabili del repository** (vedi `.github/workflows/deploy-pages.yml`).

## Struttura

```
src/
  app/            # pagine: home, /pc-su-misura, /privacy + opengraph, robots, sitemap
  components/     # blocchi del sito (grafica, anagrafe, moduli)
  lib/sito.ts     # nome, email, URL base — importato ovunque per i dati di sito
e2e/              # suite e2e CDP (Chrome DevTools Protocol, nessun framework)
public/           # immagini (screenshots, mockup)
```

## e2e test

`e2e/runner.mjs` è un runner CDP (nessun browser headless via Playwright/Puppeteer, ma Chrome ridotto a driver tramite DevTools Protocol). Per farlo partire serve un Chrome aperto in modalità debug:

```bash
node e2e/runner.mjs --tier=1          # tier di test (vedi e2e/specs/)
node e2e/runner.mjs --list            # elenco dei test
node e2e/runner.mjs --help            # uso
```

## Deploy

Push su `main` → workflow `.github/workflows/deploy-pages.yml` → export statico in `.next-pages/` → GitHub Pages. Il build statico è condizionato dal flag `GITHUB_PAGES=true`.

## Note per chi entra

- **Non commentare il codice in inglese**: i commenti spiegano il *perché* e stanno in italiano (prosa, certezze operative).
- **Niente codice morto**: se ritrovi un componente mai importato, va eliminato in git — non serve come "risparmio" del futuro.
- La regola del brand: niente template riciclati. Il codice realizza cose, il brand parla dei problemi della persona.
- Le animazioni (`ScorrimentoFluido`, `ScrollDirector`, `IntroCurtain`, `DiagonalKaomojiBackground`) sono il tratto distintivo del sito: toccarle solo con test visivi su desktop e mobile. Se serve modificarle, cambia CSS/HTML prima, JS per ultimo.
