/**
 * Parte 2 — due frasi, non un discorso.
 *
 * Compare mentre il logo si ritira nella header: entrambe dipendono dalla
 * stessa --p del volo, quindi i movimenti non possono sfasarsi.
 *
 * Le due frasi sono una sola cosa in due tempi — prima il problema, poi la
 * risposta — e stanno agli angoli opposti della schermata: lo sguardo deve
 * attraversarla per arrivare al punto. Il quadratino rosso chiude la
 * seconda, che è dove cade l'accento.
 */
import Polaroid from "./Polaroid";

type Props = {
  /* Le due metà della frase. Hanno un valore di partenza perché la pagina
     principale è quella per cui sono state scritte; l'assistenza passa
     le sue. */
  uno?: string;
  due?: string;
  didascalia?: string;
};

export default function ChiSiamo({
  uno = "le piccole attività",
  due = "meritano grandi progetti",
  didascalia = "Sycomo Digital",
}: Props) {
  return (
    <section className="chi">
      <h1 className="chi-uno">{uno}</h1>

      <Polaroid
        video="/vetrina.mp4"
        alt="Una piccola bottega apre la saracinesca e accende l'insegna"
        didascalia={didascalia}
      />

      <p className="chi-due">
        {due}
        {/* il punto del marchio: quadrato, non tondo */}
        <span className="chi-dot" aria-hidden="true" />
      </p>
    </section>
  );
}
