# Sycomo Digital — Design System (da conservare sempre)

Questo file è la fonte permanente di palette e stile visivo. Sopravvive a
qualunque rifacimento del sito: quando si ricostruisce da capo, i colori e
il linguaggio del "liquid glass" restano questi.

## Palette (invariabile)

```css
:root {
  /* Superfici */
  --paper: #f7f4ed;
  --paper-2: #f1ede4;
  --lift: #fffefb;

  /* Inchiostro & neutri */
  --ink: #20201c;
  --ink-soft: #4c483f;
  --muted: #948e80;
  --hair: #e2ddd1;

  /* Rosso — brand */
  --red: #e12c1a;
  --red-deep: #8f2014;
}
```

Uso:
- `--paper` sfondo pagina, `--lift` superfici "sollevate" (vetro, card)
- `--ink` testo principale, `--ink-soft` testo secondario, `--muted` placeholder
- `--hair` bordi sottili
- `--red` accento primario (CTA, punto del logo, selection), `--red-deep` ombre calde e stati profondi

## Tipografia

- **Geist** (`--font-sans`, var `--font-geist-sans`) — corpo del testo, "sycomo" nel logo
- **Manrope** (`--font-title`, var `--font-manrope`) — "DIGITAL" nel logo, kicker/label maiuscoli, titoli enfatici

## Logo

- "sycomo" in Geist, peso 700, letter-spacing -0.045em
- un quadratino pieno `--red` come punto tipografico dopo la parola (non un pallino: un **quadrato**, 0.17em × 0.17em)
- "DIGITAL" sotto, in Manrope 600, maiuscolo, letter-spacing 0.34em, colore `--ink`
- **ATTENZIONE**: se esiste una guida di stile con un logo diverso, quella guida è SBAGLIATA — questa è la versione corretta, verificata più volte nel progetto.

## Liquid glass ("Massa di Vetro") — la ricetta

Stile HyperOS/Xiaomi: vetro smerigliato opaco, mai trasparente e piatto.
Ogni forma di vetro (`.cl-shape` e affini) usa questa combinazione:

```css
.qualunque-forma-di-vetro {
  --edge: color-mix(in srgb, var(--lift) 52%, transparent);
  border: 1px solid var(--edge);
  box-shadow:
    /* filo di luce sul bordo superiore: il taglio della lastra */
    inset 0 1px 0 0 color-mix(in srgb, var(--lift) 62%, transparent),
    /* luce interna che scende dall'alto: vetro smerigliato spesso */
    inset 0 26px 52px -22px color-mix(in srgb, var(--lift) 24%, transparent),
    /* fondo della lastra leggermente più denso: spessore */
    inset 0 -18px 36px -24px color-mix(in srgb, var(--red-deep) 46%, transparent),
    /* ombra calda a contatto + alone soffuso */
    0 10px 24px -14px color-mix(in srgb, var(--red-deep) 34%, transparent),
    0 34px 80px -32px color-mix(in srgb, var(--red-deep) 40%, transparent);
}

/* riempimento tipico: gradiente tra i due rossi, mai un colore piatto */
background: linear-gradient(
  135deg,
  color-mix(in srgb, var(--red) 72%, transparent) 0%,
  color-mix(in srgb, var(--red) 66%, transparent) 38%,
  color-mix(in srgb, var(--red-deep) 58%, transparent) 100%
);

/* sheen: riflesso morbido in alto-sinistra, su ::before */
background: radial-gradient(
  120% 88% at 26% 16%,
  color-mix(in srgb, var(--lift) 30%, transparent) 0%,
  color-mix(in srgb, var(--lift) 10%, transparent) 34%,
  transparent 58%
);

/* vetro ATTIVO (quello che sfoca ciò che ha sotto), solo sulle lastre superiori */
backdrop-filter: blur(16px) saturate(1.1); /* var(--glass-blur, 16px) */
```

Header/pannelli di vetro più leggeri (meno velo, più sfocatura+saturazione):
```css
background: color-mix(in srgb, var(--paper) 64%, transparent);
backdrop-filter: blur(20px) saturate(1.5);
border-bottom: 1px solid color-mix(in srgb, var(--hair) 72%, transparent);
```

Regole del linguaggio visivo:
- Il vetro "vero" nasce dalle **sovrapposizioni**: solo le lastre superiori hanno `backdrop-filter`, quelle sotto no — è il contrasto a fare l'effetto.
- Forme semplici e riconoscibili (cerchi, quadrati), mai forme organiche a caso.
- Movimento: derive lente (9–18s) e "respiri" (`cl-breathe`, scale sottile) su `translate`/`scale`, MAI su proprietà che causano layout — sempre compositor (`transform`, `opacity`).
- Rotazioni statiche su `rotate`, separate dalle derive, così si compongono senza conflitti.
- Ombre sempre calde (`--red-deep`), mai grigie/neutre: è quello che rende il vetro "caldo" invece che asettico.

## Easing

Mai lineare/meccanico. Preferire curve come `cubic-bezier(0.22, 1, 0.36, 1)`
(decelerazione morbida, tipo "entrata" di HyperOS) e varianti simili —
ogni animazione ha un carattere leggermente diverso, non lo stesso timing
riciclato ovunque.

## Note permanenti

- Palette e stile liquid-glass qui sopra **non cambiano mai**, indipendentemente da quante volte si rifà la struttura/i contenuti del sito.
- L'email di contatto attuale è provvisoria (personale): va sostituita con l'indirizzo del dominio quando disponibile.
