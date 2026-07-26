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

      {/* Livelli visuai fissi (non scrollano, guidati da --p/--p2/--p3/--p4) */}
      <HeroArt />
      <Tagline />
      <Logo className="logo-fly" />
      <CtaReveal />
      <InvertedScene />
      <BlackHoleFx />

      {/* ── Spaziatore di scroll ──────────────────────────────────────
          Queste sezioni danno ALTEZZA alla pagina per permettere lo
          scroll nativo. Sono invisibili: servono solo come "binari"
          su cui ScrollDirector mappa i progressi --p/--p2/--p3/--p4.
          Ogni sezione è alta 100vh (= 1 schermata di scroll).       */}
      <div className="scroll-track" aria-hidden="true">
        <div className="scroll-section" data-label="hero" />
        <div className="scroll-section" data-label="logo-flight" />
        <div className="scroll-section" data-label="tagline" />
        <div className="scroll-section" data-label="cta-grow" />
        <div className="scroll-section" data-label="sink-inverted" />
        <div className="scroll-section" data-label="scene-title" />
        <div className="scroll-section" data-label="finale" />
        <div className="scroll-section" data-label="archivio" />
        <div className="scroll-section" data-label="lancio-spazio" />
      </div>
    </>
  );
}
