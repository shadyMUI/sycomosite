import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pagina non trovata",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <header className="doc-testa">
        <Link href="/" aria-label="Torna alla pagina principale">
          <Logo />
        </Link>
      </header>

      <main className="doc">
        <p className="doc-occhiello">Errore 404</p>
        <h1 className="doc-titolo">
          Questa pagina
          <br />
          non esiste
          <span className="doc-dot" aria-hidden="true" />
        </h1>

        <p className="doc-guida">
          Forse il link è vecchio o la pagina è stata spostata. La home è qui
          sotto; se cercavate qualcosa in particolare, scriveteci.
        </p>

        <Link className="doc-torna" href="/">
          Torna al sito
        </Link>
      </main>

      <Footer />
    </>
  );
}
