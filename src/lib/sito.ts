/**
 * I dati del sito in un posto solo.
 *
 * Compaiono nei metadati, nella sitemap, in robots.txt e nei dati
 * strutturati per i motori di ricerca: tenerli sparsi significherebbe
 * cambiarne uno e dimenticarne tre, e un indirizzo incoerente fra tag
 * canonico e sitemap è uno degli errori che Google segnala più spesso.
 */

/* ⚠️ Da impostare quando ci sarà il dominio: basta la variabile
   NEXT_PUBLIC_SITE_URL nell'ambiente del servizio di hosting, senza
   toccare il codice. Finché resta il valore di ripiego, gli indirizzi
   assoluti nei metadati puntano a un dominio che non esiste ancora —
   il sito funziona, ma le anteprime social e la sitemap non sarebbero
   valide se venisse pubblicato così. */
export const SITO =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.sycomodigital.it";

export const NOME = "Sycomo Digital";

export const EMAIL = "sycomodigital@gmail.com";

/* La riga che descrive lo studio. Sta qui perché deve essere la stessa
   nel titolo della scheda, nell'anteprima social e nei dati strutturati:
   tre descrizioni diverse della stessa attività confondono i motori e
   chi legge. */
export const DESCRIZIONE =
  "Studio indipendente che progetta e realizza siti su misura per le " +
  "piccole attività. Niente modelli riciclati: il sito è scritto da zero, " +
  "veloce, e fatto per farvi trovare.";

/* Più corta, per l'anteprima social: sotto le 200 battute non viene
   troncata da nessuna delle piattaforme. */
export const DESCRIZIONE_BREVE =
  "Siti su misura per le piccole attività. Scritti da zero, veloci, " +
  "fatti per farvi trovare.";

export const SOCIAL = [
  "https://www.instagram.com/sycomo.digital",
  "https://www.tiktok.com/@sycomo.digital",
];
