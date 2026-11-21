# Handoff Report: Milestone 1 — Hero & Title Entrance Polish

**Agent**: `teamwork_worker_m1`  
**Date**: 2026-11-10  
**Working Directory**: `/home/shadymui/sycomosite/.agents/teamwork/teamwork_worker_m1/`  
**Milestone**: Milestone 1 (R1 — Hero & Title Entrance Animation, Dead Zone Elimination, Mobile Bounce Fix, Reduced Motion Support)  

---

## 1. Observation

Direct observations from the codebase and build tools:

1. **Initial State of `ScrollDirector.tsx`**:
   - `ScrollDirector` previously initialized with `aperto = false` and required `window.scrollY > 10` to set `--p = 1` and `figs-on`.
   - On page load (`scrollY === 0`), `resetImmediato()` was called, stripping CSS transitions (`root.style.setProperty("transition", "none")`) and setting `--p = 0`.
   - If user scroll position bounced into `y <= 4` (elastic rubber-band overscroll on iOS Safari or Android Chrome), `ScrollDirector` forcefully reset `--p = 0`, popping the centered monumental logo back to `top: 50vh`, obscuring the page.
   - There was zero automatic entrance on page load and no support for `prefers-reduced-motion`.

2. **The 100vh Apertura Spacer Track**:
   - In `src/app/page.tsx` (lines 60–65) and `src/app/pc-su-misura/page.tsx` (lines 98–103), an empty `.scroll-track` container containing `<div className="scroll-section" data-label="apertura" />` was placed directly between the fixed hero elements and `<main>`.
   - In `src/app/globals.css` (lines 283–295), `.scroll-section[data-label="apertura"]` was styled with `height: 100vh; height: 100svh;`.
   - Because of this spacer, users who started scrolling had to scroll an entire full-screen empty height before `<CheComputer>` (introductory text) became visible.

3. **CSS Mechanics of `--p` and Hero Elements (`src/app/globals.css`)**:
   - `--p` is registered as `<number>` via `@property` with `transition: --p 0.95s cubic-bezier(0.22, 1, 0.36, 1);`.
   - `.site-header` is fixed at `height: 64px` with `opacity: var(--p)`.
   - `.logo-fly` uses `top: calc((1 - var(--p)) * 50vh + var(--p) * 12px)`, `margin-left: calc((1 - var(--p)) * 8vw + var(--p) * 22px)`, and `font-size: calc((1 - var(--p)) * clamp(84px, 19vw, 300px) + var(--p) * 30px)`.
   - `.logo-fly` previously lacked `pointer-events: none;`, which risked intercepting touch gestures over the center of the mobile screen.
   - `.uso` (`<CheComputer>`) previously had `min-height: 100vh; padding: clamp(70px, 10vh, 130px) 6vw clamp(56px, 8vh, 110px);` without dynamic reveal tied to `--p`.

4. **Curtain Coordination (`IntroCurtain.tsx`)**:
   - `IntroCurtain` in `src/app/globals.css` drops downward with `animation: intro-fall 1.15s cubic-bezier(0.5, 0.15, 0.78, 0.72) 0.22s both;`.
   - By `t = 350ms - 400ms`, the upper viewport is cleared, and at `1.4s` the curtain is removed with `display: none; visibility: hidden;`.
   - Under `prefers-reduced-motion: reduce`, `.intro` is immediately `display: none;`.

---

## 2. Logic Chain

1. **Autonomous Entrance Sequence**:
   - By scheduling `apri(false)` in `ScrollDirector.tsx` at `DELAY_INGRESSO_MS = 350ms` (coordinating with `IntroCurtain`'s drop at 220ms), `--p` smoothly transitions from 0 to 1 over 0.95s on initial page load for both desktop and mobile without requiring any user scroll intervention.
   - If the user interacts earlier (`scroll`, `wheel`, `touchstart`, `pointerdown`, `keydown`), `onInterazione` immediately cancels the timer and executes `apri(false)`, honoring user intent with zero lag.
   - If the user reloads a page already scrolled down (`window.scrollY > 10`), `apri(true)` executes instantly with `transition: none`, preventing awkward replay.
   - If client-side navigation between pages occurs, existing `figs-on` / `--p === "1"` is preserved.

2. **Fixing the Stuck Title & Rubber-Band Bounce Defect**:
   - The aggressive reset block (`else if (y <= CHIUDE) { ... --p: 0 }`) was eliminated from `ScrollDirector.tsx`. Once `aperto = true`, `--p` remains `1` persistently throughout the user's session.
   - When a mobile user reaches the top or triggers rubber-band overscroll (`y <= 4` or oscillating bounce), the title remains docked in the header at `top: 12px; font-size: 30px; margin-left: 22px` with `.site-header` fully illuminated.
   - Adding `pointer-events: none;` to `.logo-fly` ensures touch gestures seamlessly pass through to the document flow.
   - Page scrolling is now immediate, unblocked, and completely natural from the very first frame.

3. **Eliminating the 100vh Dead Zone & Revealing Introductory Text**:
   - The empty 100vh `.scroll-track` container was removed from `src/app/page.tsx` and `src/app/pc-su-misura/page.tsx`.
   - In `src/app/globals.css`, `.scroll-track` and `.scroll-section[data-label="apertura"]` were collapsed with `display: none !important; height: 0 !important; min-height: 0 !important;`.
   - In `src/app/globals.css`, `.uso` (`<CheComputer>`) was integrated directly into the `--p` reveal mechanics:
     ```css
     .uso {
       position: relative;
       z-index: 32;
       min-height: calc(100vh - 64px);
       min-height: calc(100svh - 64px);
       display: grid;
       align-content: center;
       padding: clamp(84px, 12vh, 120px) 6vw clamp(56px, 8vh, 110px);
       opacity: var(--p);
       translate: 0 calc((1 - var(--p)) * 24px);
       transition:
         opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1),
         translate 0.95s cubic-bezier(0.22, 1, 0.36, 1);
     }
     @media (max-width: 860px) {
       .uso {
         min-height: auto;
         align-content: start;
         padding: clamp(84px, 12vh, 104px) 7vw clamp(36px, 5vh, 60px);
         margin-bottom: 24px;
       }
     }
     ```
   - On initial load at `--p = 0`, `.uso` is transparent. As `--p` transitions to 1, `.uso` smoothly fades in and glides upward 24px into place.
   - The top padding (`clamp(84px, 12vh, 104px)`) provides comfortable clearance (>20px) below the fixed 64px glass header bar, avoiding any clipping or awkward overlap.

4. **Instant Prefers-Reduced-Motion Support**:
   - In `src/components/ScrollDirector.tsx`:
     ```ts
     const mediaReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
     if (mediaReducedMotion.matches) {
       apri(true);
       return;
     }
     ```
   - In `src/app/globals.css`:
     ```css
     @media (prefers-reduced-motion: reduce) {
       .intro { display: none; }
       :root { --p: 1 !important; transition: none !important; }
       .site-header { opacity: 1 !important; transition: none !important; }
       .logo-fly { top: 12px !important; translate: 0 0 !important; margin-left: 22px !important; font-size: 30px !important; transition: none !important; }
       .uso { opacity: 1 !important; translate: none !important; transition: none !important; }
     }
     ```
   - When a user has reduced motion enabled, `--p = 1`, `.site-header` opacity is 1, the logo is docked, and `.uso` is visible immediately with zero animation delay and zero transition.

---

## 3. Caveats

1. **Portfolio Carousel Untouched**: In accordance with the write-ownership boundaries, `src/components/Album.tsx` and `src/components/HorizontalPinAlbum.tsx` were not modified. Those components are owned by Milestone 2.
2. **E2E Test Directory Untouched**: No files in `e2e/` were touched or edited. Verification used the read-only test runner.
3. **Browser `@property` Compatibility**: `@property` is supported across modern Evergreen browsers (Chrome/Edge 85+, Safari 16.4+, Firefox 128+). For any legacy environment lacking `@property`, explicit CSS transitions on `opacity` and `translate` ensure smooth progressive enhancement.

---

## 4. Conclusion

All objectives of Milestone 1 have been met:
- **Objective 1 (Auto Entrance)**: Entrance animation runs automatically without user scroll on both desktop and mobile, animating `.logo-fly` into the header (`top: 12px`, `font-size: 30px`) and revealing `.site-header` (`opacity: 1`).
- **Objective 2 (Dead Zone Elimination & Intro Placement)**: The empty 100vh `.scroll-track` container was removed, and `<CheComputer>` is revealed smoothly with `--p` and positioned cleanly below the header bar.
- **Objective 3 (Mobile Stuck Title & Rubber-Band Fix)**: Eliminating `y <= 4` resets and adding `pointer-events: none` on `.logo-fly` ensures natural, unblocked vertical scrolling without sticky resistance or title snapping.
- **Objective 4 (Prefers-Reduced-Motion)**: Instant resolution with zero delay in both CSS and JavaScript.
- **Objective 5 (Build & Lint)**: Clean build (`npm run build` exits 0 with 9/9 static routes generated) and clean lint (`npm run lint` exits 0 with 0 errors).
- **Automated Verification**: All 10 Feature 1 E2E tests (`e2e/runner.mjs --feature=F1`) pass with 100% success.

---

## 5. Verification Method

### 5.1 Build and Lint
```bash
npm run build && npm run lint
```
**Observed Result**:
- Next.js 16.2.10 (Turbopack) successfully compiled in 2.4s.
- TypeScript check passed in 3.0s with zero errors.
- 9/9 static pages generated.
- ESLint completed with exit code 0 (zero errors in workspace code).

### 5.2 Automated E2E Test Suite (Feature 1)
```bash
node e2e/runner.mjs --feature=F1
```
**Observed Result**:
```
================================================================
  SYCOMO E2E AUTOMATED TEST SUITE
  Selected: 10 of 40 tests
  Target:   http://localhost:3000
================================================================

[1/10] [T1:F1] F1-T1-01          Auto-Entrance: Page loads and entrance triggers ... ✔ PASS (1009ms)
[2/10] [T1:F1] F1-T1-02          Header Lockup: Logo moves from center into heade... ✔ PASS (1294ms)
[3/10] [T1:F1] F1-T1-03          Header Visibility: .site-header fades in to full... ✔ PASS (1414ms)
[4/10] [T1:F1] F1-T1-04          Intro Content Reveal: Introductory text section ... ✔ PASS (348ms)
[5/10] [T1:F1] F1-T1-05          Mobile Scroll Unblock: Immediate vertical scroll... ✔ PASS (2333ms)
[6/10] [T2:F1] F1-T2-01          Rapid Reload: Entrance state cleanly re-executes... ✔ PASS (1175ms)
[7/10] [T2:F1] F1-T2-02          Fast Scroll During Entrance: Rapid scroll down d... ✔ PASS (1710ms)
[8/10] [T2:F1] F1-T2-03          Overscroll Bounce: Pulling down to y=0 does not ... ✔ PASS (2793ms)
[9/10] [T2:F1] F1-T2-04          Compact Viewport Height: Title lockup fits prope... ✔ PASS (2257ms)
[10/10] [T2:F1] F1-T2-05         Reduced Motion Mode: Title entrance completes im... ✔ PASS (991ms)

================================================================
  E2E TEST EXECUTION SUMMARY
================================================================
  Total Executed: 10
  Passed:         10
  Failed:         0
  Total Duration: 15.32s
================================================================

All 10 tests passed successfully!
```
