import Logo from "@/components/Logo";
import HeroArt from "@/components/HeroArt";

export default function Home() {
  return (
    <main className="relative flex w-full flex-1 flex-col justify-center py-32">
      {/* Canvas decorativo a tutta hero, dietro al logo */}
      <HeroArt />

      {/* marginLeft in em = circa una lettera del logo, a ogni dimensione */}
      <Logo
        className="relative z-10"
        style={{ fontSize: "clamp(72px, 17vw, 240px)", marginLeft: "0.45em" }}
      />
    </main>
  );
}
