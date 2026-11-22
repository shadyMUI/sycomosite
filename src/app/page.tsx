import Logo from "@/components/Logo";
import HeroArt from "@/components/HeroArt";
import CheComputer from "@/components/CheComputer";
import DueMestieri, { MESTIERI_DIGITAL } from "@/components/DueMestieri";
import Album, { SCATTI_DIGITAL } from "@/components/Album";
import Domande, { FAQ_DIGITAL } from "@/components/Domande";
import Contatti from "@/components/Contatti";
import Footer from "@/components/Footer";
import ScrollDirector from "@/components/ScrollDirector";
import SottoLogo from "@/components/SottoLogo";
import DiagonalKaomojiBackground from "@/components/DiagonalKaomojiBackground";
import { SITO, NOME, EMAIL, DESCRIZIONE, SOCIAL, CITTA } from "@/lib/sito";

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
      areaServed: { "@type": "City", name: CITTA },
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
    <div className="relative w-full min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DATI_STRUTTURATI) }}
      />

      <DiagonalKaomojiBackground />

      <ScrollDirector />

      {/* barra di vetro: si accende mentre il logo ci vola dentro */}
      <div className="site-header" aria-hidden="true" />

      {/* Scene fisse: restano dietro e vengono coperte dal contenuto che
          scorre sopra di loro. */}
      <HeroArt />
      <Logo className="logo-fly" />
      <SottoLogo />

      <main>
        <CheComputer
          titolo="siti e app costruiti da zero"
          casi={["siti web", "app mobile", "social"]}
          chiusura=" — scritti su misura, "
          accento="senza modelli riciclati"
        />

        <DueMestieri mestieri={MESTIERI_DIGITAL} titolo="cosa facciamo" />

        <Album
          titolo={["Progetti digitali", "e casi studio"]}
          scatti={SCATTI_DIGITAL}
        />

        <Domande domande={FAQ_DIGITAL} titolo="Quello che ci chiedono" />

        <Contatti
          altra={{
            domanda: "Vi serve anche un PC o assistenza computer?",
            invito: "Li montiamo su misura o ripariamo",
            href: "/pc-su-misura",
          }}
          frase={{
            attivita: {
              chiede: ", ho",
              esempio: "un ristorante / uno studio ad Asti",
              etichetta: "che attività avete",
            },
            serve: {
              chiede: "e vorrei",
              esempio: "un nuovo sito o un'app",
              etichetta: "cosa vi serve",
            },
            mail: "nome@esempio.it",
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
