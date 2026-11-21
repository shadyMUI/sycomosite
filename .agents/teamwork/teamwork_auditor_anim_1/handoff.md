# Forensic Audit Report: Milestone M4 (Sycomo Animation & Easing Calibration)

**Work Product**: Milestone M4 (Sycomo Animation & Easing Calibration: `src/app/globals.css`, `src/components/ScrollDirector.tsx`)  
**Profile**: General Project (`development` mode per `ORIGINAL_REQUEST.md`)  
**Verdict**: **CLEAN**

---

### Phase Results
- **Scope Boundary Compliance**: **PASS** — Only `src/app/globals.css` and `src/components/ScrollDirector.tsx` were modified during M4.
- **Test Suite Anti-Tampering Check**: **PASS** — Zero files in `e2e/` were modified or weakened; test specs remain in original state.
- **Prohibited Patterns Check**: **PASS** — Zero hardcoded test results, zero dummy/facade implementations, zero fabricated verification outputs.
- **Genuine CSS & Mathematics**: **PASS** — Registered `@property --p`, valid cubic-bezier curves (`(0.25, 1, 0.5, 1)`, `(0.16, 1, 0.3, 1)`, `(0.32, 0.72, 0, 1)`), real CSS keyframes, and compositor promotions.
- **Micro-Staggering & Natural Inertia**: **PASS** — Calibrated 30-50ms typographical stagger in `.uso`, asymmetric card press/release, and synchronized curtain/flight orchestration.
- **Accessibility & Reduced Motion**: **PASS** — Genuine `@media (prefers-reduced-motion: reduce)` rules correctly disabling transitions and setting instant layout.
- **Independent Build & Verification**: **PASS** — `npm run lint` (0 errors), `npm run build` (exit 0), `node e2e/runner.mjs` (40/40 PASS), `node e2e/adversarial-layout.mjs` (12 viewports + 3 modal breakpoints PASS), `node e2e/adversarial-stress.mjs` (10/10 PASS).

---

## 1. Observation

### 1.1 Scope Boundary Verification
- Git inspection and file timestamp analysis across the entire project confirmed that during Milestone M4 execution (post-20:01:02 local time):
  - `src/components/ScrollDirector.tsx` was modified at `2026-11-10 20:10:34.165184591 +0100`
  - `src/app/globals.css` was modified at `2026-11-10 20:13:28.153445911 +0100`
  - No other source files in `src/` were altered during M4.
  - Zero files in `e2e/specs/` were altered. Timestamps:
    - `e2e/specs/tier1-features.mjs`: `2026-11-10 18:32:28 +0100`
    - `e2e/specs/tier2-boundaries.mjs`: `2026-11-10 18:30:05 +0100`
    - `e2e/specs/tier3-interactions.mjs`: `2026-11-10 18:30:30 +0100`
    - `e2e/specs/tier4-scenarios.mjs`: `2026-11-10 19:10:08 +0100`
    - `e2e/runner.mjs`: `2026-11-10 18:36:32 +0100`

### 1.2 Inspection of Modified Code
1. `src/components/ScrollDirector.tsx`:
   - Line 19: `const DELAY_INGRESSO_MS = 1180;` synchronized with curtain fall (`0.12s` delay + `0.98s` fall = `1.10s` + `80ms` margin).
   - Lines 42-56: `apri` function cleanly switches `--p` to `1` and adds `.figs-on`. When `prefers-reduced-motion` is active or immediate opening is requested, temporarily disables transition to ensure zero-lag instant setup.
   - Lines 68-76: Listens to custom event `'sycomo:intro-done'` with `{ once: true }` and clears fallback timer.
   - Lines 86-98: Clean event listener removal on component unmount.
2. `src/app/globals.css`:
   - Lines 144-154: `.intro` disappears cleanly at `1.12s`: `animation: intro-done 0s linear 1.12s forwards;`.
   - Lines 162-179: `.intro-sheet` cascade: `animation: intro-fall 0.98s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both; will-change: transform; transform: translate3d(0, 0, 0);`.
   - Lines 268-276: Registered `@property --p` with syntax `"<number>"`; `:root` ease-outquart transition: `transition: --p 1.05s cubic-bezier(0.25, 1, 0.5, 1);`.
   - Lines 297-309: `.site-header` opacity bound to `var(--p)` with `will-change: opacity;` and no conflicting opacity transition.
   - Lines 320-333: `.logo-fly` promoted to compositor layer with `will-change: transform; backface-visibility: hidden;`.
   - Lines 546-549: `.massa` harmonized transition: `transition: translate 1.25s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.25s cubic-bezier(0.25, 1, 0.5, 1);`.
   - Lines 1458-1598: `.uso` & typography micro-staggering:
     - `.uso`: `opacity: var(--p); transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);`
     - `.uso-domanda`: delay `0ms`, `0.65s cubic-bezier(0.16, 1, 0.3, 1)`, `translateY(16px) -> 0`
     - `.uso-dot`: delay `50ms`, `0.45s cubic-bezier(0.16, 1, 0.3, 1)`, `scale(0.92) -> 1`
     - `.uso-testo`: delay `80ms`, `0.65s cubic-bezier(0.16, 1, 0.3, 1)`, `translateY(12px) -> 0`
     - `.uso-testo > span:nth-of-type(1)`: delay `110ms`, `opacity 0.5s`
     - `.uso-testo > span:nth-of-type(2)`: delay `150ms`, `opacity 0.5s`
     - `.uso-testo > span:nth-of-type(3)`: delay `190ms`, `opacity 0.5s`
     - `.uso-testo em`: delay `230ms`, `0.55s`, `translateY(8px) -> 0`
     - `@media (prefers-reduced-motion: reduce)`: all typography elements reset with `opacity: 1 !important; transform: none !important; translate: none !important; transition: none !important;`.
   - Lines 2848-2897: `.alb-mobile-card`:
     - `@keyframes albMobileCardEnter`: strictly vertical `translateY(14px) scale(0.985) -> translateY(0) scale(1)`.
     - Staggered delays: 40ms, 85ms, 130ms, 175ms, 220ms.
     - Asymmetric tactile feedback: 160ms snappy press (`scale(0.978)`), 220ms cushioned spring release.
   - Lines 2097-2110: `.alb-card`: hover wrapped in `@media (hover: hover) and (pointer: fine)`, active press `scale3d(0.982, 0.982, 0.982)`.
   - Lines 3135-3214, 3274-3300, 3553-3579:
     - Backdrop: `animation: albModalFadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1);`.
     - Mobile drawer: `animation: albModalSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);` (iOS curve).
     - Close button active press: `transform: scale(0.92);` in 160ms.
     - CTA button active press: `transform: scale(0.97);` in 160ms.

### 1.3 Verbatim Tool Commands and Results

#### Command 1: `npm run lint`
```
> sycomosite@0.1.0 lint
> eslint

/home/shadymui/sycomosite/e2e/adversarial-layout.mjs
  304:15  warning  'style' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/shadymui/sycomosite/e2e/adversarial-stress.mjs
  323:11  warning  'cyclesCompleted' is assigned a value but never used  @typescript-eslint/no-unused-vars
  421:17  warning  'first' is assigned a value but never used            @typescript-eslint/no-unused-vars

/home/shadymui/sycomosite/e2e/challenger-empirical.mjs
  232:15  warning  'verticalCenter' is assigned a value but never used  @typescript-eslint/no-unused-vars
  330:18  warning  'e' is defined but never used                        @typescript-eslint/no-unused-vars

✖ 5 problems (0 errors, 5 warnings)
Exit code: 0
```

#### Command 2: `npm run build`
```
> sycomosite@0.1.0 build
> next build

▲ Next.js 16.2.10 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 3.7s
✓ Finished TypeScript in 5.1s 
✓ Collecting page data using 10 workers in 828ms 
✓ Generating static pages using 10 workers (9/9) in 1093ms
✓ Finalizing page optimization in 20ms 

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /opengraph-image
├ ○ /pc-su-misura
├ ○ /privacy
├ ○ /robots.txt
└ ○ /sitemap.xml

○  (Static)  prerendered as static content
Exit code: 0
```

#### Command 3: `node e2e/runner.mjs`
```
================================================================
  SYCOMO E2E AUTOMATED TEST SUITE
  Selected: 40 of 40 tests
  Target:   http://localhost:3000
================================================================

[runner] Server detected active at http://localhost:3000
[runner] Launching headless Chrome and initializing driver...
[runner] Chrome initialized (Chrome/157.0.8103.50)

[1/40] [T1:F1] F1-T1-01          Auto-Entrance: Page loads and entrance triggers ... ✔ PASS (1621ms)
[2/40] [T1:F1] F1-T1-02          Header Lockup: Logo moves from center into heade... ✔ PASS (1914ms)
[3/40] [T1:F1] F1-T1-03          Header Visibility: .site-header fades in to full... ✔ PASS (1767ms)
[4/40] [T1:F1] F1-T1-04          Intro Content Reveal: Introductory text section ... ✔ PASS (334ms)
[5/40] [T1:F1] F1-T1-05          Mobile Scroll Unblock: Immediate vertical scroll... ✔ PASS (2447ms)
[6/40] [T1:F2] F2-T1-01          Mobile Layout: Portfolio renders as vertical car... ✔ PASS (1551ms)
[7/40] [T1:F2] F2-T1-02          Mobile Card Anatomy Preview: Card displays previ... ✔ PASS (1532ms)
[8/40] [T1:F2] F2-T1-03          Mobile Card Anatomy Details: Card displays proje... ✔ PASS (1584ms)
[9/40] [T1:F2] F2-T1-04          Mobile Vertical Scrollability: Mobile portfolio ... ✔ PASS (1973ms)
[10/40] [T1:F2] F2-T1-05         Mobile Card Tap / Modal Trigger: Tapping a mobil... ✔ PASS (1644ms)
[11/40] [T1:F3] F3-T1-01         Desktop Carousel Active: Pinned horizontal carou... ✔ PASS (2042ms)
[12/40] [T1:F3] F3-T1-02         Desktop Scroll Translation: Scrolling through de... ✔ PASS (2825ms)
[13/40] [T1:F3] F3-T1-03         Desktop Cards Arrangement: Cards arranged side-b... ✔ PASS (2060ms)
[14/40] [T1:F3] F3-T1-04         Desktop Card Click: Clicking desktop card opens ... ✔ PASS (2032ms)
[15/40] [T1:F3] F3-T1-05         Desktop Dock / Scrubber: Scrubber reflects horiz... ✔ PASS (1952ms)
[16/40] [T2:F1] F1-T2-01         Rapid Reload: Entrance state cleanly re-executes... ✔ PASS (1994ms)
[17/40] [T2:F1] F1-T2-02         Fast Scroll During Entrance: Rapid scroll down d... ✔ PASS (1619ms)
[18/40] [T2:F1] F1-T2-03         Overscroll Bounce: Pulling down to y=0 does not ... ✔ PASS (2807ms)
[19/40] [T2:F1] F1-T2-04         Compact Viewport Height: Title lockup fits prope... ✔ PASS (2181ms)
[20/40] [T2:F1] F1-T2-05         Reduced Motion Mode: Title entrance completes im... ✔ PASS (995ms)
[21/40] [T2:F2] F2-T2-01         Breakpoint Boundary 859px: Exactly 859px renders... ✔ PASS (1587ms)
[22/40] [T2:F2] F2-T2-02         Compact Viewport 375px (iPhone SE): Zero horizon... ✔ PASS (1870ms)
[23/40] [T2:F2] F2-T2-03         Standard Mobile 390px (iPhone 14): Zero horizont... ✔ PASS (1913ms)
[24/40] [T2:F2] F2-T2-04         Wide Mobile 412px (Android Flagship): Zero horiz... ✔ PASS (1965ms)
[25/40] [T2:F2] F2-T2-05         Mobile Landscape 667x375: Card list remains acce... ✔ PASS (2096ms)
[26/40] [T2:F3] F3-T2-01         Breakpoint Boundary 860px: Exactly 860px renders... ✔ PASS (2000ms)
[27/40] [T2:F3] F3-T2-02         Desktop Standard 1280px: Zero horizontal root ov... ✔ PASS (2009ms)
[28/40] [T2:F3] F3-T2-03         Desktop High-Res 1920px: Carousel scales properl... ✔ PASS (2039ms)
[29/40] [T2:F3] F3-T2-04         Midpoint Scroll Jump: Direct scroll to 50% of tr... ✔ PASS (2459ms)
[30/40] [T2:F3] F3-T2-05         Boundary Exit to FAQ: Scrolling past track unpin... ✔ PASS (2433ms)
[31/40] [T3:Cross] T3-01         Entrance to Mobile Card Tap Flow: Load -> Entran... ✔ PASS (1900ms)
[32/40] [T3:Cross] T3-02         Dynamic Breakpoint Switch: Resize 1280px -> 390p... ✔ PASS (3236ms)
[33/40] [T3:Cross] T3-03         Modal Resizing Resilience: Modal open on 390px a... ✔ PASS (2565ms)
[34/40] [T3:Cross] T3-04         Reduced Motion Synergy: Reduced motion mode work... ✔ PASS (1030ms)
[35/40] [T3:Cross] T3-05         Full Mobile Page Flow: Header entrance -> Intro ... ✔ PASS (2545ms)
[36/40] [T4:Scenario] T4-01      First-time Mobile Visitor Journey (iPhone 14, 39... ✔ PASS (1810ms)
[37/40] [T4:Scenario] T4-02      Compact Screen Visitor Journey (iPhone SE, 375x6... ✔ PASS (2851ms)
[38/40] [T4:Scenario] T4-03      Desktop Workstation Visitor Journey (1440x900): ... ✔ PASS (2646ms)
[39/40] [T4:Scenario] T4-04      Keyboard Navigation & Modal Accessibility: Focus... ✔ PASS (2401ms)
[40/40] [T4:Scenario] T4-05      Multi-Route Static Page Integrity: Validate /, /... ✔ PASS (4368ms)

================================================================
  E2E TEST EXECUTION SUMMARY
================================================================
  Total Executed: 40
  Passed:         40
  Failed:         0
  Total Duration: 82.61s
================================================================
Exit code: 0
```

#### Command 4: `node e2e/adversarial-layout.mjs`
```
================================================================
  EMPIRICAL ADVERSARIAL CHALLENGER 2: VIEWPORT & LAYOUT AUDIT
  Target: http://localhost:3000
  Viewports to evaluate: 12
================================================================

Evaluating [320x568] Ultra-compact mobile (iPhone 5/SE 1st)... ✔ PASS
Evaluating [360x640] Small Android (Galaxy S5/legacy)... ✔ PASS
Evaluating [375x667] Compact mobile (iPhone SE 2nd/3rd)... ✔ PASS
Evaluating [390x844] Standard mobile (iPhone 14/15)... ✔ PASS
Evaluating [412x915] Wide mobile (Samsung S22 / Pixel)... ✔ PASS
Evaluating [667x375] Mobile landscape (iPhone 667x375)... ✔ PASS
Evaluating [859x900] Breakpoint max mobile (859px)... ✔ PASS
Evaluating [860x900] Breakpoint min desktop (860px)... ✔ PASS
Evaluating [1280x800] Desktop standard (1280x800)... ✔ PASS
Evaluating [1440x900] Desktop 2K / MBP 15 (1440x900)... ✔ PASS
Evaluating [1920x1080] Desktop Full HD (1920x1080)... ✔ PASS
Evaluating [2560x1440] Desktop Ultrawide / 4K (2560x1440)... ✔ PASS

Evaluating ProjectDetailModal across viewports...
Testing modal at 320px ultra-compact... ✔ PASS (width=320px, bodyOverflow=hidden)
Testing modal at 390px standard mobile... ✔ PASS (width=390px, bodyOverflow=hidden)
Testing modal at 1280px desktop... ✔ PASS (width=640px, bodyOverflow=hidden)

================================================================
  ADVERSARIAL LAYOUT AUDIT SUMMARY
================================================================
  Total Viewports Tested: 12
  Modal Breakpoints Tested: 3
  Failures: 0
================================================================
Exit code: 0
```

#### Command 5: `node e2e/adversarial-stress.mjs`
```
================================================================
  EMPIRICAL ADVERSARIAL STRESS TEST SUITE
  Target: http://localhost:3000
================================================================

>>> CHALLENGE 1: Rapid Scrolling During Entrance Animation
[STRESS] C1.1: Mobile rapid scroll barrage during entrance (0-500ms window) ✔ PASS
   ↳ Captured 73 frames; --p reached 1.0 smoothly without back-glitch or reset
[STRESS] C1.2: Desktop wheel hammering before curtain drops (t < 200ms)    ✔ PASS
   ↳ Entrance settled cleanly with p=1, logo.top=12px

>>> CHALLENGE 2: Rubber-banding Overscroll at y <= 0
[STRESS] C2.1: Mobile aggressive overscroll bounce (simulating iOS/Android top pull) ✔ PASS
   ↳ 40 overscroll cycles simulated; title stayed firmly docked at top: 12px with --p = 1
[STRESS] C2.2: Violent negative wheel delta overscroll on desktop          ✔ PASS
   ↳ Negative wheel delta did not dislodge title (p=1, top=12px)

>>> CHALLENGE 3: Card Tapping and Modal Transitions
[STRESS] C3.1: 20x Rapid Open/Close hammering via card click & backdrop tap ✔ PASS
   ↳ Completed 20 rapid open/close cycles; 0 DOM leaks, body.style.overflow cleanly restored to 'default'
[STRESS] C3.2: Rapid Escape key assault during modal opening transition    ✔ PASS
   ↳ 15 rapid card-click + Escape pairs cleanly handled; overflow='default'
[STRESS] C3.3: Accessibility Focus Trap verification on Tab / Shift+Tab    ✔ PASS
   ↳ Focus remained trapped within modal (2 focusable elements)

>>> CHALLENGE 4: Dynamic Resizing & Breakpoint Stress
[STRESS] C4.1: Viewport oscillations (1280px <-> 859px <-> 390px) while scrolled ✔ PASS
   ↳ Zero horizontal overflow (scrollWidth=390px == innerWidth=390px), desktop cleanly hidden, mobile visible
[STRESS] C4.2: Resizing from 390px to 1280px with Modal OPEN               ✔ PASS
   ↳ Modal maintained visual integrity across resize (diff=0px), closed cleanly, desktop carousel intact
[STRESS] C4.3: Sticky container lifecycle audit (no orphaned pinned tracks) ✔ PASS
   ↳ Zero orphaned sticky scroll tracks on mobile viewport

================================================================
  ADVERSARIAL STRESS TEST SUMMARY
================================================================
  Total Executed: 10
  Passed:         10
  Failed:         0
================================================================
Exit code: 0
```

---

## 2. Logic Chain

1. **Strict Scope Confinement**:
   - Observations 1.1 confirm that only `src/app/globals.css` and `src/components/ScrollDirector.tsx` were modified during M4.
   - All tests in `e2e/` (both the central runner and the individual tier specs) have timestamps preceding M4 or untouched by the worker. No tests were softened or rewritten to force passes.

2. **Genuine Implementation vs. Prohibited Facades**:
   - In `globals.css`, animation physics rely on genuine CSS properties: `@property --p` with syntax `"<number>"`, valid custom cubic-bezier math (`(0.25, 1, 0.5, 1)`, `(0.16, 1, 0.3, 1)`, and `(0.32, 0.72, 0, 1)`), CSS keyframes (`albMobileCardEnter`, `intro-fall`, `albModalSlideUp`), and GPU layer promotion (`will-change: transform`, `backface-visibility: hidden`).
   - In `ScrollDirector.tsx`, state transitions are commanded strictly via DOM properties and event listeners (`sycomo:intro-done`, `scroll`). There are zero bypass hooks, zero environment mocks, and zero dummy return paths.

3. **Adherence to Emil Kowalski Design Engineering & User Constraints**:
   - The user request in `ORIGINAL_REQUEST.md` asked for natural physical inertia at 60/120fps, soft easing curves, and micro-staggering.
   - Typography in `<CheComputer>` is staggered across 7 steps between 0ms and 230ms, preventing jarring simultaneous block pop-ins.
   - Mobile card entrance motion is strictly vertical (`translateY(14px) scale(0.985) -> translateY(0) scale(1)`), eliminating horizontal layout blowouts across all viewports (from 320px up to ultrawide).
   - Asymmetric active feedback (160ms snappy press, 220ms release) produces tactile touch response without sluggishness.
   - The mobile modal uses the native iOS bottom-sheet drawer curve `cubic-bezier(0.32, 0.72, 0, 1)`.

4. **Empirical Evidence of Flawless Execution**:
   - All 40 E2E tests, 12 layout viewports, and 10 adversarial stress scenarios passed consistently on fresh, independent runs.
   - Build and lint pass cleanly with zero errors.

---

## 3. Caveats
- No caveats. The codebase was independently tested with live headless Chrome instances against the local Next.js server via Chrome DevTools Protocol.

---

## 4. Conclusion
Milestone M4 (Sycomo Animation & Easing Calibration) fully satisfies all requirements in `ORIGINAL_REQUEST.md` and complies with all integrity forensic standards. Zero integrity violations, facades, hardcoded test results, or regressions were detected.

**Final Verdict**: **CLEAN**

---

## 5. Verification Method
Any auditor or engineer can independently replicate these findings by executing:
```bash
npm run lint
npm run build
node e2e/runner.mjs
node e2e/adversarial-layout.mjs
node e2e/adversarial-stress.mjs
```
Expected output: All 5 commands exit with code 0 and zero errors or failures.
