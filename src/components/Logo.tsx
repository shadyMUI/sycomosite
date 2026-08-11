type LogoProps = {
  className?: string;
  style?: React.CSSProperties;
  /* La riga sotto il nome. "Digital" per il sito, "Hardware" per
     l'assistenza: stesso marchio, due mestieri. */
  sub?: string;
};

/**
 * Logo Sycomo Digital.
 * "sycomo" in Geist (font-sans), quadratino rosso del brand, "DIGITAL" in
 * Manrope (font-title) sotto. Scala con `font-size` sul contenitore: tutte le
 * misure interne sono in `em`.
 */
export default function Logo({ className = "", style, sub = "Digital" }: LogoProps) {
  return (
    <span
      className={`logo-lockup ${className}`}
      style={style}
      role="img"
      aria-label={`Sycomo ${sub}`}
    >
      <span className="logo-word" aria-hidden="true">
        sycomo
        <span className="logo-dot" />
      </span>
      <span className="logo-sub" aria-hidden="true">
        {sub}
      </span>
    </span>
  );
}
