import type { MetadataRoute } from "next";
import { SITO, urlSito } from "@/lib/sito";

export const dynamic = "force-static";

/**
 * Cosa possono leggere i motori di ricerca.
 *
 * Tutto: non c'è area riservata né contenuto duplicato da nascondere.
 * Il file serve soprattutto a indicare dove sta la sitemap — è il primo
 * posto che un crawler guarda arrivando su un dominio.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: urlSito("/sitemap.xml"),
    host: new URL(SITO).host,
  };
}
