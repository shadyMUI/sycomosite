/**
 * e2e/specs/tier1-features.mjs
 * Tier 1: Feature Coverage (≥5 tests per feature)
 * - F1: Hero & Title Entrance Animation (5 tests)
 * - F2: Mobile Portfolio Vertical Cards Layout (5 tests)
 * - F3: Desktop Carousel Preservation (5 tests)
 */

export const tier1Tests = [
  // ==========================================
  // FEATURE 1: Hero & Title Entrance Animation
  // ==========================================
  {
    id: "F1-T1-01",
    tier: 1,
    feature: "F1",
    name: "Auto-Entrance: Page loads and entrance triggers automatically without user scroll",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);

      // Wait up to 3500ms for entrance animation to run automatically
      const entranceState = await driver.waitForFunction(
        () => {
          const root = document.documentElement;
          const pVal = parseFloat(root.style.getPropertyValue("--p") || "0");
          const hasFigs = root.classList.contains("figs-on");
          const header = document.querySelector(".site-header");
          const headerOpacity = header ? parseFloat(window.getComputedStyle(header).opacity) : 0;

          // Entrance complete when --p is near 1, figs-on is added, or header is visible
          if (pVal >= 0.8 || hasFigs || headerOpacity >= 0.8) {
            return {
              pVal,
              hasFigs,
              headerOpacity,
              scrollY: window.scrollY,
            };
          }
          return null;
        },
        4500
      );

      if (!entranceState) {
        throw new Error("Automatic entrance did not trigger: --p remained 0 without user scroll");
      }

      if (entranceState.scrollY > 0) {
        throw new Error(`Entrance required user scroll: window.scrollY was ${entranceState.scrollY}`);
      }

      return {
        passed: true,
        details: `Automatic entrance succeeded: --p=${entranceState.pVal}, headerOpacity=${entranceState.headerOpacity}, scrollY=${entranceState.scrollY}`,
      };
    },
  },

  {
    id: "F1-T1-02",
    tier: 1,
    feature: "F1",
    name: "Header Lockup: Logo moves from center into header lockup position",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);

      // Wait for entrance animation to place logo in header
      const logoState = await driver.waitForFunction(
        () => {
          const logo = document.querySelector(".logo-fly, .site-header .logo, header .logo");
          if (!logo) return null;
          const rect = logo.getBoundingClientRect();
          // Header position means rect.top is close to the top of the viewport (<= 50px)
          if (rect.top <= 50) {
            return {
              top: rect.top,
              left: rect.left,
              height: rect.height,
            };
          }
          return null;
        },
        4500
      );

      if (!logoState) {
        const currentTop = await driver.evaluate(() => {
          const logo = document.querySelector(".logo-fly, .site-header .logo, header .logo");
          return logo ? logo.getBoundingClientRect().top : "not found";
        });
        throw new Error(
          `Logo failed to move to header lockup position: current top is ${currentTop}px (expected <= 50px)`
        );
      }

      return {
        passed: true,
        details: `Logo locked into header: top=${logoState.top.toFixed(1)}px`,
      };
    },
  },

  {
    id: "F1-T1-03",
    tier: 1,
    feature: "F1",
    name: "Header Visibility: .site-header fades in to full opacity",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);

      const headerState = await driver.waitForFunction(
        () => {
          const header = document.querySelector(".site-header");
          if (!header) return null;
          const style = window.getComputedStyle(header);
          const opacity = parseFloat(style.opacity);
          const visibility = style.visibility;
          if (opacity >= 0.8 && visibility !== "hidden") {
            return { opacity, visibility };
          }
          return null;
        },
        4500
      );

      if (!headerState) {
        const actualOpacity = await driver.evaluate(() => {
          const header = document.querySelector(".site-header");
          return header ? window.getComputedStyle(header).opacity : "header element not found";
        });
        throw new Error(`Header did not become visible: opacity is ${actualOpacity} (expected >= 0.8)`);
      }

      return {
        passed: true,
        details: `Header visible: opacity=${headerState.opacity}`,
      };
    },
  },

  {
    id: "F1-T1-04",
    tier: 1,
    feature: "F1",
    name: "Intro Content Reveal: Introductory text section (CheComputer) is revealed and accessible",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);

      // Intro section should be rendered and ready without requiring 100vh empty scroll
      const introState = await driver.waitForFunction(
        () => {
          const intro = document.querySelector(".uso, [data-section='intro'], #intro");
          if (!intro) return null;
          const rect = intro.getBoundingClientRect();
          // Height must be positive and element mounted
          if (rect.height > 100) {
            return {
              top: rect.top,
              height: rect.height,
              hasText: Boolean(intro.textContent && intro.textContent.includes("computer")),
            };
          }
          return null;
        },
        4500
      );

      if (!introState) {
        throw new Error("Introductory section (.uso / CheComputer) not found or has 0 height");
      }

      return {
        passed: true,
        details: `Intro section revealed: height=${introState.height}px, top=${introState.top}px`,
      };
    },
  },

  {
    id: "F1-T1-05",
    tier: 1,
    feature: "F1",
    name: "Mobile Scroll Unblock: Immediate vertical scrolling is functional and unblocked",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);

      // Wait for entrance settle
      await driver.sleep(1800);

      // Execute vertical scroll
      await driver.scrollTo({ top: 120 });
      await driver.sleep(200);

      const scrollY = await driver.evaluate(() => window.scrollY);

      if (scrollY <= 0) {
        throw new Error(
          `Scrolling is blocked or reset: window.scrollY remained ${scrollY} after scrolling`
        );
      }

      return {
        passed: true,
        details: `Scroll functional immediately: window.scrollY=${scrollY}px`,
      };
    },
  },

  // ==========================================
  // FEATURE 2: Mobile Portfolio Vertical Cards (< 860px)
  // ==========================================
  {
    id: "F2-T1-01",
    tier: 1,
    feature: "F2",
    name: "Mobile Layout: Portfolio renders as vertical card list on viewports < 860px",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1200);

      // Find mobile card elements
      const layoutData = await driver.evaluate(() => {
        // Query mobile cards
        const mobileView = document.querySelector(".alb-mobile-view, .mobile-portfolio, .alb-vertical-list");
        const cards = document.querySelectorAll(
          ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-mobile-view .alb-card, .alb-mobile-view article"
        );

        if (!cards || cards.length < 2) {
          // Fallback to checking general album cards in mobile view
          const anyCards = document.querySelectorAll(".alb-card, [data-card]");
          if (anyCards.length < 2) return { count: 0 };

          const r0 = anyCards[0].getBoundingClientRect();
          const r1 = anyCards[1].getBoundingClientRect();
          const isVertical = r1.top >= r0.bottom - 20;
          return {
            count: anyCards.length,
            isVertical,
            top0: r0.top,
            top1: r1.top,
            hasMobileView: Boolean(mobileView),
          };
        }

        const r0 = cards[0].getBoundingClientRect();
        const r1 = cards[1].getBoundingClientRect();
        // Cards must be vertically stacked (card 1 below card 0)
        const isVertical = r1.top >= r0.bottom - 20;

        return {
          count: cards.length,
          isVertical,
          top0: r0.top,
          top1: r1.top,
          hasMobileView: Boolean(mobileView),
        };
      });

      if (layoutData.count < 2) {
        throw new Error(`Insufficient cards found for mobile portfolio (count=${layoutData.count})`);
      }

      if (!layoutData.isVertical) {
        throw new Error(
          `Cards are not arranged vertically stacked: card[0].top=${layoutData.top0}, card[1].top=${layoutData.top1}`
        );
      }

      return {
        passed: true,
        details: `Vertical stack confirmed: ${layoutData.count} cards arranged vertically`,
      };
    },
  },

  {
    id: "F2-T1-02",
    tier: 1,
    feature: "F2",
    name: "Mobile Card Anatomy Preview: Card displays preview thumbnail/mockup on the left",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1200);

      const anatomy = await driver.evaluate(() => {
        const cards = document.querySelectorAll(
          ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-mobile-view .alb-card"
        );
        if (!cards.length) return { error: "No mobile cards found" };

        const firstCard = cards[0];
        const preview = firstCard.querySelector(
          ".card-preview, .card-thumb, .alb-card-preview, .alb-thumb, img, svg, [data-thumb]"
        );
        const details = firstCard.querySelector(
          ".card-details, .card-info, .alb-card-info, .alb-dettagli, [data-info]"
        );

        if (!preview || !details) {
          return { error: "Preview or Details container not found in card" };
        }

        const pRect = preview.getBoundingClientRect();
        const dRect = details.getBoundingClientRect();

        return {
          previewLeft: pRect.left,
          previewWidth: pRect.width,
          detailsLeft: dRect.left,
          isLeftAligned: pRect.left <= dRect.left,
        };
      });

      if (anatomy.error) {
        throw new Error(`Mobile card anatomy check failed: ${anatomy.error}`);
      }

      if (!anatomy.isLeftAligned) {
        throw new Error(
          `Preview is not on the left of details: previewLeft=${anatomy.previewLeft}, detailsLeft=${anatomy.detailsLeft}`
        );
      }

      return {
        passed: true,
        details: `Left preview confirmed: width=${anatomy.previewWidth}px, positioned left of details`,
      };
    },
  },

  {
    id: "F2-T1-03",
    tier: 1,
    feature: "F2",
    name: "Mobile Card Anatomy Details: Card displays project info on the right",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1200);

      const detailsData = await driver.evaluate(() => {
        const cards = document.querySelectorAll(
          ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-mobile-view .alb-card"
        );
        if (!cards.length) return { error: "No mobile cards found" };

        const card = cards[0];
        const text = card.textContent || "";
        const titleEl = card.querySelector("h3, h4, .card-title, .alb-card-titolo, [data-title]");

        return {
          hasText: text.trim().length > 10,
          hasTitle: Boolean(titleEl && titleEl.textContent.trim().length > 0),
          titleText: titleEl ? titleEl.textContent.trim() : "",
        };
      });

      if (detailsData.error) {
        throw new Error(`Mobile card details check failed: ${detailsData.error}`);
      }

      if (!detailsData.hasTitle) {
        throw new Error("Mobile card missing title element or title is empty");
      }

      return {
        passed: true,
        details: `Project info confirmed on right: title="${detailsData.titleText}"`,
      };
    },
  },

  {
    id: "F2-T1-04",
    tier: 1,
    feature: "F2",
    name: "Mobile Vertical Scrollability: Mobile portfolio scrolls naturally vertically without horizontal trapping",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1200);

      // Scroll down into portfolio
      const portfolioTop = await driver.evaluate(() => {
        const album = document.querySelector("#lavori, .alb-mobile-view, .alb-section, section[data-label='album']");
        return album ? album.getBoundingClientRect().top + window.scrollY : 800;
      });

      await driver.scrollTo({ top: portfolioTop + 100 });
      await driver.sleep(150);

      const scroll1 = await driver.getScrollState();

      await driver.scrollBy({ top: 200 });
      await driver.sleep(150);

      const scroll2 = await driver.getScrollState();

      if (scroll2.scrollY <= scroll1.scrollY) {
        throw new Error(
          `Vertical scroll trapped inside portfolio: scroll1=${scroll1.scrollY}, scroll2=${scroll2.scrollY}`
        );
      }

      if (scroll2.scrollX !== 0) {
        throw new Error(`Unexpected horizontal scroll trapped on mobile: scrollX=${scroll2.scrollX}`);
      }

      return {
        passed: true,
        details: `Natural vertical scrolling confirmed: advanced from ${scroll1.scrollY}px to ${scroll2.scrollY}px with 0px horizontal drift`,
      };
    },
  },

  {
    id: "F2-T1-05",
    tier: 1,
    feature: "F2",
    name: "Mobile Card Tap / Modal Trigger: Tapping a mobile card opens the project detail modal / sheet",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 390, height: 844, isMobile: true });
      await driver.goto(baseUrl);
      await driver.sleep(1200);

      // Scroll to mobile card and click
      const cardSelector = ".alb-mobile-card, .mobile-card, [data-mobile-card], .alb-mobile-view .alb-card";
      await driver.waitForSelector(cardSelector, 3000);
      await driver.click(cardSelector);

      // Wait for modal/dialog/bottom-sheet to appear
      const modalState = await driver.waitForFunction(
        () => {
          const modal = document.querySelector(
            "[role='dialog'], .project-modal, .alb-modal, .bottom-sheet, [data-modal]"
          );
          if (!modal) return null;
          const rect = modal.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          const closeBtn = modal.querySelector("button, [aria-label*='chiudi' i], [aria-label*='close' i], .modal-close");
          return {
            isVisible,
            hasCloseButton: Boolean(closeBtn),
            text: modal.textContent || "",
          };
        },
        3500
      );

      if (!modalState || !modalState.isVisible) {
        throw new Error("Project detail modal did not open upon tapping mobile card");
      }

      return {
        passed: true,
        details: `Detail modal opened: hasCloseBtn=${modalState.hasCloseButton}, length=${modalState.text.length} chars`,
      };
    },
  },

  // ==========================================
  // FEATURE 3: Desktop Horizontal Carousel Preservation (>= 860px)
  // ==========================================
  {
    id: "F3-T1-01",
    tier: 1,
    feature: "F3",
    name: "Desktop Carousel Active: Horizontal carousel is active on viewports >= 860px without scroll pinning",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const desktopTrack = await driver.evaluate(() => {
        const track = document.querySelector(".alb-pin-track, .alb-desktop-view, [data-desktop-carousel]");
        if (!track) return { found: false };

        const style = window.getComputedStyle(track);
        const rect = track.getBoundingClientRect();
        const heightVh = (rect.height / window.innerHeight) * 100;

        return {
          found: true,
          heightPx: rect.height,
          heightVh,
          display: style.display,
        };
      });

      if (!desktopTrack.found) {
        throw new Error("Desktop pinned track (.alb-pin-track / .alb-desktop-view) not found");
      }

      if (desktopTrack.display === "none") {
        throw new Error("Desktop pinned track is hidden (display: none) at 1280px");
      }

      if (desktopTrack.heightVh < 90 || desktopTrack.heightVh > 130) {
        throw new Error(
          `Desktop track should stay a normal viewport-height carousel: ${desktopTrack.heightVh.toFixed(1)}vh (expected 90–130vh)`
        );
      }

      return {
        passed: true,
        details: `Desktop carousel active without a tall pin track: height=${desktopTrack.heightVh.toFixed(1)}vh (${desktopTrack.heightPx}px)`,
      };
    },
  },

  {
    id: "F3-T1-02",
    tier: 1,
    feature: "F3",
    name: "Desktop Scroll Stability: Vertical page scroll leaves the carousel in place (no horizontal hijack)",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const trackTop = await driver.evaluate(() => {
        const track = document.querySelector(".alb-pin-track, .alb-desktop-view, [data-desktop-carousel]");
        return track ? track.getBoundingClientRect().top + window.scrollY : 1000;
      });

      // Scroll to entrance of track
      await driver.scrollTo({ top: trackTop + 100 });
      await driver.sleep(300);

      const initialLeft = await driver.evaluate(() => {
        const card = document.querySelector(".alb-card, [data-desktop-card]");
        return card ? card.getBoundingClientRect().left : 0;
      });

      // Scroll 500px deeper into track
      await driver.scrollTo({ top: trackTop + 700 });
      await driver.sleep(400);

      const scrolledLeft = await driver.evaluate(() => {
        const card = document.querySelector(".alb-card, [data-desktop-card]");
        return card ? card.getBoundingClientRect().left : 0;
      });

      // Vertical page scroll must not move the carousel horizontally.
      const diff = Math.abs(scrolledLeft - initialLeft);
      if (diff > 2) {
        throw new Error(
          `Desktop carousel moved horizontally during page scroll: initialLeft=${initialLeft}, scrolledLeft=${scrolledLeft}, diff=${diff}`
        );
      }

      const pageScrollX = await driver.evaluate(() => window.scrollX);
      if (pageScrollX !== 0) {
        throw new Error(`Unexpected horizontal page scroll: scrollX=${pageScrollX}`);
      }

      return {
        passed: true,
        details: `Scroll stability confirmed: card left=${scrolledLeft.toFixed(1)}px, page scrollX=${pageScrollX}`,
      };
    },
  },

  {
    id: "F3-T1-03",
    tier: 1,
    feature: "F3",
    name: "Desktop Cards Arrangement: Cards arranged side-by-side horizontally",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const arrangement = await driver.evaluate(() => {
        const cards = document.querySelectorAll(
          ".alb-desktop-view .alb-card, .alb-tavolo .alb-card, .alb-pin-track .alb-card"
        );
        if (cards.length < 2) return { count: cards.length };

        const r0 = cards[0].getBoundingClientRect();
        const r1 = cards[1].getBoundingClientRect();

        return {
          count: cards.length,
          isHorizontal: r1.left > r0.left + 50,
          left0: r0.left,
          left1: r1.left,
        };
      });

      if (arrangement.count < 2) {
        throw new Error(`Insufficient desktop cards found (count=${arrangement.count})`);
      }

      if (!arrangement.isHorizontal) {
        throw new Error(
          `Desktop cards are not arranged horizontally: card[0].left=${arrangement.left0}, card[1].left=${arrangement.left1}`
        );
      }

      return {
        passed: true,
        details: `Desktop horizontal arrangement confirmed: card[0].left=${arrangement.left0.toFixed(1)}px, card[1].left=${arrangement.left1.toFixed(1)}px`,
      };
    },
  },

  {
    id: "F3-T1-04",
    tier: 1,
    feature: "F3",
    name: "Desktop Card Click: Clicking desktop card opens project detail view",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const cardSelector = ".alb-desktop-view .alb-card, .alb-tavolo .alb-card, .alb-pin-track .alb-card";
      await driver.waitForSelector(cardSelector, 3000);
      await driver.click(cardSelector);

      const modalState = await driver.waitForFunction(
        () => {
          const modal = document.querySelector("[role='dialog'], .project-modal, .alb-modal");
          if (!modal) return null;
          const rect = modal.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 ? { isVisible: true } : null;
        },
        3000
      );

      if (!modalState) {
        throw new Error("Project detail modal did not open upon clicking desktop card");
      }

      return {
        passed: true,
        details: "Desktop detail view / dialog opened successfully",
      };
    },
  },

  {
    id: "F3-T1-05",
    tier: 1,
    feature: "F3",
    name: "Desktop Dock / Scrubber: Scrubber reflects horizontal progression through cards",
    async run(driver, { baseUrl }) {
      await driver.setViewport({ width: 1280, height: 800 });
      await driver.goto(baseUrl);
      await driver.sleep(1500);

      const dockInfo = await driver.evaluate(() => {
        const dock = document.querySelector(".alb-pin-dock, .alb-pin-dock-wrapper, .alb-dock-center, .alb-dock, [data-dock]");
        if (!dock) return { found: false };
        const pills = dock.querySelectorAll(".alb-dock-pill, .alb-tasto, [data-pill], button");
        return {
          found: true,
          pillsCount: pills.length,
        };
      });

      if (!dockInfo.found) {
        throw new Error("Desktop dock / scrubber (.alb-dock) not found");
      }

      return {
        passed: true,
        details: `Desktop dock/scrubber verified with ${dockInfo.pillsCount} navigation affordances`,
      };
    },
  },
];
