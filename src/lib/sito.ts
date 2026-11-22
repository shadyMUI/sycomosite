export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const SITO =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.sycomodigital.it";

export function urlSito(percorso: string) {
  const parte = percorso === "/" ? "" : `/${percorso.replace(/^\/+|\/+$/g, "")}`;
  if (!parte) return BASE_PATH ? `${SITO}/` : SITO;
  const eFile = /\.[^/]+$/.test(parte) || parte === "/opengraph-image";
  const slashFinale = BASE_PATH && !eFile ? "/" : "";
  return `${SITO}${parte}${slashFinale}`;
}

export const NOME = "Sycomo Digital";

export const EMAIL = "sycomodigital@gmail.com";

export const CITTA = "Asti";

export const DESCRIZIONE =
  "Studio indipendente ad Asti che progetta e sviluppa siti web e app su misura " +
  "per le piccole attività. Niente modelli riciclati: " +
  "scriviamo codice veloce, curato e pensato per farvi trovare.";

export const DESCRIZIONE_BREVE =
  "Siti web e app su misura per le attività di Asti. " +
  "Scritti da zero, veloci, fatti per farvi trovare.";

export const WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") || "39XXXXXXXXXX";

export const SOCIAL = [
  "https://www.instagram.com/sycomo.digital",
  "https://www.tiktok.com/@sycomo.digital",
];

