import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { NOME, DESCRIZIONE_BREVE } from "@/lib/sito";

/**
 * L'immagine che compare quando qualcuno incolla il link del sito su
 * WhatsApp, Instagram, LinkedIn o in una chat.
 *
 * È disegnata qui invece di essere un file: così segue la palette e non
 * va rifatta a mano ogni volta che il marchio cambia. Riproduce la prima
 * schermata — carta, marchio in grande, il quadratino rosso — perché chi
 * clicca deve ritrovare quello che ha visto nell'anteprima.
 *
 * `next/font` serve la pagina, non questo generatore: qui si caricano
 * gli stessi caratteri da TTF statici locali, compatibili con Satori.
 */

export const alt = `${NOME} — siti su misura per le piccole attività`;
export const dynamic = "force-static";

/* 1200×630 è la misura che tutte le piattaforme ritagliano senza tagliare:
   sotto, l'immagine viene sgranata; con altre proporzioni viene rifilata
   ai bordi. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f7f4ed";
const INK = "#20201c";
const RED = "#e12c1a";
const MUTED = "#4c483f";

export default async function Immagine() {
  const [geistRegular, geistBold, manropeSemiBold] = await Promise.all([
    readFile(join(process.cwd(), "src/app/og-fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "src/app/og-fonts/Geist-Bold.ttf")),
    readFile(join(process.cwd(), "src/app/og-fonts/Manrope-SemiBold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: PAPER,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          position: "relative",
        }}
      >
        {/* La massa di vetro dell'angolo, ridotta a due cerchi: nel
            piccolo di un'anteprima le cinque lastre diventerebbero una
            macchia confusa, mentre due sagome larghe si leggono ancora. */}
        <div
          style={{
            position: "absolute",
            left: -120,
            bottom: -190,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: RED,
            opacity: 0.14,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 120,
            bottom: -120,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: RED,
            opacity: 0.2,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <div
            style={{
              fontSize: 132,
              fontFamily: "Geist",
              fontWeight: 700,
              letterSpacing: "-0.05em",
              color: INK,
              lineHeight: 1,
              display: "flex",
            }}
          >
            sycomo
          </div>
          {/* il punto del marchio: quadrato, non tondo */}
          <div
            style={{
              width: 26,
              height: 26,
              background: RED,
              marginLeft: 14,
              marginBottom: 8,
              display: "flex",
            }}
          />
        </div>

        <div
          style={{
            fontSize: 30,
            fontFamily: "Manrope",
            fontWeight: 600,
            letterSpacing: "0.42em",
            color: INK,
            marginTop: 14,
            marginLeft: 6,
            display: "flex",
          }}
        >
          DIGITAL
        </div>

        <div
          style={{
            fontSize: 40,
            fontFamily: "Geist",
            fontWeight: 400,
            color: MUTED,
            marginTop: 54,
            maxWidth: 780,
            lineHeight: 1.35,
            display: "flex",
          }}
        >
          {DESCRIZIONE_BREVE}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: Uint8Array.from(geistRegular).buffer,
          weight: 400,
          style: "normal",
        },
        {
          name: "Geist",
          data: Uint8Array.from(geistBold).buffer,
          weight: 700,
          style: "normal",
        },
        {
          name: "Manrope",
          data: Uint8Array.from(manropeSemiBold).buffer,
          weight: 600,
          style: "normal",
        },
      ],
    }
  );
}
