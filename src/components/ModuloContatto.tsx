"use client";

import { useRef, useState } from "react";

/**
 * Il modulo di contatto, scritto come una frase da completare.
 *
 * Non caselle impilate con l'etichetta sopra: una riga di discorso in cui
 * si riempiono i buchi. Chi scrive non sta "compilando un form", sta
 * finendo una frase — e intanto ci dice le uniche quattro cose che
 * servono per rispondere con qualcosa di sensato.
 *
 * Non c'è un server dietro: alla conferma si apre il programma di posta
 * con tutto già scritto. È la scelta onesta per uno studio piccolo — chi
 * riceve vede una mail vera, da un indirizzo vero, a cui può rispondere.
 * Se la posta non si apre resta il testo pronto da copiare, così il
 * messaggio non va perso.
 *
 * `noValidate` disattiva i controlli del browser: il fumetto giallo di
 * sistema non si può vestire in alcun modo — è disegnato dal browser, il
 * CSS non lo raggiunge — e in mezzo a questa pagina stonava. I controlli
 * li facciamo qui, e l'avviso è scritto nella lingua del sito.
 */

type Props = { email: string };

type Campo = { id: string; valore: string; nome: string; mail?: boolean };

export default function ModuloContatto({ email }: Props) {
  const [nome, setNome] = useState("");
  const [attivita, setAttivita] = useState("");
  const [serve, setServe] = useState("");
  const [mittente, setMittente] = useState("");
  const [mancano, setMancano] = useState<string[]>([]);
  const [inviato, setInviato] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  const testo = [
    `Ciao, sono ${nome || "…"}.`,
    ``,
    `Ho ${attivita || "…"} e vorrei ${serve || "…"}.`,
    ``,
    `Potete rispondermi a ${mittente || "…"}.`,
  ].join("\n");

  const invia = (e: React.FormEvent) => {
    e.preventDefault();

    const campi: Campo[] = [
      { id: "c-nome", valore: nome, nome: "il vostro nome" },
      { id: "c-attivita", valore: attivita, nome: "che attività avete" },
      { id: "c-serve", valore: serve, nome: "cosa vi serve" },
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
    const oggetto = `Richiesta da ${nome}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      oggetto
    )}&body=${encodeURIComponent(testo)}`;
    setInviato(true);
  };

  const copia = () => navigator.clipboard?.writeText(testo);

  /* un campo si segnala come mancante solo DOPO un tentativo di invio:
     colorare di rosso ciò che non è ancora stato scritto è un rimprovero
     a chi non ha ancora fatto nulla */
  const manca = (etichetta: string) => mancano.includes(etichetta);

  return (
    <form className="mod" onSubmit={invia} noValidate ref={form}>
      <p className="mod-frase">
        Ciao, sono{" "}
        <span className="mod-campo">
          <label className="mod-etichetta" htmlFor="c-nome">
            il vostro nome
          </label>
          <input
            id="c-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Marco"
            autoComplete="name"
            aria-invalid={manca("il vostro nome") || undefined}
            className={manca("il vostro nome") ? "manca" : undefined}
          />
        </span>
        , ho{" "}
        <span className="mod-campo mod-campo--largo">
          <label className="mod-etichetta" htmlFor="c-attivita">
            che attività avete
          </label>
          <input
            id="c-attivita"
            value={attivita}
            onChange={(e) => setAttivita(e.target.value)}
            placeholder="un bar in centro"
            aria-invalid={manca("che attività avete") || undefined}
            className={manca("che attività avete") ? "manca" : undefined}
          />
        </span>{" "}
        e vorrei{" "}
        <span className="mod-campo mod-campo--largo">
          <label className="mod-etichetta" htmlFor="c-serve">
            cosa vi serve
          </label>
          <input
            id="c-serve"
            value={serve}
            onChange={(e) => setServe(e.target.value)}
            placeholder="un sito dove si vede il menù"
            aria-invalid={manca("cosa vi serve") || undefined}
            className={manca("cosa vi serve") ? "manca" : undefined}
          />
        </span>
        . Rispondetemi a{" "}
        <span className="mod-campo mod-campo--largo">
          <label className="mod-etichetta" htmlFor="c-mail">
            la vostra email
          </label>
          <input
            id="c-mail"
            type="email"
            value={mittente}
            onChange={(e) => setMittente(e.target.value)}
            placeholder="marco@ilmiobar.it"
            autoComplete="email"
            aria-invalid={
              manca("la vostra email") ||
              manca("un'email scritta bene") ||
              undefined
            }
            className={
              manca("la vostra email") || manca("un'email scritta bene")
                ? "manca"
                : undefined
            }
          />
        </span>
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

      <button className="mod-invia" type="submit">
        Mandate il messaggio
      </button>

      {/* Rete di sicurezza: se il programma di posta non si apre — capita
          spesso su computer condivisi o con la webmail — il messaggio è
          già scritto e si può copiare invece di riscriverlo da capo. */}
      {inviato && (
        <div className="mod-scorta" role="status">
          <p>
            Non si è aperta la posta? Il messaggio è pronto: copiatelo e
            mandatelo a <strong>{email}</strong>.
          </p>
          <pre>{testo}</pre>
          <button type="button" onClick={copia}>
            Copia il messaggio
          </button>
        </div>
      )}
    </form>
  );
}
