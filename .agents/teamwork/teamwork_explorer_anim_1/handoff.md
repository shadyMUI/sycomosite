# Investigation Report: Logo Flight & CSS Custom Property Transitions (`--p`)

**Investigator**: teamwork_explorer_anim_1  
**Project**: Sycomo (`/home/shadymui/sycomosite`)  
**Date**: 2026-11-10  
**Scope**: In-depth analysis of the Logo flight controlled by `--p` in `src/app/globals.css`, coordination with `ScrollDirector.tsx`, `IntroCurtain.tsx`, `Header` (`.site-header`), `CheComputer.tsx` (`.uso`), physical inertia calibration, micro-staggering, and 60/120fps hardware acceleration.

---

## 1. Observation

### 1.1 Registration and Definition of `@property --p`
In `src/app/globals.css` (lines 274–283):
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
In `prefers-reduced-motion` media query (lines 249–263):
```css
  :root {
    --p: 1 !important;
    transition: none !important;
  }
  .site-header {
    opacity: 1 !important;
    transition: none !important;
  }
  .logo-fly {
    top: 12px !important;
    translate: 0 0 !important;
    margin-left: 22px !important;
    font-size: 30px !important;
    transition: none !important;
  }
```
- `@property --p` is registered as `<number>` with `inherits: true` and `initial-value: 0`.
- Transition property: `--p`.
- Current duration: `0.95s` (950ms).
- Current easing function: `cubic-bezier(0.22, 1, 0.36, 1)`.

### 1.2 Mathematical Interpolation of Elements Bound to `--p`

#### A. Logo Flight (`.logo-fly`)
In `src/app/globals.css` (lines 326–337):
```css
.logo-fly {
  position: fixed;
  left: 0;
  top: calc((1 - var(--p)) * 50vh + var(--p) * 12px);
  translate: 0 calc(-50% * (1 - var(--p)));
  margin-left: calc(
    (1 - var(--p)) * 8vw + var(--p) * 22px
  ); /* centrato in basso a sinistra → filo della header */
  font-size: calc((1 - var(--p)) * clamp(84px, 19vw, 300px) + var(--p) * 30px);
  z-index: 50;
  pointer-events: none;
}
```
- **Vertical position**:
  - `--p = 0`: `top: 50vh; translate: 0 -50%` (perfect vertical center of viewport).
  - `--p = 1`: `top: 12px; translate: 0 0` (docked inside `.site-header` at 12px from top).
- **Horizontal position**:
  - `--p = 0`: `margin-left: 8vw` (hero gutter alignment).
  - `--p = 1`: `margin-left: 22px` (docked inside header left margin).
- **Scale / Typographic size**:
  - `--p = 0`: `font-size: clamp(84px, 19vw, 300px)` (monumental headline size).
  - `--p = 1`: `font-size: 30px` (standard navigation bar logo size).
  - Child elements in `Logo.tsx` (`.logo-word`, `.logo-dot`, `.logo-sub`) use `em` units (`font-size: 1em`, `width: 0.17em`, `font-size: 0.24em`, `margin-left: 4.2em`), so all sub-elements scale proportionally with `font-size`.

#### B. Header (`.site-header`)
In `src/app/globals.css` (lines 303–316):
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
  /* compare insieme al logo che ci sta entrando */
  opacity: var(--p);
  transition: opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}
```
- Bound to `opacity: var(--p)`.
- **Conflict observed**: Declares `transition: opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1);` simultaneously with `opacity: var(--p)`.

#### C. Contact Triggers (`.sotto-logo` and `.sotto-voce--scivola`)
In `src/app/globals.css` (lines 347–391, and mobile 487–497):
```css
.sotto-logo {
  position: fixed;
  z-index: 50;
  left: calc((1 - var(--p)) * 8vw + var(--p) * (100vw - 22px));
  top: calc((1 - var(--p)) * (50vh + clamp(96px, 15vw, 240px)) + var(--p) * 32px);
  translate: calc(var(--p) * -100%) calc(var(--p) * -50%);
  ...
}
.sotto-voce--scivola {
  translate:
    calc((var(--p) - 1) * (var(--wa-w, 130px) + var(--gap-x)))
    calc((1 - var(--p)) * (var(--voce-h, 30px) + var(--gap-y)));
}
```
- Moves from stacked under the hero logo to aligned horizontally in the top-right header dock (`100vw - 22px`, `32px`).

#### D. Introductory Text `<CheComputer>` (`.uso`)
In `src/app/globals.css` (lines 1462–1478):
```css
.uso {
  position: relative;
  z-index: 32;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  box-sizing: border-box;
  display: grid;
  align-content: center;
  padding: clamp(84px, 12vh, 120px) 6vw clamp(56px, 8vh, 110px);
  opacity: var(--p);
  translate: 0 calc((1 - var(--p)) * 24px);
  transition:
    opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1),
    translate 0.95s cubic-bezier(0.22, 1, 0.36, 1);
}
```
- Rises 24px into place and fades in from 0 to 1.
- **Conflict observed**: Declares `transition: opacity 0.95s ..., translate 0.95s ...` simultaneously with `opacity: var(--p)` and `translate: 0 calc((1 - var(--p)) * 24px)`.

#### E. Artwork & Diagonal Texts (`.massa`, `.chi`, `.pol`)
- `.massa` (lines 548–553):
  `translate: calc((1 - var(--p)) * -14%) calc((1 - var(--p)) * 16%);`
  `opacity: calc(0.25 + var(--p) * 0.75);`
  `transition: translate 1.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.4s ease;`
- `.chi-uno`, `.chi-due` (lines 737, 750, 771):
  `opacity: calc((var(--p) - 0.55) / 0.45);` (remaps the last 45% of `--p`).
- `.pol` (Polaroid, line 853):
  `opacity: calc((var(--p) - 0.6) / 0.4);` (remaps the last 40% of `--p`).

### 1.3 Automatic Entrance Orchestration in `ScrollDirector.tsx`
In `src/components/ScrollDirector.tsx` (lines 20–58, 72–83):
```tsx
const DELAY_INGRESSO_MS = 1450;
...
const apri = (immediato = false) => {
  if (aperto) return;
  aperto = true;

  if (immediato || mediaReducedMotion.matches) {
    root.style.setProperty("transition", "none");
    root.style.setProperty("--p", "1");
    root.classList.add("figs-on");
    void root.offsetHeight;
    root.style.removeProperty("transition");
  } else {
    root.style.setProperty("--p", "1");
    root.classList.add("figs-on");
  }
};
...
// 3. Ascolta l'evento 'sycomo:intro-done' emesso da IntroCurtain quando il liquido è sceso del tutto
const onIntroDone = () => {
  clearTimeout(timer);
  apri(false);
};
window.addEventListener("sycomo:intro-done", onIntroDone, { once: true });

// 4. Timer di fallback garantito sincronizzato col termine dell'intro (1450ms)
const timer = setTimeout(() => {
  apri(false);
}, DELAY_INGRESSO_MS);
```
- Sits idle until `IntroCurtain` completes its liquid fall.
- When `sycomo:intro-done` fires (or after 1450ms fallback), sets `--p = 1` and adds class `figs-on` to `document.documentElement`.
- If `window.scrollY > 10` or `prefers-reduced-motion: reduce`, triggers `apri(true)` instantly with `transition: none`.

### 1.4 Liquid Curtain Timing in `IntroCurtain.tsx` and `globals.css`
- In `globals.css` (lines 185, 157):
  `animation: intro-fall 1.15s cubic-bezier(0.5, 0.15, 0.78, 0.72) 0.22s both;`
  `animation: intro-done 0s linear 1.4s forwards;`
- Curtain delay is 0.22s, fall duration is 1.15s, completing at ~1.37s.
- `IntroCurtain.tsx` dispatches `sycomo:intro-done` on `animationend` (`intro-fall`).

---

## 2. Logic Chain

### Step 1: Easing Curve Physics and Inertia Analysis
- **Current Curve `cubic-bezier(0.22, 1, 0.36, 1)`**:
  - Control point P1 has coordinate `(0.22, 1.0)`.
  - The initial slope $\frac{dy}{dx}$ at the start of motion is $\approx \frac{1.0}{0.22} = 4.55$.
  - At only 22% of elapsed time (approx. 200ms into a 950ms duration), the logo has already covered ~80–85% of its entire journey.
  - The remaining 750ms is an excessively flat, slow crawl.
  - **Sensory result**: The flight feels like a mechanical catapult snap rather than a natural object possessing mass, momentum, and viscous damping.
- **Calibrated Curve `cubic-bezier(0.25, 1, 0.5, 1)`**:
  - P1 = `(0.25, 1.0)`, P2 = `(0.5, 1.0)`.
  - The onset of deceleration is cushioned until x = 0.5 (half of total duration), providing a continuous, gentle decay that mirrors physical inertia (an object gliding through air or viscous fluid coming smoothly to rest).
  - Alternatively, Emil Kowalski's signature UI ease-out `cubic-bezier(0.23, 1, 0.32, 1)` provides a crisp, confident glide.
  - However, for large viewport-spanning hero journeys with physical weight, `cubic-bezier(0.25, 1, 0.5, 1)` (explicitly suggested in `ORIGINAL_REQUEST.md`) delivers the most luxurious, fluid deceleration.

### Step 2: Duration Calibration
- At `0.95s` with the old curve, the motion felt abrupt in the first 200ms and dragged at the end.
- Calibrating duration to **`1.05s` (1050ms)** with `cubic-bezier(0.25, 1, 0.5, 1)` provides:
  1. A generous, organic glide where the eye can comfortably track the logo as it docks into the header.
  2. Perfect safety margin for E2E tests: `adversarial-stress.mjs` checks `--p >= 0.95` within a 1200ms sampling window and sleeps for 1200ms. A duration of `1.05s` guarantees that the animation completes and settles at `--p = 1.0` well before the 1200ms test deadline.

### Step 3: Resolving the "Transition Fighting" Anti-Pattern
- In CSS, when custom property `--p` transitions on `:root`, the browser updates the computed value of `--p` on every animation frame (at 60fps or 120fps).
- On `.site-header`, both `opacity: var(--p)` AND `transition: opacity 0.95s ...` were declared.
- On `.uso`, both `opacity: var(--p)`, `translate: 0 calc((1 - var(--p)) * 24px)` AND `transition: opacity 0.95s ..., translate 0.95s ...` were declared.
- When an element has a local `transition` on a property whose value is being updated every frame by an `@property` transition, the browser treats each frame's micro-update as a new transition trigger. This creates a low-pass filter lag (transition-on-a-transition), introducing micro-judder, visual blur, and unnecessary compositor workload.
- **Resolution**:
  - Remove redundant `transition: opacity` from `.site-header` so its opacity directly reflects `--p` without interference.
  - For `.uso`, decouple its entrance from raw `--p` and drive it via `.figs-on` with a clean, micro-staggered CSS transition.

### Step 4: Micro-Staggering Architecture
- Currently, when `--p` begins animating, `.logo-fly`, `.site-header`, `.sotto-logo`, and `.uso` all start moving simultaneously at $t = 0$.
- Moving everything together creates a monolithic "wall-of-motion" effect that overwhelms visual focus.
- Per Emil Kowalski's design principles (`SKILL.md` line 606: "When multiple elements enter together, stagger their appearance... Keep stagger delays short (30-80ms between items)"):
  1. **Phase 1 ($t = 0$)**: `.logo-fly` launches, becoming the immediate focal leader.
  2. **Phase 2 ($t \approx 60\text{ms}$)**: `.site-header` glass fades in as the logo begins ascending.
  3. **Phase 3 ($t \approx 80\text{ms}$)**: `<CheComputer>` (`.uso`) glides in from bottom (`translateY(24px)` to `0`, opacity 0 to 1) via a staggered transition triggered by `.figs-on`.
  4. **Phase 4 ($t \approx 120\text{ms}$)**: `.sotto-logo` contact actions settle into their right-hand header dock.

### Step 5: Hardware Acceleration (60/120fps Optimization)
- `.logo-fly` modifies `top`, `margin-left`, `translate`, and `font-size`.
- While `translate` is GPU-accelerated on modern compositor layers, `font-size` and `top`/`margin-left` calculate layout metrics.
- Adding `will-change: transform;` and `backface-visibility: hidden;` forces GPU texture promotion and prevents repainting adjacent DOM trees.
- For `.uso` and `.site-header`, driving them purely with `opacity` and `transform` (`translate`) allows the compositor thread to execute the entire animation at 60/120fps without touching the main layout thread.

---

## 3. Caveats

1. **Houdini `@property` Browser Support**:
   - Supported natively in Chromium (85+), WebKit/Safari (16.4+), and Firefox (128+).
   - In unsupported legacy browsers, CSS custom properties do not interpolate smoothly via Houdini; however, `ScrollDirector.tsx` sets inline style `--p: 1` directly upon completion, ensuring immediate fallback visibility.
2. **`font-size` vs `scale()` on `.logo-fly`**:
   - The logo lockup relies on relative `em` units for the brand dot and subtext (`.logo-dot`, `.logo-sub`). Animating `font-size` ensures mathematically exact typographic proportions at all viewports.
   - While `transform: scale()` is purely compositor-driven, changing `.logo-fly` to `scale()` would alter the bounding box geometry expected by `e2e/adversarial-stress.mjs` (which verifies `logoRect.top <= 40px` and header docking). Therefore, keeping `font-size` driven by `--p` with GPU layer promotion (`will-change: transform`) is the safest and most reliable approach.
3. **E2E Timing Ceiling**:
   - The `--p` transition duration MUST NOT exceed `1.15s` (1150ms). If duration were set to e.g. `1.5s`, `adversarial-stress.mjs` (which stops sampling at 1200ms) would catch `--p` at ~0.92 and trigger a test failure (`--p failed to achieve open state`). Calibrating to `1.05s` satisfies all visual requirements while safely clearing all E2E assertions.

---

## 4. Conclusion & Emil Kowalski Design Review

### 4.1 Emil Kowalski Review Table

| Before | After | Why |
| --- | --- | --- |
| `:root { transition: --p 0.95s cubic-bezier(0.22, 1, 0.36, 1); }` | `:root { transition: --p 1.05s cubic-bezier(0.25, 1, 0.5, 1); }` | Replaces aggressive catapult curve with natural physical inertia and viscous damping; prevents abrupt jerk on departure. |
| `.site-header { opacity: var(--p); transition: opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1); }` | `.site-header { opacity: var(--p); will-change: opacity; }` | Eliminates transition-on-transition fighting; allows direct, unlagged GPU opacity interpolation from `--p`. |
| `.uso` moves in lockstep at $t=0$ with `.logo-fly` and has conflicting duplicate transition | `.uso` uses micro-staggered transition (`80ms` delay) triggered by `.figs-on` | Prevents whole page from moving simultaneously in one monolithic block; gives the logo flight visual priority. |
| `.logo-fly` lacks GPU layer promotion hint | `.logo-fly { will-change: transform; backface-visibility: hidden; }` | Promotes element to dedicated compositor layer; guarantees smooth 60/120fps motion without layout thrashing. |
| `.massa` transition uses rigid `1.4s cubic-bezier(0.22, 1, 0.36, 1)` | `.massa` transition calibrated to `1.25s cubic-bezier(0.25, 1, 0.5, 1)` | Harmonizes background glass artwork with the new physical inertia curve of the site. |

### 4.2 Concrete Implementation Blueprint

#### Changes in `src/app/globals.css`:

1. **Update `:root` `--p` transition (lines 280–283)**:
```css
:root {
  --p: 0;
  /* Il volo del logo: morbido ed elegante, con inerzia fisica naturale */
  transition: --p 1.05s cubic-bezier(0.25, 1, 0.5, 1);
}
```

2. **Optimize `.site-header` (lines 303–316)**:
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
  /* compare insieme al logo che ci sta entrando */
  opacity: var(--p);
  will-change: opacity;
  pointer-events: none;
}
```

3. **Promote `.logo-fly` to compositor layer (lines 326–337)**:
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
  pointer-events: none;
  will-change: transform;
  backface-visibility: hidden;
}
```

4. **Micro-stagger `<CheComputer>` (`.uso`) (lines 1462–1478)**:
```css
.uso {
  position: relative;
  z-index: 32;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  box-sizing: border-box;
  display: grid;
  align-content: center;
  padding: clamp(84px, 12vh, 120px) 6vw clamp(56px, 8vh, 110px);
  opacity: 0;
  translate: 0 24px;
  will-change: transform, opacity;
  transition:
    opacity 0.75s cubic-bezier(0.25, 1, 0.5, 1) 80ms,
    translate 0.75s cubic-bezier(0.25, 1, 0.5, 1) 80ms;
}

.figs-on .uso {
  opacity: 1;
  translate: 0 0;
}
```

5. **Harmonize `.massa` (lines 548–553)**:
```css
.massa {
  ...
  translate: calc((1 - var(--p)) * -14%) calc((1 - var(--p)) * 16%);
  opacity: calc(0.25 + var(--p) * 0.75);
  transition:
    translate 1.25s cubic-bezier(0.25, 1, 0.5, 1),
    opacity 1.25s cubic-bezier(0.25, 1, 0.5, 1);
}
```

6. **Harmonize `prefers-reduced-motion`**:
   Ensure `transition: none !important;` and `.figs-on .uso { opacity: 1 !important; translate: 0 0 !important; }` are strictly applied when reduced motion is preferred.

---

## 5. Verification Method

### 5.1 Verification Commands
To independently verify the implementation and ensure zero regressions across the 40 E2E tests:

1. **Lint Check**:
   ```bash
   npm run lint
   ```
   *Expected*: Exits with code 0.

2. **Next.js Production Build**:
   ```bash
   npm run build
   ```
   *Expected*: Builds clean static bundle in ~2-3 seconds with zero errors.

3. **E2E Feature F1 (Auto-entrance & Logo Flight)**:
   ```bash
   node e2e/runner.mjs --feature=F1
   ```
   *Expected*: 10/10 tests pass across Tier 1 and Tier 2 (validates F1-T1-01 through F1-T1-05 and F1-T2-01 through F1-T2-05).

4. **Empirical Adversarial Stress Suite**:
   ```bash
   node e2e/adversarial-stress.mjs
   ```
   *Expected*: Validates 60fps sampling, verifies that `--p` smoothly reaches `1.0` without back-glitch or reset, and confirms title remains firmly docked at `12px` through 40 overscroll cycles.

5. **Full 40-Test E2E Matrix**:
   ```bash
   node e2e/runner.mjs
   ```
   *Expected*: 40/40 tests pass across all 4 Tiers.

### 5.2 Files to Inspect
- `src/app/globals.css`: Check `:root`, `.site-header`, `.logo-fly`, `.uso`, `.massa`.
- `src/components/ScrollDirector.tsx`: Confirm `DELAY_INGRESSO_MS` alignment.
- Browser DevTools Animations Panel: Inspect curve at 25% speed to verify physical deceleration curve and 80ms micro-stagger.

### 5.3 Invalidation Conditions
- Any duration $> 1.15\text{s}$ which would exceed the sampling window in `e2e/adversarial-stress.mjs` (line 77: `1200ms`).
- Any regression where `--p` resets to `0` or drops $< 0.8$ upon touch/wheel overscroll at $y \le 0$.
- Retaining conflicting `transition: opacity` on an element bound to `opacity: var(--p)`.
