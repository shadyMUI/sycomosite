#!/usr/bin/env node
/**
 * e2e/adversarial-layout.mjs
 * Empirical Adversarial Challenger 2 Test Harness
 *
 * Verifies responsive rendering, horizontal overflow, card dimensions,
 * thumbnail preview aspect ratios, text clamping, and layout integrity
 * across the complete spectrum of viewports:
 * - 320x568, 360x640, 375x667, 390x844, 412x915, 667x375 (landscape)
 * - 859x900 (boundary max mobile), 860x900 (boundary min desktop)
 * - 1280x800, 1440x900, 1920x1080, 2560x1440 (ultrawide)
 */

import { spawnSync } from "node:child_process";
import process from "node:process";

// Transparent WebSocket respawn if running on Node without global WebSocket
if (typeof WebSocket === "undefined") {
  const result = spawnSync(
    process.execPath,
    ["--experimental-websocket", ...process.execArgv, ...process.argv.slice(1)],
    { stdio: "inherit", env: process.env }
  );
  process.exit(result.status ?? 0);
}

import { TestDriver } from "./driver.mjs";

const VIEWPORTS = [
  // Ultra-compact mobile
  { name: "Ultra-compact mobile (iPhone 5/SE 1st)", width: 320, height: 568, isMobile: true },
  { name: "Small Android (Galaxy S5/legacy)", width: 360, height: 640, isMobile: true },
  { name: "Compact mobile (iPhone SE 2nd/3rd)", width: 375, height: 667, isMobile: true },
  // Standard modern mobile
  { name: "Standard mobile (iPhone 14/15)", width: 390, height: 844, isMobile: true },
  { name: "Wide mobile (Samsung S22 / Pixel)", width: 412, height: 915, isMobile: true },
  // Landscape mobile
  { name: "Mobile landscape (iPhone 667x375)", width: 667, height: 375, isMobile: true },
  // Breakpoint threshold boundaries
  { name: "Breakpoint max mobile (859px)", width: 859, height: 900, isMobile: true },
  { name: "Breakpoint min desktop (860px)", width: 860, height: 900, isMobile: false },
  // Desktop & ultrawide
  { name: "Desktop standard (1280x800)", width: 1280, height: 800, isMobile: false },
  { name: "Desktop 2K / MBP 15 (1440x900)", width: 1440, height: 900, isMobile: false },
  { name: "Desktop Full HD (1920x1080)", width: 1920, height: 1080, isMobile: false },
  { name: "Desktop Ultrawide / 4K (2560x1440)", width: 2560, height: 1440, isMobile: false },
];

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runAdversarialAudit() {
  console.log("================================================================");
  console.log("  EMPIRICAL ADVERSARIAL CHALLENGER 2: VIEWPORT & LAYOUT AUDIT");
  console.log("  Target:", BASE_URL);
  console.log("  Viewports to evaluate:", VIEWPORTS.length);
  console.log("================================================================\n");

  const driver = new TestDriver();
  await driver.init({ headless: true });

  const results = [];
  let totalFailures = 0;

  for (const vp of VIEWPORTS) {
    const isDesktop = vp.width >= 860;
    process.stdout.write(`Evaluating [${vp.width}x${vp.height}] ${vp.name}... `);

    try {
      await driver.setViewport(vp);
      await driver.goto(BASE_URL);
      // Settle
      await driver.sleep(1200);

      // 1. Measure horizontal overflow across full scroll cycle (top, mid, bottom)
      const scrollPositions = [0, 500, 1500, 3000];
      const overflowSamples = [];

      for (const y of scrollPositions) {
        await driver.scrollTo({ top: y });
        await driver.sleep(100);

        const sample = await driver.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const winW = window.innerWidth;
          const docW = doc.scrollWidth;
          const bodyW = body.scrollWidth;

          // Check if any visible element overflows the viewport horizontally
          const allElements = document.querySelectorAll("*");
          const offending = [];
          for (const el of allElements) {
            // Ignore script, style, head, etc.
            if (["SCRIPT", "STYLE", "NOSCRIPT", "HEAD", "META", "LINK"].includes(el.tagName)) continue;
            const style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) continue;

            const rect = el.getBoundingClientRect();
            // 1.5px subpixel tolerance
            if (rect.right > winW + 1.5 && rect.width > 0) {
              offending.push({
                tag: el.tagName,
                id: el.id,
                className: el.className,
                right: Math.round(rect.right),
                width: Math.round(rect.width),
              });
              if (offending.length >= 3) break;
            }
          }

          return {
            winW,
            docW,
            bodyW,
            scrollY: window.scrollY,
            hasOverflow: docW > winW + 1.5,
            offending,
          };
        });

        overflowSamples.push(sample);
      }

      // Check max overflow across all scroll positions
      const overflowFailure = overflowSamples.find((s) => s.hasOverflow);

      // 2. Measure layout structure & specific milestone requirements
      const layoutMetrics = await driver.evaluate(() => {
        const isDesk = window.innerWidth >= 860;
        const desktopTrack = document.querySelector(".alb-pin-track");
        const mobileView = document.querySelector(".alb-mobile-view, .mobile-portfolio, .alb-vertical-list");
        const mobileCards = document.querySelectorAll(".alb-mobile-card, .mobile-card, [data-mobile-card]");
        const desktopCards = document.querySelectorAll(".alb-pin-card, .alb-desktop-view .alb-card");

        const desktopTrackDisplay = desktopTrack ? window.getComputedStyle(desktopTrack).display : "none";
        const mobileViewDisplay = mobileView ? window.getComputedStyle(mobileView).display : "none";

        // Mobile Card inspection
        const cardDetails = [];
        let allStackedVertically = true;

        if (!isDesk && mobileCards.length > 0) {
          for (let i = 0; i < mobileCards.length; i++) {
            const card = mobileCards[i];
            const rect = card.getBoundingClientRect();
            const thumb = card.querySelector(".card-preview, .card-thumb, .alb-card-preview, .alb-thumb");
            const thumbRect = thumb ? thumb.getBoundingClientRect() : null;
            const desc = card.querySelector(".alb-m-card-desc, p");
            const descStyle = desc ? window.getComputedStyle(desc) : null;

            // Clamping style check
            const lineClamp = descStyle ? descStyle.webkitLineClamp : null;
            const boxOrient = descStyle ? descStyle.webkitBoxOrient : null;
            const overflow = descStyle ? descStyle.overflow : null;
            const descHeight = desc ? desc.getBoundingClientRect().height : 0;
            const descLineHeight = descStyle ? parseFloat(descStyle.lineHeight) : 16;
            const estimatedLines = descLineHeight > 0 ? Math.round(descHeight / descLineHeight) : 0;

            if (i > 0) {
              const prevRect = mobileCards[i - 1].getBoundingClientRect();
              // Card i top should be at or below card i-1 bottom (allow 2px margin/rounding)
              if (rect.top < prevRect.bottom - 4) {
                allStackedVertically = false;
              }
            }

            cardDetails.push({
              index: i,
              cardWidth: Math.round(rect.width),
              cardHeight: Math.round(rect.height),
              thumbWidth: thumbRect ? Math.round(thumbRect.width) : null,
              thumbHeight: thumbRect ? Math.round(thumbRect.height) : null,
              thumbAspectRatio: thumbRect && thumbRect.height > 0 ? (thumbRect.width / thumbRect.height).toFixed(2) : null,
              lineClamp,
              boxOrient,
              overflow,
              estimatedLines,
            });
          }
        }

        // Desktop Card inspection
        let desktopSideBySide = true;
        if (isDesk && desktopCards.length >= 2) {
          const r0 = desktopCards[0].getBoundingClientRect();
          const r1 = desktopCards[1].getBoundingClientRect();
          // In horizontal carousel, r1.left should be > r0.left
          desktopSideBySide = r1.left > r0.left;
        }

        return {
          desktopTrackDisplay,
          mobileViewDisplay,
          mobileCardsCount: mobileCards.length,
          desktopCardsCount: desktopCards.length,
          allStackedVertically,
          desktopSideBySide,
          cardDetails,
        };
      });

      // 3. Evaluate criteria
      const errors = [];
      if (overflowFailure) {
        errors.push(
          `Horizontal overflow detected at scrollY=${overflowFailure.scrollY}: doc.scrollWidth=${overflowFailure.docW}px > innerWidth=${overflowFailure.winW}px. Offending: ${JSON.stringify(overflowFailure.offending)}`
        );
      }

      if (isDesktop) {
        if (layoutMetrics.mobileViewDisplay !== "none") {
          errors.push(`On desktop (>=860px), .alb-mobile-view display is "${layoutMetrics.mobileViewDisplay}" (expected "none")`);
        }
        if (layoutMetrics.desktopTrackDisplay === "none") {
          errors.push(`On desktop (>=860px), .alb-pin-track is display: none`);
        }
        if (!layoutMetrics.desktopSideBySide) {
          errors.push(`On desktop (>=860px), cards are not arranged side-by-side horizontally`);
        }
      } else {
        if (layoutMetrics.desktopTrackDisplay !== "none") {
          errors.push(`On mobile (<860px), .alb-pin-track display is "${layoutMetrics.desktopTrackDisplay}" (expected "none")`);
        }
        if (layoutMetrics.mobileViewDisplay === "none") {
          errors.push(`On mobile (<860px), .alb-mobile-view is display: none`);
        }
        if (layoutMetrics.mobileCardsCount === 0) {
          errors.push(`On mobile (<860px), 0 mobile cards rendered`);
        }
        if (!layoutMetrics.allStackedVertically) {
          errors.push(`On mobile (<860px), cards are not stacked vertically in document flow`);
        }
        // Verify card dimensions and clamping on first card
        const c0 = layoutMetrics.cardDetails[0];
        if (c0) {
          if (c0.thumbWidth === null || c0.thumbWidth < 90 || c0.thumbWidth > 130) {
            errors.push(`Mobile thumbnail width unexpected: ${c0.thumbWidth}px (expected ~108px)`);
          }
          if (c0.lineClamp !== "2") {
            errors.push(`Mobile description -webkit-line-clamp is "${c0.lineClamp}" (expected "2")`);
          }
        }
      }

      const passed = errors.length === 0;
      if (passed) {
        console.log("✔ PASS");
      } else {
        console.log("✖ FAIL");
        for (const e of errors) {
          console.log(`    ↳ ${e}`);
        }
        totalFailures++;
      }

      results.push({
        viewport: vp,
        passed,
        errors,
        maxDocWidth: Math.max(...overflowSamples.map((s) => s.docW)),
        winWidth: vp.width,
        layoutMetrics,
      });
    } catch (err) {
      console.log("✖ ERROR:", err.message);
      totalFailures++;
      results.push({
        viewport: vp,
        passed: false,
        errors: [err.message],
      });
    }
  }

  // 4. Modal adversarial test across mobile (390px, 320px) and desktop (1280px)
  console.log("\nEvaluating ProjectDetailModal across viewports...");
  const modalViewports = [
    { width: 320, height: 568, isMobile: true, label: "320px ultra-compact" },
    { width: 390, height: 844, isMobile: true, label: "390px standard mobile" },
    { width: 1280, height: 800, isMobile: false, label: "1280px desktop" },
  ];

  for (const mvp of modalViewports) {
    process.stdout.write(`Testing modal at ${mvp.label}... `);
    try {
      await driver.setViewport(mvp);
      await driver.goto(BASE_URL);
      await driver.sleep(1200);

      // Find and click a card
      const cardSelector = mvp.isMobile
        ? ".alb-mobile-card, .mobile-card, [data-mobile-card]"
        : ".alb-pin-card, .alb-desktop-view .alb-card";

      await driver.waitForSelector(cardSelector, 3000);
      await driver.click(cardSelector);
      await driver.sleep(500);

      const modalMetrics = await driver.evaluate(() => {
        const modal = document.querySelector("[role='dialog'], .project-modal, .alb-modal");
        if (!modal) return null;
        const rect = modal.getBoundingClientRect();
        const style = window.getComputedStyle(modal);
        const winW = window.innerWidth;
        const bodyOverflow = window.getComputedStyle(document.body).overflow;

        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
          winW,
          bodyOverflow,
          isOverflowingRight: rect.right > winW + 1,
        };
      });

      if (!modalMetrics) {
        throw new Error("Modal element not found or not rendered after card click");
      }

      if (modalMetrics.isOverflowingRight) {
        throw new Error(`Modal overflows viewport to the right: right=${modalMetrics.right}px > winW=${modalMetrics.winW}px`);
      }

      // Close modal with Escape
      await driver.evaluate(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
      });
      await driver.sleep(400);

      const closed = await driver.evaluate(() => {
        const m = document.querySelector("[role='dialog'], .project-modal, .alb-modal");
        return !m;
      });

      if (!closed) {
        throw new Error("Modal failed to close on Escape key press");
      }

      console.log(`✔ PASS (width=${modalMetrics.width}px, bodyOverflow=${modalMetrics.bodyOverflow})`);
    } catch (err) {
      console.log(`✖ FAIL (${err.message})`);
      totalFailures++;
    }
  }

  await driver.newPage();

  import("node:fs").then((fs) => {
    fs.writeFileSync(
      "e2e/adversarial-layout-results.json",
      JSON.stringify({ results, totalFailures }, null, 2),
      "utf-8"
    );
  });

  console.log("\n================================================================");
  console.log("  ADVERSARIAL LAYOUT AUDIT SUMMARY");
  console.log("================================================================");
  console.log(`  Total Viewports Tested: ${VIEWPORTS.length}`);
  console.log(`  Modal Breakpoints Tested: ${modalViewports.length}`);
  console.log(`  Failures: ${totalFailures}`);
  console.log("================================================================");

  if (totalFailures > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAdversarialAudit().catch((err) => {
  console.error("Fatal audit execution failure:", err);
  process.exit(1);
});
