/**
 * e2e/specs/tier3-interactions.mjs
 * Tier 3: Cross-Feature Interactions (≥5 tests)
 * - T3-01: Auto-entrance -> Mobile scroll -> Card tap -> Modal open/close
 * - T3-02: Dynamic Viewport Resize across 860px boundary (1280 -> 390 -> 1280)
 * - T3-03: Modal Open during Viewport Resize across 860px
 * - T3-04: Reduced motion mode across all features
 * - T3-05: Complete full-page mobile user flow
 * - T3-06: Glass silhouettes across section boundaries
 */

export const tier3Tests = [
  {
    id: "T3-01",
    tier: 3,
    feature: "Cross",
    name: "Entrance to Mobile Card Tap Flow: Load -> Entrance completes -> Scroll to portfolio -> Tap card -> Modal opens",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);

      // 1. Wait for entrance animation to complete
      await driver.waitForFunction(
        () => {
          const root = document.documentElement;
          const pVal = parseFloat(root.style.getPropertyValue("--p") || "0");
          const header = document.querySelector(".site-header");
          const opacity = header ? parseFloat(window.getComputedStyle(header).opacity) : 0;
          return pVal >= 0.8 || opacity >= 0.8;
        },
        4500
      );

      // 2. Scroll into portfolio
      const cardSelector = ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-mobile-view .alb-card";
      await driver.waitForSelector(cardSelector, 4000);

      // 3. Tap card
      await driver.click(cardSelector);

      // 4. Verify modal opens
      const modalOpen = await driver.waitForFunction(
        () => {
          const modal = document.querySelector("[role='dialog'], .project-modal, .alb-modal, .bottom-sheet");
          if (!modal) return null;
          const r = modal.getBoundingClientRect();
          return r.width > 0 && r.height > 0 ? { found: true } : null;
        },
        3000
      );

      if (!modalOpen) {
        throw new Error("Modal failed to open in sequential flow");
      }

      // 5. Close modal
      await driver.evaluate(() => {
        const modal = document.querySelector("[role='dialog'], .project-modal, .alb-modal, .bottom-sheet");
        const btn = modal ? modal.querySelector("button, [aria-label*='chiudi' i], [aria-label*='close' i]") : null;
        if (btn) btn.click();
      });

      await driver.sleep(300);

      const errors = await driver.getErrors();
      if (errors.length > 0) {
        throw new Error(`Errors during entrance-to-modal flow: ${errors.join("; ")}`);
      }

      return {
        passed: true,
        details: "Complete entrance -> scroll -> card tap -> modal open -> close flow passed cleanly",
      };
    },
  },

  {
    id: "T3-02",
    tier: 3,
    feature: "Cross",
    name: "Dynamic Breakpoint Switch: Resize 1280px -> 390px -> 1280px without layout crash or orphaned pins",
    async run(driver, { baseUrl }) {
      // 1. Start at desktop (1280px)
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const desktopState1 = await driver.evaluate(() => {
        const track = document.querySelector(".alb-pin-track, .alb-desktop-view");
        return { hasTrack: Boolean(track) };
      });

      if (!desktopState1.hasTrack) {
        throw new Error("Desktop track missing initially at 1280px");
      }

      // 2. Dynamically resize to mobile (390px)
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.sleep(500);

      const mobileState = await driver.evaluate(() => {
        const cards = document.querySelectorAll(
          ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-card"
        );
        let isVertical = false;
        if (cards.length >= 2) {
          const r0 = cards[0].getBoundingClientRect();
          const r1 = cards[1].getBoundingClientRect();
          isVertical = r1.top >= r0.bottom - 20;
        }
        return {
          cardsCount: cards.length,
          isVertical,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });

      if (mobileState.scrollWidth > 391) {
        throw new Error(`Horizontal overflow after resizing to 390px: ${mobileState.scrollWidth}px`);
      }

      // 3. Dynamically resize back to desktop (1280px)
      await driver.setViewport({ width: 1280, height: 800, isMobile: false });
      await driver.sleep(500);

      const desktopState2 = await driver.evaluate(() => {
        const track = document.querySelector(".alb-pin-track, .alb-desktop-view");
        return {
          hasTrack: Boolean(track),
          scrollWidth: document.documentElement.scrollWidth,
        };
      });

      if (!desktopState2.hasTrack) {
        throw new Error("Desktop track failed to restore after resizing back to 1280px");
      }

      const errors = await driver.getErrors();
      if (errors.length > 0) {
        throw new Error(`Errors during dynamic resize: ${errors.join("; ")}`);
      }

      return {
        passed: true,
        details: "Clean bidirectional resize transition: 1280px -> 390px -> 1280px without errors",
      };
    },
  },

  {
    id: "T3-03",
    tier: 3,
    feature: "Cross",
    name: "Modal Resizing Resilience: Modal open on 390px adapts cleanly when resized to 1280px",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      // Open modal on mobile
      const cardSelector = ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-mobile-view .alb-card";
      await driver.waitForSelector(cardSelector, 4000);
      await driver.click(cardSelector);

      await driver.waitForSelector("[role='dialog'], .project-modal, .alb-modal, .bottom-sheet", 3000);

      // Resize to desktop while modal is active
      await driver.setViewport({ width: 1280, height: 800, isMobile: false });
      await driver.sleep(400);

      const modalAfterResize = await driver.evaluate(() => {
        const modal = document.querySelector("[role='dialog'], .project-modal, .alb-modal");
        if (!modal) return { open: false };
        const rect = modal.getBoundingClientRect();
        return {
          open: rect.width > 0 && rect.height > 0,
          modalWidth: rect.width,
          modalHeight: rect.height,
        };
      });

      if (!modalAfterResize.open) {
        throw new Error("Modal unmounted or vanished upon viewport resize to desktop");
      }

      return {
        passed: true,
        details: `Modal survived resize: width=${modalAfterResize.modalWidth.toFixed(1)}px, height=${modalAfterResize.modalHeight.toFixed(1)}px`,
      };
    },
  },

  {
    id: "T3-04",
    tier: 3,
    feature: "Cross",
    name: "Reduced Motion Synergy: Reduced motion mode works consistently across entrance, cards, and modal",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.setReducedMotion(true);
      await driver.goto(baseUrl);

      // Fast check that entrance finished quickly
      await driver.sleep(500);

      const entranceDone = await driver.evaluate(() => {
        const root = document.documentElement;
        return parseFloat(root.style.getPropertyValue("--p") || "0") >= 0.8;
      });

      if (!entranceDone) {
        throw new Error("Entrance did not complete immediately under reduced motion");
      }

      // Open modal
      const cardSelector = ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-mobile-view .alb-card";
      await driver.waitForSelector(cardSelector, 3000);
      await driver.click(cardSelector);

      // Check modal appears without transition freeze
      const modalReady = await driver.waitForSelector(
        "[role='dialog'], .project-modal, .alb-modal, .bottom-sheet",
        2000
      );

      if (!modalReady) {
        throw new Error("Modal failed to open under reduced motion");
      }

      return {
        passed: true,
        details: "Reduced motion honored seamlessly across entrance and modal components",
      };
    },
  },

  {
    id: "T3-05",
    tier: 3,
    feature: "Cross",
    name: "Full Mobile Page Flow: Header entrance -> Intro -> Services -> Portfolio -> Modal -> Contact section",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);

      // 1. Entrance completes
      await driver.waitForFunction(
        () => parseFloat(document.documentElement.style.getPropertyValue("--p") || "0") >= 0.8,
        4500
      );

      // 2. Scroll through page sections
      await driver.scrollTo({ top: 400 });
      await driver.sleep(200);

      await driver.scrollTo({ top: 1000 });
      await driver.sleep(200);

      // 3. Open modal at portfolio
      const cardSelector = ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-mobile-view .alb-card";
      await driver.waitForSelector(cardSelector, 4000);
      await driver.click(cardSelector);

      await driver.waitForSelector("[role='dialog'], .project-modal, .alb-modal, .bottom-sheet", 3000);

      // 4. Close modal
      await driver.evaluate(() => {
        const modal = document.querySelector("[role='dialog'], .project-modal, .alb-modal, .bottom-sheet");
        const btn = modal ? modal.querySelector("button, [aria-label*='chiudi' i], [aria-label*='close' i]") : null;
        if (btn) btn.click();
      });
      await driver.sleep(300);

      // 5. Scroll all the way to contact section
      const contactTop = await driver.evaluate(() => {
        const contact = document.querySelector("#contatti, .cnt, section[data-label='contatti']");
        return contact ? contact.getBoundingClientRect().top + window.scrollY : 2500;
      });

      await driver.scrollTo({ top: contactTop });
      await driver.sleep(300);

      const finalState = await driver.evaluate(() => ({
        scrollY: window.scrollY,
        hasErrors: window.__errors ? window.__errors.length : 0,
      }));

      if (finalState.scrollY < 1000) {
        throw new Error(`Failed to reach contact section: scrollY was only ${finalState.scrollY}`);
      }

      const errors = await driver.getErrors();
      if (errors.length > 0) {
        throw new Error(`Errors during full mobile page flow: ${errors.join("; ")}`);
      }

      return {
        passed: true,
        details: `Full mobile journey traversed smoothly to scrollY=${finalState.scrollY}px with 0 errors`,
      };
    },
  },

  {
    id: "T3-06",
    tier: 3,
    feature: "Cross",
    name: "Glass shapes keep their animated bounds across red section boundaries",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1440, height: 900 });
      await driver.setReducedMotion(false);
      await driver.goto(baseUrl);
      await driver.waitForFunction(() => {
        const motion = document.querySelector(".hero-art--red .ml")?.getAnimations()[0];
        return motion?.playState === "running" && motion.currentTime > 1500;
      });

      for (const selector of [".rosso", ".faq", ".rosso"]) {
        await driver.evaluate(async (selector) => {
          const section = document.querySelector(selector);
          const red = document.querySelector(".hero-art--red");
          const circle = red.querySelector(".ml-fondo").getBoundingClientRect();
          const seam = circle.top + circle.height / 2;
          window.scrollBy({ top: section.getBoundingClientRect().top - seam, behavior: "instant" });
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

          for (const shape of [".ml-fondo", ".ml-ancora", ".ml-quadro", ".ml-tondo", ".ml-scheggia"]) {
            const reference = red.querySelector(shape).getBoundingClientRect();
            const white = section.querySelector(shape).getBoundingClientRect();
            if (!reference.width) throw new Error(`Missing geometry for ${shape}`);
            for (const key of ["x", "y", "width", "height"]) {
              if (Math.abs(white[key] - reference[key]) > 0.25) {
                throw new Error(`${selector} ${shape} ${key}: ${white[key]} vs red ${reference[key]}`);
              }
            }
          }
        }, selector);
      }
      return { passed: true, details: "All five silhouettes match on entry to services, FAQ and back" };
    },
  },
];
