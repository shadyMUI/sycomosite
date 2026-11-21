"use client";

import { useState } from "react";
import HorizontalPinAlbum from "./HorizontalPinAlbum";
import MobileVerticalAlbum from "./MobileVerticalAlbum";
import ProjectDetailModal from "./ProjectDetailModal";

export type Scatto = {
  src: string | null;
  didascalia: string;
  alt: string;
  daFare: string;
  cliente?: string;
  categoria?: string;
  anno?: string;
  ruolo?: string;
  metriche?: string[];
  specifiche?: string[];
  descrizione?: string;
  stato?: string;
};

export const SCATTI_HARDWARE: Scatto[] = [
  {
    src: null,
    didascalia: "Per Marco, che ci gioca",
    alt: "Computer da gioco montato per un cliente ad Asti",
    daFare: "la macchina di tre quarti, pannello aperto",
    cliente: "Marco V. · Sim Racing & Competitivo",
    categoria: "PC Gaming Estremo · 1440p & 4K",
    anno: "2024",
    ruolo: "Selezione Componenti, Cablaggio & Undervolt Termico",
    stato: "Consegnato & Operativo",
    metriche: ["64°C Max Sotto Carico", "0 dB Silenzio Idle", "240+ FPS Stabili"],
    specifiche: [
      "Ryzen 7 7800X3D + RTX 4080 Super",
      "Pasta Kryonaut Extreme",
      "Pressione Positiva Antipolvere",
      "Stress Test OCCT 24h Pass",
    ],
    descrizione:
      "Costruito per sessioni competitive e simulatori di guida: zero rumore molesto delle ventole, temperature glaciali anche ad agosto e gestione cavi millimetrica a scomparsa sul retro.",
  },
  {
    src: null,
    didascalia: "Per uno studio di montaggio",
    alt: "Postazione da montaggio video montata per uno studio",
    daFare: "la postazione accesa sulla scrivania",
    cliente: "Atelier Audiovisivo Astigiano",
    categoria: "Workstation Video 6K & Color Grading",
    anno: "2024",
    ruolo: "Architettura RAID NVMe, Tuning RAM & Acustica",
    stato: "In Studio ad Asti",
    metriche: ["Realtime 6K ProRes", "32 TB Ridondanza Raid", "Filtrazione Totale Polvere"],
    specifiche: [
      "64GB DDR5 6000MT/s Low-Latency",
      "Raffreddamento Liquido 360mm",
      "Pannelli Fonoassorbenti 4mm",
      "Calibrazione Profilo DCI-P3",
    ],
    descrizione:
      "Una workstation pensata per montatori e colorist che non possono tollerare interruzioni: esportazioni continue in background e storage ultra-rapido da oltre 7000 MB/s senza surriscaldare.",
  },
  {
    src: null,
    didascalia: "Il primo computer di Sara",
    alt: "Computer da studio montato per una studentessa",
    daFare: "il computer consegnato, pronto all'uso",
    cliente: "Sara M. · Ingegneria & CAD",
    categoria: "Desktop da Studio & Calcolo Tecnico",
    anno: "2024",
    ruolo: "Ottimizzazione Budget & Espandibilità 5+ Anni",
    stato: "Consegnato Chiavi in Mano",
    metriche: ["Miglior Euro/Prestazioni", "< 8s Avvio Windows", "Garanzia Estesa 10 Anni"],
    specifiche: [
      "Alimentatore Gold ATX 3.0",
      "Chassis Compatto High-Airflow",
      "Doppio Backup Automatico",
      "BIOS Ottimizzato su Misura",
    ],
    descrizione:
      "La prima macchina da lavoro seria: selezione calibrata al centesimo per garantire reattività con software di modellazione 3D e calcolo senza spendere soldi in luci inutili o marchi gonfiati.",
  },
  {
    src: null,
    didascalia: "Rimesso a nuovo, non ricomprato",
    alt: "Computer di qualche anno dopo pulizia e sostituzione componenti",
    daFare: "prima e dopo: la ventola piena di polvere e pulita",
    cliente: "Studio Commercialista Locale",
    categoria: "Rigenerazione Termica & Clone NVMe",
    anno: "2024",
    ruolo: "Pulizia Approfondita, Delid & Upgrade SSD",
    stato: "Rigenerato con Garanzia",
    metriche: ["-28°C Abbattimento Termico", "Zero Ronzio Meccanico", "+350% Reattività"],
    specifiche: [
      "Smontaggio Camera Pulita",
      "Pad Termici Nuovi ad Alta Conducibilità",
      "Clonazione Dati 1:1 NVMe M.2",
      "Licenze e Archivi Intatti",
    ],
    descrizione:
      "Dato per spacciato a causa di blocchi e surriscaldamento: ripulito da cima a fondo, nuova pasta termica, SSD moderno e ottimizzazione software. Ora è più veloce di quando è uscito dal negozio.",
  },
];

export const SCATTI_DIGITAL: Scatto[] = [
  {
    src: null,
    didascalia: "Studio Fisioterapico · Sito & Prenotazioni",
    alt: "Landing page per studio medico e fisioterapico ad Asti",
    daFare: "screenshot della landing su smartphone e portatile",
    cliente: "Studio FisioMed Asti",
    categoria: "Piattaforma Web & Prenotazioni Rapide",
    anno: "2024",
    ruolo: "Design UI/UX, Sviluppo Fullstack & SEO Locale",
    stato: "In Produzione · Attivo",
    metriche: ["< 0.4s Caricamento", "+140% Richieste Online", "100/100 Google Lighthouse"],
    specifiche: [
      "Next.js App Router & React 19",
      "Integrazione WhatsApp Diretta",
      "Hosting Edge Server Europei",
      "Accessibilità WCAG AA",
    ],
    descrizione:
      "Interfaccia pulita e immediata: il paziente prenota la visita specialistica in due tocchi, senza login o moduli infiniti. Nessun CMS ingombrante, velocità di caricamento fulminea su reti mobili.",
  },
  {
    src: null,
    didascalia: "Dueby · App Mobile Android & iOS",
    alt: "Applicazione mobile per il tracciamento di scadenze e documenti",
    daFare: "schermate dell'app in mano su telefono vero",
    cliente: "Dueby Document Tracker",
    categoria: "Applicazione Nativa Cross-Platform",
    anno: "2024",
    ruolo: "Architettura Mobile, UX & Sincronizzazione Cloud",
    stato: "Beta Pubblica · App Store & Play Store",
    metriche: ["60 FPS Fluidi", "100% Funzionamento Offline", "Crittografia AES-256"],
    specifiche: [
      "React Native & TypeScript",
      "Motore OCR Locale su Dispositivo",
      "Notifiche Predittive Intelligenti",
      "Zero Cessione Dati a Terzi",
    ],
    descrizione:
      "Tracciamento intelligente di bollette, revisioni auto e documenti di famiglia. Promemoria contestuali prima della scadenza, archivio crittografato sul dispositivo e sincronizzazione sicura.",
  },
  {
    src: null,
    didascalia: "Demo Ristorante · Menù & Tavoli",
    alt: "Web app con menù digitale interattivo e prenotazione WhatsApp",
    daFare: "anteprima del menù interattivo aperto da QR code",
    cliente: "Osteria Contemporanea Astigiana",
    categoria: "Web App Interattiva & QR Experience",
    anno: "2024",
    ruolo: "Design di Esperienza & Frontend Interattivo",
    stato: "Showcase Dal Vivo",
    metriche: ["0.2s Apertura QR Istantanea", "Filtro Allergeni Real-time", "+32% Ordini al Tavolo"],
    specifiche: [
      "Progressive Web App Installabile",
      "Micro-interazioni 60fps",
      "Comande WhatsApp al Tavolo",
      "Pannello Carta Vini Istantaneo",
    ],
    descrizione:
      "Basta PDF pesanti e illeggibili con zoom a due dita. Un menù digitale ultra-rapido, con foto nitide, abbinamenti vino consigliati e invio comande al personale o direttamente su WhatsApp.",
  },
  {
    src: null,
    didascalia: "Demo Estetica · Listino & Appuntamenti",
    alt: "Sito e sistema di prenotazione rapida per centro estetico",
    daFare: "schermata di scelta trattamento e orario",
    cliente: "Atelier Benessere & Beauty Lounge",
    categoria: "Agenda Digitale & Listino Trattamenti",
    anno: "2024",
    ruolo: "UI Liquid Glass & Logica Calendario",
    stato: "Showcase Dal Vivo",
    metriche: ["3 Passaggi per Prenotare", "-65% Telefonate Perse", "Sincronizzazione Google"],
    specifiche: [
      "Design System Liquid Glass",
      "Slot Orari Dinamici",
      "Promemoria SMS & WhatsApp",
      "Zero Commissioni Esterne",
    ],
    descrizione:
      "Esperienza tattile ed elegante per clienti esigenti. Scelta dell'operatore, selezione del pacchetto benessere e conferma immediata dello slot orario senza frizioni o attese al telefono.",
  },
];

type Props = {
  titolo?: [string, string];
  scatti?: Scatto[];
};

export default function Album({
  titolo = ["Qualche macchina", "che abbiamo montato"],
  scatti = SCATTI_HARDWARE,
}: Props) {
  const [selectedProject, setSelectedProject] = useState<Scatto | null>(null);

  return (
    <>
      {/* Vista Desktop (>= 860px): giostra orizzontale a pieno schermo ancorata */}
      <HorizontalPinAlbum
        titolo={titolo}
        scatti={scatti}
        onSelectCard={(p) => setSelectedProject(p)}
      />

      {/* Vista Mobile (< 860px): lista verticale di schede a flusso naturale */}
      <MobileVerticalAlbum
        titolo={titolo}
        scatti={scatti}
        onSelectProject={(p) => setSelectedProject(p)}
      />

      {/* Modale / Foglio inferiore di dettaglio accessibile (Liquid-Glass) */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <noscript>
        <div className="sr-only">
          <h2>
            {titolo[0]} {titolo[1]}
          </h2>
          <ul>
            {scatti.map((s, idx) => (
              <li key={s.didascalia}>
                <h3>
                  {idx + 1}. {s.didascalia}
                </h3>
                <p>{s.alt}</p>
                {s.descrizione && <p>{s.descrizione}</p>}
                {s.cliente && <p>Cliente: {s.cliente}</p>}
                {s.categoria && <p>Categoria: {s.categoria}</p>}
                {s.ruolo && <p>Ruolo: {s.ruolo}</p>}
                {s.metriche && <p>Metriche: {s.metriche.join(", ")}</p>}
                {s.specifiche && <p>Specifiche: {s.specifiche.join(", ")}</p>}
              </li>
            ))}
          </ul>
        </div>
      </noscript>
    </>
  );
}
