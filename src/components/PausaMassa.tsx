"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PausaMassa() {
  const pathname = usePathname();

  useEffect(() => {
    const gruppi = Array.from(document.querySelectorAll<HTMLElement>(".massa"));
    if (!gruppi.length) return;

    const hero = document.querySelector<HTMLElement>(".uso");
    const scene = new Map<Element, HTMLElement>();
    for (const gruppo of gruppi) {
      const scena = gruppo.closest(".rosso, .faq") ?? hero;
      if (scena) scene.set(scena, gruppo);
      gruppo.classList.add("massa--ferma");
    }

    const observer = new IntersectionObserver(
      (voci) => {
        // Una copia che rientra deve mostrare lo stesso fotogramma di quella
        // visibile, non riprendere la scala e la deriva da dove si era fermata.
        const riferimento = gruppi.find((g) => !g.classList.contains("massa--ferma")) ?? gruppi[0];
        const moto = riferimento.querySelector(".ml")?.getAnimations()[0];
        const inizio = moto?.startTime ?? Number(document.timeline.currentTime) - Number(moto?.currentTime ?? 0);

        for (const { target, isIntersecting } of voci) {
          const gruppo = scene.get(target);
          if (!gruppo) continue;
          gruppo.classList.toggle("massa--ferma", !isIntersecting);
          if (isIntersecting) {
            for (const animazione of gruppo.getAnimations({ subtree: true })) {
              if (animazione.playState === "running") animazione.startTime = inizio;
            }
          }
        }
      },
      { rootMargin: "200px 0px" }
    );

    for (const scena of scene.keys()) observer.observe(scena);

    return () => {
      observer.disconnect();
      for (const g of gruppi) g.classList.remove("massa--ferma");
    };
  }, [pathname]);

  return null;
}
