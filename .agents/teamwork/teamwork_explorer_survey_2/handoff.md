# Handoff Report: Portfolio Section Architecture & Mobile Card Layout Survey

**Agent**: teamwork_explorer_survey_2  
**Date**: 2026-11-10T17:21:00Z  
**Scope**: Sycomo Portfolio / Album Section Architecture, Horizontal Pinning Engine, Data Model, Mobile Card Layout (< 860px, R2), Desktop Carousel Preservation (>= 860px, R3), and Modal Detail View Integration.

---

## 1. Observation

### 1.1 Project Structure & Section Usage
- The portfolio section is rendered via `<Album>` in two key routes:
  1. `src/app/page.tsx` (lines 5, 77-80):
     ```tsx
     import Album, { SCATTI_DIGITAL } from "@/components/Album";
     ...
     <Album
       titolo={["Qualche progetto", "demo e dal vivo"]}
       scatti={SCATTI_DIGITAL}
     />
     ```
  2. `src/app/pc-su-misura/page.tsx` (lines 10, 108):
     ```tsx
     import Album from "@/components/Album";
     ...
     <Album /> {/* Uses default titolo: ["Qualche macchina", "che abbiamo montato"] and scatti: SCATTI_HARDWARE */}
     ```
- `src/components/Album.tsx` (lines 3, 186-224) delegates directly to `HorizontalPinAlbum`:
  ```tsx
  export default function Album({
    titolo = ["Qualche macchina", "che abbiamo montato"],
    scatti = SCATTI_HARDWARE,
  }: Props) {
    return (
      <>
        <HorizontalPinAlbum titolo={titolo} scatti={scatti} />
        <noscript>...</noscript>
      </>
    );
  }
  ```

### 1.2 GSAP / ScrollTrigger vs. Actual Implementation
- **GSAP and ScrollTrigger are NOT used**: Neither package exists in `package.json` (`next: 16.2.10`, `react: 19.2.4`, `three: ^0.187.0`, `@emailjs/browser: ^4.4.1`, `tailwindcss: ^4`).
- Pinned horizontal scrolling is entirely custom-built in `src/components/HorizontalPinAlbum.tsx` (lines 35-510) and `src/app/globals.css` (lines 1840-2715):
  1. **Pinning mechanism**: CSS `position: sticky` on `.alb-pin-viewport` inside `.alb-pin-track`:
     - Desktop CSS:
       ```css
       .alb-pin-track {
         position: relative;
         width: 100%;
         height: 380vh;
         z-index: 32;
         outline: none;
       }
       .alb-pin-viewport {
         position: sticky;
         top: 0;
         left: 0;
         width: 100%;
         height: 100vh;
         height: 100dvh;
         overflow: hidden;
         display: flex;
         flex-direction: column;
         justify-content: space-between;
         background: transparent;
       }
       ```
     - Current Mobile CSS (`globals.css` line 2666-2679):
       ```css
       @media (max-width: 860px) {
         .alb-pin-track {
           height: 320vh;
         }
         ...
         .alb-card {
           width: clamp(290px, 86vw, 480px);
           height: clamp(400px, 64vh, 560px);
         }
       }
       ```
  2. **Scroll synchronization (`HorizontalPinAlbum.tsx`)**:
     - `onScroll` callback (lines 227-247): Computes normalized scroll progress within track:
       `rawP = -rect.top / (trackHeight - window.innerHeight);`
       `clampedP = Math.max(0, Math.min(1, rawP));`
       `animStateRef.current.targetX = clampedP * metricsRef.current.maxScrollX;`
     - Hardware-accelerated RAF loop (lines 150-224): Lerps `currentX` toward `targetX` with factor `0.18` (or `1` for `prefersReducedMotion`), applying:
       `stripRef.current.style.transform = "translate3d(-" + state.currentX + "px, 0, 0)";`
     - Multi-layer parallax: Moves watermark numerals (`clampedDist * -32px`) and device media wrappers (`clampedDist * 18px`).
     - Progress scrubber dock: Scales `.alb-dock-rail-fill` via `scaleX(safeP)`.
     - Pointer gesture hijacking (lines 365-426): `handlePointerDown`, `handlePointerMove`, and `handlePointerUp` intercept touch/drag and call `window.scrollBy({ top: -stepX * ratio })`.
     - Wheel interceptor (lines 281-313): Captures two-finger trackpad horizontal delta and converts to `window.scrollBy({ top: e.deltaX * ratio })`.

### 1.3 Project Data Model
`src/components/Album.tsx` (lines 5-18) defines:
```ts
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
```
- Datasets:
  - `SCATTI_DIGITAL` (lines 103-184): 4 entries:
    1. "Studio Fisioterapico · Sito & Prenotazioni" (Studio FisioMed Asti, Piattaforma Web & Prenotazioni Rapide, 2024)
    2. "Dueby · App Mobile Android & iOS" (Dueby Document Tracker, Applicazione Nativa Cross-Platform, 2024)
    3. "Demo Ristorante · Menù & Tavoli" (Osteria Contemporanea Astigiana, Web App Interattiva & QR Experience, 2024)
    4. "Demo Estetica · Listino & Appuntamenti" (Atelier Benessere & Beauty Lounge, Agenda Digitale & Listino Trattamenti, 2024)
  - `SCATTI_HARDWARE` (lines 20-101): 4 entries:
    1. "Per Marco, che ci gioca" (Marco V. · Sim Racing & Competitivo, PC Gaming Estremo)
    2. "Per uno studio di montaggio" (Atelier Audiovisivo Astigiano, Workstation Video 6K)
    3. "Il primo computer di Sara" (Sara M. · Ingegneria & CAD, Desktop da Studio & Calcolo Tecnico)
    4. "Rimesso a nuovo, non ricomprato" (Studio Commercialista Locale, Rigenerazione Termica & Clone NVMe)
- In both datasets, `src: null`. Visual preview is currently generated dynamically via JSX device frames:
  - Digital: `.alb-preview-device--digital` (macOS traffic lights, SSL lock, URL `sycomo.it/portfolio/...`, LIVE badge, mini hero art canvas, primary metric badge).
  - Hardware: `.alb-preview-device--hardware` (blueprint styling, telemetry gauge, 24h stress test badge, specs board).
- Currently, **there is NO modal or detail view component** anywhere in `src/`. Cards in `HorizontalPinAlbum.tsx` do not have an `onClick` handler; they only display visual previews.

### 1.4 Observed Mobile UX Deficiencies on Viewports < 860px
1. **Vertical Pinning Trap**: On mobile devices, `.alb-pin-track` remains `320vh` tall. When users scroll vertically, the page view stays pinned (`position: sticky`) for 3.2 viewport heights while the carousel slides sideways. This contradicts natural thumb scrolling.
2. **Gesture Fighting**: `onPointerMove` intercepts horizontal gestures to trigger `window.scrollBy`, which conflicts with native mobile momentum scrolling and pinch-to-zoom.
3. **Card Content Truncation**: At `< 920px`, CSS forces `.alb-card-body { overflow-y: auto; }` and hides several sub-elements (`.alb-preview-mini-subtitle`, `.alb-hw-specs-board`, `.alb-pin-hint`), creating nested scroll containers inside an already pinned container.
4. **Dock Cramping**: The horizontal dock scrubber (`.alb-pin-dock`) wraps or clips on screens under 400px.

---

## 2. Logic Chain

```
[Observation: alb-pin-track is 320vh on < 860px with sticky 100vh viewport]
                         │
                         ▼
[Step 1: On touchscreens, users scroll vertically with thumb swipes expecting continuous document flow]
                         │
                         ▼
[Step 2: Pinned carousel converts vertical scroll into horizontal translation, trapping mobile users]
                         │
                         ▼
[Step 3: Requirement R2 mandates replacing horizontal pinned carousel on < 860px with a vertical list of rectangular cards]
                         │
                         ▼
[Observation: Each Scatto has rich metadata (title, category, client, description, metrics, specs) and dynamic JSX preview chassis]
                         │
                         ▼
[Step 4: Design mobile cards with image/mockup on left (width ~105-120px) and project details on right (title, kicker, 2-line clamped description, metric pill, tap hint)]
                         │
                         ▼
[Observation: No modal or detail view currently exists in Sycomo codebase]
                         │
                         ▼
[Step 5: Fulfill R2 acceptance criteria ("Tapping a card opens the existing project details, link, or modal") by introducing an accessible Liquid-Glass Project Detail Modal / Bottom Sheet]
                         │
                         ▼
[Observation: Requirement R3 mandates preserving desktop full-screen pinned carousel on >= 860px without layout breakage or orphaned containers]
                         │
                         ▼
[Step 6: Implement dual responsive switching with CSS media queries controlling visibility and JS guard in HorizontalPinAlbum controlling RAF/scroll listeners]
```

### Detailed Design for Proposed Implementation

#### 2.1 Responsive Architecture (< 860px vs >= 860px)
To guarantee zero hydration mismatch, zero layout shift (CLS = 0), and clean lifecycle handling:
- **CSS Breakpoint Separation**:
  ```css
  /* Desktop Carousel: Visible only on >= 860px */
  @media (max-width: 859.98px) {
    .alb-desktop-view {
      display: none !important;
    }
  }
  /* Mobile Vertical Cards: Visible only on < 860px */
  @media (min-width: 860px) {
    .alb-mobile-view {
      display: none !important;
    }
  }
  ```
- **JS Lifecycle Guard in `HorizontalPinAlbum.tsx`**:
  - Add an active breakpoint guard (`const isDesktop = typeof window !== "undefined" && window.innerWidth >= 860`).
  - When viewport `< 860px`:
    - Do not register or execute `onScroll` RAF loops.
    - Do not attach pointer capture or trackpad wheel listeners.
    - Cancel any existing `rafId`.
  - Add a `window.matchMedia("(min-width: 860px)")` event listener:
    - On crossing from mobile to desktop: immediately trigger `updateMetrics()` and `onScroll()`.
    - On crossing from desktop to mobile: reset `stripRef.current.style.transform = ""`, stop RAF, and clear pointer state.
  - This eliminates orphaned pinned containers, eliminates CPU waste on mobile, and prevents stale metric calculations.

#### 2.2 Mobile Card Layout Architecture (R2)
- **Container**: `<section className="alb-mobile-view alb-m-section" aria-label="Galleria progetti">`
  - Normal document flow (NO sticky viewport, NO 320vh height).
  - Clean vertical stack with `padding: clamp(28px, 6vw, 44px) clamp(16px, 4vw, 24px);`.
- **Header**:
  - Eyebrow tag: `ARCHIVIO DIGITALE · SYCOMO STUDIO` (or `OFFICINA HARDWARE · SYCOMO LAB`).
  - Section title: `titolo[0]` <br /> `titolo[1]` with brand red square dot `.alb-dot`.
  - Project counter pill: `4 PROGETTI SELEZIONATI`.
- **Card Anatomy (`.alb-m-card`)**:
  - Semantic `<article>` or `<div role="button" tabIndex={0}>` with tap target feedback (`:active { transform: scale(0.985); }`).
  - Layout: `display: flex; flex-direction: row; align-items: stretch; gap: 14px; min-height: 130px;`.
  - Card style: Liquid-Glass paper card:
    - `background: linear-gradient(135deg, rgba(255, 254, 251, 0.94) 0%, rgba(247, 244, 237, 0.88) 100%)`
    - `backdrop-filter: blur(20px)`
    - `border: 1px solid color-mix(in srgb, var(--lift) 85%, var(--hair))`
    - `border-radius: 18px`
    - `box-shadow: 0 4px 18px -4px rgba(32, 32, 28, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.95)`
  - **Left Column: Thumbnail Preview (~105px - 118px fixed width)**:
    - If `s.src`: Render optimized image thumbnail.
    - If `s.src === null`: Render miniature liquid-glass preview chassis:
      - *Digital*: Mini dark browser bar with 3 color dots (red/yellow/green), URL pill, canvas with category pill, title monogram, and red primary metric chip (`< 0.4s` or `60 FPS`).
      - *Hardware*: Mini dark telemetry chassis with "HW LAB" header, live collaudo badge, telemetry gauge (`64°C` or `32 TB`), and grid pattern.
  - **Right Column: Project Details (flex: 1)**:
    - Top kicker: Category & Client badge (`font-size: 10px`, uppercase, bold, letter-spaced, `var(--muted)`).
    - Title: `s.didascalia` (`font-size: 15.5px`, `font-weight: 700`, line-height 1.25, `var(--ink)`).
    - Description: `s.descrizione || s.alt` (`font-size: 12px`, line-height 1.4, `var(--ink-soft)`, CSS `-webkit-line-clamp: 2`).
    - Footer row:
      - Primary metric chip: `s.metriche[0]` (`font-family: var(--font-mono)`, 10.5px, subtle border).
      - Tap affordance: `Dettagli →` or subtle red chevron.

#### 2.3 Detail Modal / Bottom Sheet Component
- When a card is tapped, open `ProjectDetailModal`:
  - On mobile (< 860px): Smooth bottom sheet sliding up from bottom (`max-height: 88dvh`, `border-radius: 24px 24px 0 0`, drag handle bar on top).
  - On desktop (>= 860px): Centered liquid-glass dialog (`max-width: 640px`, `border-radius: 28px`).
  - Accessibility & UX:
    - `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`.
    - Focus trap and initial focus on close button.
    - Keyboard `Escape` closes modal.
    - Backdrop blur click closes modal.
    - Body scroll locking (`document.body.style.overflow = "hidden"` while modal is open, cleaned up on close and unmount).
  - Content display:
    1. Header with category badge, client, status (`ONLINE DAL VIVO`), and close button (touch target >= 44x44px).
    2. Full project title and complete multi-paragraph description.
    3. Expanded preview chassis / mockup.
    4. Sycomo role kicker (`s.ruolo`).
    5. Key metrics grid (all entries from `s.metriche` with diamond bullet).
    6. Technical specifications chips (all entries from `s.specifiche`).
    7. Direct action button: "Contattaci per questo progetto" (smooth scrolls to `#contatti` with prefill).

---

## 3. Caveats

1. **Dual DOM SSR vs. Bundle Footprint**:
   - Rendering both the desktop horizontal carousel and the mobile vertical list in the DOM adds ~15KB of markup per album instance (4 cards each). In Next.js SSR, this negligible payload is well worth the guarantee of zero hydration mismatch, instantaneous first paint (FCP), and zero CLS.
2. **Dynamic Viewport Resize during Transition**:
   - When a user resizes a desktop browser down past 860px while scrolled midway through the 380vh track, the total document height decreases abruptly. The JS listener must ensure the scroll position is clamped gracefully so the user does not land in an unexpected position.
3. **Image Assets (`src: null`)**:
   - Currently, both `SCATTI_DIGITAL` and `SCATTI_HARDWARE` have `src: null` and rely on CSS/SVG mockups. The mobile thumbnail implementation must handle both `src: null` (rendering the miniature preview chassis) and `src: string` (rendering an `<img>` or `<Image>`) seamlessly for future image assets.

---

## 4. Conclusion

1. **Architecture & Feasibility**:
   - The current horizontal pinned carousel is an in-house React/CSS sticky RAF implementation with zero external GSAP dependencies.
   - The cleanest, most resilient way to satisfy R2 and R3 is a **dual-view component architecture managed in `src/components/Album.tsx`**:
     - Desktop view (`.alb-desktop-view`): Retains `HorizontalPinAlbum.tsx` with its full-screen pinned 380vh track, multi-layer parallax, 3D tilt, and dock scrubber, guarded to only run RAF/listeners on `>= 860px`.
     - Mobile view (`.alb-mobile-view`): Introduces `MobileVerticalAlbum` rendering a natural document-flow vertical card list (image/mockup on left, details on right) optimized for thumb scrolling.
     - Modal integration: Introduces `ProjectDetailModal` (bottom sheet on mobile, centered dialog on desktop) triggered when any card is tapped.
2. **Performance & UX Guarantees**:
   - Zero sticky pinning, zero scroll trapping, and zero pointer hijacking on viewports `< 860px`.
   - Zero hydration mismatch between Next.js SSR and client.
   - Full preservation of desktop Awwwards-tier horizontal experience on `>= 860px`.

---

## 5. Verification Method

To independently verify this survey and future implementation:
1. **TypeScript & Lint Verification**:
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
2. **Production Build Verification**:
   ```bash
   npm run build
   ```
3. **DOM & Viewport Inspection**:
   - Inspect `http://localhost:3000/` and `http://localhost:3000/pc-su-misura` at viewports:
     - 375px (iPhone SE): Verify vertical card stack with left thumbnail / right details, natural scrolling, and modal opening on card tap.
     - 390px (iPhone 14/15) & 412px (Pixel): Verify thumb scroll comfort, zero horizontal overflow, and bottom-sheet modal dismiss.
     - 859px vs 860px boundary: Verify instantaneous transition with zero layout trapping or orphaned pinned containers.
     - 1280px+ (Desktop): Verify horizontal pinned carousel functions identically to current baseline.
