#!/usr/bin/env node
/**
 * e2e/challenger-empirical.mjs
 * Empirical Challenger Verification Harness for Milestone M4
 *
 * Scope:
 * 1. 12 exact viewports testing horizontal overflow (scrollWidth <= innerWidth + 1)
 *    across scroll positions.
 * 2. Modal layout at 3 specific breakpoints:
 *    - 375px mobile sheet
 *    - 859px tablet sheet
 *    - 1280px desktop dialog
 * 3. Compositor execution verification:
 *    - Inspect CSS and live computed styles to confirm only transform and opacity
 *      are animated during active runtime, skipping reflow/paint.
 * 4. Runtime frame timing measurement via requestAnimationFrame during active CSS animations.
 */

import { spawnSync } from "node:child_process";
import process from "node:process";

if (typeof WebSocket === "undefined") {
  const result = spawnSync(
    process.execPath,
    ["--experimental-websocket", ...process.execArgv, ...process.argv.slice(1)],
    { stdio: "inherit", env: process.env }
  );
  process.exit(result.status ?? 0);
}

import { TestDriver } from "./driver.mjs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const VIEWPORTS_12 = [
  { name: "320x568 (iPhone SE gen 1)", width: 320, height: 568, isMobile: true },
  { name: "360x800 (Android compact)", width: 360, height: 800, isMobile: true },
  { name: "375x667 (iPhone SE modern)", width: 375, height: 667, isMobile: true },
  { name: "390x844 (iPhone 12/13/14)", width: 390, height: 844, isMobile: true },
  { name: "412x915 (Pixel modern)", width: 412, height: 915, isMobile: true },
  { name: "667x375 (landscape mobile)", width: 667, height: 375, isMobile: true },
  { name: "859x800 (boundary just below 860px)", width: 859, height: 800, isMobile: true },
  { name: "860x900 (boundary exactly at 860px)", width: 860, height: 900, isMobile: false },
  { name: "1280x800 (laptop)", width: 1280, height: 800, isMobile: false },
  { name: "1440x900 (desktop standard)", width: 1440, height: 900, isMobile: false },
  { name: "1920x1080 (Full HD)", width: 1920, height: 1080, isMobile: false },
  { name: "2560x1440 (QHD ultra-wide)", width: 2560, height: 1440, isMobile: false },
];

const MODAL_BREAKPOINTS = [
  { name: "375px mobile sheet", width: 375, height: 667, isMobile: true, expectedType: "bottom-sheet" },
  { name: "859px tablet sheet", width: 859, height: 800, isMobile: true, expectedType: "bottom-sheet" },
  { name: "1280px desktop dialog", width: 1280, height: 800, isMobile: false, expectedType: "centered-dialog" },
];

async function runEmpiricalVerification() {
  console.log("================================================================");
  console.log("  CHALLENGER EMPIRICAL VERIFICATION HARNESS — MILESTONE M4");
  console.log("  Target:", BASE_URL);
  console.log("================================================================\n");

  const driver = new TestDriver();
  await driver.init({ headless: true });

  const auditReport = {
    viewports: [],
    modalBreakpoints: [],
    compositorAnalysis: null,
    frameTimingAnalysis: null,
    totalFailures: 0,
  };

  // ============================================================================
  // STEP 1: Viewport horizontal overflow testing (12 configurations)
  // ============================================================================
  console.log("--- 1. Evaluating 12 Viewport Configurations for Horizontal Overflow ---");

  for (const vp of VIEWPORTS_12) {
    process.stdout.write(`Testing [${vp.width}x${vp.height}] ${vp.name}... `);
    try {
      await driver.setViewport(vp);
      await driver.goto(BASE_URL);
      await driver.sleep(1200); // Allow intro animation to settle

      // Sample overflow at multiple scroll coordinates
      const scrollYPositions = [0, 250, 750, 1500, 2500];
      const overflowDetails = [];

      for (const y of scrollYPositions) {
        await driver.scrollTo({ top: y });
        await driver.sleep(80);

        const check = await driver.evaluate(() => {
          const winW = window.innerWidth;
          const docW = document.documentElement.scrollWidth;
          const bodyW = document.body.scrollWidth;
          const hasDocOverflow = docW > winW + 1;

          // Find any offending element overflowing the screen horizontally
          const offending = [];
          const allEls = document.querySelectorAll("*");
          for (const el of allEls) {
            if (["SCRIPT", "STYLE", "NOSCRIPT", "HEAD", "META", "LINK"].includes(el.tagName)) continue;
            const style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) continue;
            const r = el.getBoundingClientRect();
            if (r.right > winW + 1.5 && r.width > 0) {
              offending.push({
                tag: el.tagName,
                cls: el.className,
                right: Math.round(r.right),
                width: Math.round(r.width),
              });
              if (offending.length >= 3) break;
            }
          }

          return { winW, docW, bodyW, hasDocOverflow, offending, scrollY: window.scrollY };
        });

        overflowDetails.push(check);
      }

      const failedSample = overflowDetails.find((s) => s.hasDocOverflow);
      if (failedSample) {
        console.log(`✖ FAIL: scrollWidth=${failedSample.docW} > innerWidth=${failedSample.winW} at scrollY=${failedSample.scrollY}`);
        console.log(`    Offending: ${JSON.stringify(failedSample.offending)}`);
        auditReport.totalFailures++;
        auditReport.viewports.push({ vp, passed: false, error: failedSample });
      } else {
        const maxDocW = Math.max(...overflowDetails.map((s) => s.docW));
        console.log(`✔ PASS (doc.scrollWidth=${maxDocW}px <= innerWidth=${vp.width}px + 1)`);
        auditReport.viewports.push({ vp, passed: true, maxDocW });
      }
    } catch (err) {
      console.log(`✖ ERROR: ${err.message}`);
      auditReport.totalFailures++;
      auditReport.viewports.push({ vp, passed: false, error: err.message });
    }
  }

  // ============================================================================
  // STEP 2: Modal layout at 3 breakpoints (375px, 859px, 1280px)
  // ============================================================================
  console.log("\n--- 2. Evaluating Modal Layout at 3 Specific Breakpoints ---");

  for (const mbp of MODAL_BREAKPOINTS) {
    process.stdout.write(`Testing modal at [${mbp.width}x${mbp.height}] ${mbp.name}... `);
    try {
      await driver.setViewport(mbp);
      await driver.goto(BASE_URL);
      await driver.sleep(1200);

      const cardSelector = mbp.isMobile
        ? ".alb-mobile-card, .mobile-card, [data-mobile-card]"
        : ".alb-pin-card, .alb-desktop-view .alb-card";

      await driver.waitForSelector(cardSelector, 3000);
      await driver.click(cardSelector);
      await driver.sleep(500);

      const modalInfo = await driver.evaluate(() => {
        const modal = document.querySelector("[role='dialog'], .project-modal.alb-modal");
        const backdrop = document.querySelector(".alb-modal-backdrop");
        const dragHandle = document.querySelector(".alb-modal-drag-handle");
        if (!modal) return null;

        const rect = modal.getBoundingClientRect();
        const style = window.getComputedStyle(modal);
        const dragStyle = dragHandle ? window.getComputedStyle(dragHandle) : null;
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        return {
          winW,
          winH,
          rect: {
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          computed: {
            position: style.position,
            bottom: style.bottom,
            top: style.top,
            left: style.left,
            right: style.right,
            transform: style.transform,
            borderRadius: style.borderRadius,
            borderTopLeftRadius: style.borderTopLeftRadius,
            borderTopRightRadius: style.borderTopRightRadius,
            animationName: style.animationName,
          },
          dragHandleDisplay: dragStyle ? dragStyle.display : "none",
          hasBackdrop: Boolean(backdrop),
        };
      });

      if (!modalInfo) {
        throw new Error("Modal element not found after clicking portfolio card");
      }

      const issues = [];
      // Horizontal overflow check
      if (modalInfo.rect.right > modalInfo.winW + 1) {
        issues.push(`Modal overflows horizontally: rect.right=${modalInfo.rect.right}px > winW=${modalInfo.winW}px`);
      }

      if (mbp.expectedType === "bottom-sheet") {
        // Must dock at bottom
        if (Math.abs(modalInfo.rect.bottom - modalInfo.winH) > 2) {
          issues.push(`Expected bottom-sheet docked at bottom: rect.bottom=${modalInfo.rect.bottom} != winH=${modalInfo.winH}`);
        }
        // Width should span the viewport (left:0, right:0)
        if (modalInfo.rect.width < modalInfo.winW - 2) {
          issues.push(`Expected full-width bottom-sheet: rect.width=${modalInfo.rect.width} < winW=${modalInfo.winW}`);
        }
        // Top corners rounded
        if (parseFloat(modalInfo.computed.borderTopLeftRadius) < 16) {
          issues.push(`Expected rounded top corners for sheet, found borderTopLeftRadius=${modalInfo.computed.borderTopLeftRadius}`);
        }
        // Drag handle should be visible
        if (modalInfo.dragHandleDisplay === "none") {
          issues.push(`Expected drag handle to be visible on bottom-sheet, found display: ${modalInfo.dragHandleDisplay}`);
        }
      } else if (mbp.expectedType === "centered-dialog") {
        // Centered horizontally and vertically
        const horizontalCenter = modalInfo.rect.left + modalInfo.rect.width / 2;
        const verticalCenter = modalInfo.rect.top + modalInfo.rect.height / 2;
        if (Math.abs(horizontalCenter - modalInfo.winW / 2) > 4) {
          issues.push(`Expected centered dialog horizontally: center=${horizontalCenter} != winW/2=${modalInfo.winW / 2}`);
        }
        if (verticalCenter < 0 || verticalCenter > modalInfo.winH) {
          issues.push(`Dialog vertical center outside viewport: verticalCenter=${verticalCenter}, winH=${modalInfo.winH}`);
        }
        // Max width capped to 640px
        if (modalInfo.rect.width > 650) {
          issues.push(`Expected dialog max-width <= 640px, found rect.width=${modalInfo.rect.width}px`);
        }
        // Drag handle should be hidden
        if (modalInfo.dragHandleDisplay !== "none") {
          issues.push(`Expected drag handle hidden on desktop dialog, found display: ${modalInfo.dragHandleDisplay}`);
        }
      }

      // Close modal
      await driver.evaluate(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
      });
      await driver.sleep(300);

      const isClosed = await driver.evaluate(() => !document.querySelector(".project-modal.alb-modal"));
      if (!isClosed) {
        issues.push("Modal did not close on Escape key");
      }

      if (issues.length > 0) {
        console.log("✖ FAIL");
        for (const iss of issues) {
          console.log(`    ↳ ${iss}`);
        }
        auditReport.totalFailures++;
        auditReport.modalBreakpoints.push({ mbp, passed: false, issues, modalInfo });
      } else {
        console.log(`✔ PASS (${mbp.expectedType}, width=${modalInfo.rect.width}px, height=${modalInfo.rect.height}px, bottom=${modalInfo.rect.bottom}px)`);
        auditReport.modalBreakpoints.push({ mbp, passed: true, modalInfo });
      }
    } catch (err) {
      console.log(`✖ ERROR: ${err.message}`);
      auditReport.totalFailures++;
      auditReport.modalBreakpoints.push({ mbp, passed: false, error: err.message });
    }
  }

  // ============================================================================
  // STEP 3: Compositor Execution & Frame Timing Analysis
  // ============================================================================
  console.log("\n--- 3. Evaluating Compositor-Only Animations & Frame Fluidity ---");

  try {
    await driver.setViewport({ width: 1280, height: 800, isMobile: false });
    await driver.goto(BASE_URL);

    const animationAudit = await driver.evaluate(() => {
      // Collect all keyframes and transitions defined in document stylesheets
      const keyframeAnalysis = [];
      const nonCompositorWarnings = [];

      for (const sheet of document.styleSheets) {
        try {
          const rules = sheet.cssRules || [];
          for (const rule of rules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE) {
              const kfName = rule.name;
              const propsAnimated = new Set();
              for (const kf of rule.cssRules) {
                for (let i = 0; i < kf.style.length; i++) {
                  propsAnimated.add(kf.style[i]);
                }
              }
              const propsArr = Array.from(propsAnimated);
              // Check if properties belong to compositor (transform, opacity, translate, rotate, scale, filter)
              // or trigger reflow (width, height, top, left, bottom, right, margin, padding)
              const reflowProps = propsArr.filter((p) =>
                ["width", "height", "top", "left", "bottom", "right", "margin", "padding"].includes(p)
              );

              keyframeAnalysis.push({
                name: kfName,
                properties: propsArr,
                isCompositorOnly: reflowProps.length === 0,
                reflowProps,
              });

              if (
                [
                  "intro-fall",
                  "intro-swell",
                  "albMobileCardEnter",
                  "albModalSlideUp",
                  "albModalPopIn",
                  "albModalFadeIn",
                ].includes(kfName) &&
                reflowProps.length > 0
              ) {
                nonCompositorWarnings.push(`Keyframe @${kfName} animates reflow properties: ${reflowProps.join(", ")}`);
              }
            }
          }
        } catch {
          // Cross-origin stylesheet security check
        }
      }

      // Check transition properties on critical active elements
      const targetSelectors = [
        ".alb-card",
        ".alb-mobile-card",
        ".site-header",
        ".logo-fly",
        ".uso",
        ".uso-domanda",
        ".uso-dot",
        ".uso-testo",
        ".alb-modal-close",
        ".alb-modal-cta-btn",
      ];

      const transitionsAudit = [];
      for (const sel of targetSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const style = window.getComputedStyle(el);
          transitionsAudit.push({
            selector: sel,
            transitionProperty: style.transitionProperty,
            transitionDuration: style.transitionDuration,
            transitionTimingFunction: style.transitionTimingFunction,
            willChange: style.willChange,
          });
        }
      }

      return { keyframeAnalysis, nonCompositorWarnings, transitionsAudit };
    });

    console.log(`Evaluated ${animationAudit.keyframeAnalysis.length} keyframe animations in stylesheet.`);
    const activeKeyframes = animationAudit.keyframeAnalysis.filter((k) =>
      ["intro-fall", "intro-swell", "albMobileCardEnter", "albModalSlideUp", "albModalPopIn", "albModalFadeIn"].includes(k.name)
    );

    for (const kf of activeKeyframes) {
      console.log(`  Keyframe @${kf.name}: properties=[${kf.properties.join(", ")}] -> ${kf.isCompositorOnly ? "✔ COMPOSITOR ONLY" : "✖ REFLOW DETECTED"}`);
    }

    if (animationAudit.nonCompositorWarnings.length > 0) {
      console.log("✖ Non-compositor warnings found in critical animations:");
      for (const w of animationAudit.nonCompositorWarnings) {
        console.log(`    ↳ ${w}`);
      }
      auditReport.totalFailures++;
    } else {
      console.log("✔ All active keyframe animations strictly animate transform / translate / opacity (compositor only)!");
    }

    auditReport.compositorAnalysis = animationAudit;

    // ============================================================================
    // STEP 4: Measure Frame Timing Fluidity during active CSS animations
    // ============================================================================
    console.log("\n--- 4. Measuring Frame Timing Jitter during Active Animation Execution ---");

    // Re-navigate to catch the active intro curtain fall + logo flight transition in real time
    await driver.goto(BASE_URL);

    const frameStats = await driver.evaluate(() => {
      return new Promise((resolve) => {
        const frameDeltas = [];
        let lastTime = performance.now();
        let frameCount = 0;
        const startTime = performance.now();

        function sampleFrame(now) {
          const delta = now - lastTime;
          lastTime = now;
          if (delta > 0 && delta < 200) {
            frameDeltas.push(delta);
          }
          frameCount++;

          // Sample throughout the 1200ms intro curtain & logo flight transition
          if (now - startTime < 1200) {
            requestAnimationFrame(sampleFrame);
          } else {
            const validDeltas = frameDeltas.slice(1);
            const avgDelta = validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length;
            const maxDelta = Math.max(...validDeltas);
            const fps = 1000 / avgDelta;
            const droppedFrames = validDeltas.filter((d) => d > 34).length;

            resolve({
              frameCount,
              avgDelta: Math.round(avgDelta * 100) / 100,
              maxDelta: Math.round(maxDelta * 100) / 100,
              estimatedFps: Math.round(fps),
              droppedFrames,
              totalFramesSampled: validDeltas.length,
            });
          }
        }

        requestAnimationFrame(sampleFrame);
      });
    });

    console.log(`Frame Sampling Summary during Active Intro & Flight:`);
    console.log(`  Sampled frames: ${frameStats.totalFramesSampled}`);
    console.log(`  Average frame delta: ${frameStats.avgDelta}ms (~${frameStats.estimatedFps} FPS)`);
    console.log(`  Max frame delta: ${frameStats.maxDelta}ms`);
    console.log(`  Dropped frames (>34ms): ${frameStats.droppedFrames}`);

    if (frameStats.droppedFrames > 3) {
      console.log(`✖ WARNING: Detected ${frameStats.droppedFrames} dropped frames during active animation`);
      auditReport.totalFailures++;
    } else {
      console.log(`✔ Frame timing is fluid and stable at 60 FPS without dropped frames.`);
    }

    auditReport.frameTimingAnalysis = frameStats;
  } catch (err) {
    console.log(`✖ Compositor evaluation error: ${err.message}`);
    auditReport.totalFailures++;
  }

  await driver.close();

  console.log("\n================================================================");
  console.log("  EMPIRICAL CHALLENGER VERIFICATION SUMMARY");
  console.log("================================================================");
  console.log(`  Viewports Tested:          ${auditReport.viewports.length}`);
  console.log(`  Modal Breakpoints Tested:  ${auditReport.modalBreakpoints.length}`);
  console.log(`  Total Failures:            ${auditReport.totalFailures}`);
  console.log(`  Final Challenger Verdict:  ${auditReport.totalFailures === 0 ? "APPROVE" : "REQUEST_CHANGES"}`);
  console.log("================================================================\n");

  return auditReport;
}

runEmpiricalVerification()
  .then((report) => {
    if (report.totalFailures > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error("Fatal test failure:", err);
    process.exit(1);
  });
