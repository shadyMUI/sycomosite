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
import DiagonalKaomojiBackground from "@/components/DiagonalKaomojiBackground";
import { NOME, EMAIL, CITTA, urlSito } from "@/lib/sito";

export const metadata: Metadata = {
  /* Prima il servizio, poi la città: chi cerca scrive "assemblaggio pc
     [città]", e ritrovare le stesse parole nel risultato è ciò che gli
     fa scegliere questo e non un altro. */
  title: `Computer su misura ad ${CITTA}`,
  description: `Scelta delle componenti in base al budget, assemblaggio, messa a punto e manutenzione ad ${CITTA}. Pulizia, pasta termica e sostituzione componenti.`,
  alternates: { canonical: urlSito("/pc-su-misura") },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: urlSito("/pc-su-misura"),
    title: `Computer su misura ad ${CITTA} · ${NOME}`,
    description:
      "Scegliamo le componenti col vostro budget, montiamo, mettiamo a punto e teniamo in forma.",
    images: [urlSito("/opengraph-image")],
  },
  twitter: {
    card: "summary_large_image",
    title: `Computer su misura ad ${CITTA} · ${NOME}`,
    description:
      "Scegliamo le componenti col vostro budget, montiamo, mettiamo a punto e teniamo in forma.",
    images: [urlSito("/opengraph-image")],
  },
};

const DATI_STRUTTURATI = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": urlSito("/pc-su-misura"),
      url: urlSito("/pc-su-misura"),
      name: `Computer su misura ad ${CITTA} · ${NOME}`,
      description: `Scelta delle componenti in base al budget, assemblaggio, messa a punto e manutenzione ad ${CITTA}.`,
      inLanguage: "it-IT",
      isPartOf: {
        "@type": "WebSite",
        name: NOME,
        url: urlSito("/"),
      },
    },
    {
      "@type": "Service",
      name: `Assemblaggio e Assistenza Computer ad ${CITTA}`,
      provider: {
        "@type": "Organization",
        name: NOME,
        url: urlSito("/"),
        email: EMAIL,
      },
      areaServed: {
        "@type": "City",
        name: CITTA,
      },
      serviceType: "Assemblaggio e Manutenzione PC",
      description: `Scelta componenti in base al budget, assemblaggio PC da lavoro o da gaming, manutenzione, pulizia e cambio pasta termica ad ${CITTA}.`,
    },
  ],
};

export default function PcSuMisura() {
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
      <Logo className="logo-fly" sub="Hardware" />
      <SottoLogo />

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
    </div>
  );
}
