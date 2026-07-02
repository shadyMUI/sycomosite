import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col justify-center py-32">
      {/* marginLeft in em = circa una lettera del logo, a ogni dimensione */}
      <Logo style={{ fontSize: "clamp(72px, 17vw, 240px)", marginLeft: "0.45em" }} />
    </main>
  );
}
