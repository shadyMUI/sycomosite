import Logo from "@/components/Logo";
import HeroArt from "@/components/HeroArt";
import ChiSiamo from "@/components/ChiSiamo";
import Servizi from "@/components/Servizi";
import Contatti from "@/components/Contatti";
import Footer from "@/components/Footer";
import ScrollDirector from "@/components/ScrollDirector";
import VaiAiContatti from "@/components/VaiAiContatti";

export default function Home() {
  return (
    <>
      <ScrollDirector />

      {/* barra di vetro: si accende mentre il logo ci vola dentro */}
      <div className="site-header" aria-hidden="true" />

      {/* Scene fisse: restano dietro e vengono coperte dal contenuto che
          scorre sopra di loro. */}
      <HeroArt />
      <Logo className="logo-fly" />
      <VaiAiContatti />
      <ChiSiamo />

      {/* Dà alle scene fisse lo spazio per esistere: due schermate di
          scorrimento, l'apertura e "chi siamo". Poi comincia il contenuto
          vero, che scorre normalmente sopra di esse. */}
      <div className="scroll-track" aria-hidden="true">
        <div className="scroll-section" data-label="apertura" />
        <div className="scroll-section" data-label="chi-siamo" />
      </div>

      <main>
        <Servizi />
        <Contatti />
      </main>

      <Footer />
    </>
  );
}
