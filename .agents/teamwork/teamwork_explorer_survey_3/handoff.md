# Investigation & Survey Report: Build, Responsive Breakpoints & E2E Testing Track

**Date**: 2026-11-10T17:21:00Z  
**Agent**: `teamwork_explorer_survey_3`  
**Working Directory**: `/home/shadymui/sycomosite/.agents/teamwork/teamwork_explorer_survey_3/`  
**Target Project**: Sycomo Website (`/home/shadymui/sycomosite`)  
**Scope**: Build Pipeline, Responsive Breakpoint Architecture (<860px vs >=860px), Mobile Viewports (375px, 390px, 412px), Desktop Viewports (>=1280px), and End-to-End Testing Track Design.

---

## 1. Observation

### 1.1 Package, Build Pipeline & Engine Configuration
- **`package.json` (`/home/shadymui/sycomosite/package.json`)**:
  - `name`: `"sycomosite"`, `version`: `"0.1.0"`
  - Core frameworks: `next: "16.2.10"`, `react: "19.2.4"`, `react-dom: "19.2.4"`
  - Styling: `tailwindcss: "^4"`, `@tailwindcss/postcss: "^4"`, `@tailwindcss/oxide-linux-x64-gnu: "^4.3.5"`
  - 3D & Graphics: `three: "^0.187.0"`, `@types/three: "^0.187.0"`
  - External services: `@emailjs/browser: "^4.4.1"`
  - Linting: `eslint: "^9"`, `eslint-config-next: "16.2.10"`
  - TypeScript: `typescript: "^5"`, `@types/node: "^20"`, `@types/react: "^19"`, `@types/react-dom: "^19"`
  - Scripts:
    ```json
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "eslint"
    }
    ```
- **`tsconfig.json` (`/home/shadymui/sycomosite/tsconfig.json`)**:
  - Target: `"ES2017"`, lib: `["dom", "dom.iterable", "esnext"]`
  - Strict mode enabled (`"strict": true`)
  - Module resolution: `"bundler"`, module: `"esnext"`
  - Path alias: `"@/*": ["./src/*"]`
  - Next.js TypeScript plugin configured under `plugins: [{ "name": "next" }]`
- **`next.config.ts` (`/home/shadymui/sycomosite/next.config.ts`)**:
  - Configures Turbopack root:
    ```typescript
    import type { NextConfig } from "next";

    const nextConfig: NextConfig = {
      turbopack: {
        root: __dirname,
      },
    };

    export default nextConfig;
    ```
- **`eslint.config.mjs` (`/home/shadymui/sycomosite/eslint.config.mjs`)**:
  - ESLint 9 Flat Config importing `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
  - Global ignores configured for `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.
- **Build Execution Verification (`npm run build`)**:
  - Command: `npm run build`
  - Result: Exit code 0, 100% static prerendering across all 7 routes:
    ```
    ▲ Next.js 16.2.10 (Turbopack)
    ✓ Compiled successfully in 1918ms
    ✓ Finished TypeScript in 2.6s 
    ✓ Collecting page data using 10 workers in 530ms 
    ✓ Generating static pages using 10 workers (9/9) in 573ms
    Route (app)
    ┌ ○ /
    ├ ○ /_not-found
    ├ ○ /opengraph-image
    ├ ○ /pc-su-misura
    ├ ○ /privacy
    ├ ○ /robots.txt
    └ ○ /sitemap.xml
    ```
- **Lint Execution Verification (`npm run lint`)**:
  - Command: `npm run lint` (`eslint`)
  - Result: Exit code 0, zero lint warnings or errors.
- **Existing Test Suite Audit**:
  - Searching `find_by_name` for `*test*` and `*spec*` (excluding `node_modules` and `.next`) yielded **0 files**.
  - No testing framework (Playwright, Jest, Vitest, Cypress) is installed in `devDependencies`.
- **System Binary & Environment Audit**:
  - Node version: `v20.20.2`, npm: `10.8.2`.
  - Local browser availability:
    - Google Chrome is pre-installed at `/usr/bin/google-chrome` (Version: `157.0.8103.50`).
    - Firefox is pre-installed at `/usr/bin/firefox`.

---

### 1.2 Responsive Breakpoint Audit (<860px vs >=860px)
- **Universal Breakpoint Constant**:
  Across the entire Sycomo codebase, **`860px`** is the established breakpoint separating mobile/touch viewports from desktop viewports.
- **CSS Media Queries in `src/app/globals.css` (14 occurrences of `860px`)**:
  1. `Line 82`: `@media (pointer: coarse), (max-width: 860px)` — suppresses custom desktop scrollbars for touch/mobile devices (`scrollbar-width: none; ::-webkit-scrollbar { display: none }`).
  2. `Line 455`: `@media (max-width: 860px)` — repositions contact pill (`.sotto-logo--barra`) from header bar down to bottom-right thumb reach (`bottom: calc(16px + env(safe-area-inset-bottom, 0px))`); formats `.sotto-logo:not(.sotto-logo--barra)` to avoid overlap.
  3. `Line 685`: `@media (max-width: 860px)` — expands `.massa` (hero background liquid glass) width to `92vw`, `left: -18vw`.
  4. `Line 781`: `@media (max-width: 860px)` — reorganizes `.chi` typography from diagonal full-bleed layout to vertical grid column with `font-size: clamp(34px, 11vw, 76px)`.
  5. `Line 1021`: `@media (max-width: 860px)` — hides decorative floating Polaroid on mobile (`.pol:not(.pol--album) { display: none; }`).
  6. `Line 1238`: `@media (max-width: 860px)` — collapses `.srv-colonne` (services list) to single column (`grid-template-columns: 1fr`).
  7. `Line 1423`: `@media (max-width: 860px)` — reduces title section `.srv-apre` `min-height` to `42vh`; clamps `.srv-titolo` font size relative to the longest word rather than single-line viewport calculation.
  8. `Line 1523`: `@media (max-width: 860px)` — clamps intro section `.uso` (`CheComputer`) to `min-height: 70vh`, `align-content: start`, and font-size based on `--dom-max`.
  9. `Line 1777`: `@media (max-width: 860px)` — adapts `.duo` (DueMestieri) to tab switch mode (`.duo-scelta`) with single-column toggle.
  10. `Line 2666`: `@media (max-width: 860px)` — **Defect point**: `.alb-pin-track` is set to `height: 320vh` and `.alb-card` is given `width: clamp(290px, 86vw, 480px)` with horizontal strip. The horizontal pinned carousel remains active on mobile!
  11. `Line 2791`: `@media (max-width: 860px)` — legacy `.alb-tavolo` horizontal scroll snap.
  12. `Line 3031`: `@media (max-width: 860px)` — optimizes `.faq` touch target sizes (`summary { font-size: 18px; padding: 17px 0; }`).
  13. `Line 3268`: `@media (max-width: 860px)` — adjusts contact box `.cnt-altra` padding and font sizes.
  14. `Line 3809`: `@media (max-width: 860px)` — collapses `.pie-alto` (Footer) to single-column layout.
- **JavaScript Media Query Audit**:
  - `matchMedia` is used only for:
    - `(prefers-reduced-motion: reduce)` in `HorizontalPinAlbum.tsx` (lines 21, 28), `ScorrimentoFluido.tsx` (line 35), `SottoLogo.tsx` (line 108), `Domande.tsx` (line 94).
    - `(pointer: coarse)` in `ScorrimentoFluido.tsx` (line 39).
  - **Crucial finding**: There is **no `matchMedia("(max-width: 860px)")`** anywhere in JavaScript. In `HorizontalPinAlbum.tsx`, scroll calculations, requestAnimationFrame loops, pointer drag listeners, and wheel hijacking event handlers run identically on mobile and desktop viewports.

---

### 1.3 Mobile Viewports (375px, 390px, 412px) & Desktop (>=1280px)
- **Viewport Metatag**:
  In `src/app/layout.tsx` (lines 105-112):
  ```typescript
  export const viewport: Viewport = {
    themeColor: "#f7f4ed",
    colorScheme: "light",
    width: "device-width",
    initialScale: 1,
  };
  ```
- **375px Viewport (iPhone SE / Compact Mobile)**:
  - Container padding is generally `6vw` to `7vw` (~22px to 26px), leaving an effective content width of ~323px to 331px.
  - In `HorizontalPinAlbum`, `.alb-card` currently has `width: clamp(290px, 86vw, 480px)`. At 375px, `86vw` is 322.5px. The horizontal strip has 4 cards with gaps and paddings exceeding 1400px in total width.
  - For vertical mobile cards (<860px): A card width of `100%` (inside section padding) with an internal horizontal layout (preview/image ~90-100px on left, text details on right) fits within 325px.
- **390px Viewport (iPhone 12/13/14/15/16) & 412px Viewport (Android Flagships)**:
  - 390px: Effective content width ~335px.
  - 412px: Effective content width ~355px.
  - Both viewports comfortably accommodate a left thumbnail preview (100–115px) and right project information column (210–240px).
- **Desktop Viewport (>=1280px)**:
  - Horizontal pinned carousel occupies 100vh viewport with sticky pinning over a `380vh` scroll track.
  - Cards scale up to `clamp(320px, 78vw, 1140px)` with interactive 3D mouse tilt and dynamic reflection sheen.
- **Horizontal Overflow State**:
  - `html` and `body` lack explicit `overflow-x: hidden` or `overflow-x: clip`.
  - While sections like `.hero-art` set `overflow: hidden`, any unbounded element or touch swipe can cause horizontal viewport shifting if not properly constrained.

---

### 1.4 Hero Entrance Animation & Scroll Blocking Mechanism
- **In `src/components/ScrollDirector.tsx` (lines 16-44)**:
  ```typescript
  const APRE = 10;
  const CHIUDE = 4;
  ...
  if (y > APRE) {
    if (!aperto) {
      aperto = true;
      root.style.setProperty("--p", "1");
      root.classList.add("figs-on");
    }
  } else if (y <= CHIUDE) {
    if (aperto || ...) {
      aperto = false;
      root.style.setProperty("--p", "0");
      root.classList.remove("figs-on");
    }
  }
  ```
- **In `src/app/globals.css` (lines 265, 324-334, 283-296)**:
  - `--p` is initialized to `0`.
  - `.logo-fly` has:
    ```css
    top: calc((1 - var(--p)) * 50vh + var(--p) * 12px);
    translate: 0 calc(-50% * (1 - var(--p)));
    font-size: calc((1 - var(--p)) * clamp(84px, 19vw, 300px) + var(--p) * 30px);
    ```
    When `--p = 0`, the logo is centered at `50vh` and rendered at maximum clamp size.
  - Header `.site-header` has `opacity: var(--p);` (completely invisible at `--p = 0`).
  - `.scroll-track` contains `.scroll-section[data-label="apertura"]` with `height: 100vh; height: 100svh;`.
- **In `src/app/page.tsx` & `src/app/pc-su-misura/page.tsx`**:
  The introductory component `<CheComputer>` sits *below* the 100vh scroll section.
  On initial page load, `--p` is 0, the logo is fixed in the center of the viewport, the header is invisible, and `CheComputer` is pushed 100vh off-screen.
  On mobile devices, user touch input does not immediately trigger `--p = 1` unless the user performs a deliberate vertical drag of >10px past the 100vh blank scroll track. This creates the exact observed defect where the title appears stuck in the center of the screen, blocking immediate access to the introductory text.

---

## 2. Logic Chain

1. **Build & Tooling Integrity**:
   - `npm run build` compiles with Next.js 16.2.10 (Turbopack) and TypeScript 5, generating static output for all routes with zero errors (`Observation 1.1`).
   - `npm run lint` confirms ESLint 9 passes with zero warnings (`Observation 1.1`).
   - Therefore, the codebase build pipeline is fully healthy and ready for feature additions.

2. **Root Cause of Mobile Title Lock & Scroll Blocking**:
   - `Observation 1.4` shows that `--p` governs both the logo size/position (`.logo-fly`) and header visibility (`.site-header`).
   - `--p` is strictly bound to `window.scrollY > 10` in `ScrollDirector.tsx`.
   - On page load (`y = 0`), the logo is fixed at `50vh`, occupying the screen center. The introductory content (`CheComputer`) is placed after a dummy 100vh spacer (`.scroll-section[data-label="apertura"]`).
   - On mobile, users are confronted with an apparent dead end: a centered static logo on an empty screen. Because the dummy spacer requires a full viewport scroll before reaching content, mobile scrolling feels locked or unresponsive.
   - **Remedy**: Triggering an automatic intro entrance animation upon page load (e.g., following or coordinating with `IntroCurtain`) that transitions `--p` from 0 to 1 automatically moves the logo into the header, fades in the header, and reveals the introductory text (`CheComputer`) in optimal position without scroll intervention. Concurrently, removing or adapting the 100vh dummy scroll spacer ensures natural vertical page scrolling is functional immediately from the top.

3. **Responsive Breakpoint & Portfolio Layout Partitioning**:
   - `Observation 1.2` established that 860px is the project-wide breakpoint across all existing components (`globals.css`).
   - `Observation 1.2` and `Observation 1.3` revealed that `HorizontalPinAlbum.tsx` currently applies its 320vh–380vh scroll pinning and horizontal translate to *both* mobile and desktop, trapping touch users in horizontal scroll interactions.
   - `Observation 1.2` also revealed the complete lack of a JS breakpoint listener in `HorizontalPinAlbum.tsx`.
   - **Remedy**: For viewports `< 860px`, `Album.tsx` must switch from horizontal pinning to a vertical card layout. On `< 860px`, each card must feature preview/mockup imagery on the left and project details on the right, scrolling naturally with vertical touch gestures. For viewports `>= 860px`, the existing full-screen horizontal pinned carousel experience must remain active and unchanged.
   - To prevent hydration mismatch in Next.js 16 App Router, the responsive separation must either be CSS-driven (with JS pinning handlers activated exclusively when `window.matchMedia("(min-width: 860px)").matches`) or powered by React 19 `useSyncExternalStore` with appropriate SSR fallback.

4. **Card Interactivity & Modal Integration**:
   - `Observation 1.1` and grep searches confirmed that no generic modal component currently exists in `src/`.
   - `ORIGINAL_REQUEST.md` specifies: *"Tapping a mobile portfolio card triggers the project's modal, detail view, or navigation target."*
   - Therefore, the mobile card implementation must include a clean, accessible detail dialog/modal (or expansion sheet) that displays the full project case study (metadata, metrics, specs, role, and contact trigger).

5. **E2E Testing Infrastructure Feasibility**:
   - `Observation 1.1` identified zero existing test files in the codebase.
   - `Observation 1.1` confirmed that Google Chrome 157 is installed at `/usr/bin/google-chrome`.
   - Next.js 16 can be tested via Playwright (or Puppeteer) using `/usr/bin/google-chrome` as the browser executable, allowing zero-download headless testing in CI and local execution.
   - A dedicated E2E test suite can deterministically verify:
     - Hero entrance animation execution and `--p` transition to header.
     - Content reveal of introductory text without scroll intervention.
     - Natural page scrolling without blockage.
     - Viewports <860px (375px, 390px, 412px) rendering vertical cards (preview left, info right) with no horizontal overflow.
     - Card tap triggering detail view / modal.
     - Viewports >=860px preserving horizontal pinned carousel.
     - Smooth dynamic viewport resizing without layout collapse.
     - Zero console errors and clean `npm run build`.

---

## 3. Caveats

1. **Pre-existing CSS in `globals.css`**:
   `src/app/globals.css` is extensive (4,013 lines). The mobile album rules at lines 2666–2688 (`.alb-pin-track { height: 320vh; }`) and lines 2791–2838 must be carefully decoupled so that new mobile vertical card styling cleanly overrides or replaces the pinned rules below 860px without degrading desktop rules.
2. **Next.js Turbopack & React 19 Hydration**:
   Any viewport-based conditional rendering must prevent React hydration mismatches between server-rendered HTML and client state. A CSS media query strategy or a `useSyncExternalStore` subscription with a consistent server snapshot (`false` for mobile or desktop default) is essential.
3. **Reduced Motion Compatibility**:
   Users with `prefers-reduced-motion: reduce` must experience the logo already positioned in the header without animation delays, and the mobile cards must render without entrance delays.

---

## 4. Conclusion & Actionable Recommendations

### 4.1 Architecture Recommendations

#### A. Hero & Title Entrance Track (R1)
1. **Automatic Entrance Coordinator**:
   Update `ScrollDirector.tsx` (or coordinate with an entrance state in `layout.tsx` / `page.tsx`) such that upon page load:
   - When the component mounts (coinciding with the 1.4s `IntroCurtain` fall or starting at ~0.3s), automatically set `--p` from `0` to `1` (or add an entrance state class).
   - This smoothly animates `.logo-fly` into its header lockup (`top: 12px`, `font-size: 30px`) via the existing CSS transition on `--p`.
   - `.site-header` fades in smoothly (`opacity: 1`).
   - Remove or adapt the 100vh empty `.scroll-track` spacer so `<CheComputer>` is visible immediately below the header in natural page flow.
   - Maintain scroll responsiveness: once the intro animation completes, vertical scrolling is immediate, natural, and unblocked.

#### B. Responsive Breakpoint & Mobile Portfolio Track (R2, R3)
1. **Breakpoint Definition**:
   Strict adherence to `@media (max-width: 859px)` (or `< 860px`) for mobile and `@media (min-width: 860px)` for desktop.
2. **Component Architecture**:
   In `src/components/Album.tsx`:
   - On `< 860px`: Render `MobileVerticalAlbum` — a clean vertical list of cards:
     - Card container: `display: flex; flex-direction: row; align-items: stretch; gap: 14px;`
     - Left column: Preview image / miniature device chassis (~90px–110px width).
     - Right column: Project title, category/client badge, concise description, and action indicator.
     - Tapping a card opens `ProjectDetailModal` presenting full case study specs, metrics, and direct inquiry link.
     - Ensure `touch-action: pan-y;` and zero horizontal scroll traps.
   - On `>= 860px`: Render the existing `HorizontalPinAlbum`, preserving the full 380vh sticky horizontal pinned carousel, dock rail, and 3D card tilt.
3. **JS Execution Guard in `HorizontalPinAlbum.tsx`**:
   Wrap wheel interception and scroll RAF triggers with `window.matchMedia("(min-width: 860px)").matches` check to eliminate unnecessary desktop animation overhead on mobile devices.

#### C. Viewport Layout & Overflow Hardening
1. Add `overflow-x: clip;` or `overflow-x: hidden;` to `body` / page container to guarantee zero horizontal scroll drift at 375px, 390px, and 412px.
2. Verify all typography clamps and flex containers at 375px to ensure no text wrapping defects or clipped text.

---

### 4.2 E2E Testing Track Design

To verify all requirements and acceptance criteria, implement an automated E2E test harness using **Playwright** with local Google Chrome (`/usr/bin/google-chrome`):

#### Test Suite Structure (`e2e/sycomo.spec.ts`)

| Test Case | Viewport | Assertion Targets |
|:---|:---|:---|
| **TC-01: Build & Static Routes** | N/A | `npm run build` exits 0; static routes `/`, `/pc-su-misura`, `/privacy` return 200 OK. |
| **TC-02: Hero Entrance Animation** | Desktop (1440x900) & Mobile (390x844) | Logo automatically moves into header within 1.5s; header opacity evaluates to 1; introductory text (`.uso` / `CheComputer`) is visible without user scroll intervention. |
| **TC-03: Immediate Natural Scrolling** | Mobile (390x844) | Scroll action immediately shifts `window.scrollY > 0` with no sticky lock, scroll-blocking overlays, or console errors. |
| **TC-04: Mobile Vertical Cards Layout** | Mobile (375x667, 390x844, 412x915) | Portfolio renders as vertical stack (`display: flex; flex-direction: column` or `display: grid`); cards have left preview + right details; carousel track is unpinned (`height < 200vh`). |
| **TC-05: Horizontal Overflow Check** | Mobile (375px, 390px, 412px) | `document.documentElement.scrollWidth <= window.innerWidth` across all pages. |
| **TC-06: Mobile Card Modal/Detail Trigger** | Mobile (390x844) | Clicking/tapping a mobile card opens the detail dialog; modal displays title, metrics, specs, and close button. |
| **TC-07: Desktop Carousel Preservation** | Desktop (1280x800, 1440x900) | `alb-pin-track` has `height: 380vh`; viewport is sticky; vertical scrolling translates strip horizontally; dock scrubber updates. |
| **TC-08: Responsive Resizing Transition** | 1280px → 375px → 1280px | Smooth transition between modes without orphaned pinned elements or console exceptions. |
| **TC-09: Reduced Motion Support** | Mobile & Desktop with `prefers-reduced-motion` | Hero is instantly at navbar; no continuous animations; immediate accessibility compliance. |

---

## 5. Verification Method

### 5.1 Build & Lint Verification
Execute the project build commands:
```bash
cd /home/shadymui/sycomosite
npm run lint
npm run build
```
*Expected Result*: Exit code 0, 0 TypeScript errors, 0 ESLint errors.

### 5.2 Responsive & Viewport Inspection Commands
Verify CSS and layout configurations:
```bash
# Check 860px breakpoint coverage
grep -n "860px" /home/shadymui/sycomosite/src/app/globals.css

# Verify no TypeScript compile errors across all components
npx tsc --noEmit
```

### 5.3 E2E Test Execution Command
Once the test runner is configured:
```bash
# Run Playwright tests against production build
npx playwright test
```
*Invalidation Conditions*:
- Any occurrence of horizontal overflow (`scrollWidth > innerWidth`) on viewports 375px, 390px, or 412px.
- Any manual scroll requirement before the logo moves to the header or before intro text is revealed.
- Failure of viewports >= 860px to horizontally scroll through portfolio projects.
- Any TypeScript, build, or browser console errors.
