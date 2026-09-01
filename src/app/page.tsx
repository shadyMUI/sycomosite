import Logo from "@/components/Logo";
import HeroArt from "@/components/HeroArt";
import ChiSiamo from "@/components/ChiSiamo";
import Servizi from "@/components/Servizi";
import Contatti from "@/components/Contatti";
import Footer from "@/components/Footer";
import ScrollDirector from "@/components/ScrollDirector";
import SottoLogo from "@/components/SottoLogo";
import { SITO, NOME, EMAIL, DESCRIZIONE, SOCIAL } from "@/lib/sito";

/**
 * I dati strutturati: la stessa pagina, scritta per le macchine.
 *
 * I motori leggono il testo e tirano a indovinare che cosa sia questa
 * attività; questo blocco glielo dice senza ambiguità — come si chiama,
 * dove scrivere, quali sono i profili ufficiali. È ciò che permette a
 * una ricerca del nome di mostrare la scheda con i social giusti invece
 * di un risultato qualsiasi.
 *
 * `Organization` e non `LocalBusiness`: quest'ultimo richiede indirizzo
 * e orari di apertura, e dichiararli finti è peggio che non dichiararli.
 * ⚠️ Quando ci sarà una sede vera, questo è il punto in cui passare a
 * LocalBusiness aggiungendo `address` e `openingHours`.
 */
const DATI_STRUTTURATI = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITO}/#studio`,
      name: NOME,
      url: SITO,
      email: EMAIL,
      description: DESCRIZIONE,
      areaServed: { "@type": "Country", name: "Italia" },
      sameAs: SOCIAL,
    },
    {
      "@type": "WebSite",
      "@id": `${SITO}/#sito`,
      url: SITO,
      name: NOME,
      inLanguage: "it-IT",
      publisher: { "@id": `${SITO}/#studio` },
    },
  ],
};

export default function Home() {
  return (
    <>
      {/* Non usa <Script>: questo blocco deve trovarsi nell'HTML alla
          prima consegna, perché i crawler leggono la pagina servita e
          non aspettano che il JavaScript la completi. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DATI_STRUTTURATI) }}
      />

      <ScrollDirector />

      {/* barra di vetro: si accende mentre il logo ci vola dentro */}
      <div className="site-header" aria-hidden="true" />

      {/* Scene fisse: restano dietro e vengono coperte dal contenuto che
          scorre sopra di loro. */}
      <HeroArt />
      <Logo className="logo-fly" />
      {/* Qui niente WhatsApp: chi cerca un sito ha una cosa da spiegare —
          che attività ha, cosa gli serve — e il modulo la raccoglie meglio
          di una chat. Sulla pagina dei computer resta, perché lì la
          domanda è spesso una sola e urgente.
          E restando una voce sola, sta meglio in alto a destra dove i
          contatti si cercano per abitudine, che appesa sotto il marchio. */}
      <SottoLogo whatsapp={false} dove="barra" />
      <ChiSiamo />

      {/* Dà alle scene fisse lo spazio per esistere: due schermate di
          scorrimento, l'apertura e "chi siamo". Poi comincia il contenuto
          vero, che scorre normalmente sopra di esse. */}
      <div className="scroll-track" aria-hidden="true">
        <div className="scroll-section" data-label="apertura" />
        <div className="scroll-section" data-label="chi-siamo" data-aggancio />
      </div>

      <main>
        <Servizi />
        <Contatti
          altra={{
            domanda: "Vi serve anche un computer?",
            invito: "Li montiamo su misura",
            href: "/pc-su-misura",
          }}
        />
      </main>

      <Footer />
    </>
  );
}
