import type { Metadata } from "next";
import Logo from "@/components/Logo";
import HeroArt from "@/components/HeroArt";
import DueMestieri from "@/components/DueMestieri";
import Contatti from "@/components/Contatti";
import Footer from "@/components/Footer";
import ScrollDirector from "@/components/ScrollDirector";
import SottoLogo from "@/components/SottoLogo";
import CheComputer from "@/components/CheComputer";
import Album from "@/components/Album";
import Domande from "@/components/Domande";

/**
 * I computer su misura.
 *
 * Stessa macchina della pagina principale — tenda, volo del logo, massa
 * di vetro, sezione rossa, contatti — con testi propri. Al posto delle
 * due frasi diagonali c'è però una domanda: chi cerca un computer ha in
 * testa una cosa precisa da farci, e chiederla apre il discorso meglio di
 * qualsiasi frase a effetto. I componenti sono
 * gli stessi: ciò che cambia sono le parole, non il modo in cui si
 * muovono. Così le due metà dello studio si somigliano senza che nessuna
 * sia la copia sbiadita dell'altra, e una correzione al meccanismo vale
 * per entrambe.
 *
 * La schermata rossa non elenca più quattro passi ma due mestieri
 * affiancati — assemblare e mantenere — perché sono due persone diverse:
 * chi la macchina non ce l'ha ancora e chi ce l'ha già e non va più.
 *
 * È anche la stessa idea, detta su un altro oggetto: là un sito costruito
 * attorno a un'attività invece di un modello comprato, qui un computer
 * costruito attorno a quello che ci dovete fare invece di uno preso dallo
 * scaffale. Il marchio lo dice cambiando una parola: HARDWARE al posto
 * di DIGITAL.
 */

/* ⚠️ DA COMPLETARE con la città: compare nel titolo dei risultati di
   ricerca, ed è la parola che chi cerca digita insieme a "assemblaggio
   pc". Senza, la pagina non si posiziona per le ricerche locali — che
   sono l'unica fonte di clienti che conti per questo servizio. */
const CITTA = "[città]";

export const metadata: Metadata = {
  /* Prima il servizio, poi la città: chi cerca scrive "assemblaggio pc
     [città]", e ritrovare le stesse parole nel risultato è ciò che gli
     fa scegliere questo e non un altro. */
  title: `Computer su misura a ${CITTA}`,
  description: `Scelta delle componenti in base al budget, assemblaggio, messa a punto e manutenzione a ${CITTA}. Pulizia, pasta termica e sostituzione componenti.`,
  alternates: { canonical: "/pc-su-misura" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/pc-su-misura",
    title: `Computer su misura a ${CITTA}`,
    description:
      "Scegliamo le componenti col vostro budget, montiamo, mettiamo a punto e teniamo in forma.",
    /* L'immagine va ripetuta: dichiarando un blocco openGraph proprio, la
       pagina smette di ereditare quella generata nella radice. */
    images: ["/opengraph-image"],
  },
};

export default function PcSuMisura() {
  return (
    <>
      <ScrollDirector />

      {/* barra di vetro: si accende mentre il logo ci vola dentro */}
      <div className="site-header" aria-hidden="true" />

      {/* Scene fisse: restano dietro e vengono coperte dal contenuto che
          scorre sopra di loro. */}
      <HeroArt />
      <Logo className="logo-fly" sub="Hardware" />
      <SottoLogo />

      {/* Dà all'apertura lo spazio per esistere, e poco: qui dopo il
          marchio non c'è una scena fissa da guardare — la domanda arriva
          col flusso — quindi un binario lungo sarebbe carta bianca da
          attraversare. */}
      <div className="scroll-track" aria-hidden="true">
        <div
          className="scroll-section scroll-section--corta"
          data-label="apertura"
        />
      </div>

      <main>
        <CheComputer />
        <DueMestieri />
        <Album />
        <Domande />
        <Contatti
          titolo={["Diteci", "cosa vi serve"]}
          modello="computer"
          altra={{
            domanda: "Vi serve anche un sito?",
            invito: "Li facciamo su misura",
            href: "/",
          }}
          /* Qui la frase chiede l'uso e il budget, non l'attività e il
             sito: sono gli esempi nei campi a far capire cosa scrivere, e
             il budget è la prima cosa che serve sapere per consigliare. */
          frase={{
            attivita: {
              chiede: ", vorrei",
              esempio: "un computer per giocare",
              etichetta: "che computer vi serve",
            },
            serve: {
              chiede: "e posso spendere",
              esempio: "intorno agli 800 euro",
              etichetta: "quanto volete spendere",
            },
            mail: "marco@esempio.it",
          }}
        />
      </main>

      <Footer sub="Hardware" claim="il computer giusto non è il più caro." />
    </>
  );
}
