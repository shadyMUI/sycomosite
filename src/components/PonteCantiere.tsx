"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * ⚠️ PROVVISORIO — DA RIMUOVERE PRIMA DI PUBBLICARE.
 *
 * Passaggio rapido fra le due metà del sito mentre si lavora. Non fa parte
 * del progetto: le due pagine si raggiungono dal piede, e un commutatore
 * fisso in un angolo direbbe al visitatore che sta guardando qualcosa di
 * incompiuto.
 *
 * Per toglierlo basta cancellare la riga <PonteCantiere /> nel layout,
 * questo file e il blocco `.cantiere` nel foglio di stile.
 *
 * È vestito apposta da attrezzo — bordo tratteggiato, carattere a
 * spaziatura fissa — così non si confonde mai con un elemento del sito e
 * nessuno si dimentica che è lì.
 */

const PAGINE = [
  { href: "/", nome: "siti" },
  { href: "/pc-su-misura", nome: "computer" },
];

export default function PonteCantiere() {
  const qui = usePathname();

  return (
    <nav className="cantiere" aria-label="Passaggio fra le pagine (provvisorio)">
      <span className="cantiere-etichetta">cantiere</span>
      {PAGINE.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className={p.href === qui ? "cantiere-qui" : undefined}
          /* la pagina su cui si è già non è un collegamento da seguire */
          aria-current={p.href === qui ? "page" : undefined}
        >
          {p.nome}
        </Link>
      ))}
    </nav>
  );
}
