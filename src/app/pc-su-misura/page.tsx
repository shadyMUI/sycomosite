import type { Metadata } from "next";
import Logo from "@/components/Logo";
import HeroArt from "@/components/HeroArt";
import ChiSiamo from "@/components/ChiSiamo";
import Servizi from "@/components/Servizi";
import Contatti from "@/components/Contatti";
import Footer from "@/components/Footer";
import ScrollDirector from "@/components/ScrollDirector";
import SottoLogo from "@/components/SottoLogo";

/**
 * I computer su misura.
 *
 * Stessa macchina della pagina principale — tenda, volo del logo, massa
 * di vetro, sezione rossa, contatti — con testi propri. I componenti sono
 * gli stessi: ciò che cambia sono le parole, non il modo in cui si
 * muovono. Così le due metà dello studio si somigliano senza che nessuna
 * sia la copia sbiadita dell'altra, e una correzione al meccanismo vale
 * per entrambe.
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

const PASSI = [
  {
    n: "01",
    nome: "Scegliamo insieme",
    testo:
      "Ci dite cosa dovete farci e quanto volete spendere. Da lì scegliamo i pezzi: non i più costosi, quelli che rendono di più per quella cifra. Spesso si spende meno di quanto pensavate.",
  },
  {
    n: "02",
    nome: "Lo montiamo",
    testo:
      "Assemblaggio, cavi in ordine, sistema installato e programmi pronti. Ve lo consegnamo che si accende e funziona, non da configurare.",
  },
  {
    n: "03",
    nome: "Lo mettiamo a punto",
    testo:
      "Un computer montato non è ancora un computer finito. Temperature, avvio, prestazioni reali: lo tariamo perché dia tutto quello per cui l'avete pagato.",
  },
  {
    n: "04",
    nome: "Lo teniamo in forma",
    testo:
      "Pulizia, pasta termica, sostituzione dei pezzi che invecchiano. Un computer curato dura anni in più, e costa molto meno che ricomprarlo.",
  },
];

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
      <ChiSiamo
        uno="il computer giusto"
        due="non è il più caro"
        didascalia="Sycomo Hardware"
      />

      {/* Dà alle scene fisse lo spazio per esistere: due schermate di
          scorrimento, l'apertura e la frase. Poi comincia il contenuto
          vero, che scorre normalmente sopra di esse. */}
      <div className="scroll-track" aria-hidden="true">
        <div className="scroll-section" data-label="apertura" />
        <div className="scroll-section" data-label="chi-siamo" />
      </div>

      <main>
        <Servizi titolo="come lo costruiamo" voci={PASSI} />
        <Contatti
          titolo={["Diteci", "cosa vi serve"]}
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
