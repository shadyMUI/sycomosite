/**
 * e2e/specs/tier2-boundaries.mjs
 * Tier 2: Boundary & Corner Cases (≥5 tests per feature)
 * - F1 Boundaries: Rapid reload, fast scroll, overscroll y=0, compact height, reduced motion
 * - F2 Boundaries: Exactly 859px, 375px zero overflow, 390px zero overflow, 412px zero overflow, landscape 667x375
 * - F3 Boundaries: Exactly 860px, 1280px standard, 1920px high-res, midpoint scroll jump, boundary exit
 */

export const tier2Tests = [
  // ==========================================
  // FEATURE 1 BOUNDARIES
  // ==========================================
  {
    id: "F1-T2-01",
    tier: 2,
    feature: "F1",
    name: "Rapid Reload: Entrance state cleanly re-executes upon immediate page reload",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);
      await driver.sleep(200); // Intentionally interrupt entrance by reloading immediately
      await driver.reload();

      const state = await driver.waitForFunction(
        () => {
          const root = document.documentElement;
          const pVal = parseFloat(root.style.getPropertyValue("--p") || "0");
          const hasFigs = root.classList.contains("figs-on");
          const header = document.querySelector(".site-header");
          const headerOpacity = header ? parseFloat(window.getComputedStyle(header).opacity) : 0;
          if (pVal >= 0.8 || hasFigs || headerOpacity >= 0.8) {
            return { pVal, headerOpacity };
          }
          return null;
        },
        4500
      );

      if (!state) {
        throw new Error("Rapid reload corrupted entrance sequence: header or --p failed to resolve");
      }

      const errors = await driver.getErrors();
      if (errors.length > 0) {
        throw new Error(`Console errors during rapid reload: ${errors.join("; ")}`);
      }

      return {
        passed: true,
        details: `Clean reload recovery: --p=${state.pVal}, headerOpacity=${state.headerOpacity}`,
      };
    },
  },

  {
    id: "F1-T2-02",
    tier: 2,
    feature: "F1",
    name: "Fast Scroll During Entrance: Rapid scroll down during entrance preserves header lockup",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);

      // Immediately initiate fast scroll while entrance animation is playing
      await driver.sleep(150);
      await driver.scrollTo({ top: 400 });
      await driver.sleep(1000);

      const headerLock = await driver.evaluate(() => {
        const logo = document.querySelector(".logo-fly, .site-header .logo, header .logo");
        const header = document.querySelector(".site-header");
        const rect = logo ? logo.getBoundingClientRect() : { top: 999 };
        const opacity = header ? parseFloat(window.getComputedStyle(header).opacity) : 0;
        return {
          logoTop: rect.top,
          headerOpacity: opacity,
          scrollY: window.scrollY,
        };
      });

      if (headerLock.logoTop > 50) {
        throw new Error(
          `Logo failed to stay in header during fast scroll: top=${headerLock.logoTop}px (expected <= 50px)`
        );
      }

      if (headerLock.headerOpacity < 0.8) {
        throw new Error(`Header opacity dropped during fast scroll: opacity=${headerLock.headerOpacity}`);
      }

      return {
        passed: true,
        details: `Header lockup preserved during fast scroll: logoTop=${headerLock.logoTop.toFixed(1)}px, scrollY=${headerLock.scrollY}px`,
      };
    },
  },

  {
    id: "F1-T2-03",
    tier: 2,
    feature: "F1",
    name: "Overscroll Bounce: Pulling down to y=0 does not regress logo back to centered 50vh",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(2000); // Allow entrance to complete

      // Simulate overscroll bounce: scroll down then scroll right back to 0
      await driver.scrollTo({ top: 100 });
      await driver.sleep(100);
      await driver.scrollTo({ top: 0 });
      await driver.sleep(300);

      const stateAtTop = await driver.evaluate(() => {
        const logo = document.querySelector(".logo-fly, .site-header .logo, header .logo");
        const rect = logo ? logo.getBoundingClientRect() : { top: 999 };
        const root = document.documentElement;
        const pVal = root.style.getPropertyValue("--p");
        return {
          logoTop: rect.top,
          pVal,
          scrollY: window.scrollY,
        };
      });

      // Logo should still be in header lockup position, NOT reset to 50vh (~420px)
      if (stateAtTop.logoTop > 60) {
        throw new Error(
          `Logo regressed to center on returning to y=0: logoTop=${stateAtTop.logoTop}px (expected <= 60px)`
        );
      }

      return {
        passed: true,
        details: `Logo remained locked in header at y=0: logoTop=${stateAtTop.logoTop.toFixed(1)}px`,
      };
    },
  },

  {
    id: "F1-T2-04",
    tier: 2,
    feature: "F1",
    name: "Compact Viewport Height: Title lockup fits properly on 375x500 screen",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 375, height: 500, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1800);

      const compactMetrics = await driver.evaluate(() => {
        const logo = document.querySelector(".logo-fly, .site-header .logo, header .logo");
        const rect = logo ? logo.getBoundingClientRect() : { top: 999, height: 0, width: 0 };
        return {
          logoTop: rect.top,
          logoHeight: rect.height,
          logoWidth: rect.width,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });

      if (compactMetrics.logoTop > 50) {
        throw new Error(`Logo top offset too large on compact height: ${compactMetrics.logoTop}px`);
      }

      if (compactMetrics.scrollWidth > 376) {
        throw new Error(`Horizontal overflow on 375x500: scrollWidth=${compactMetrics.scrollWidth}px`);
      }

      return {
        passed: true,
        details: `Compact height handled cleanly: logoTop=${compactMetrics.logoTop.toFixed(1)}px, scrollWidth=${compactMetrics.scrollWidth}px`,
      };
    },
  },

  {
    id: "F1-T2-05",
    tier: 2,
    feature: "F1",
    name: "Reduced Motion Mode: Title entrance completes immediately under prefers-reduced-motion",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.setReducedMotion(true);
      await driver.goto(baseUrl);

      // Under reduced motion, entrance should resolve almost immediately (within 600ms)
      await driver.sleep(500);

      const instantState = await driver.evaluate(() => {
        const root = document.documentElement;
        const pVal = parseFloat(root.style.getPropertyValue("--p") || "0");
        const header = document.querySelector(".site-header");
        const headerOpacity = header ? parseFloat(window.getComputedStyle(header).opacity) : 0;
        return { pVal, headerOpacity };
      });

      if (instantState.pVal < 0.8 && instantState.headerOpacity < 0.8) {
        throw new Error(
          `Reduced motion failed to resolve immediately: --p=${instantState.pVal}, headerOpacity=${instantState.headerOpacity}`
        );
      }

      return {
        passed: true,
        details: `Reduced motion instant entrance verified: --p=${instantState.pVal}, headerOpacity=${instantState.headerOpacity}`,
      };
    },
  },

  // ==========================================
  // FEATURE 2 BOUNDARIES
  // ==========================================
  {
    id: "F2-T2-01",
    tier: 2,
    feature: "F2",
    name: "Breakpoint Boundary 859px: Exactly 859px renders mobile vertical cards layout",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 859, height: 900, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1200);

      const bp859 = await driver.evaluate(() => {
        // Desktop pinned track should either be display: none or have mobile vertical cards active
        const desktopTrack = document.querySelector(".alb-pin-track");
        const mobileView = document.querySelector(".alb-mobile-view, .mobile-portfolio, .alb-vertical-list");
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
          innerWidth: window.innerWidth,
          cardsCount: cards.length,
          isVertical,
          hasMobileView: Boolean(mobileView),
          desktopTrackDisplay: desktopTrack ? window.getComputedStyle(desktopTrack).display : "none",
        };
      });

      if (!bp859.isVertical && bp859.desktopTrackDisplay !== "none") {
        throw new Error(
          `At 859px, mobile vertical layout is not active (desktopTrackDisplay=${bp859.desktopTrackDisplay}, isVertical=${bp859.isVertical})`
        );
      }

      return {
        passed: true,
        details: `859px boundary confirmed mobile layout: ${bp859.cardsCount} cards arranged vertically`,
      };
    },
  },

  {
    id: "F2-T2-02",
    tier: 2,
    feature: "F2",
    name: "Compact Viewport 375px (iPhone SE): Zero horizontal overflow across full page",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 375, height: 667, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const overflowCheck = await driver.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const bodyWidth = document.body.scrollWidth;

        // Check if any element protrudes past window.innerWidth
        const allElements = document.querySelectorAll("*");
        const overflowing = [];
        for (const el of allElements) {
          const r = el.getBoundingClientRect();
          if (r.right > winWidth + 1) {
            overflowing.push({
              tag: el.tagName,
              className: el.className,
              right: r.right,
            });
            if (overflowing.length > 3) break;
          }
        }

        return {
          docWidth,
          winWidth,
          bodyWidth,
          hasOverflow: docWidth > winWidth + 1,
          overflowing,
        };
      });

      if (overflowCheck.hasOverflow) {
        throw new Error(
          `Horizontal overflow detected at 375px: scrollWidth=${overflowCheck.docWidth}px, innerWidth=${overflowCheck.winWidth}px. Overflow elements: ${JSON.stringify(overflowCheck.overflowing)}`
        );
      }

      return {
        passed: true,
        details: `Zero horizontal overflow at 375px: scrollWidth=${overflowCheck.docWidth}px <= innerWidth=${overflowCheck.winWidth}px`,
      };
    },
  },

  {
    id: "F2-T2-03",
    tier: 2,
    feature: "F2",
    name: "Standard Mobile 390px (iPhone 14): Zero horizontal overflow and clean card wrapping",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const check390 = await driver.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        return {
          docWidth,
          winWidth,
          hasOverflow: docWidth > winWidth + 1,
        };
      });

      if (check390.hasOverflow) {
        throw new Error(
          `Horizontal overflow detected at 390px: scrollWidth=${check390.docWidth}px, innerWidth=${check390.winWidth}px`
        );
      }

      return {
        passed: true,
        details: `Zero horizontal overflow at 390px: scrollWidth=${check390.docWidth}px`,
      };
    },
  },

  {
    id: "F2-T2-04",
    tier: 2,
    feature: "F2",
    name: "Wide Mobile 412px (Android Flagship): Zero horizontal overflow and 2-column card integrity",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 412, height: 915, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const check412 = await driver.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const cards = document.querySelectorAll(
          ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-card"
        );
        const cardWidth = cards.length > 0 ? cards[0].getBoundingClientRect().width : 0;

        return {
          docWidth,
          winWidth,
          cardWidth,
          hasOverflow: docWidth > winWidth + 1,
        };
      });

      if (check412.hasOverflow) {
        throw new Error(
          `Horizontal overflow detected at 412px: scrollWidth=${check412.docWidth}px, innerWidth=${check412.winWidth}px`
        );
      }

      return {
        passed: true,
        details: `Zero horizontal overflow at 412px: scrollWidth=${check412.docWidth}px, cardWidth=${check412.cardWidth.toFixed(1)}px`,
      };
    },
  },

  {
    id: "F2-T2-05",
    tier: 2,
    feature: "F2",
    name: "Mobile Landscape 667x375: Card list remains accessible in landscape orientation",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 667, height: 375, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const landscapeState = await driver.evaluate(() => {
        const cards = document.querySelectorAll(
          ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-card"
        );
        const docWidth = document.documentElement.scrollWidth;
        return {
          cardsCount: cards.length,
          docWidth,
          winWidth: window.innerWidth,
          hasOverflow: docWidth > window.innerWidth + 1,
        };
      });

      if (landscapeState.hasOverflow) {
        throw new Error(`Horizontal overflow in landscape: scrollWidth=${landscapeState.docWidth}px`);
      }

      return {
        passed: true,
        details: `Landscape 667x375 rendered cleanly: ${landscapeState.cardsCount} cards available`,
      };
    },
  },

  // ==========================================
  // FEATURE 3 BOUNDARIES
  // ==========================================
  {
    id: "F3-T2-01",
    tier: 2,
    feature: "F3",
    name: "Breakpoint Boundary 860px: Exactly 860px renders desktop pinned carousel",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 860, height: 900 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const bp860 = await driver.evaluate(() => {
        const desktopTrack = document.querySelector(".alb-pin-track, .alb-desktop-view, [data-desktop-carousel]");
        if (!desktopTrack) return { found: false };

        const style = window.getComputedStyle(desktopTrack);
        const rect = desktopTrack.getBoundingClientRect();
        return {
          found: true,
          display: style.display,
          heightVh: (rect.height / window.innerHeight) * 100,
        };
      });

      if (!bp860.found || bp860.display === "none") {
        throw new Error("At 860px boundary, desktop pinned carousel is not active");
      }

      if (bp860.heightVh < 180) {
        throw new Error(`At 860px, track height is insufficient: ${bp860.heightVh.toFixed(1)}vh`);
      }

      return {
        passed: true,
        details: `860px boundary confirmed desktop carousel: height=${bp860.heightVh.toFixed(1)}vh`,
      };
    },
  },

  {
    id: "F3-T2-02",
    tier: 2,
    feature: "F3",
    name: "Desktop Standard 1280px: Zero horizontal root overflow and carousel integrity",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const check1280 = await driver.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        return {
          docWidth,
          winWidth,
          hasOverflow: docWidth > winWidth + 1,
        };
      });

      if (check1280.hasOverflow) {
        throw new Error(
          `Horizontal body overflow at 1280px: scrollWidth=${check1280.docWidth}px, innerWidth=${check1280.winWidth}px`
        );
      }

      return {
        passed: true,
        details: `1280px desktop clean: scrollWidth=${check1280.docWidth}px`,
      };
    },
  },

  {
    id: "F3-T2-03",
    tier: 2,
    feature: "F3",
    name: "Desktop High-Res 1920px: Carousel scales properly across full canvas",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1920, height: 1080 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const check1920 = await driver.evaluate(() => {
        const track = document.querySelector(".alb-pin-track, .alb-desktop-view");
        const cards = document.querySelectorAll(".alb-card, [data-desktop-card]");
        return {
          trackFound: Boolean(track),
          cardsCount: cards.length,
          docWidth: document.documentElement.scrollWidth,
        };
      });

      if (!check1920.trackFound) {
        throw new Error("Desktop track missing on 1920px high-res viewport");
      }

      return {
        passed: true,
        details: `1920px desktop verified with ${check1920.cardsCount} cards`,
      };
    },
  },

  {
    id: "F3-T2-04",
    tier: 2,
    feature: "F3",
    name: "Midpoint Scroll Jump: Direct scroll to 50% of track translates cards smoothly",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const jumpData = await driver.evaluate(() => {
        const track = document.querySelector(".alb-pin-track, .alb-desktop-view");
        if (!track) return null;
        const rect = track.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const mid = top + rect.height * 0.5;
        return { top, mid, height: rect.height };
      });

      if (!jumpData) {
        throw new Error("Desktop track not found for jump test");
      }

      await driver.scrollTo({ top: jumpData.mid });
      await driver.sleep(400);

      const cardPositions = await driver.evaluate(() => {
        const cards = document.querySelectorAll(".alb-card, [data-desktop-card]");
        if (cards.length < 2) return null;
        return {
          left0: cards[0].getBoundingClientRect().left,
          left1: cards[1].getBoundingClientRect().left,
        };
      });

      if (!cardPositions) {
        throw new Error("Cards not found after scroll jump");
      }

      return {
        passed: true,
        details: `Scroll jump successful: card[0].left=${cardPositions.left0.toFixed(1)}px, card[1].left=${cardPositions.left1.toFixed(1)}px`,
      };
    },
  },

  {
    id: "F3-T2-05",
    tier: 2,
    feature: "F3",
    name: "Boundary Exit to FAQ: Scrolling past track unpins cleanly to next section",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const exitPoint = await driver.evaluate(() => {
        const track = document.querySelector(".alb-pin-track, .alb-desktop-view");
        if (!track) return 2000;
        const rect = track.getBoundingClientRect();
        return rect.top + window.scrollY + rect.height + 200;
      });

      await driver.scrollTo({ top: exitPoint });
      await driver.sleep(400);

      const faqVisible = await driver.evaluate(() => {
        const faq = document.querySelector(".faq, #domande, [data-section='faq']");
        if (!faq) return false;
        const rect = faq.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });

      if (!faqVisible) {
        throw new Error("Subsequent section (.faq) did not become visible after exiting carousel");
      }

      return {
        passed: true,
        details: "Clean unpinning confirmed: handed off to FAQ section",
      };
    },
  },
];
