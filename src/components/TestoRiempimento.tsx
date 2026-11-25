/* From Uiverse.io by satyamchaudharydev - https://uiverse.io/satyamchaudharydev/quick-chicken-50
   MIT License, Copyright (c) satyamchaudharydev (satyam) */
type Props = {
  testo: string;
};

export default function TestoRiempimento({ testo }: Props) {
  const lettere = Array.from(testo);

  return (
    <span className="testo-riempimento" aria-hidden="true">
      {lettere.map((carattere, indice) => (
        <span
          key={indice}
          className="testo-riempimento__lettera"
          style={{
            "--ritardo-lettera": `${indice * 12}ms`,
            "--ritardo-ritorno": `${(lettere.length - indice - 1) * 12}ms`,
          } as React.CSSProperties}
        >
          {carattere}
        </span>
      ))}
    </span>
  );
}
