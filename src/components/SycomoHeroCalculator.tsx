"use client";

import { useState } from "react";
import { WHATSAPP } from "@/lib/sito";

interface TierData {
  id: "10" | "30" | "50";
  pillLabel: string;
  clienti: string;
  tempo: string;
  mensile: string;
  stato: string;
}

const TIERS: Record<"10" | "30" | "50", TierData> = {
  "10": {
    id: "10",
    pillLabel: "10 - 20",
    clienti: "10 - 20 clienti",
    tempo: "~2,5 ore",
    mensile: "10 ore/mese",
    stato: "100% in automatico",
  },
  "30": {
    id: "30",
    pillLabel: "30 - 40",
    clienti: "30 - 40 clienti",
    tempo: "~5 ore",
    mensile: "20 ore/mese",
    stato: "Zero buchi in agenda",
  },
  "50": {
    id: "50",
    pillLabel: "50+",
    clienti: "50+ clienti",
    tempo: "~8+ ore",
    mensile: "32+ ore/mese",
    stato: "Gestione completa H24",
  },
};

export default function SycomoHeroCalculator() {
  const [selectedTier, setSelectedTier] = useState<"10" | "30" | "50">("30");
  const tier = TIERS[selectedTier];

  const waMessage = `Ciao! Ho visto il calcolatore sul sito: gestisco circa ${tier.clienti} a settimana e vorrei capire come risparmiare tempo con un sistema su misura.`;
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="w-full flex-1 min-h-0 rounded-2xl border border-stone-200 bg-white/95 p-5 lg:p-6 shadow-xl shadow-zinc-900/5 flex flex-col justify-between text-zinc-900 backdrop-blur-[6px] shadow-[0_0_40px_25px_#FAF8F5]">
      {/* 1. Header: Titolo ripristinato come prima (a sinistra, forte e chiaro) */}
      <div className="border-b border-stone-100/90 pb-3">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-zinc-900 tracking-tight leading-snug text-left">
          Quanto tempo ti fa risparmiare un sistema su misura?
        </h2>

        {/* Barra di selezione delle ore/clienti: a larghezza piena come il bottone sotto */}
        <div className="mt-3 sm:mt-4 w-full">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-100/90 rounded-xl border border-stone-200/60 w-full">
            {(["10", "30", "50"] as const).map((tierKey) => {
              const item = TIERS[tierKey];
              const isActive = selectedTier === tierKey;
              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => setSelectedTier(tierKey)}
                  aria-pressed={isActive}
                  className={`py-2.5 px-3 text-xs sm:text-sm rounded-lg font-bold transition-all duration-150 cursor-pointer text-center ${isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-stone-600 hover:text-zinc-900 hover:bg-white/60"
                    }`}
                >
                  <span className="block font-bold sm:text-sm">{item.pillLabel}</span>
                  <span className="block text-[10px] sm:text-[11px] opacity-75 font-normal">
                    clienti
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Griglia orizzontale a 2 box affiancati */}
      <div className="grid grid-cols-2 gap-3.5 my-auto py-2">
        {/* Box Sinistro — Tempo Risparmiato */}
        <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-3.5 lg:p-4 flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-medium text-zinc-900">
            Tempo risparmiato
          </span>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#E04F3E] tracking-tight block leading-tight">
              {tier.tempo}
            </span>
            <span className="text-xs text-stone-500 font-medium block mt-0.5">
              {tier.mensile}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            settimanale
          </span>
        </div>

        {/* Box Destro — Appuntamenti & Clienti */}
        <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-3.5 lg:p-4 flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-medium text-zinc-900">
            Appuntamenti e clienti
          </span>
          <div className="my-1">
            <span className="text-sm sm:text-base font-bold text-zinc-900 block leading-tight">
              {tier.stato}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 mt-1">
              <span>✓</span> Sito + Agenda + WhatsApp
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            {tier.clienti}
          </span>
        </div>
      </div>

      {/* 3. CTA Finale */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#E04F3E] hover:bg-[#c94333] active:scale-[0.99] text-white font-semibold py-2.5 sm:py-3 px-5 rounded-xl transition-all duration-150 shadow-md shadow-[#E04F3E]/20 flex items-center justify-center gap-2 group text-sm sm:text-base text-center cursor-pointer"
      >
        <span>Scopri come funziona per te</span>
        <span className="transition-transform duration-150 group-hover:translate-x-1">
          →
        </span>
      </a>
    </div>
  );
}
