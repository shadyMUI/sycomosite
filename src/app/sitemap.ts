import type { MetadataRoute } from "next";
import { urlSito } from "@/lib/sito";

export const dynamic = "force-static";

/**
 * L'elenco delle pagine, per i motori di ricerca.
 *
 * Sono due, e si potrebbero trovare seguendo i link: la sitemap serve
 * comunque, perché dice anche quando una pagina è cambiata l'ultima
 * volta e quanto conta rispetto alle altre.
 *
 * ⚠️ Le date sono fisse e non `new Date()`: una data che si sposta a
 * ogni compilazione dice al motore "è cambiato tutto" anche quando non è
 * cambiato nulla, e a forza di gridare al lupo smette di crederci.
 * Vanno aggiornate quando si modifica davvero il contenuto.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: urlSito("/"),
      lastModified: new Date("2026-11-09"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      /* Vale quanto la home: è l'altra metà di quello che fate, e per le
         ricerche locali è la pagina che porterà più visite delle altre. */
      url: urlSito("/pc-su-misura"),
      lastModified: new Date("2026-11-09"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: urlSito("/privacy"),
      lastModified: new Date("2026-11-09"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
