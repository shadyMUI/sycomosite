"use client";

/**
 * Il richiamo ai contatti, in alto a destra.
 *
 * Chi arriva già deciso non deve attraversare tutto il racconto per
 * trovare un indirizzo. Sta nell'angolo dove i contatti si cercano per
 * abitudine e ci resta per tutta la pagina: quando il logo vola nella
 * barra di vetro se lo trova già di fronte, all'altro capo.
 *
 * Lo scorrimento è fatto a mano invece che con un'ancora `#contatti`:
 * il salto secco del browser stonerebbe in una pagina che altrove
 * rallenta arrivando, e `scrollIntoView` con l'inerzia del sistema si
 * accavallerebbe alla nostra. Qui la curva è la stessa dello scorrimento
 * fluido, così il gesto sembra un movimento solo.
 */

/* Quanto dura il viaggio. Fisso e non proporzionale alla distanza: la
   sezione è lontana, e una durata proporzionale la renderebbe eterna. */
const DURATA = 1100;

export default function VaiAiContatti() {
  const vai = (e: React.MouseEvent) => {
    e.preventDefault();

    const meta = document.getElementById("contatti");
    /* Fuori dalla pagina principale la sezione non c'è: si lascia fare al
       browser, che segue il collegamento e atterra sui contatti della
       home. Senza questa uscita il richiamo, qui, non farebbe nulla. */
    if (!meta) {
      window.location.href = "/#contatti";
      return;
    }

    const menoMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const da = window.scrollY;
    const a = da + meta.getBoundingClientRect().top;

    // chi ha chiesto meno movimento ci arriva e basta
    if (menoMovimento) {
      window.scrollTo(0, a);
      return;
    }

    const inizio = performance.now();
    /* Parte veloce e si posa piano: è la stessa sensazione della frenata
       della rotella, non un movimento a velocità costante. */
    const curva = (t: number) => 1 - Math.pow(1 - t, 3);

    const passo = (ora: number) => {
      const t = Math.min(1, (ora - inizio) / DURATA);
      window.scrollTo(0, da + (a - da) * curva(t));
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  /* Minuscolo come l'email e i social: qui le parole cliccabili non
     gridano in maiuscolo, si riconoscono dal filetto rosso. */
  return (
    <a className="vai-contatti" href="#contatti" onClick={vai}>
      contatti
    </a>
  );
}
