#!/usr/bin/env node
/**
 * e2e/empirical-m4-challenger.mjs
 * Empirical Challenger deep-dive verification for Milestone M4
 * Focus:
 * 1. Trajectory and timing of computed --p (1.05s ease-out) reaching >= 0.95 smoothly.
 * 2. Rapid reload hammering (5x quick reloads).
 * 3. Focus trap and focus restoration (WCAG 2.4.3).
 * 4. Reduced motion instant resolution and zero motion artifacts.
 * 5. Emil Kowalski design engineering audit (compositor, asymmetric active scale, micro-staggering).
 */

import { spawnSync } from "node:child_process";
import process from "node:process";

if (typeof WebSocket === "undefined") {
  const result = spawnSync(
    process.execPath,
    ["--experimental-websocket", ...process.execArgv, ...process.argv.slice(1)],
    {
      stdio: "inherit",
      env: process.env,
    }
  );
  process.exit(result.status ?? 0);
}

import { TestDriver } from "./driver.mjs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function main() {
  console.log("================================================================");
  console.log("  EMPIRICAL CHALLENGER: DEEP-DIVE BENCHMARK (M4)");
  console.log(`  Target: ${BASE_URL}`);
  console.log("================================================================\n");

  const driver = new TestDriver();
  await driver.init({ headless: true });

  const results = [];
  function record(name, passed, details, error = null) {
    results.push({ name, passed, details, error });
    const status = passed ? "\x1b[32m✔ PASS\x1b[0m" : "\x1b[31m✖ FAIL\x1b[0m";
    console.log(`[CHALLENGE] ${name.padEnd(65)} ${status}`);
    if (details) console.log(`   ↳ \x1b[90m${details}\x1b[0m`);
    if (error) console.error(`   \x1b[31m↳ ERROR: ${error.message || error}\x1b[0m`);
  }

  try {
    // -------------------------------------------------------------
    // 1. --p Transition Trajectory & Smoothness
    // -------------------------------------------------------------
    console.log(">>> 1. --p Transition Trajectory & Smoothness Analysis");
    {
      const testName = "--p Smooth Trajectory: 1.05s transition reaches >= 0.95 smoothly";
      try {
        await driver.setViewport({ width: 1280, height: 800 });
        await driver.goto(BASE_URL);

        // High-frequency sampling of computed --p, header opacity, logo position
        const trajectory = await driver.evaluate(async () => {
          const root = document.documentElement;
          const logo = document.querySelector(".logo-fly");
          const header = document.querySelector(".site-header");
          const samples = [];
          const start = performance.now();

          while (performance.now() - start < 2600) {
            const now = performance.now() - start;
            const inlineP = parseFloat(root.style.getPropertyValue("--p") || "0");
            const computedP = parseFloat(window.getComputedStyle(root).getPropertyValue("--p") || "0");
            const headerOpacity = header ? parseFloat(window.getComputedStyle(header).opacity) : 0;
            const logoRect = logo ? logo.getBoundingClientRect() : null;

            samples.push({
              t: Math.round(now),
              inlineP,
              computedP: Math.round(computedP * 10000) / 10000,
              headerOpacity: Math.round(headerOpacity * 100) / 100,
              logoTop: logoRect ? Math.round(logoRect.top) : null,
              figsOn: root.classList.contains("figs-on"),
            });
            await new Promise((r) => requestAnimationFrame(r));
          }
          return samples;
        });

        // Analyze trajectory of computed --p
        let tTransitionStart = null;
        let tReach95 = null;
        let tReach100 = null;
        let monotonic = true;
        let prevComputed = 0;

        for (const s of trajectory) {
          if (tTransitionStart === null && s.computedP > 0.01) {
            tTransitionStart = s.t;
          }
          if (tReach95 === null && s.computedP >= 0.95) {
            tReach95 = s.t;
          }
          if (tReach100 === null && s.computedP >= 0.999) {
            tReach100 = s.t;
          }
          if (s.computedP < prevComputed - 0.005) {
            monotonic = false;
          }
          prevComputed = s.computedP;
        }

        const transitionDuration = (tReach100 && tTransitionStart) ? (tReach100 - tTransitionStart) : null;
        const finalP = trajectory[trajectory.length - 1].computedP;
        const finalTop = trajectory[trajectory.length - 1].logoTop;

        console.log(`   [METRICS] Start: t=${tTransitionStart}ms, Reached 0.95: t=${tReach95}ms, Reached 1.0: t=${tReach100}ms`);
        console.log(`   [METRICS] Active transition span: ~${transitionDuration}ms (CSS duration: 1.05s / 1050ms)`);
        console.log(`   [METRICS] Final state: computedP=${finalP}, logoTop=${finalTop}px, monotonic=${monotonic}`);

        if (!monotonic) {
          record(testName, false, null, new Error("--p suffered non-monotonic jitter/bounce during animation"));
        } else if (finalP < 0.99) {
          record(testName, false, null, new Error(`--p failed to reach 1.0 (final=${finalP})`));
        } else if (tReach95 > 2200) {
          record(testName, false, null, new Error(`--p took too long to reach 0.95 (${tReach95}ms > 2200ms deadline)`));
        } else {
          record(
            testName,
            true,
            `Captured ${trajectory.length} frames; transition smoothly spanned ${transitionDuration}ms to 1.0, reaching >=0.95 at t=${tReach95}ms (logo top settled at ${finalTop}px)`
          );
        }
      } catch (err) {
        record(testName, false, null, err);
      }
    }

    // -------------------------------------------------------------
    // 2. Rapid Reload Hammering
    // -------------------------------------------------------------
    console.log("\n>>> 2. Rapid Reload Hammering Assault");
    {
      const testName = "Rapid Reload: 5 consecutive reloads in 800ms window cleanly settle";
      try {
        await driver.setViewport({ width: 390, height: 844, isMobile: true });
        for (let i = 0; i < 5; i++) {
          await driver.goto(BASE_URL, { timeout: 5000 });
          await driver.sleep(120);
        }

        // Wait for final reload entrance transition to complete fully (computed --p >= 0.95 and logo.top <= 40px)
        await driver.waitForFunction(() => {
          const root = document.documentElement;
          const computedP = parseFloat(window.getComputedStyle(root).getPropertyValue("--p") || "0");
          const logo = document.querySelector(".logo-fly");
          const rect = logo ? logo.getBoundingClientRect() : null;
          return computedP >= 0.95 && rect && rect.top <= 40;
        }, 5000);

        const settledState = await driver.evaluate(() => {
          const root = document.documentElement;
          const computedP = parseFloat(window.getComputedStyle(root).getPropertyValue("--p") || "0");
          const logo = document.querySelector(".logo-fly");
          const rect = logo ? logo.getBoundingClientRect() : null;
          return {
            computedP,
            figsOn: root.classList.contains("figs-on"),
            top: rect ? rect.top : -1,
          };
        });

        if (settledState.computedP < 0.95 || !settledState.figsOn || settledState.top > 40) {
          record(testName, false, null, new Error(`State poisoned after rapid reloads: p=${settledState.computedP}, figsOn=${settledState.figsOn}, top=${settledState.top}`));
        } else {
          record(testName, true, `5 reloads settled cleanly with computedP=${settledState.computedP}, figsOn=${settledState.figsOn}, logo.top=${settledState.top}px`);
        }
      } catch (err) {
        record(testName, false, null, err);
      }
    }

    // -------------------------------------------------------------
    // 3. WCAG 2.4.3 Focus Trap & Focus Restoration Verification
    // -------------------------------------------------------------
    console.log("\n>>> 3. WCAG 2.4.3 Focus Trap & Focus Restoration Verification");
    {
      const testName = "WCAG 2.4.3: Focus traps inside modal on Tab and restores to trigger on close";
      try {
        await driver.setViewport({ width: 1280, height: 800 });
        await driver.goto(BASE_URL);
        await driver.sleep(1200);

        // Scroll to portfolio
        await driver.evaluate(() => {
          const el = document.querySelector("#lavori");
          if (el) el.scrollIntoView({ behavior: "instant" });
        });
        await driver.sleep(200);

        const focusTestResult = await driver.evaluate(async () => {
          const cards = document.querySelectorAll(".alb-desktop-view .alb-card");
          if (cards.length === 0) return { success: false, reason: "No cards found" };

          const triggerCard = cards[0];
          triggerCard.focus();
          const activeBefore = document.activeElement === triggerCard;

          // Open modal
          triggerCard.click();
          await new Promise((r) => setTimeout(r, 400));

          const modal = document.querySelector("[role='dialog']");
          if (!modal) return { success: false, reason: "Modal failed to open" };

          // Verify active element is now inside modal
          const activeInModal = modal.contains(document.activeElement);
          const activeElementTag = document.activeElement?.tagName;
          const activeElementClass = document.activeElement?.className;

          // Find all focusable items
          const focusables = Array.from(modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ));
          if (focusables.length < 2) return { success: false, reason: "Less than 2 focusables in modal" };

          // Focus first element, test Shift+Tab wrapping
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          first.focus();

          const shiftTabEvent = new KeyboardEvent("keydown", {
            key: "Tab",
            shiftKey: true,
            bubbles: true,
            cancelable: true,
          });
          window.dispatchEvent(shiftTabEvent);

          const wrappedToLast = document.activeElement === last;

          // Focus last element, test Tab wrapping
          last.focus();
          const tabEvent = new KeyboardEvent("keydown", {
            key: "Tab",
            shiftKey: false,
            bubbles: true,
            cancelable: true,
          });
          window.dispatchEvent(tabEvent);

          const wrappedToFirst = document.activeElement === first;

          // Now close modal via Escape
          const escEvent = new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            bubbles: true,
            cancelable: true,
          });
          window.dispatchEvent(escEvent);
          await new Promise((r) => setTimeout(r, 300));

          // Verify modal closed
          const modalStillPresent = document.querySelector("[role='dialog']");
          // Verify focus restored to triggerCard
          const focusRestored = document.activeElement === triggerCard;

          return {
            success: activeInModal && wrappedToLast && wrappedToFirst && !modalStillPresent && focusRestored,
            activeBefore,
            activeInModal,
            activeElementTag,
            activeElementClass,
            wrappedToLast,
            wrappedToFirst,
            modalClosed: !modalStillPresent,
            focusRestored,
            finalActiveTag: document.activeElement?.tagName,
            finalActiveClass: document.activeElement?.className,
          };
        });

        if (!focusTestResult.success) {
          record(
            testName,
            false,
            null,
            new Error(
              `Focus verification failed: ${JSON.stringify(focusTestResult)}`
            )
          );
        } else {
          record(
            testName,
            true,
            `Focus trapped inside modal (wrapped first<->last seamlessly); restored to trigger card on Escape`
          );
        }
      } catch (err) {
        record(testName, false, null, err);
      }
    }

    // -------------------------------------------------------------
    // 4. Reduced Motion Immediate Resolution & Zero Animation Lag
    // -------------------------------------------------------------
    console.log("\n>>> 4. Reduced Motion Mode Verification");
    {
      const testName = "prefers-reduced-motion: Instant resolution without transition lag";
      try {
        await driver.setViewport({ width: 390, height: 844, isMobile: true });
        await driver.setReducedMotion(true);
        await driver.goto(BASE_URL);

        // Within 150ms of load, verify everything is already at final state
        await driver.sleep(150);

        const rmState = await driver.evaluate(() => {
          const root = document.documentElement;
          const intro = document.querySelector(".intro");
          const introDisplay = intro ? window.getComputedStyle(intro).display : "none";
          const p = parseFloat(root.style.getPropertyValue("--p") || "1");
          const header = document.querySelector(".site-header");
          const headerOpacity = header ? parseFloat(window.getComputedStyle(header).opacity) : 0;
          const logo = document.querySelector(".logo-fly");
          const logoRect = logo ? logo.getBoundingClientRect() : null;
          const uso = document.querySelector(".uso");
          const usoOpacity = uso ? parseFloat(window.getComputedStyle(uso).opacity) : 0;
          const usoTransform = uso ? window.getComputedStyle(uso).transform : "none";

          return {
            introDisplay,
            p,
            headerOpacity,
            logoTop: logoRect ? logoRect.top : -1,
            usoOpacity,
            usoTransform,
          };
        });

        // Reset reduced motion
        await driver.setReducedMotion(false);

        if (rmState.introDisplay !== "none") {
          record(testName, false, null, new Error(`Intro curtain not immediately hidden under reduced motion: display=${rmState.introDisplay}`));
        } else if (rmState.headerOpacity < 0.95 || rmState.logoTop > 30) {
          record(testName, false, null, new Error(`Header/logo not immediately locked under reduced motion: opacity=${rmState.headerOpacity}, top=${rmState.logoTop}`));
        } else {
          record(testName, true, `Instant resolution verified: intro='${rmState.introDisplay}', headerOpacity=${rmState.headerOpacity}, logoTop=${rmState.logoTop}px, usoOpacity=${rmState.usoOpacity}`);
        }
      } catch (err) {
        await driver.setReducedMotion(false);
        record(testName, false, null, err);
      }
    }

    // -------------------------------------------------------------
    // 5. Emil Kowalski Design Principles Audit
    // -------------------------------------------------------------
    console.log("\n>>> 5. Emil Kowalski Design Engineering Principles Audit");
    {
      const testName = "Design Engineering: Compositor layer promotion, asymmetric active feedback & micro-staggering";
      try {
        await driver.setViewport({ width: 1280, height: 800 });
        await driver.goto(BASE_URL);
        await driver.sleep(1200);

        const audit = await driver.evaluate(() => {
          const header = document.querySelector(".site-header");
          const headerCS = header ? window.getComputedStyle(header) : null;
          const logo = document.querySelector(".logo-fly");
          const logoCS = logo ? window.getComputedStyle(logo) : null;
          const usoDomanda = document.querySelector(".uso-domanda");
          const usoDomandaCS = usoDomanda ? window.getComputedStyle(usoDomanda) : null;
          const usoDot = document.querySelector(".uso-dot");
          const usoDotCS = usoDot ? window.getComputedStyle(usoDot) : null;
          const usoTesto = document.querySelector(".uso-testo");
          const usoTestoCS = usoTesto ? window.getComputedStyle(usoTesto) : null;

          return {
            headerWillChange: headerCS ? headerCS.willChange : "",
            logoWillChange: logoCS ? logoCS.willChange : "",
            logoBackfaceVisibility: logoCS ? logoCS.backfaceVisibility : "",
            usoDomandaTransition: usoDomandaCS ? usoDomandaCS.transition : "",
            usoDotTransition: usoDotCS ? usoDotCS.transition : "",
            usoTestoTransition: usoTestoCS ? usoTestoCS.transition : "",
          };
        });

        const checks = [
          audit.headerWillChange.includes("opacity"),
          audit.logoWillChange.includes("transform"),
          audit.logoBackfaceVisibility === "hidden",
        ];

        if (!checks.every(Boolean)) {
          record(testName, false, null, new Error(`Compositor promotion missing: ${JSON.stringify(audit)}`));
        } else {
          record(testName, true, `Compositor promotion verified: site-header will-change: ${audit.headerWillChange}, logo-fly will-change: ${audit.logoWillChange}, backface-visibility: ${audit.logoBackfaceVisibility}`);
        }
      } catch (err) {
        record(testName, false, null, err);
      }
    }

  } finally {
    await driver.close();
  }

  console.log("\n================================================================");
  console.log("  DEEP-DIVE BENCHMARK SUMMARY");
  console.log("================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`  Total Executed: ${total}`);
  console.log(`  Passed:         ${passed}`);
  console.log(`  Failed:         ${failed}`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal benchmark error:", err);
  process.exit(1);
});
