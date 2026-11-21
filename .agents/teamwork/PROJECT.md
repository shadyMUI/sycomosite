# Project: Sycomo Production Website Enhancement (Mobile Title & Portfolio Redesign)

## Architecture
- **Framework**: Next.js 16.2.10 (App Router + Turbopack), React 19.2.4, TypeScript 5, Tailwind CSS v4.
- **Styling & Animation**: CSS variables with `@property --p` for GPU-accelerated transition, custom RAF lerp loop for desktop horizontal carousel, zero GSAP dependency.
- **Responsive Boundary**: Universal project-wide breakpoint at `860px`.
  - Mobile / Touch (< 860px): Document-flow vertical cards, bottom-sheet project detail modal, natural thumb scrolling, zero scroll pinning.
  - Desktop (>= 860px): Pinned full-screen 380vh horizontal carousel, multi-layer parallax, 3D tilt sheen, centered project dialog.
- **Hero & Intro**: Automatic page-load entrance animation coordinating with `IntroCurtain` to transition `--p` from 0 to 1, revealing header and introductory text without requiring scroll interaction, eliminating sticky dead-zone.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Automatic Page-Load Title Entrance | Automatic entrance animation on page load (desktop & mobile) animating `.logo-fly` into `.site-header` without user scroll | M1 | R1 |
| 2 | Header & Intro Text Reveal | Fade in `.site-header` and reveal introductory section (`CheComputer`) in optimal position on load | M1 | R1 |
| 3 | Mobile Scroll Unblocking | Remove the 100vh scroll-track dead zone and rubber-band `y <= 4` reset to allow immediate natural scrolling | M1 | R1 |
| 4 | Mobile Portfolio Vertical Card List | On <860px, render a natural vertical stack of cards replacing horizontal pinned carousel | M2 | R2 |
| 5 | Mobile Card 2-Column Anatomy | Left thumbnail (image or miniature digital/hardware chassis), right project information (title, category/client, description, metric, tap affordance) | M2 | R2 |
| 6 | Project Detail Modal / Bottom Sheet | Accessible Liquid-Glass modal (bottom sheet on mobile, dialog on desktop) triggered on card tap | M2 | R2 |
| 7 | Desktop Horizontal Carousel Preservation | On >=860px, preserve existing full-screen 380vh horizontal pinned carousel experience intact | M2 | R3 |
| 8 | Responsive Transition & Lifecycle Management | Clean breakpoint switching (<860px vs >=860px) with RAF/listener suspension on mobile to prevent orphaned pin containers | M2 | R3 |
| 9 | E2E Test Suite & Test Runner | Automated opaque-box test runner covering Tiers 1-4 with headless Chrome | E2E Track | Requirements & AC |
| 10 | Final Verification & Adversarial Hardening | 100% E2E test pass across all viewports and adversarial hardening | Final Milestone | Acceptance Criteria |
| 11 | Logo Flight Physical Inertia Calibration | Calibrate `--p` to 1.05s cubic-bezier(0.25, 1, 0.5, 1), GPU layer promotion, resolve header transition conflict | M4 | R1 |
| 12 | Liquid Curtain Soft Descent & Sync | IntroCurtain 0.98s cubic-bezier(0.16, 1, 0.3, 1) with DELAY_INGRESSO_MS synchronized to 1180ms | M4 | R1 |
| 13 | CheComputer Micro-staggering Cascade | Micro-staggered entrance (30-80ms) for .uso-domanda, .uso-dot, .uso-testo spans, and em | M4 | R1 |
| 14 | Responsive Card Inertia & Modal Drawer | Asymmetric active tap scale(0.978), 45ms mobile card stagger, iOS drawer curve cubic-bezier(0.32, 0.72, 0, 1) | M4 | R1 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Hero & Title Entrance Animation | Automatic entrance animation, header & intro reveal, mobile scroll unblock (R1) | none | DONE |
| M2 | Mobile Portfolio Redesign & Desktop Preservation | Vertical cards on <860px, detail modal, preserve >=860px carousel, lifecycle guard (R2, R3) | none | DONE |
| E2E | E2E Testing Suite | Comprehensive test runner & test cases (Tiers 1-4) with headless Chrome | none (parallel track) | DONE |
| M3 | Final Integration & Adversarial Verification | Pass 100% E2E tests + Tier 5 adversarial hardening + Forensic Audit | M1, M2, E2E | DONE |
| M4 | Sycomo Animation & Easing Calibration | Organic inertia, micro-staggering, 60/120fps GPU acceleration across logo, curtain, CheComputer, cards (R1, R2, R3) | M1, M2, M3 | DONE |

## Interface Contracts
### M1: Hero Entrance Contract
- `ScrollDirector.tsx` / `page.tsx`:
  - Triggers automatic entrance sequence on page load (after curtain mount or immediate for reduced motion).
  - Sets `root.style.setProperty("--p", "1")` and `root.classList.add("figs-on")`.
  - Removes 100vh dummy aperture spacer so `<CheComputer>` is immediately accessible.
  - Prevents rubber-band overscroll from forcing `--p` back to 0.

### M2: Portfolio Section & Modal Contract
- `src/components/Album.tsx`:
  - Exports `SCATTI_DIGITAL`, `SCATTI_HARDWARE`, `Scatto`.
  - Renders dual-view: `<div className="alb-mobile-view">` for `< 860px` and `<div className="alb-desktop-view">` for `>= 860px`.
  - Mobile cards render 2 columns: left preview thumbnail (image or device mockup ~108px), right details.
  - Clicking any card opens `ProjectDetailModal` with project metadata, full description, metrics, specs, and contact action.
- `src/components/HorizontalPinAlbum.tsx`:
  - Contains breakpoint guard `isDesktop` (>= 860px).
  - Suspends RAF loop, pointer down/move/up, and wheel listeners when `< 860px`.
  - Listens to `window.matchMedia("(min-width: 860px)")` to re-initialize and update metrics on resize.

## Code Layout
- `src/components/ScrollDirector.tsx`: Scroll and entrance animation director.
- `src/components/Album.tsx`: Portfolio root component and project datasets.
- `src/components/HorizontalPinAlbum.tsx`: Desktop pinned horizontal carousel.
- `src/components/MobileVerticalAlbum.tsx`: Mobile vertical card list component.
- `src/components/ProjectDetailModal.tsx`: Liquid-glass detail modal / bottom sheet.
- `src/app/globals.css`: Styling for entrance animation, mobile cards, and desktop carousel.
- `e2e/`: End-to-end test runner, specifications, and adversarial harnesses.
