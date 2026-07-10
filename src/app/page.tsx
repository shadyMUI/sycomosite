import Logo from "@/components/Logo";
import HeroArt from "@/components/HeroArt";
import ScrollDirector from "@/components/ScrollDirector";
import Tagline from "@/components/Tagline";
import CtaReveal from "@/components/CtaReveal";
import InvertedScene from "@/components/InvertedScene";
import BlackHoleFx from "@/components/BlackHoleFx";

export default function Home() {
  return (
    <>
      <ScrollDirector />

      {/* Barra header: appare mentre il logo ci vola dentro */}
      <div className="site-header" aria-hidden="true" />

      <main className="relative flex min-h-svh w-full flex-1 flex-col justify-center py-32">
        {/* Canvas decorativo a tutta hero, dietro al logo */}
        <HeroArt />

        {/* Claim sulla destra: appare quando il cluster è atterrato */}
        <Tagline />

        {/* Il logo vive fuori dal flusso: parte grande e centrato nella hero,
            allo scroll vola in alto a sinistra e diventa la header */}
        <Logo className="logo-fly" />
      </main>

      {/* Fase 4: scena a colori invertiti, rivelata dal dissolversi del
          pannello CTA (sta dietro, z 55) */}
      <InvertedScene />

      {/* Fase 2: il punto di sycomo cresce in un pannello CTA a tutto schermo */}
      <CtaReveal />

      {/* Gran finale: buco nero quadrato che risucchia tutto ed esplode nel
          cielo stellato (a tempo, scroll bloccato) */}
      <BlackHoleFx />
    </>
  );
}
