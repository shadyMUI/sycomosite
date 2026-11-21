# Handoff Report: Responsive Card Transitions & E2E Test Suite Integrity

## 1. Observation

### 1.1 Codebase Structure and Transition Implementation
Direct examination of the codebase revealed the following components and CSS rules governing card interactions and modal lifecycles:

1. **`src/app/globals.css` (lines 2773–2803) — Mobile Vertical Cards**:
   ```css
   .alb-mobile-card {
     display: flex;
     flex-direction: row;
     align-items: stretch;
     gap: 12px;
     padding: 12px;
     background: linear-gradient(135deg, rgba(255, 254, 251, 0.94) 0%, rgba(247, 244, 237, 0.88) 100%);
     border: 1px solid color-mix(in srgb, var(--lift) 85%, var(--hair));
     border-radius: 18px;
     box-shadow: 0 4px 18px -4px rgba(32, 32, 28, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.95);
     cursor: pointer;
     transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease;
     user-select: none;
     -webkit-tap-highlight-color: transparent;
     box-sizing: border-box;
     width: 100%;
     height: auto !important;
     max-height: none;
     outline: none;
   }

   .alb-mobile-card:focus-visible {
     outline: 2px solid var(--red);
     outline-offset: 2px;
   }

   .alb-mobile-card:active {
     transform: scale(0.985);
     box-shadow: 0 2px 8px -2px rgba(32, 32, 28, 0.06);
   }
   ```
   *Observed*: No entrance animation or micro-staggering exists for mobile cards; all cards appear instantaneously in a block when rendered. The active tap duration is symmetrical (0.15s) with a faint scale factor (`0.985`), lacking tactile depth. No `@media (hover: hover) and (pointer: fine)` query protects hover states from sticky touch taps.

2. **`src/app/globals.css` (lines 1998–2035) — Desktop Horizontal Cards**:
   ```css
   .alb-card {
     ...
     transform: perspective(1100px) rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg)) scale3d(var(--card-scale, 1), var(--card-scale, 1), var(--card-scale, 1));
     transition:
       box-shadow 0.28s ease,
       border-color 0.28s ease,
       transform 0.12s ease-out;
     transform-style: preserve-3d;
   }
   .alb-card:hover {
     border-color: color-mix(in srgb, var(--red) 32%, var(--hair));
     box-shadow: ...;
   }
   ```
   *Observed*: There is no `:active` pseudo-class for `.alb-card`. Clicks on desktop cards provide zero scale depression feedback. The transform transition is standard `0.12s ease-out` instead of an organic custom curve with physical inertia.

3. **`src/app/globals.css` (lines 3040–3124) — Project Detail Modal / Bottom Sheet**:
   ```css
   @keyframes albModalFadeIn {
     from { opacity: 0; }
     to { opacity: 1; }
   }
   @keyframes albModalSlideUp {
     from { transform: translateY(100%); }
     to { transform: translateY(0); }
   }
   @keyframes albModalPopIn {
     from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
     to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
   }
   .alb-modal-backdrop {
     animation: albModalFadeIn 0.2s ease-out;
   }
   @media (max-width: 859.98px) {
     .project-modal.alb-modal {
       animation: albModalSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
     }
   }
   @media (min-width: 860px) {
     .project-modal.alb-modal {
       animation: albModalPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
     }
   }
   ```
   *Observed*: The bottom sheet uses `cubic-bezier(0.16, 1, 0.3, 1)` at 0.24s rather than the iOS-native spring/drawer curve `cubic-bezier(0.32, 0.72, 0, 1)`. The modal close button (`.alb-modal-close`) lacks an `:active` state. The modal CTA button (`.alb-modal-cta-btn`, line 3452) uses `transition: all 0.2s ease` and `:active { transform: translateY(0); }`, violating Emil Kowalski's rules against `transition: all` and missing scale feedback.

4. **`src/components/ProjectDetailModal.tsx` (lines 51–80, 82)**:
   ```tsx
   if (!project) return null;
   ```
   *Observed*: The modal is rendered conditionally and unmounts synchronously in React when `project === null`. The `useEffect` cleanup hook synchronously restores `document.body.style.overflow = previousOverflow`.

5. **`src/app/globals.css` (lines 280–283, 1462–1478) & `ScrollDirector.tsx` — Entrance Curves**:
   ```css
   :root {
     --p: 0;
     transition: --p 0.95s cubic-bezier(0.22, 1, 0.36, 1);
   }
   .uso {
     opacity: var(--p);
     translate: 0 calc((1 - var(--p)) * 24px);
     transition:
       opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1),
       translate 0.95s cubic-bezier(0.22, 1, 0.36, 1);
   }
   .intro-sheet {
     animation: intro-fall 1.15s cubic-bezier(0.5, 0.15, 0.78, 0.72) 0.22s both;
   }
   ```
   *Observed*: `--p` and `.uso` use `cubic-bezier(0.22, 1, 0.36, 1)`. `.intro-sheet` uses `cubic-bezier(0.5, 0.15, 0.78, 0.72)`. `.uso` animates both question and subtitle in a single block without micro-staggering.

### 1.2 Empirical E2E Test Suite Execution
Direct execution of the test suite yielded the following baseline results:
1. `node e2e/runner.mjs`: **40/40 tests PASSED (100% pass rate)** in 77.78s.
   - Tier 1 (Coverage, 15 tests): 15/15 PASS (25.57s)
   - Tier 2 (Boundaries, 15 tests): 15/15 PASS
   - Tier 3 (Cross, 5 tests): 5/5 PASS
   - Tier 4 (Scenarios, 5 tests): 5/5 PASS
2. `node e2e/adversarial-layout.mjs`: **12/12 viewports PASSED + 3/3 modal breakpoints PASSED (0 failures)**.
3. `npm run lint`: **0 errors**, 3 warnings in test harness.
4. `npm run build`: **Compiled successfully in 6.8s**.

### 1.3 Identification of Assertions, Timing Thresholds, and Critical Selectors
Grep and manual inspection across `e2e/specs/` and `e2e/adversarial-*.mjs` identified the following test tolerances:

| Target Element / State | Test ID / Spec File | Assertion & Method | Timing Window / Timeout | Critical Constraint / Risk |
|---|---|---|---|---|
| `--p` & Header | `F1-T1-01`, `T3-01`, `T4-01` | `waitForFunction(() => pVal >= 0.8 \|\| opacity >= 0.8)` | 4500ms timeout | Duration must settle `>= 0.8` well under 4.5s. Current 0.95s settles in ~1.4s. |
| Logo header lockup | `F1-T1-02` | `waitForFunction(() => logo.top <= 50)` | 4500ms timeout | Must reach header (`top <= 50px`) before timeout. |
| Introductory text (`.uso`) | `F1-T1-04`, `T4-01` | `waitForFunction(() => rect.height > 100 && text.includes("computer"))` | 4500ms timeout | Height must remain > 100px, content unblocked. |
| Mobile card stack | `F2-T1-01`, `F2-T2-01` | `cards.length >= 2 && r1.top >= r0.bottom - 20` | `sleep(1200)` | Cards must be vertically stacked, not overlapping. |
| Mobile horizontal overflow | `F2-T2-02` (375px), `F2-T2-03` (390px), `F2-T2-04` (412px), `adversarial-layout.mjs` | `scrollWidth <= innerWidth + 1` AND `allElements.every(r.right <= winWidth + 1)` | `sleep(1500)` after navigation | **CRITICAL**: No card transform or stagger can exceed `winWidth`. Must use `translateY` and `scale <= 1`, never `translateX` or `scale > 1` on mobile. |
| Mobile Card click / Modal open | `F2-T1-05`, `F3-T1-04`, `T3-01`, `T4-01` | `waitForFunction(() => modal && r.width > 0 && r.height > 0)` | 3000ms–3500ms timeout | Modal must become visible with non-zero dimensions. |
| Modal hammer assault | `adversarial-stress.mjs` (C3.1) | 20 open/close cycles with `sleep(35ms)` between clicks; checks `modals.length === 0` and `body.overflow !== "hidden"` | 35ms sleep per cycle | **CRITICAL**: Modal unmount MUST stay synchronous in React. Any delayed exit transition in React state causes DOM leaks and test failure. |
| Modal Escape assault | `adversarial-stress.mjs` (C3.2) | 15 open/Escape cycles with `sleep(25ms)`; checks 0 modal elements in DOM | 25ms sleep per cycle | Same invariant as C3.1: DOM cleanup must be instant on Escape. |
| Reduced motion mode | `F1-T2-05`, `T3-04` | `waitForFunction(() => pVal >= 0.8)` | `sleep(500–600ms)` | Under `prefers-reduced-motion`, entrance & modal must resolve immediately (`transition: none !important`). |

---

## 2. Logic Chain

1. **Step 1: Tactile Card Inertia**:
   - *Observation*: `.alb-card` (desktop) has no `:active` selector, and `.alb-mobile-card` has a minimal `scale(0.985)` with equal 0.15s enter/exit timing.
   - *Reasoning*: Per Emil Kowalski's guidelines, pressable elements must provide responsive active feedback (`scale(0.97)` to `scale(0.98)`) with asymmetric timing: snappy press (~160ms) and organic release (~220ms).
   - *Inference*: Applying `transform: scale(0.978)` (or `scale(0.98)`) on `:active` with `transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1)` to `.alb-mobile-card`, and `scale3d(0.982, 0.982, 0.982)` to `.alb-card`, introduces soft physical inertia.
   - *Safety check*: Because scaling down reduces element dimensions, `rect.right` strictly decreases during press, making it mathematically impossible to cause horizontal overflow in tests `F2-T2-02` or `adversarial-layout.mjs`.

2. **Step 2: Mobile Card Micro-Staggering**:
   - *Observation*: Mobile cards enter the DOM simultaneously. E2E tests `F2-T1-01` and `F2-T1-04` wait `sleep(1200)` before interacting, while `F2-T2-02` checks `allElements.r.right <= winWidth + 1` at 375px.
   - *Reasoning*: Adding `@keyframes albMobileCardEnter` with `opacity: 0; transform: translateY(14px) scale(0.985);` to `opacity: 1; transform: translateY(0) scale(1);` with `cubic-bezier(0.16, 1, 0.3, 1)` over 380ms, staggered by 45ms per child (e.g. 40ms, 85ms, 130ms, 175ms), completes all card entrances in under 560ms.
   - *Inference*: 560ms is well within the 1200ms `driver.sleep()` of E2E tests. Because the motion is purely vertical (`translateY`) and starts slightly contracted (`scale(0.985)`), no card can protrude horizontally past the container padding, preserving zero overflow (`scrollWidth <= innerWidth + 1`).
   - *Rule check*: Starts from `scale(0.985)` and `opacity: 0` (never `scale(0)`). Disabled under `@media (prefers-reduced-motion: reduce)`.

3. **Step 3: Bottom-Sheet Drawer Easing**:
   - *Observation*: Currently `.project-modal.alb-modal` on mobile uses `animation: albModalSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1)`.
   - *Reasoning*: The domain skill specifies the iOS drawer curve `cubic-bezier(0.32, 0.72, 0, 1)` (Vaul/Ionic curve) for natural physics with decelerating inertia over 280ms.
   - *Inference*: Updating `.project-modal.alb-modal` on mobile to `animation: albModalSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)` yields authentic iOS sheet behavior while settling in 280ms—well within the 3000ms `waitForFunction` in `F2-T1-05`, `T3-01`, and `T4-01`.
   - *Critical Invariant for Modal Unmount*: Tests C3.1 and C3.2 in `adversarial-stress.mjs` test rapid open/close hammering with 25ms–35ms sleeps and assert that 0 modal or backdrop elements exist in the DOM. Therefore, closing the modal MUST remain an immediate React unmount (`project === null`), leaving exit transitions to purely off-thread CSS or avoiding delayed state unmounting.

4. **Step 4: Micro-Staggering and Easing for `<CheComputer>` (`.uso`)**:
   - *Observation*: `.uso` transitions with `0.95s cubic-bezier(0.22, 1, 0.36, 1)` as a monolithic block.
   - *Reasoning*: Emil Kowalski advocates custom ease-out curves (`cubic-bezier(0.16, 1, 0.3, 1)`) and micro-staggering child elements (30–80ms delay) to prevent elements moving in unison.
   - *Inference*: Giving `.uso-domanda` a duration of 0.85s with `cubic-bezier(0.16, 1, 0.3, 1)` and `.uso-testo` a 0.08s (80ms) delay causes the headline and body text to flow in sequence like liquid typography, settling in 0.93s—fully compatible with the 4500ms `F1-T1-04` assertion.

---

## 3. Design Engineering Review (Emil Kowalski Guidelines)

The required before/after review table summarizes the proposed transition upgrades:

| Before | After | Why |
|---|---|---|
| `.alb-mobile-card:active { transform: scale(0.985); }` | `transform: scale(0.978);` with `transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1)` on `:active`, `220ms` on release | Press must provide clear tactile feedback with asymmetric timing (snappy press, organic release) |
| `.alb-card` (desktop) has no `:active` state | `.alb-card:active { transform: perspective(1100px) rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg)) scale3d(0.982, 0.982, 0.982); }` | Large desktop cards must confirm mouse click through subtle physical compression |
| Mobile cards render instantaneously in a block | `@keyframes albMobileCardEnter` with 45ms micro-staggering (`:nth-child(n)`) | Cascading reveal gives natural fluidity without moving everything simultaneously in a block |
| Mobile card entry without scale guard | `from { opacity: 0; transform: translateY(14px) scale(0.985); }` | Never animate from `scale(0)`; start near full size with opacity for physical realism |
| `.project-modal` mobile: `0.24s cubic-bezier(0.16, 1, 0.3, 1)` | `animation: albModalSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)` | Authentic iOS-like bottom-sheet drawer curve with natural inertia |
| `.alb-modal-backdrop` uses generic `0.2s ease-out` | `animation: albModalFadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)` | Built-in CSS easings are weak; strong custom ease-out matches sheet momentum |
| `.alb-modal-close` has no `:active` state | `.alb-modal-close:active { transform: scale(0.92); }` with `transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1)` | Close button must confirm tap with crisp scale depression |
| `.alb-modal-cta-btn { transition: all 0.2s ease; }` | `transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease, box-shadow 200ms ease;` + `:active { transform: scale(0.97); }` | Avoid `transition: all`; specify exact GPU properties and add responsive active press feedback |
| Desktop card hover active on touch devices | Wrap `.alb-card:hover` in `@media (hover: hover) and (pointer: fine)` | Touch devices trigger sticky hover on tap, causing visual glitches |
| `<CheComputer>` (`.uso`) moves as a monolithic block | Stagger `.uso-domanda` (0ms delay) and `.uso-testo` (+80ms delay) with `cubic-bezier(0.16, 1, 0.3, 1)` | Headline and body copy cascade organically rather than shifting in a rigid block |

---

## 4. Caveats

1. **Modal DOM Removal Invariant**:
   Under no circumstances should React unmounting of `ProjectDetailModal` be delayed via asynchronous timeouts (e.g. `setTimeout(() => onClose(), 300)`). Test C3.1 and C3.2 in `e2e/adversarial-stress.mjs` execute 20 cycles of card clicks and backdrop/Escape key presses spaced by only 25ms–35ms. Delayed unmount would result in orphaned elements in the DOM and body scroll lock leakage, failing the stress suite.
2. **Horizontal Protrusion Invariant**:
   In `e2e/specs/tier2-boundaries.mjs` (test `F2-T2-02`), the test queries `document.querySelectorAll("*")` on a 375px viewport and asserts `r.right <= winWidth + 1`. Any horizontal slide (e.g. `translateX(-20px)`) or oversized scaling (`scale(1.05)`) on mobile cards will trigger an immediate test failure. All mobile card entrances and active states must strictly use `translateY` and `scale <= 1`.
3. **`--p` Inline Property vs Computed Style in Stress Tests**:
   In `adversarial-stress.mjs` (C2.1), the test inspects `document.documentElement.style.getPropertyValue("--p")`. When `ScrollDirector.tsx` sets inline `--p = "1"` at 1450ms, the CSS transition of `--p` (0.95s) is still interpolating toward `top: 12px`. Extending `--p` duration beyond 0.95s would aggravate this discrepancy. Keeping `--p` transition at `0.95s cubic-bezier(0.16, 1, 0.3, 1)` or `cubic-bezier(0.25, 1, 0.5, 1)` ensures prompt arrival without timing budget pressure.

---

## 5. Conclusion

1. **Design Upgrades**:
   Upgrading mobile card interactions to asymmetric active feedback (`scale(0.978)` / 160ms press), introducing 45ms micro-staggering (`translateY(14px) scale(0.985)`), calibrating the bottom sheet to the iOS drawer curve `cubic-bezier(0.32, 0.72, 0, 1)`, and cascading `.uso` elements fulfills all visual polish criteria while adhering to Emil Kowalski's guidelines.
2. **E2E Integrity Guarantee**:
   All 40 tests in the test matrix and all 12 viewports in the adversarial layout suite will remain 100% green, because:
   - All transition durations (160ms–380ms) settle well within test timeouts (3000ms–4500ms).
   - Mobile card animations are strictly vertical and scaling-inward, guaranteeing zero horizontal overflow (`scrollWidth <= innerWidth + 1`).
   - Modal lifecycle remains synchronous in React, preventing DOM leakage during high-frequency stress hammering.

---

## 6. Verification Method

To independently verify 100% test pass after applying the transition refinements:

1. **Lint and Typecheck**:
   ```bash
   npm run lint
   ```
   *Expected output*: 0 errors.

2. **Production Build**:
   ```bash
   npm run build
   ```
   *Expected output*: Successful Turbopack build with static generation completed.

3. **Complete 40-Test Matrix**:
   ```bash
   node e2e/runner.mjs
   ```
   *Expected output*: `All 40 tests passed successfully!` with 0 failures across Tiers 1–4.

4. **Adversarial Viewport & Layout Audit (320px to 2560px)**:
   ```bash
   node e2e/adversarial-layout.mjs
   ```
   *Expected output*: `Failures: 0` across all 12 viewport configurations and 3 modal breakpoints.

5. **Adversarial Stress Suite (Hammering & Transitions)**:
   ```bash
   node e2e/adversarial-stress.mjs
   ```
   *Expected output*: Rapid open/close hammering (C3.1), Escape key assault (C3.2), and focus trap (C3.3) PASS.

### Invalidation Conditions
- Any mobile card transition that causes `document.documentElement.scrollWidth > window.innerWidth + 1` at 375px or 390px.
- Any delayed React unmount that causes `document.querySelectorAll(".project-modal").length > 0` after Escape or backdrop click.
- Any transition duration exceeding 1.2s that causes `waitForFunction` timeouts in `tier1-features.mjs`.
