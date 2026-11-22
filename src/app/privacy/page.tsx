import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import { NOME, EMAIL, urlSito } from "@/lib/sito";

export const metadata: Metadata = {
  /* diventa "Privacy · Sycomo Digital" per via del modello nel layout */
  title: "Privacy",
  description:
    "Come Sycomo Digital tratta i dati personali di chi visita il sito e di chi ci scrive.",
  alternates: { canonical: urlSito("/privacy") },
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    locale: "it_IT",
    url: urlSito("/privacy"),
    title: "Privacy",
    description:
      "Come trattiamo i dati di chi visita il sito e di chi ci scrive.",
    /* L'immagine va ripetuta: dichiarando un blocco openGraph proprio, la
       pagina smette di ereditare quella generata da opengraph-image.tsx
       nella radice, e il link condiviso resterebbe senza anteprima. */
    images: [urlSito("/opengraph-image")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy · Sycomo Digital",
    description:
      "Come trattiamo i dati di chi visita il sito e di chi ci scrive.",
    images: [urlSito("/opengraph-image")],
  },
};

/* ⚠️ DA COMPLETARE prima di pubblicare — sono gli unici punti da toccare.
   Finché restano così l'informativa non è valida: il titolare va indicato
   con dati veri e verificabili, è il primo obbligo dell'articolo 13.
   Quando ci sarà la partita IVA va aggiunta qui e nel piede di pagina. */
const TITOLARE = {
  nome: NOME,
  indirizzo: "[via, numero civico — CAP, città, provincia], Italia",
  email: EMAIL,
};

/* Chi tratta dati per conto vostro. Da aggiornare quando scegliete dove
   pubblicare il sito e quale casella di posta usate per lavoro.

   ⚠️ "dove" è impostato su Unione Europea perché è la scelta da fare:
   con fornitori europei non serve alcuna garanzia aggiuntiva per il
   trasferimento. Se ne sceglierete uno che tratta dati fuori dall'UE —
   la maggior parte dei servizi americani lo fa — il valore va corretto,
   e va tenuto il capoverso sulle clausole contrattuali standard. */
const FORNITORI = [
  {
    nome: "[fornitore dell'hosting]",
    ruolo: "conserva il sito e registra gli accessi tecnici",
    dove: "Unione Europea",
  },
  {
    nome: "[fornitore della posta elettronica]",
    ruolo: "conserva i messaggi che ci scrivete",
    dove: "Unione Europea",
  },
  {
    nome: "EmailJS (EmailJS Inc.)",
    ruolo: "recapita a noi i messaggi scritti nel modulo di contatto",
    dove: "Stati Uniti",
  },
];

const AGGIORNATA = "9 novembre 2026";

export default function Privacy() {
  return (
    <>
      <header className="doc-testa">
        <Link href="/" aria-label="Torna alla pagina principale">
          <Logo />
        </Link>
      </header>

      <main className="doc">
        <p className="doc-occhiello">informativa privacy</p>
        <h1 className="doc-titolo">
          Come trattiamo
          <br />i vostri dati
          <span className="doc-dot" aria-hidden="true" />
        </h1>

        <p className="doc-guida">
          In breve: questo sito non usa cookie, non vi profila e non passa i
          vostri dati a nessuno per fini commerciali. Se ci scrivete, usiamo
          quello che ci mandate solo per rispondervi. Sotto è spiegato nel
          dettaglio, come richiedono il Regolamento europeo 2016/679 e il
          Codice italiano in materia di protezione dei dati personali
          (decreto legislativo 196/2003, come modificato dal decreto
          legislativo 101/2018).
        </p>

        <section>
          <h2>1. Chi tratta i dati</h2>
          <p>
            Il titolare del trattamento è {TITOLARE.nome},{" "}
            {TITOLARE.indirizzo}. Per qualsiasi questione riguardante i vostri
            dati potete scrivere a{" "}
            <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>.
          </p>
          <p>
            Non abbiamo nominato un responsabile della protezione dei dati
            perché non ricorrono i casi previsti dall&apos;articolo 37 del
            Regolamento. I dati sono trattati in Italia e, per la parte
            affidata ai fornitori indicati al punto 5, all&apos;interno dello
            Spazio economico europeo.
          </p>
        </section>

        <section>
          <h2>2. Quali dati raccogliamo</h2>
          <h3>Se ci scrivete</h3>
          <p>
            Il modulo di contatto raccoglie quattro informazioni: il vostro
            nome, che attività avete, che cosa vi serve e l&apos;indirizzo a
            cui volete essere ricontattati. Nient&apos;altro: non ci sono
            campi nascosti.
          </p>
          <p>
            Il messaggio viene recapitato dal servizio EmailJS, indicato al
            punto 5, che lo consegna alla nostra casella. Non abbiamo un
            server nostro che lo conservi. Se l&apos;invio non riesce, il
            modulo apre il programma di posta che usate abitualmente con il
            testo già scritto: in quel caso siete voi a inviarlo, dal vostro
            indirizzo, e EmailJS non entra in gioco.
          </p>
          <h3>Quando visitate il sito</h3>
          <p>
            Come ogni sito, il server che lo ospita registra automaticamente
            alcuni dati tecnici: l&apos;indirizzo IP, la data e l&apos;ora
            della visita, il tipo di browser e la pagina richiesta. Servono a
            far funzionare il sito e a difenderlo da abusi; non li usiamo per
            identificarvi né li incrociamo con altri dati.
          </p>
        </section>

        <section>
          <h2>3. Perché li trattiamo</h2>
          <ul>
            <li>
              <strong>Per rispondervi.</strong> Base giuridica: l&apos;esecuzione
              di misure precontrattuali richieste da voi (articolo 6.1.b del
              Regolamento). Senza questi dati non possiamo semplicemente
              rispondere.
            </li>
            <li>
              <strong>Per far funzionare il sito in sicurezza.</strong> Base
              giuridica: il nostro legittimo interesse a mantenerlo
              raggiungibile e protetto (articolo 6.1.f).
            </li>
            <li>
              <strong>Per gli obblighi di legge</strong>, contabili e fiscali,
              se il contatto diventa un lavoro (articolo 6.1.c).
            </li>
          </ul>
          <p>
            Non facciamo profilazione, non prendiamo decisioni automatizzate e
            non usiamo i vostri dati per pubblicità.
          </p>
        </section>

        <section>
          <h2>4. Per quanto tempo li conserviamo</h2>
          <ul>
            <li>
              I messaggi che non portano a un lavoro: <strong>due anni</strong>{" "}
              dall&apos;ultimo scambio, poi vengono cancellati.
            </li>
            <li>
              I dati di chi diventa cliente: per la durata del rapporto e poi
              per i <strong>dieci anni</strong> che l&apos;articolo 2220 del
              Codice civile impone per le scritture contabili, termine ripreso
              dalla normativa fiscale.
            </li>
            <li>
              I registri tecnici del server: secondo i tempi del fornitore di
              hosting, di norma non oltre pochi mesi. EmailJS conserva la
              copia dei messaggi inoltrati secondo i termini del proprio
              servizio; per noi vale il termine dei due anni indicato sopra.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Chi altro li vede</h2>
          <p>
            Nessuno, a parte i fornitori tecnici che ci permettono di lavorare.
            Non vendiamo e non cediamo dati a terzi.
          </p>
          <ul>
            {FORNITORI.map((f) => (
              <li key={f.nome}>
                <strong>{f.nome}</strong> — {f.ruolo}. Dati trattati in:{" "}
                {f.dove}.
              </li>
            ))}
          </ul>
          <p>
            Questi fornitori agiscono come responsabili del trattamento,
            nominati con contratto ai sensi dell&apos;articolo 28 del
            Regolamento. Per l&apos;hosting e la posta scegliamo fornitori che
            trattano i dati all&apos;interno dello Spazio economico europeo:
            così non escono dall&apos;area in cui vale il Regolamento e non
            serve alcuna garanzia ulteriore per il trasferimento.
          </p>
          <p>
            EmailJS ha invece sede negli Stati Uniti: il messaggio che
            scrivete nel modulo transita quindi fuori dall&apos;Unione
            Europea. Il trasferimento avviene sulla base delle clausole
            contrattuali standard approvate dalla Commissione europea
            (articolo 46 del Regolamento) e, se il fornitore vi aderisce, del
            quadro UE-USA per la protezione dei dati (articolo 45). Se
            preferite che i vostri dati non escano dall&apos;Unione,
            scriveteci direttamente all&apos;indirizzo indicato al punto 1: il
            risultato per voi è lo stesso, e il modulo non viene usato.
          </p>
        </section>

        <section>
          <h2>6. Cookie</h2>
          <p>
            <strong>Questo sito non installa cookie.</strong> Non usiamo
            statistiche, non abbiamo pixel di tracciamento, non incorporiamo
            video o mappe di terze parti, e i caratteri tipografici sono
            serviti dal nostro stesso dominio. Per questo non vedete alcun
            banner: non essendoci nulla da autorizzare, chiedervi il consenso
            sarebbe solo un fastidio inutile.
          </p>
          <p>
            Se in futuro aggiungeremo strumenti che usano cookie, ve lo
            chiederemo prima di installarli e aggiorneremo questa pagina.
          </p>
        </section>

        <section>
          <h2>7. I vostri diritti</h2>
          <p>
            Gli articoli dal 15 al 22 del Regolamento vi danno il diritto di
            chiederci:
          </p>
          <ul>
            <li>di sapere quali dati vostri abbiamo e di riceverne copia;</li>
            <li>di correggerli, se sono sbagliati o incompleti;</li>
            <li>di cancellarli;</li>
            <li>di limitarne o di opporvi al trattamento;</li>
            <li>di riceverli in un formato leggibile da un altro programma.</li>
          </ul>
          <p>
            Per esercitarli basta scrivere a{" "}
            <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>:
            rispondiamo entro un mese, come previsto dall&apos;articolo 12 del
            Regolamento. Non chiediamo nulla per rispondervi.
          </p>
          <p>
            Se ritenete che i vostri dati siano trattati in modo scorretto
            potete presentare reclamo al{" "}
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
            >
              Garante per la protezione dei dati personali
            </a>
            , piazza Venezia 11, 00187 Roma — l&apos;autorità di controllo
            italiana (articolo 77 del Regolamento e articolo 141 del Codice).
            In alternativa, o successivamente, potete rivolgervi
            all&apos;autorità giudiziaria ordinaria: le due strade non si
            possono però percorrere contemporaneamente sullo stesso oggetto.
          </p>
        </section>

        <section>
          <h2>8. Modifiche</h2>
          <p>
            Se cambieremo qualcosa nel modo in cui trattiamo i dati,
            aggiorneremo questa pagina e la data qui sotto. Al trattamento e a
            questa informativa si applicano la legge italiana e il diritto
            dell&apos;Unione Europea.
          </p>
          <p className="doc-data">Ultimo aggiornamento: {AGGIORNATA}.</p>
        </section>

        <Link className="doc-torna" href="/">
          Torna al sito
        </Link>
      </main>

      <Footer />
    </>
  );
}
