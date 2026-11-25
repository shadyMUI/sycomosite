"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode, CSSProperties } from "react";

type Props = {
  href: string;
  className?: string;
  ariaLabel?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Usa il sipario del marchio prima di lasciare la pagina per l'altra metà
 * dello studio; con meno movimento resta la navigazione normale. */
export default function TransizioneLink({
  href,
  className,
  ariaLabel,
  style,
  children,
}: Props) {
  const router = useRouter();

  const vaiConSipario = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    event.preventDefault();
    let timer = 0;

    const naviga = () => {
      window.clearTimeout(timer);
      window.removeEventListener("sycomo:navigation-covered", naviga);
      router.push(href);
    };

    window.addEventListener("sycomo:navigation-covered", naviga, { once: true });
    timer = window.setTimeout(naviga, 1600);
    window.dispatchEvent(new CustomEvent("sycomo:navigation-start"));
  };

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      style={style}
      onClick={vaiConSipario}
    >
      {children}
    </Link>
  );
}

