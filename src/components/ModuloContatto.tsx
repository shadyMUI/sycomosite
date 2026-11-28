"use client";

import { memo, useRef, useState } from "react";

/* From Uiverse.io by gharsh11032000 - https://uiverse.io/gharsh11032000/loud-chicken-53
   MIT License, Copyright (c) gharsh11032000 (Harsh Gupta) */

/**
 * Il modulo di contatto, scritto come una frase da completare.
 *
 * Non caselle impilate con l'etichetta sopra: una riga di discorso in cui
 * si riempiono i buchi. Chi scrive non sta "compilando un form", sta
 * finendo una frase — e intanto ci dice le uniche quattro cose che
 * servono per rispondere con qualcosa di sensato.
 *
 * L'invio passa da EmailJS: il messaggio parte dal browser di chi scrive
 * e arriva nella nostra casella senza che serva un server nostro.
 *
 * Se la chiamata non riesce — rete assente, quota del mese finita, chiavi
 * sbagliate — non si perde nulla: si apre il programma di posta con il
 * messaggio già scritto, e sotto resta comunque il testo da copiare. Un
 * modulo che dice "errore" e basta fa perdere il cliente; questo lascia
 * sempre una strada aperta.
 *
 * `noValidate` disattiva i controlli del browser: il fumetto giallo di
 * sistema non si può vestire in alcun modo — è disegnato dal browser, il
 * CSS non lo raggiunge — e in mezzo a questa pagina stonava. I controlli
 * li facciamo qui, e l'avviso è scritto nella lingua del sito.
 */

type Props = {
  email: string;
  /* La frase da completare cambia col mestiere: chi scrive per un sito
     dice che attività ha, chi scrive per un computer dice che macchina
     ha. Gli esempi nei campi sono la parte che fa capire cosa scrivere,
     quindi devono parlare della cosa giusta. */
  frase?: {
    attivita: { chiede: string; esempio: string; etichetta: string };
    serve: { chiede: string; esempio: string; etichetta: string };
    /* l'esempio nel campo dell'indirizzo: cambia col mestiere come gli
       altri, così la frase intera resta verosimile */
    mail?: string;
  };
  /* Quale modello di EmailJS recapita il messaggio. */
  modello?: keyof typeof MODELLI;
};

const FRASE_SITI = {
  attivita: {
    chiede: ", ho",
    esempio: "un bar in centro",
    etichetta: "che attività avete",
  },
  serve: {
    chiede: "e vorrei",
    esempio: "un sito dove si vede il menù",
    etichetta: "cosa vi serve",
  },
  mail: "marco@ilmiobar.it",
};

/* Chiavi EmailJS. Sono pubbliche per costruzione: EmailJS invia dal
   browser, quindi finiscono comunque nel codice che arriva al visitatore.
   Non sono un segreto — la protezione dagli abusi si fa dal pannello di
   EmailJS, limitando i domini da cui si può inviare.

   Vanno lette così, per esteso: Next.js sostituisce `process.env.NOME`
   con il valore al momento della compilazione, e con un accesso dinamico
   non saprebbe cosa sostituire. */
const SERVIZIO = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const CHIAVE = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

/* Un modello per mestiere: i due moduli chiedono cose diverse — attività
   e sito da una parte, uso e budget dall'altra — e su EmailJS ognuno ha
   il suo, così le mail arrivano già scritte nella forma giusta.
   Vanno lette entrambe per esteso: Next.js sostituisce `process.env.NOME`
   col valore al momento della compilazione, e con un accesso costruito a
   pezzi non saprebbe cosa sostituire. */
const MODELLI = {
  siti: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  computer: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PC,
};

type Campo = { id: string; valore: string; nome: string; mail?: boolean };

type CampoInputProps = {
  id: string;
  etichetta: string;
  valore: string;
  onChange: (valore: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  manca?: boolean;
  largo?: boolean;
};

/* Un campo isolato: quando si scrive in uno, gli altri tre non hanno motivo
   di essere ri-renderizzati. I setter sono stabili, quindi memo li salta. */
const CampoInput = memo(function CampoInput({
  id,
  etichetta,
  valore,
  onChange,
  placeholder,
  type,
  autoComplete,
  manca = false,
  largo = false,
}: CampoInputProps) {
  return (
    <span className={`mod-campo${largo ? " mod-campo--largo" : ""}`}>
      <label className="mod-etichetta" htmlFor={id}>
        {etichetta}
      </label>
      <input
        id={id}
        type={type}
        value={valore}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={manca || undefined}
        className={manca ? "manca" : undefined}
      />
    </span>
  );
});

export default function ModuloContatto({
  email,
  frase = FRASE_SITI,
  modello = "siti",
}: Props) {
  const idModello = MODELLI[modello];
  const [nome, setNome] = useState("");
  const [attivita, setAttivita] = useState("");
  const [serve, setServe] = useState("");
  const [mittente, setMittente] = useState("");
  const [mancano, setMancano] = useState<string[]>([]);
  /* fermo → in-corso → fatto | ripiego.
     "ripiego" è quando EmailJS non ce l'ha fatta e si è passati alla
     posta: l'esito va detto in modo diverso, perché lì il messaggio non
     è ancora partito davvero. */
  const [stato, setStato] = useState<"fermo" | "invio" | "fatto" | "ripiego">(
    "fermo"
  );
  const [copiato, setCopiato] = useState(false);
  const form = useRef<HTMLFormElement>(null);


  const chiediAttivita = frase.attivita.chiede.replace(/^[,\s]+/, "");
  const incipitAttivita =
    chiediAttivita.charAt(0).toUpperCase() + chiediAttivita.slice(1);
  const testo = [
    `Ciao, sono ${nome || "…"}.`,
    ``,
    `${incipitAttivita} ${attivita || "…"} ${frase.serve.chiede} ${serve || "…"}.`,
    ``,
    `Potete rispondermi a ${mittente || "…"}.`,
  ].join("\n");

  /* La via di scorta: apre il programma di posta con tutto già scritto. */
  const apriPosta = () => {
    const oggetto = `Richiesta da ${nome}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      oggetto
    )}&body=${encodeURIComponent(testo)}`;
  };

  const invia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stato === "invio") return; // niente doppi invii sul doppio clic

    const campi: Campo[] = [
      { id: "c-nome", valore: nome, nome: "il vostro nome" },
      { id: "c-attivita", valore: attivita, nome: frase.attivita.etichetta },
      { id: "c-serve", valore: serve, nome: frase.serve.etichetta },
      { id: "c-mail", valore: mittente, nome: "la vostra email", mail: true },
    ];

    const vuoti = campi.filter((c) => !c.valore.trim());
    /* controllo minimo sull'indirizzo: serve una chiocciola e un punto
       dopo. Non si va oltre di proposito — le regole troppo strette
       rifiutano indirizzi veri e fanno perdere richieste. */
    const mailStorta =
      mittente.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mittente.trim());

    if (vuoti.length || mailStorta) {
      const elenco = vuoti.map((c) => c.nome);
      if (mailStorta && !elenco.length) elenco.push("un'email scritta bene");
      setMancano(elenco);
      // il fuoco va dove manca qualcosa, non resta sul pulsante
      const primo = vuoti[0]?.id ?? "c-mail";
      form.current?.querySelector<HTMLInputElement>(`#${primo}`)?.focus();
      return;
    }

    setMancano([]);

    /* Senza chiavi configurate non ha senso tentare la chiamata: si va
       dritti alla posta. Capita in locale a chi non ha il file .env. */
    if (!SERVIZIO || !idModello || !CHIAVE) {
      apriPosta();
      setStato("ripiego");
      return;
    }

    setStato("invio");
    try {
      const { send } = await import("@emailjs/browser");
      await send(
        SERVIZIO,
        idModello,
        {
          /* Questi nomi devono corrispondere alle variabili scritte nel
             modello su EmailJS; se lì si chiamano diversamente, arriva una
             mail con i campi vuoti. Usiamo i nomi che EmailJS mette di
             default nei suoi modelli — name, email, title, message — così
             il modello funziona senza doverlo riscrivere, e i campi
             "From Name" e "Reply To" del pannello pescano da soli. */
          name: nome,
          email: mittente,
          title: `${nome} — ${attivita}`,
          message: testo,
          /* In più, i due campi grezzi: servono solo se vorrete comporre
             il modello in modo più ricco che con la sola frase. */
          attivita,
          serve,
        },
        { publicKey: CHIAVE }
      );
      setStato("fatto");
    } catch {
      /* Non mostriamo l'errore tecnico: a chi scrive non dice nulla e
         suona come "riprova più tardi", che di solito vuol dire mai. */
      apriPosta();
      setStato("ripiego");
    }
  };

  const copia = async () => {
    try {
      await navigator.clipboard?.writeText(testo);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2500);
    } catch {
      // Se gli appunti sono bloccati, l'utente può sempre selezionare il pre
    }
  };

  /* un campo si segnala come mancante solo DOPO un tentativo di invio:
     colorare di rosso ciò che non è ancora stato scritto è un rimprovero
     a chi non ha ancora fatto nulla */
  const manca = (etichetta: string) => mancano.includes(etichetta);

  return (
    <form className="mod" onSubmit={invia} noValidate ref={form}>
      <p className="mod-frase">
        Ciao, sono{" "}
        <CampoInput
          id="c-nome"
          etichetta="il vostro nome"
          valore={nome}
          onChange={setNome}
          placeholder="Marco"
          autoComplete="name"
          manca={manca("il vostro nome")}
        />
        {frase.attivita.chiede}{" "}
        <CampoInput
          id="c-attivita"
          etichetta={frase.attivita.etichetta}
          valore={attivita}
          onChange={setAttivita}
          placeholder={frase.attivita.esempio}
          manca={manca(frase.attivita.etichetta)}
          largo
        />{" "}
        {frase.serve.chiede}{" "}
        <CampoInput
          id="c-serve"
          etichetta={frase.serve.etichetta}
          valore={serve}
          onChange={setServe}
          placeholder={frase.serve.esempio}
          manca={manca(frase.serve.etichetta)}
          largo
        />
        . Rispondetemi a{" "}
        <CampoInput
          id="c-mail"
          etichetta="la vostra email"
          valore={mittente}
          onChange={setMittente}
          placeholder={frase.mail ?? "marco@esempio.it"}
          type="email"
          autoComplete="email"
          manca={manca("la vostra email") || manca("un'email scritta bene")}
          largo
        />
        <span className="mod-dot" aria-hidden="true" />
      </p>

      {/* L'avviso nella lingua del sito, al posto del fumetto di sistema.
          `role="alert"` lo fa leggere subito da uno screen reader, che
          altrimenti non si accorgerebbe che è comparso. */}
      {mancano.length > 0 && (
        <p className="mod-manca" role="alert">
          Manca ancora {mancano.join(", ").replace(/, ([^,]*)$/, " e $1")}.
        </p>
      )}

      <button
        className="hero-action mod-invia"
        type="submit"
        disabled={stato === "invio"}
      >
        <span className="hero-action__arrow hero-action__arrow--enter" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
          </svg>
        </span>
        <span className="hero-action__text">
          {stato === "invio" ? "Un attimo…" : "Mandaci un messaggio"}
        </span>
        <span className="hero-action__circle" aria-hidden="true" />
        <span className="hero-action__arrow hero-action__arrow--exit" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
          </svg>
        </span>
      </button>

      {stato === "fatto" && (
        <p className="mod-fatto" role="status">
          Ricevuto. Vi rispondiamo presto, all&apos;indirizzo che ci avete
          lasciato.
        </p>
      )}

      {/* Ultima rete: si arriva qui solo se l'invio diretto è fallito e si
          è ripiegati sulla posta. Se anche quella non si apre — capita su
          computer condivisi o con la webmail — il messaggio è già scritto
          e si può copiare invece di riscriverlo da capo. */}
      {stato === "ripiego" && (
        <div className="mod-scorta" role="status">
          <p>
            Abbiamo aperto il vostro programma di posta. Se non è successo,
            il messaggio è pronto: copiatelo e mandatelo a{" "}
            <strong>{email}</strong>.
          </p>
          <pre>{testo}</pre>
          <button type="button" onClick={copia}>
            {copiato ? "Copiato negli appunti!" : "Copia il messaggio"}
          </button>
        </div>
      )}
    </form>
  );
}
