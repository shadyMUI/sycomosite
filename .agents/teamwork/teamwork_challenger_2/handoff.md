# Handoff Report: Empirical Adversarial Challenge — Viewports, Overflow & Layout Integrity

**Agent**: `teamwork_challenger_2`  
**Role**: Empirical Challenger (critic, specialist)  
**Date**: 2026-11-10T18:04:00Z  
**Verdict**: **`REQUEST_CHANGES`**

---

## 1. Observation

### 1.1 Automated E2E Test Suite Execution (`node e2e/runner.mjs`)
- **Execution Command**: `node e2e/runner.mjs`
- **Observed Result**: Exit code `1`. 39 passed, 1 failed (total runtime: 77.63s).
- **Verbatim Failure Output**:
  ```text
  [36/40] [T4:Scenario] T4-01      First-time Mobile Visitor Journey (iPhone 14, 39... ✖ FAIL (797ms)
      ↳ Introductory section text not visible to visitor

  ================================================================
    E2E TEST EXECUTION SUMMARY
  ================================================================
    Total Executed: 40
    Passed:         39
    Failed:         1
    Total Duration: 77.63s
  ================================================================

  Failed Tests Summary:
    ✖ [Tier 4] T4-01      - First-time Mobile Visitor Journey (iPhone 14, 390x844): Load, intro reveal, thumb scroll, card tap, modal inspection
      Error: Introductory section text not visible to visitor
  ```
- **Code Inspection**:
  - In `e2e/specs/tier4-scenarios.mjs` (lines 35–41):
    ```javascript
    const intro = await driver.evaluate(() => {
      const el = document.querySelector(".uso, [data-section='intro']");
      return el ? el.textContent : "";
    });
    if (!intro || (!intro.toLowerCase().includes("pc") && !intro.toLowerCase().includes("esigenza") && !intro.toLowerCase().includes("computer"))) {
      throw new Error("Introductory section text not visible to visitor");
    }
    ```
  - In `src/app/page.tsx` (lines 57–62):
    ```tsx
    <CheComputer
      titolo="siti e app costruiti da zero"
      casi={["siti web", "app mobile", "social"]}
      chiusura=" — scritti su misura, "
      accento="senza modelli riciclati"
    />
    ```
  - The text rendered on `/` is `"siti e app costruiti da zero sites web / app mobile / social — scritti su misura, senza modelli riciclati"`. It does not contain the substring `"pc"`, `"esigenza"`, or `"computer"`, which only exist on `/pc-su-misura` or in the fallback default props of `CheComputer.tsx`.

---

### 1.2 Mobile Card Dimensions & Thumbnail Aspect Ratio Distortion
- **Code Inspection**:
  - In `src/components/MobileVerticalAlbum.tsx` (line 64):
    ```tsx
    <article
      key={s.didascalia}
      role="button"
      tabIndex={0}
      className="alb-mobile-card mobile-card alb-card"
    ```
  - In `src/app/globals.css` (lines 1993–1997):
    ```css
    .alb-card {
      position: relative;
      flex-shrink: 0;
      width: clamp(320px, 78vw, 1140px);
      height: clamp(390px, 62vh, 600px);
    ```
  - In `src/app/globals.css` (lines 2768–2785):
    `.alb-mobile-card` specifies `width: 100%`, `display: flex`, `flex-direction: row`, `align-items: stretch`, but **omits `height: auto`**.
- **Empirical DOM Measurements (Headless Chrome DevTools Protocol)**:
  - Because `.alb-mobile-card` includes class `alb-card`, it inherits `height: clamp(390px, 62vh, 600px)`.
  - **On iPhone 14/15 (390x844)**:
    - Card computed height: `523.27px` (`62vh` of 844px).
    - Left column preview thumbnail (`.card-preview`): width `108px`, height `497.27px`.
    - Thumbnail aspect ratio: **`0.22` (1:4.6 vertical stretch ratio)**. The mini browser / hardware mockup canvas stretches into an elongated 480px tall pillar.
    - Right column (`.card-details`): height `497.27px`. Because content (kicker, title, 2-line description) totals ~86px, `.alb-m-card-footer` with `margin-top: auto` is pushed down by **`marginTop = 343.61px`**, leaving a massive empty void in every mobile card.
  - **On Samsung S22 / Pixel (412x915)**:
    - Card height: `567.0px`, thumbnail height: `541.0px` (aspect ratio **`0.20`**, 1:5.0 ratio).
  - **On Breakpoint Threshold Boundary (859x900)**:
    - Card height: `558.0px`, thumbnail height: `532.0px` (aspect ratio **`0.20`**).
- **Simulated Fix Verification**:
  - Overriding `card.style.height = "auto"` via CDP:
    - Card height drops from `523.27px` to **`179.66px`**.
    - Thumbnail height drops from `497.27px` to **`153.66px`** (width `108px`).
    - Thumbnail aspect ratio becomes **`0.70` (3:4.2 portrait miniature)**.
    - Empty margin void in `.card-details` drops from `343.61px` to **`0px`**.

---

### 1.3 Adversarial Viewport Matrix & Horizontal Overflow Metrics
Using standalone test runner `e2e/adversarial-layout.mjs`, all 12 viewports were measured across the complete scroll cycle (`scrollY = 0, 500, 1500, 3000`):

| Viewport | Device Profile | `window.innerWidth` | `scrollWidth` | Delta (`scrollWidth - innerWidth`) | Status | Notes |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **320x568** | Ultra-compact (iPhone 5/SE 1st) | 320px | 339px | **+19px** | **FAIL** | 19px horizontal overflow caused by `#contatti` (`.cnt`) padding + 320px content |
| **360x640** | Small Android (Galaxy S5) | 360px | 360px | 0px | **PASS** | Zero horizontal overflow |
| **375x667** | iPhone SE (2nd/3rd gen) | 375px | 375px | 0px | **PASS** | Zero horizontal overflow |
| **390x844** | Standard mobile (iPhone 14/15) | 390px | 390px | 0px | **PASS** | Zero horizontal overflow |
| **412x915** | Android flagship (Samsung/Pixel) | 412px | 412px | 0px | **PASS** | Zero horizontal overflow |
| **667x375** | Landscape mobile (iPhone SE) | 667px | 667px | 0px | **PASS** | Zero horizontal overflow |
| **859x900** | Max mobile threshold boundary | 859px | 859px | 0px | **PASS** | Mobile vertical cards active; desktop track `display: none` |
| **860x900** | Min desktop threshold boundary | 860px | 860px | 0px | **PASS** | Desktop carousel active; mobile view `display: none` |
| **1280x800** | Standard desktop / laptop | 1280px | 1280px | 0px | **PASS** | Pinned horizontal carousel active, 0px overflow |
| **1440x900** | Desktop 2K / MacBook Pro 15 | 1440px | 1440px | 0px | **PASS** | Pinned horizontal carousel active, 0px overflow |
| **1920x1080**| Full HD 1080p workstation | 1920px | 1920px | 0px | **PASS** | Pinned horizontal carousel active, 0px overflow |
| **2560x1440**| Ultrawide / 4K workstation | 2560px | 2560px | 0px | **PASS** | Pinned horizontal carousel active, 0px overflow |

---

### 1.4 Text Clamping Verification
Empirical inspection of `.alb-m-card-desc` across all mobile cards:
- `-webkit-line-clamp`: `2` (exact computed property)
- `-webkit-box-orient`: `vertical`
- `overflow`: `hidden`
- `text-overflow`: `ellipsis`
- Computed line height: `16.8px`
- Bounding box client height: `33.59px`
- **Rendered lines**: exactly **`2.0 lines`** with trailing ellipsis. Clamping is strictly enforced.

---

### 1.5 Kicker Flex Spans Bounding Box Inspection
- In `MobileVerticalAlbum.tsx` (lines 138–149), `.alb-m-card-kicker` contains `<span className="alb-m-card-cat">` and `<span className="alb-m-card-client">`.
- `.alb-m-card-kicker` is styled with `display: flex; white-space: nowrap; overflow: hidden;`.
- Because flex children default to `min-width: auto`, the unconstrained child spans retain intrinsic text widths (up to `231px` and `210px`, extending to `right: 585px`).
- While visually clipped by `.alb-m-card-kicker`'s `overflow: hidden`, adding `min-width: 0; overflow: hidden; text-overflow: ellipsis;` to `.alb-m-card-cat` and `.alb-m-card-client` will ensure inline truncation.

---

## 2. Logic Chain

1. **Test Suite Exit Code Gate**:
   - Dispatch Requirement 2 mandates running `node e2e/runner.mjs`.
   - The test suite returned exit code `1` due to `T4-01` failing.
   - Observation 1.1 reveals that `T4-01` fails because it asserts the homepage `/` contains the word `"pc"`, `"esigenza"`, or `"computer"`, whereas `page.tsx` intentionally provides digital agency copy (`"siti e app costruiti da zero"`).
   - This failure prevents an automated release gate pass.

2. **Mobile Card Proportion & Usability Breakdown**:
   - Original Request R2 requires a "clean vertical list of cards/rectangles featuring an image/preview on the left and project details (title, category/client, description) on the right, optimized for thumb scrolling."
   - Observation 1.2 demonstrates that due to CSS inheritance from `.alb-card`, cards balloon to `523px` on standard mobile screens (iPhone 14/15) and `567px` on Android flagships.
   - The thumbnail preview (`.card-preview`, 108px wide) is forced into an elongated `497px` strip (aspect ratio 0.22, 1:4.6 vertical distortion), destroying the visual fidelity of the miniature device mockup.
   - The card details column suffers from an artificial `343px` empty void, forcing users to scroll past half-screen blank cards rather than browsing a tight, thumb-friendly feed.
   - Overriding `height: auto` on `.alb-mobile-card` resolves the issue immediately, reducing card height to `179.66px` and restoring thumbnail aspect ratio to `0.70` (~3:4).

3. **Ultra-Compact Viewport Overflow (320px)**:
   - On 320x568 (iPhone 5 / SE 1st gen), `document.documentElement.scrollWidth` is `339px`, producing a `19px` horizontal overflow.
   - Observation 1.3 isolates this overflow to `#contatti` (`.cnt`), where `padding: 6vw` (19.2px) combined with form elements produces a width of `339.2px`.
   - While `#lavori` (the portfolio component) itself has `scrollWidth = 320px` and zero overflow at 320px, the overall document fails the zero-overflow requirement at 320px.

---

## 3. Caveats

- **No Code Modifications Made**: In strict adherence to the Challenger / Reviewer constraint ("Review-only — do NOT modify implementation code"), no source files were changed. All fixes were validated via non-destructive CDP style injection.
- **Scope of 320px Overflow**: The 19px overflow at 320px originates in `#contatti` (`.cnt`), not in `#lavori` or the newly redesigned portfolio cards.
- **Assertion Root Cause in T4-01**: The failure in `T4-01` is an overly restrictive assertion in `e2e/specs/tier4-scenarios.mjs` (expecting PC hardware copy on the digital web agency homepage `/`). Either updating `T4-01` to accept digital agency copy (`"siti"`, `"app"`, `"misura"`) or visiting `/pc-su-misura` for the PC journey will allow 40/40 tests to pass.

---

## 4. Conclusion

**Verdict: `REQUEST_CHANGES`**

While Milestone 1 (Hero entrance) and the fundamental architecture of Milestone 2 (breakpoint separation at 860px, bottom-sheet modal, and text clamping) are solid, the implementation cannot be approved in its current state due to two actionable issues:

1. **Card Dimension & Aspect Ratio Defect (Critical Visual)**:
   - File: `src/app/globals.css` (lines 2768–2785).
   - Change: Add `height: auto !important;` to `.alb-mobile-card`.
   - Rationale: Prevents mobile cards from inheriting desktop `height: clamp(390px, 62vh, 600px)`, eliminating the 523px card stretching, the 1:4.6 thumbnail distortion, and the 343px empty gap.
2. **E2E Test Runner Gate Failure (Exit Code 1)**:
   - File: `e2e/specs/tier4-scenarios.mjs` (line 39).
   - Change: Update `T4-01` intro text assertion to include digital studio copy:
     ```javascript
     if (!intro || (!intro.toLowerCase().includes("pc") && !intro.toLowerCase().includes("esigenza") && !intro.toLowerCase().includes("computer") && !intro.toLowerCase().includes("siti") && !intro.toLowerCase().includes("app")))
     ```
   - Rationale: Restores 40/40 pass rate on `node e2e/runner.mjs`.
3. **Kicker Child Truncation (Defensive Polish)**:
   - File: `src/app/globals.css` (lines 2957–2963).
   - Change: Add `min-width: 0; overflow: hidden; text-overflow: ellipsis;` to `.alb-m-card-cat` and `.alb-m-card-client`.
4. **Ultra-Compact (320px) Overflow (Defensive Polish)**:
   - File: `src/app/globals.css` (lines 3847, 3865).
   - Change: Ensure `#contatti` (`.cnt`) uses `box-sizing: border-box; max-width: 100vw;` and clamp heading font size down to `clamp(28px, 6.4vw, 120px)` on viewports `< 360px`.

---

## 5. Verification Method

### 5.1 Execute Automated E2E Test Suite
```bash
node e2e/runner.mjs
```
*Current Result*: 39/40 passing, exit code 1 (fails on T4-01).  
*Expected Result After Fix*: 40/40 passing, exit code 0.

### 5.2 Execute Adversarial Layout Test Harness Across All 12 Viewports
```bash
node e2e/adversarial-layout.mjs
```
*Evaluates*:
- 320x568, 360x640, 375x667, 390x844, 412x915, 667x375, 859x900, 860x900, 1280x800, 1440x900, 1920x1080, 2560x1440.
- Horizontal overflow (`scrollWidth <= innerWidth`).
- Mobile card height and thumbnail aspect ratios.
- Clamping (`-webkit-line-clamp: 2`).
- ProjectDetailModal bottom sheet / dialog display and Escape key dismissal.

### 5.3 Measure Mobile Card Geometry on iPhone 14
```bash
node --experimental-websocket -e '
import("./e2e/driver.mjs").then(async ({ TestDriver }) => {
  const driver = new TestDriver();
  await driver.init({ headless: true });
  await driver.setViewport({ width: 390, height: 844, isMobile: true });
  await driver.goto("http://localhost:3000");
  await driver.sleep(1000);
  const m = await driver.evaluate(() => {
    const card = document.querySelector(".alb-mobile-card");
    const thumb = card?.querySelector(".card-preview");
    return {
      cardHeight: card?.getBoundingClientRect().height,
      thumbWidth: thumb?.getBoundingClientRect().width,
      thumbHeight: thumb?.getBoundingClientRect().height,
      thumbRatio: (thumb?.getBoundingClientRect().width / thumb?.getBoundingClientRect().height).toFixed(2)
    };
  });
  console.log("Card Metrics:", m);
  await driver.close();
  process.exit(0);
});
'
```
*Pass Criteria*: `cardHeight <= 220px` and `thumbRatio >= 0.60`.
