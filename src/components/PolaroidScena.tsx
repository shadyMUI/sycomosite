/**
 * Cosa c'è dentro la polaroid quando non c'è una foto: un sito che si
 * costruisce da solo, in loop.
 *
 * Non è un ripiego in attesa di uno scatto — è la cosa più onesta che si
 * possa mettere lì. Non finge un ufficio che non esiste e mostra
 * esattamente il mestiere: un progetto che prende forma, pezzo per pezzo,
 * fino a stare in piedi.
 *
 * Tutto in CSS: nessuna immagine da scaricare, nitido a ogni risoluzione,
 * e pesa quanto il markup che stai leggendo.
 */
export default function PolaroidScena() {
  return (
    <div className="pa" aria-hidden="true">
      {/* la barra in alto, col quadratino del marchio */}
      <span className="pa-barra">
        <span className="pa-punto" />
      </span>

      {/* il blocco grande: l'immagine di apertura */}
      <span className="pa-hero" />

      {/* le righe di testo che si posano accanto */}
      <span className="pa-riga pa-riga--1" />
      <span className="pa-riga pa-riga--2" />
      <span className="pa-riga pa-riga--3" />

      {/* il bottone: l'ultimo pezzo, quello che fa lavorare il sito */}
      <span className="pa-cta" />
    </div>
  );
}
