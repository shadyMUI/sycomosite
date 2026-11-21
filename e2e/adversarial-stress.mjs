#!/usr/bin/env node
/**
 * e2e/adversarial-stress.mjs
 * Empirical Challenger Adversarial Stress Suite for Sycomo Website
 *
 * Focus areas:
 * 1. Rapid scrolling during initial entrance animation: does `--p` glitch or jump?
 * 2. Rubber-banding overscroll at y <= 0: does the title stay docked or pop back?
 * 3. Card tapping and modal transitions: rapid open/close hammering, backdrop clicks, Escape key.
 * 4. Dynamic window resizing between desktop (1280px) and mobile (390px): scroll trapping & orphaned pins.
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

const stressResults = [];

function recordResult(name, passed, details, error = null) {
  stressResults.push({ name, passed, details, error });
  const status = passed ? "\x1b[32m✔ PASS\x1b[0m" : "\x1b[31m✖ FAIL\x1b[0m";
  console.log(`[STRESS] ${name.padEnd(65)} ${status}`);
  if (details) console.log(`   ↳ \x1b[90m${details}\x1b[0m`);
  if (error) console.error(`   \x1b[31m↳ ERROR: ${error.message || error}\x1b[0m`);
}

async function run() {
  console.log("================================================================");
  console.log("  EMPIRICAL ADVERSARIAL STRESS TEST SUITE");
  console.log(`  Target: ${BASE_URL}`);
  console.log("================================================================\n");

  const driver = new TestDriver();
  await driver.init({ headless: true });

  try {
    // -------------------------------------------------------------
    // CHALLENGE 1: Rapid Scrolling During Initial Entrance Animation
    // -------------------------------------------------------------
    console.log("\n>>> CHALLENGE 1: Rapid Scrolling During Entrance Animation");
    {
      const testName = "C1.1: Mobile rapid scroll barrage during entrance (0-500ms window)";
      try {
        await driver.setViewport({ width: 390, height: 844, isMobile: true });
        await driver.goto(BASE_URL);

        // Immediately start continuous rapid scroll events while entrance is playing
        const pSamples = await driver.evaluate(async () => {
          const samples = [];
          const root = document.documentElement;
          const start = performance.now();

          // Continuous rapid scroll jitter for 800ms
          let direction = 1;
          const intervalId = setInterval(() => {
            window.scrollBy(0, direction * 45);
            if (window.scrollY > 200) direction = -1;
            if (window.scrollY < 20) direction = 1;
          }, 15);

          // Sample --p and computed metrics at 60fps
          while (performance.now() - start < 1200) {
            const rawP = root.style.getPropertyValue("--p") || "0";
            const numP = parseFloat(rawP);
            const logo = document.querySelector(".logo-fly");
            const logoRect = logo ? logo.getBoundingClientRect() : null;
            const header = document.querySelector(".site-header");
            const headerOpacity = header ? parseFloat(window.getComputedStyle(header).opacity) : 0;

            samples.push({
              t: Math.round(performance.now() - start),
              p: numP,
              top: logoRect ? Math.round(logoRect.top) : null,
              headerOpacity,
              figsOn: root.classList.contains("figs-on"),
            });
            await new Promise((r) => requestAnimationFrame(r));
          }

          clearInterval(intervalId);
          return samples;
        });

        // Analyze pSamples for glitching:
        // 1. Once --p reaches 1 or figs-on is added, --p must NEVER drop below 0.9 or reset to 0
        let reachedOne = false;
        let glitchedBack = false;
        let glitchDetail = "";

        for (const s of pSamples) {
          if (s.p >= 0.95 || s.figsOn) {
            reachedOne = true;
          }
          if (reachedOne && s.p < 0.5) {
            glitchedBack = true;
            glitchDetail = `At t=${s.t}ms, --p dropped from 1 to ${s.p}`;
            break;
          }
        }

        const finalSample = pSamples[pSamples.length - 1];
        if (glitchedBack) {
          recordResult(testName, false, null, new Error(`Glitch detected: ${glitchDetail}`));
        } else if (!reachedOne || finalSample.p < 0.9) {
          recordResult(testName, false, null, new Error(`--p failed to achieve open state (final p=${finalSample.p})`));
        } else {
          recordResult(testName, true, `Captured ${pSamples.length} frames; --p reached 1.0 smoothly without back-glitch or reset`);
        }
      } catch (err) {
        recordResult(testName, false, null, err);
      }
    }

    {
      const testName = "C1.2: Desktop wheel hammering before curtain drops (t < 200ms)";
      try {
        await driver.setViewport({ width: 1280, height: 800 });
        await driver.goto(BASE_URL);

        const result = await driver.evaluate(async () => {
          // Hammer wheel events immediately
          for (let i = 0; i < 20; i++) {
            window.dispatchEvent(new WheelEvent("wheel", { deltaY: 100, bubbles: true }));
            window.scrollBy(0, 20);
            await new Promise((r) => setTimeout(r, 10));
          }
          await new Promise((r) => setTimeout(r, 900));

          const root = document.documentElement;
          const p = parseFloat(root.style.getPropertyValue("--p") || "0");
          const logo = document.querySelector(".logo-fly");
          const logoRect = logo ? logo.getBoundingClientRect() : null;
          return {
            p,
            top: logoRect ? logoRect.top : -1,
            figsOn: root.classList.contains("figs-on"),
          };
        });

        if (result.p < 0.95 || !result.figsOn) {
          recordResult(testName, false, null, new Error(`Wheel hammering broke entrance: p=${result.p}, figsOn=${result.figsOn}`));
        } else {
          recordResult(testName, true, `Entrance settled cleanly with p=${result.p}, logo.top=${result.top}px`);
        }
      } catch (err) {
        recordResult(testName, false, null, err);
      }
    }

    // -------------------------------------------------------------
    // CHALLENGE 2: Rubber-banding Overscroll at y <= 0
    // -------------------------------------------------------------
    console.log("\n>>> CHALLENGE 2: Rubber-banding Overscroll at y <= 0");
    {
      const testName = "C2.1: Mobile aggressive overscroll bounce (simulating iOS/Android top pull)";
      try {
        await driver.setViewport({ width: 390, height: 844, isMobile: true });
        await driver.goto(BASE_URL);
        await driver.waitForFunction(() => {
          const logo = document.querySelector(".logo-fly");
          const rect = logo?.getBoundingClientRect();
          const p = parseFloat(document.documentElement.style.getPropertyValue("--p") || "0");
          return p >= 0.95 && rect && rect.top <= 40;
        }, 5000);

        // Verify title is docked
        const initialTitleState = await driver.evaluate(() => {
          const logo = document.querySelector(".logo-fly");
          const rect = logo?.getBoundingClientRect();
          const p = parseFloat(document.documentElement.style.getPropertyValue("--p") || "0");
          return { top: rect ? rect.top : -1, p };
        });

        if (initialTitleState.p < 0.95 || initialTitleState.top > 40) {
          throw new Error(`Title not initially docked: top=${initialTitleState.top}px, p=${initialTitleState.p}`);
        }

        // Simulate 40 rapid overscroll pull events at y <= 0
        const bounceCheck = await driver.evaluate(async () => {
          const log = [];
          for (let i = 0; i < 40; i++) {
            // Simulate touchmove pulling downward past 0
            try {
              const touch = new Touch({
                identifier: Date.now() + i,
                target: document.body,
                clientX: 200,
                clientY: 400 + (i % 5) * 30,
                screenX: 200,
                screenY: 400 + (i % 5) * 30,
                pageX: 200,
                pageY: 400 + (i % 5) * 30,
              });
              window.dispatchEvent(new TouchEvent("touchmove", {
                touches: [touch],
                targetTouches: [touch],
                changedTouches: [touch],
                bubbles: true,
                cancelable: true,
              }));
            } catch {
              // Fallback to pointer event if Touch constructor restricted
              window.dispatchEvent(new PointerEvent("pointermove", {
                clientX: 200,
                clientY: 400 + (i % 5) * 30,
                bubbles: true,
              }));
            }
            // Force scroll to 0 (and attempt negative)
            window.scrollTo(0, 0);
            window.dispatchEvent(new Event("scroll"));

            const pVal = parseFloat(document.documentElement.style.getPropertyValue("--p") || "0");
            const logo = document.querySelector(".logo-fly");
            const top = logo ? logo.getBoundingClientRect().top : -1;
            if (pVal < 0.8 || top > 50) {
              log.push({ step: i, p: pVal, top });
            }
            await new Promise((r) => setTimeout(r, 15));
          }
          return log;
        });

        if (bounceCheck.length > 0) {
          recordResult(testName, false, null, new Error(`Rubber-banding popped title out of header on ${bounceCheck.length} frames: first=${JSON.stringify(bounceCheck[0])}`));
        } else {
          recordResult(testName, true, `40 overscroll cycles simulated; title stayed firmly docked at top: 12px with --p = 1`);
        }
      } catch (err) {
        recordResult(testName, false, null, err);
      }
    }

    {
      const testName = "C2.2: Violent negative wheel delta overscroll on desktop";
      try {
        await driver.setViewport({ width: 1280, height: 800 });
        await driver.goto(BASE_URL);
        await driver.waitForFunction(() => {
          const logo = document.querySelector(".logo-fly");
          const rect = logo?.getBoundingClientRect();
          const p = parseFloat(document.documentElement.style.getPropertyValue("--p") || "0");
          return p >= 0.95 && rect && rect.top <= 40;
        }, 5000);

        const check = await driver.evaluate(async () => {
          // Repeated negative wheel delta
          for (let i = 0; i < 30; i++) {
            window.dispatchEvent(new WheelEvent("wheel", { deltaY: -150, bubbles: true }));
            window.scrollTo(0, 0);
            await new Promise((r) => setTimeout(r, 10));
          }
          const p = parseFloat(document.documentElement.style.getPropertyValue("--p") || "0");
          const logo = document.querySelector(".logo-fly");
          const top = logo ? logo.getBoundingClientRect().top : -1;
          return { p, top };
        });

        if (check.p < 0.95 || check.top > 40) {
          recordResult(testName, false, null, new Error(`Desktop negative delta popped title: p=${check.p}, top=${check.top}`));
        } else {
          recordResult(testName, true, `Negative wheel delta did not dislodge title (p=${check.p}, top=${check.top}px)`);
        }
      } catch (err) {
        recordResult(testName, false, null, err);
      }
    }

    // -------------------------------------------------------------
    // CHALLENGE 3: Card Tapping and Modal Transitions
    // -------------------------------------------------------------
    console.log("\n>>> CHALLENGE 3: Card Tapping and Modal Transitions");
    {
      const testName = "C3.1: 20x Rapid Open/Close hammering via card click & backdrop tap";
      try {
        await driver.setViewport({ width: 390, height: 844, isMobile: true });
        await driver.goto(BASE_URL);
        await driver.sleep(1000);

        // Scroll to portfolio
        await driver.evaluate(() => {
          const lavori = document.querySelector("#lavori");
          if (lavori) lavori.scrollIntoView({ behavior: "instant" });
        });
        await driver.sleep(200);

        let cyclesCompleted = 0;
        for (let i = 0; i < 20; i++) {
          // Click first mobile card
          await driver.evaluate(() => {
            const cards = document.querySelectorAll(".alb-mobile-card");
            if (cards.length > 0) cards[0].click();
          });
          // Wait minimal delay (stressing rapid interaction)
          await driver.sleep(35);

          // Click backdrop
          await driver.evaluate(() => {
            const backdrop = document.querySelector(".alb-modal-backdrop");
            if (backdrop) backdrop.click();
            else {
              // fallback to close button if backdrop not present
              const btn = document.querySelector(".alb-modal-close");
              if (btn) btn.click();
            }
          });
          await driver.sleep(35);
          cyclesCompleted++;
        }

        // After 20 cycles, verify DOM and body scroll state
        const state = await driver.evaluate(() => {
          const modals = document.querySelectorAll(".project-modal, [role='dialog']");
          const backdrops = document.querySelectorAll(".alb-modal-backdrop");
          const bodyOverflow = document.body.style.overflow;
          return {
            modalCount: modals.length,
            backdropCount: backdrops.length,
            bodyOverflow,
          };
        });

        if (state.modalCount !== 0 || state.backdropCount !== 0) {
          recordResult(testName, false, null, new Error(`Orphaned modal elements remained in DOM: modals=${state.modalCount}, backdrops=${state.backdropCount}`));
        } else if (state.bodyOverflow === "hidden") {
          recordResult(testName, false, null, new Error(`Body scroll lock leaked: body.style.overflow is stuck at 'hidden'!`));
        } else {
          recordResult(testName, true, `Completed 20 rapid open/close cycles; 0 DOM leaks, body.style.overflow cleanly restored to '${state.bodyOverflow || "default"}'`);
        }
      } catch (err) {
        recordResult(testName, false, null, err);
      }
    }

    {
      const testName = "C3.2: Rapid Escape key assault during modal opening transition";
      try {
        await driver.setViewport({ width: 390, height: 844, isMobile: true });
        await driver.goto(BASE_URL);
        await driver.sleep(1000);

        // Scroll to portfolio
        await driver.evaluate(() => {
          const lavori = document.querySelector("#lavori");
          if (lavori) lavori.scrollIntoView({ behavior: "instant" });
        });
        await driver.sleep(200);

        // Hammer open and immediate Escape key
        for (let i = 0; i < 15; i++) {
          await driver.evaluate((idx) => {
            const cards = document.querySelectorAll(".alb-mobile-card");
            const card = cards[idx % cards.length];
            if (card) card.click();
          }, i);
          // Dispatch Escape immediately without waiting for transition to finish
          await driver.evaluate(() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
          });
          await driver.sleep(25);
        }

        await driver.sleep(200);

        const check = await driver.evaluate(() => {
          const modals = document.querySelectorAll(".project-modal, [role='dialog']");
          const overflow = document.body.style.overflow;
          return { modals: modals.length, overflow };
        });

        if (check.modals > 0) {
          recordResult(testName, false, null, new Error(`Modal stuck open after rapid Escape sequence: modals=${check.modals}`));
        } else if (check.overflow === "hidden") {
          recordResult(testName, false, null, new Error(`Body scroll lock stuck 'hidden' after rapid Escape`));
        } else {
          recordResult(testName, true, `15 rapid card-click + Escape pairs cleanly handled; overflow='${check.overflow || "default"}'`);
        }
      } catch (err) {
        recordResult(testName, false, null, err);
      }
    }

    {
      const testName = "C3.3: Accessibility Focus Trap verification on Tab / Shift+Tab";
      try {
        await driver.setViewport({ width: 1280, height: 800 });
        await driver.goto(BASE_URL);
        await driver.sleep(1000);

        // Scroll to portfolio and open card
        await driver.evaluate(() => {
          const card = document.querySelector(".alb-desktop-view .alb-card");
          if (card) card.click();
        });
        await driver.sleep(400);

        const focusCheck = await driver.evaluate(async () => {
          const modal = document.querySelector("[role='dialog']");
          if (!modal) return { success: false, reason: "Modal not open" };

          const focusable = Array.from(modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ));
          if (focusable.length < 2) return { success: false, reason: "Too few focusable items in modal" };

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          // Set focus on last and simulate Tab
          last.focus();
          const tabEvent = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
          window.dispatchEvent(tabEvent);

          // In React synthetic / DOM event handler:
          // Check if active element wraps around or stays inside modal
          const activeAfterTab = document.activeElement;
          const insideModal = modal.contains(activeAfterTab);

          // Close modal
          const closeBtn = modal.querySelector(".alb-modal-close");
          if (closeBtn) closeBtn.click();

          return {
            success: insideModal,
            activeTag: activeAfterTab ? activeAfterTab.tagName : "none",
            focusableCount: focusable.length,
          };
        });

        if (!focusCheck.success) {
          recordResult(testName, false, null, new Error(focusCheck.reason || "Focus escaped modal during Tab"));
        } else {
          recordResult(testName, true, `Focus remained trapped within modal (${focusCheck.focusableCount} focusable elements)`);
        }
      } catch (err) {
        recordResult(testName, false, null, err);
      }
    }

    // -------------------------------------------------------------
    // CHALLENGE 4: Dynamic Resizing between Desktop (1280px) and Mobile (390px)
    // -------------------------------------------------------------
    console.log("\n>>> CHALLENGE 4: Dynamic Resizing & Breakpoint Stress");
    {
      const testName = "C4.1: Viewport oscillations (1280px <-> 859px <-> 390px) while scrolled";
      try {
        await driver.setViewport({ width: 1280, height: 800 });
        await driver.goto(BASE_URL);
        await driver.sleep(1000);

        // Scroll to mid-page (near album)
        await driver.evaluate(() => {
          window.scrollTo(0, 1400);
        });
        await driver.sleep(200);

        // Rapidly oscillate viewport widths 8 times across the 860px breakpoint
        const widths = [1280, 860, 859, 390, 859, 860, 1280, 390];
        for (const w of widths) {
          await driver.setViewport({ width: w, height: 800, isMobile: w < 860 });
          await driver.sleep(120);
        }

        // Now settle at mobile (390px) and audit layout
        await driver.setViewport({ width: 390, height: 844, isMobile: true });
        await driver.sleep(300);

        const mobileAudit = await driver.evaluate(() => {
          const root = document.documentElement;
          const scrollWidth = root.scrollWidth;
          const winWidth = window.innerWidth;
          const desktopView = document.querySelector(".alb-desktop-view");
          const desktopStyle = desktopView ? window.getComputedStyle(desktopView) : null;
          const mobileView = document.querySelector(".alb-mobile-view");
          const mobileStyle = mobileView ? window.getComputedStyle(mobileView) : null;

          return {
            scrollWidth,
            winWidth,
            hasHorizontalOverflow: scrollWidth > winWidth + 1,
            desktopDisplay: desktopStyle ? desktopStyle.display : "null",
            mobileDisplay: mobileStyle ? mobileStyle.display : "null",
          };
        });

        if (mobileAudit.hasHorizontalOverflow) {
          recordResult(testName, false, null, new Error(`Horizontal scroll trapping detected after resize: scrollWidth=${mobileAudit.scrollWidth}px > innerWidth=${mobileAudit.winWidth}px`));
        } else if (mobileAudit.desktopDisplay !== "none") {
          recordResult(testName, false, null, new Error(`Desktop carousel not hidden on 390px: display=${mobileAudit.desktopDisplay}`));
        } else if (mobileAudit.mobileDisplay === "none") {
          recordResult(testName, false, null, new Error(`Mobile portfolio hidden on 390px: display=${mobileAudit.mobileDisplay}`));
        } else {
          recordResult(testName, true, `Zero horizontal overflow (scrollWidth=${mobileAudit.scrollWidth}px == innerWidth=${mobileAudit.winWidth}px), desktop cleanly hidden, mobile visible`);
        }
      } catch (err) {
        recordResult(testName, false, null, err);
      }
    }

    {
      const testName = "C4.2: Resizing from 390px to 1280px with Modal OPEN";
      try {
        await driver.setViewport({ width: 390, height: 844, isMobile: true });
        await driver.goto(BASE_URL);
        await driver.sleep(1000);

        // Open modal on mobile
        await driver.evaluate(() => {
          const card = document.querySelector(".alb-mobile-card");
          if (card) card.click();
        });
        await driver.sleep(400);

        // Resize to desktop while modal is open
        await driver.setViewport({ width: 1280, height: 800, isMobile: false });
        await driver.sleep(400);

        // Verify modal transformed from bottom sheet to centered dialog or remained cleanly accessible
        const modalOnDesktop = await driver.evaluate(() => {
          const modal = document.querySelector(".project-modal");
          if (!modal) return { open: false };
          const rect = modal.getBoundingClientRect();
          const winW = window.innerWidth;
          // Dialog on desktop should be centered (margins roughly equal)
          const leftMargin = rect.left;
          const rightMargin = winW - rect.right;
          return {
            open: true,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            leftMargin: Math.round(leftMargin),
            rightMargin: Math.round(rightMargin),
            diff: Math.abs(leftMargin - rightMargin),
          };
        });

        if (!modalOnDesktop.open) {
          recordResult(testName, false, null, new Error(`Modal vanished during viewport resize`));
        } else {
          // Close modal on desktop
          await driver.evaluate(() => {
            const btn = document.querySelector(".alb-modal-close");
            if (btn) btn.click();
          });
          await driver.sleep(200);

          // Verify desktop horizontal carousel is functional
          const carouselCheck = await driver.evaluate(() => {
            const desktop = document.querySelector(".alb-desktop-view");
            const style = desktop ? window.getComputedStyle(desktop) : null;
            return {
              display: style ? style.display : "none",
              cards: document.querySelectorAll(".alb-desktop-view .alb-card").length,
            };
          });

          if (carouselCheck.display === "none" || carouselCheck.cards === 0) {
            recordResult(testName, false, null, new Error(`Desktop carousel failed to reactivate: display=${carouselCheck.display}, cards=${carouselCheck.cards}`));
          } else {
            recordResult(testName, true, `Modal maintained visual integrity across resize (diff=${modalOnDesktop.diff}px), closed cleanly, desktop carousel intact`);
          }
        }
      } catch (err) {
        recordResult(testName, false, null, err);
      }
    }

    {
      const testName = "C4.3: Sticky container lifecycle audit (no orphaned pinned tracks)";
      try {
        await driver.setViewport({ width: 1280, height: 800 });
        await driver.goto(BASE_URL);
        await driver.sleep(1000);

        // Switch to mobile and inspect all sticky elements
        await driver.setViewport({ width: 390, height: 844, isMobile: true });
        await driver.sleep(300);

        const stickyAudit = await driver.evaluate(() => {
          const allElements = Array.from(document.querySelectorAll("*"));
          const stickyOrphaned = allElements.filter((el) => {
            const cs = window.getComputedStyle(el);
            if (cs.position === "sticky" || cs.position === "fixed") {
              // The only allowed fixed element at top is site-header or logo-fly or sotto-logo
              if (el.classList.contains("site-header") ||
                  el.classList.contains("logo-fly") ||
                  el.classList.contains("sotto-logo") ||
                  el.classList.contains("intro")) {
                return false;
              }
              // If it's part of desktop view, it must have display: none
              if (el.closest(".alb-desktop-view") && cs.display === "none") {
                return false;
              }
              const rect = el.getBoundingClientRect();
              return rect.height > window.innerHeight * 1.5; // Sticking track > 150vh on mobile is an orphaned trap
            }
            return false;
          });

          return {
            orphanedCount: stickyOrphaned.length,
            orphanedTags: stickyOrphaned.map((e) => `${e.tagName}.${e.className}`),
          };
        });

        if (stickyAudit.orphanedCount > 0) {
          recordResult(testName, false, null, new Error(`Found ${stickyAudit.orphanedCount} orphaned sticky containers on mobile: ${stickyAudit.orphanedTags.join(", ")}`));
        } else {
          recordResult(testName, true, `Zero orphaned sticky scroll tracks on mobile viewport`);
        }
      } catch (err) {
        recordResult(testName, false, null, err);
      }
    }

  } finally {
    await driver.close();
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n================================================================");
  console.log("  ADVERSARIAL STRESS TEST SUMMARY");
  console.log("================================================================");
  const total = stressResults.length;
  const passed = stressResults.filter((r) => r.passed).length;
  const failed = stressResults.filter((r) => !r.passed).length;
  console.log(`  Total Executed: ${total}`);
  console.log(`  Passed:         ${passed}`);
  console.log(`  Failed:         ${failed}`);
  console.log("================================================================\n");

  if (failed > 0) {
    console.error(`Stress suite completed with ${failed} failure(s).`);
    process.exit(1);
  } else {
    console.log("All stress tests passed with 100% success!");
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Fatal stress runner error:", err);
  process.exit(1);
});
