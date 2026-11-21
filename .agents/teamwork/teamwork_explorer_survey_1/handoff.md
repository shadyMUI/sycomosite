# Investigation Report: Codebase Architecture, Hero/Title Implementation & Mobile Scroll Diagnosis

**Agent**: `teamwork_explorer_survey_1`  
**Date**: 2026-11-10  
**Target Path**: `/home/shadymui/sycomosite/.agents/teamwork/teamwork_explorer_survey_1/handoff.md`  
**Mission**: Codebase Architecture & Hero/Title Survey for Sycomo Production Website  

---

## 1. Observation

### 1.1 Tech Stack & Dependencies (`package.json`)
Direct observation from `/home/shadymui/sycomosite/package.json` (lines 11–32):
- **Next.js**: `16.2.10` (App Router architecture with Turbopack).
- **React**: `19.2.4` & `react-dom: 19.2.4`.
- **Styling**: `tailwindcss: ^4` with `@tailwindcss/postcss: ^4`.
- **3D / Graphics**: `three: ^0.187.0` and `@types/three: ^0.187.0`.
- **Contact / Email**: `@emailjs/browser: ^4.4.1`.
- **Animation Frameworks**: **Neither GSAP, Framer Motion, nor Lenis are installed**. All animations are achieved via CSS native animations, `@property` registered variables, and custom RAF (requestAnimationFrame) loops.
- **Build Verification**: `npm run build` succeeds cleanly in ~2 seconds (9/9 static pages generated via Turbopack with zero TypeScript or lint errors).

### 1.2 Layout & Hero/Title Implementation
In `src/app/page.tsx` (lines 45–69) and `src/app/pc-su-misura/page.tsx` (lines 83–107):
```tsx
<ScrollDirector />

{/* barra di vetro: si accende mentre il logo ci vola dentro */}
<div className="site-header" aria-hidden="true" />

{/* Scene fisse: restano dietro e vengono coperte dal contenuto che
    scorre sopra di loro. */}
<HeroArt />
<Logo className="logo-fly" />
<SottoLogo />

{/* Dà all'apertura lo spazio per esistere a tutta schermata: a riposo
    il marchio è pulito al centro; al primo gesto vola nella barra
    mentre il testo introduttivo sale come naturale continuazione
    fisica della pagina. */}
<div className="scroll-track" aria-hidden="true">
  <div
    className="scroll-section"
    data-label="apertura"
  />
</div>

<main>
  <CheComputer
    titolo="siti e app costruiti da zero"
    casi={["siti web", "app mobile", "social"]}
    chiusura=" — scritti su misura, "
    accento="senza modelli riciclati"
  />
...
```

### 1.3 Hero CSS Mechanics & Variable `--p`
In `src/app/globals.css`:
- **Registration of `--p`** (lines 259–268):
  ```css
  @property --p {
    syntax: "<number>";
    inherits: true;
    initial-value: 0;
  }
  :root {
    --p: 0;
    /* Il volo del logo: morbido ed elegante, non a scatti */
    transition: --p 0.95s cubic-bezier(0.22, 1, 0.36, 1);
  }
  ```
- **Logo Positioning & Sizing** (lines 323–333):
  ```css
  .logo-fly {
    position: fixed;
    left: 0;
    top: calc((1 - var(--p)) * 50vh + var(--p) * 12px);
    translate: 0 calc(-50% * (1 - var(--p)));
    margin-left: calc(
      (1 - var(--p)) * 8vw + var(--p) * 22px
    );
    font-size: calc((1 - var(--p)) * clamp(84px, 19vw, 300px) + var(--p) * 30px);
    z-index: 50;
  }
  ```
  - When `--p = 0`: Logo sits fixed at vertical center (`top: 50vh; translate: 0 -50%`) with monumental font size (`clamp(84px, 19vw, 300px)`).
  - When `--p = 1`: Logo is docked in the top-left header bar (`top: 12px; margin-left: 22px; font-size: 30px`).
- **Glass Header Bar** (lines 301–313):
  ```css
  .site-header {
    position: fixed;
    inset: 0 0 auto 0;
    height: 64px;
    z-index: 40;
    background: color-mix(in srgb, var(--paper) 60%, transparent);
    -webkit-backdrop-filter: blur(20px) saturate(1.6);
    backdrop-filter: blur(20px) saturate(1.6);
    border-bottom: 1px solid color-mix(in srgb, var(--hair) 65%, transparent);
    opacity: var(--p);
    pointer-events: none;
  }
  ```
- **Action Buttons (`.sotto-logo`)** (lines 343–368, 483–494):
  ```css
  @media (max-width: 860px) {
    .sotto-logo:not(.sotto-logo--barra) {
      left: calc((1 - var(--p)) * 7vw + var(--p) * (100vw - 14px));
      top: calc((1 - var(--p)) * (50vh + clamp(104px, 28vw, 200px)) + var(--p) * 32px);
      --gap-x: 14px;
      --gap-y: 8px;
    }
  }
  ```
- **Opening Spacer Track** (lines 271–296):
  ```css
  .scroll-track {
    position: relative;
    z-index: 0;
    pointer-events: none;
    opacity: 0.4;
  }
  .scroll-section[data-label="apertura"] {
    height: 100vh;
    height: 100svh;
  }
  ```
- **Introductory Text (`CheComputer` / `.uso`)** (lines 1458–1466, 1523–1528):
  ```css
  .uso {
    position: relative;
    z-index: 32;
    min-height: 100vh;
    display: grid;
    align-content: center;
    padding: clamp(70px, 10vh, 130px) 6vw clamp(56px, 8vh, 110px);
  }
  @media (max-width: 860px) {
    .uso {
      min-height: 70vh;
      align-content: start;
      padding: clamp(74px, 10vh, 90px) 7vw clamp(36px, 5vh, 60px);
    }
  }
  ```

### 1.4 Current Scroll Trigger Implementation (`ScrollDirector.tsx`)
In `src/components/ScrollDirector.tsx` (lines 12–74):
```ts
const APRE = 10;
const CHIUDE = 4;

export default function ScrollDirector() {
  useEffect(() => {
    const root = document.documentElement;
    let aperto = false;
    let inCoda = false;

    const applica = () => {
      inCoda = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      if (!vh) return;

      if (y > APRE) {
        if (!aperto) {
          aperto = true;
          root.style.setProperty("--p", "1");
          root.classList.add("figs-on");
        }
      } else if (y <= CHIUDE) {
        if (
          aperto ||
          root.classList.contains("figs-on") ||
          root.style.getPropertyValue("--p") === "1"
        ) {
          aperto = false;
          root.style.setProperty("--p", "0");
          root.classList.remove("figs-on");
        }
      }
    };

    const resetImmediato = () => {
      aperto = false;
      root.style.setProperty("transition", "none");
      root.style.setProperty("--p", "0");
      root.classList.remove("figs-on");
      void root.offsetHeight;
      root.style.removeProperty("transition");
    };

    if (window.scrollY <= CHIUDE) {
      resetImmediato();
    } else {
      applica();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      resetImmediato();
    };
  }, []);

  return null;
}
```

### 1.5 Initial Curtain Component (`IntroCurtain.tsx`)
In `src/components/IntroCurtain.tsx` and `globals.css`:
- Fixed liquid red curtain drops from top to bottom.
- Sheet animation: `intro-fall 1.15s cubic-bezier(0.5, 0.15, 0.78, 0.72) 0.22s both`.
- Curtain container: `animation: intro-done 0s linear 1.4s forwards` (`display: none; visibility: hidden`).
- When `prefers-reduced-motion: reduce`: curtain is immediately `display: none`.

---

## 2. Logic Chain

### 2.1 Why the Title Gets Stuck and Scrolling Feels Blocked on Mobile

1. **No Autonomous Entrance on Load (Observation 1.3 & 1.4)**:
   - On page load, `window.scrollY === 0`.
   - `ScrollDirector` initializes `--p = 0`.
   - The logo remains completely stationary in the center of the screen at huge font size (`19vw`), with the glass header invisible (`opacity: 0`).
   - The website relies entirely on user scroll input (`y > APRE = 10px`) to trigger any movement.
   - Without an automatic animation or visual affordance, users on mobile devices see a static splash-like screen and perceive the interface as frozen.

2. **The 100vh Spacer Dead Zone (Observation 1.2 & 1.3)**:
   - In `page.tsx`, `<CheComputer>` (the introductory text) is placed after `.scroll-track`, where `.scroll-section[data-label="apertura"]` has `height: 100vh; height: 100svh;`.
   - Even if a mobile user scrolls 10px, the logo flies to the header, but the page scroll position is only at `10px` out of an empty `100vh` container (~600–840px tall on typical phones).
   - The entire viewport below the 64px header remains completely blank white/paper space while traversing the 100vh spacer.
   - To the user, scrolling appears to have no effect or to be stuck because no readable content appears for an entire full-screen scroll gesture.

3. **Elastic Rubber-Banding and Aggressive Reset (Observation 1.4)**:
   - On mobile browsers (Safari iOS and Chrome on Android), vertical swiping near the top triggers rubber-band overscroll, where `scrollY` rebounds into `<= 0` or oscillating `<= 4px` (`CHIUDE = 4`).
   - In `ScrollDirector.tsx`, whenever `y <= CHIUDE`, `resetImmediato()` executes:
     `root.style.setProperty("transition", "none");`
     `root.style.setProperty("--p", "0");`
     `root.classList.remove("figs-on");`
     `void root.offsetHeight;`
     `root.style.removeProperty("transition");`
   - This forcefully clears CSS transitions and snaps `--p` back to `0`, popping the giant logo back to the center of the screen, covering the screen and reversing any forward progress the user made.

4. **Suppression of Mobile Scrollbars (Observation 1.3)**:
   - `globals.css` applies `scrollbar-width: none` and `::-webkit-scrollbar { display: none; }` under `@media (pointer: coarse), (max-width: 860px)`.
   - This eliminates visual scroll cues on mobile, leaving the user with zero visual confirmation that the page extends vertically.

5. **Layering & Touch Capture (Observation 1.3)**:
   - `.logo-fly` has `z-index: 50` and is centered over the screen, but lacks `pointer-events: none`. While text elements generally pass touch through, on touch devices with fast gestures, touching the centered lockup or `.sotto-logo` (`<a href="whatsapp">` / `<a href="#contatti">`) risks triggering link tap states or stalling touch dragging.

6. **Downstream Pinning Conflict (Observation 1.1 & Album investigation)**:
   - Further down the page, `HorizontalPinAlbum` locks vertical scroll using `position: sticky; top: 0; height: 320vh` to scrub horizontal cards. On mobile touch viewports (< 860px), this causes severe touch trapping, compounding the sense that the site is hard or impossible to scroll naturally.

---

### 2.2 Architecture for Automatic Intro Entrance Animation (Desktop & Mobile)

To satisfy Requirement R1 without breaking existing design tokens or introducing heavy third-party libraries:

1. **Leverage Native `@property --p` CSS Interpolation**:
   - The CSS codebase is already perfectly architected around `--p` (ranging from 0 to 1) with `transition: --p 0.95s cubic-bezier(0.22, 1, 0.36, 1);`.
   - When `--p` is set to `1` on `document.documentElement`:
     - `.logo-fly` automatically transitions from center to top-left (`top: 12px; margin-left: 22px; font-size: 30px`).
     - `.site-header` smoothly fades in (`opacity: 1`).
     - `.sotto-logo` smoothly slides into its header position (or mobile corner pill).
     - `.hero-art .massa` glides into place.
     - `.figs-on` starts subtle background plate breathing.

2. **Timing with `IntroCurtain`**:
   - `IntroCurtain` falls from `t = 0.22s` to `t = 1.37s`.
   - By `t = 1.1s - 1.3s` (or when the curtain leaves the screen), the automatic intro entrance triggers.
   - For users with `prefers-reduced-motion: reduce`:
     - `IntroCurtain` is already hidden.
     - The entrance completes instantly (`t = 0`), immediately setting `--p = 1`.

3. **Eliminating the 100vh Spacer & Positioning Introductory Text in the Hero Viewport**:
   - The `.scroll-track` / `.scroll-section[data-label="apertura"]` 100vh spacer should be collapsed or eliminated.
   - `<CheComputer>` (`.uso`) becomes the immediate content of the hero section:
     - On desktop: positioned with `padding-top: clamp(80px, 12vh, 120px)` and optimal hero min-height (`min-height: 85vh` or `calc(100vh - 64px)`).
     - On mobile (< 860px): positioned with `padding-top: clamp(80px, 12vh, 100px); min-height: auto; margin-bottom: 40px;`.
   - As `--p` animates from 0 to 1, `<CheComputer>` smoothly fades and glides into view (e.g. `opacity: 0 -> 1; translateY: 24px -> 0px;`).
   - Result: As the intro animation finishes, the logo is docked in the header, and the introductory headline ("siti e app costruiti da zero...") is immediately visible above the fold without any user scroll intervention!

4. **Permanent Navbar State & Eliminating the Top-Scroll Reset Trap**:
   - In `ScrollDirector.tsx`, remove the logic that resets `--p` to `0` when `scrollY <= 4`.
   - Once the intro animation has completed (or once `--p = 1` is applied), the header remains in header mode.
   - Scrolling back to the top leaves the logo docked in the header and the introductory text visible, behaving like a standard premium website.
   - Page scrolling becomes immediately functional and responsive from the moment the entrance animation completes.

---

## 3. Caveats

1. **No External Animation Libraries**: The project currently relies strictly on CSS variables and native CSS transitions. Introducing Framer Motion or GSAP is unnecessary, would bloat bundle size, and could introduce hydration mismatches with Next.js 16 / React 19.
2. **Reduced Motion Compliance**: Users with `prefers-reduced-motion: reduce` must not experience timed delays; `--p` should immediately be set to `1` on mount.
3. **Dual Page Consistency**: Both `src/app/page.tsx` (Digital studio) and `src/app/pc-su-misura/page.tsx` (Hardware lab) share the same hero structure and must receive identical intro entrance treatment.
4. **Mobile Portfolio Scope (R2 & R3)**: While this report focuses primarily on the Hero & Title architecture (R1), the portfolio section (`HorizontalPinAlbum.tsx`) must be refactored separately to render a clean vertical list of cards on viewports < 860px, as requested in R2.

---

## 4. Conclusion

- **The primary failure mode on mobile** is caused by the combination of:
  1. A purely scroll-dependent trigger (`window.scrollY > 10px`) to initiate logo flight.
  2. A 100vh empty spacer track (`.scroll-section[data-label="apertura"]`) that separates the header from the introductory text, creating an empty dead zone.
  3. `ScrollDirector.tsx`'s `resetImmediato()`, which forcefully resets `--p: 0` and wipes transitions whenever mobile elastic overscroll / rubber-banding dips to `y <= 4px`.
- **The recommended architectural solution**:
  1. Trigger an automatic entrance animation on page load (timed after `IntroCurtain` at ~1.1s–1.3s, or immediately for reduced motion).
  2. Transition `--p` from 0 to 1, utilizing the existing `@property --p` CSS cubic-bezier transition.
  3. Remove the 100vh `.scroll-track` spacer so `<CheComputer>` is positioned directly in the hero viewport below the header, revealing with a smooth fade/slide as the logo docks into the header.
  4. Remove the `y <= CHIUDE` reset in `ScrollDirector.tsx` so the header navbar remains stable and persistent, enabling immediate, natural vertical scrolling.

---

## 5. Verification Method

To independently verify these findings and future fixes:

1. **Build & Typecheck**:
   ```bash
   npm run build
   ```
   Must succeed with zero errors on Turbopack and TypeScript.

2. **Inspection of Hero & Navbar Behavior on Mobile**:
   - Open Chrome DevTools in device emulation mode (e.g. iPhone 14 Pro, 393x852, DPR 3).
   - Navigate to `/` and `/pc-su-misura`.
   - Verify:
     - On initial page load without any scroll touch, the entrance animation plays automatically.
     - Logo smoothly glides to top-left (`64px` header).
     - Introductory text is clearly visible in the hero viewport below the header bar.
     - Swiping vertically begins scrolling through `<main>` immediately with zero dead space or sticky resistance.
     - Pulling down at the top of the page (rubber-band) does NOT reset the logo back to the center of the screen.

3. **Inspection on Desktop Viewports (>= 860px, e.g. 1440x900)**:
   - Verify entrance animation runs smoothly.
   - Logo docks cleanly into the header bar.
   - Mouse wheel scrolling operates smoothly without jitter or layout jumps.
