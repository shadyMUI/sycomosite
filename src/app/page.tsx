import Logo from "@/components/Logo";
import HeroArt from "@/components/HeroArt";
import ScrollDirector from "@/components/ScrollDirector";
import Tagline from "@/components/Tagline";
import CtaReveal from "@/components/CtaReveal";

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

      {/* Fase 2: il punto di sycomo cresce in un pannello CTA a tutto schermo */}
      <CtaReveal />

      {/* Spazio placeholder: dà corsa allo scroll (fase 1 + fase 2) */}
      <section aria-hidden="true" className="h-[220vh]" />
    </>
  );
}
