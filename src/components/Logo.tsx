type LogoProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Logo Sycomo Digital.
 * "sycomo" in Geist (font-sans), quadratino rosso del brand, "DIGITAL" in
 * Manrope (font-title) sotto. Scala con `font-size` sul contenitore: tutte le
 * misure interne sono in `em`.
 */
export default function Logo({ className = "", style }: LogoProps) {
  return (
    <span
      className={`logo-lockup ${className}`}
      style={style}
      role="img"
      aria-label="Sycomo Digital"
    >
      <span className="logo-word" aria-hidden="true">
        sycomo
        <span className="logo-dot" />
      </span>
      <span className="logo-sub" aria-hidden="true">
        Digital
      </span>
    </span>
  );
}
