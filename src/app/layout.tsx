import type { Metadata, Viewport } from "next";
import { Manrope, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import IntroCurtain from "@/components/IntroCurtain";
import ScorrimentoFluido from "@/components/ScorrimentoFluido";
/* ⚠️ PROVVISORIO: passaggio rapido fra le due metà del sito mentre si
   lavora. Va tolto prima di pubblicare — questa riga, l'elemento nel
   corpo, il file del componente e il blocco `.cantiere` negli stili. */
import PonteCantiere from "@/components/PonteCantiere";
import { SITO, NOME, DESCRIZIONE, DESCRIZIONE_BREVE } from "@/lib/sito";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  /* Solo i pesi che il CSS usa davvero: ognuno è un file da scaricare.
     L'800 è stato tolto perché non compariva in una sola regola — e
     Google ha smesso di servire quel file, mandando in errore la
     compilazione appena la copia locale è stata cancellata. */
  weight: ["300", "400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  /* La base da cui si costruiscono tutti gli indirizzi assoluti dei
     metadati. Senza, ogni percorso relativo — l'immagine dell'anteprima,
     il tag canonico — manderebbe la compilazione in errore. */
  metadataBase: new URL(SITO),

  title: {
    /* Sulla home resta il nome nudo; le altre pagine si scrivono da sé
       come "Privacy · Sycomo Digital", senza ripetere il suffisso a mano
       ogni volta. */
    default: `${NOME} — siti su misura per le piccole attività`,
    template: `%s · ${NOME}`,
  },
  description: DESCRIZIONE,
  applicationName: NOME,
  authors: [{ name: NOME, url: SITO }],
  creator: NOME,
  publisher: NOME,

  /* L'indirizzo ufficiale della pagina. Serve a dire ai motori qual è la
     versione buona quando lo stesso contenuto è raggiungibile da più vie
     — con e senza www, con parametri di tracciamento in coda. */
  alternates: { canonical: "/" },

  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: NOME,
    title: `${NOME} — siti su misura per le piccole attività`,
    description: DESCRIZIONE_BREVE,
    /* L'immagine non è dichiarata qui: la genera opengraph-image.tsx, e
       Next la aggiunge da sé con misure e tipo corretti. Elencarla anche
       qui produrrebbe due tag in conflitto. */
  },

  twitter: {
    /* card grande: l'immagine occupa tutta la larghezza del riquadro
       invece di stare in un quadratino di lato */
    card: "summary_large_image",
    title: `${NOME} — siti su misura per le piccole attività`,
    description: DESCRIZIONE_BREVE,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      /* senza questi, Google decide da sé quanto testo mostrare e se
         usare l'anteprima grande: così la scheda nei risultati resta
         completa */
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  /* Dichiarata esplicitamente: il file favicon.ico in app/ verrebbe
     raccolto lo stesso, ma così l'icona è documentata insieme al resto. */
  icons: { icon: "/favicon.ico" },

  category: "technology",
  formatDetection: {
    /* Safari su iPhone trasformerebbe numeri e indirizzi in link azzurri
       sottolineati, sfondando la composizione delle pagine. */
    telephone: false,
    address: false,
    email: false,
  },
};

export const viewport: Viewport = {
  /* Il colore che il telefono dà alla barra di sistema attorno alla
     pagina: la carta del sito, così il bordo dello schermo non stacca. */
  themeColor: "#f7f4ed",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${manrope.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <IntroCurtain />
        <ScorrimentoFluido />
        {children}
        <PonteCantiere />
      </body>
    </html>
  );
}
