## 2026-11-10T17:37:30Z
You are teamwork_worker_m2.
Your working directory is /home/shadymui/sycomosite/.agents/teamwork/teamwork_worker_m2/
Your identity is teamwork_worker.

Read the user requirements file at:
/home/shadymui/sycomosite/.agents/teamwork/ORIGINAL_REQUEST.md

Read the project architecture and interface contracts at:
/home/shadymui/sycomosite/.agents/teamwork/PROJECT.md

Read the explorer investigation report at:
/home/shadymui/sycomosite/.agents/teamwork/teamwork_explorer_survey_2/handoff.md

Write Ownership:
You EXCLUSIVELY own:
- `src/components/Album.tsx`
- `src/components/HorizontalPinAlbum.tsx`
- `src/components/MobileVerticalAlbum.tsx` (new file)
- `src/components/ProjectDetailModal.tsx` (new file)
- Album / Portfolio CSS rules in `src/app/globals.css`
You MUST NOT touch `src/components/ScrollDirector.tsx`, `src/app/page.tsx`, `src/app/pc-su-misura/page.tsx`, or any files in `e2e/`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Milestone 2 Objectives:
1. Implement Requirement R2 (Mobile Portfolio Vertical Card Layout):
   - On mobile screens and touch viewports (< 860px), replace the horizontal pinned album carousel with a clean, natural vertical list of rectangular cards (`MobileVerticalAlbum.tsx`).
   - Each mobile card displays a 2-column layout:
     - Left column (~100-118px): Preview image/mockup (image thumbnail if `src` is present, or miniature liquid-glass device mockup: digital browser preview with macOS dots & metric pill for digital projects, hardware telemetry chassis with gauge for hardware projects).
     - Right column: Category/client kicker, title, 2-line clamped description, primary metric badge, and "Dettagli →" tap affordance.
   - Natural document-flow vertical scrolling with thumb/swipe input: zero sticky pinning, zero 320vh height, zero horizontal scroll trapping or stutter on < 860px.
2. Implement Project Detail View / Modal:
   - Create `src/components/ProjectDetailModal.tsx`: an accessible liquid-glass modal (bottom sheet on mobile <860px with drag handle, centered dialog on desktop >=860px).
   - Tapping any mobile portfolio card opens the modal, displaying full project details (title, category, client, status, expanded description, role, full metrics grid, technical specs, and contact CTA).
   - Accessibility: `role="dialog"`, `aria-modal="true"`, focus trap, Escape key closes modal, body scroll locking while open.
3. Implement Requirement R3 (Desktop Portfolio Carousel Preservation):
   - On viewports 860px and wider, preserve the full-screen horizontal pinned carousel experience intact (`HorizontalPinAlbum.tsx`).
   - Add a breakpoint guard (`isDesktop = window.innerWidth >= 860`) and `window.matchMedia("(min-width: 860px)")` listener in `HorizontalPinAlbum.tsx` to completely suspend RAF loops, pointer events, and wheel hijacking on mobile (<860px), and seamlessly re-activate and recalculate metrics upon resizing to desktop.
   - In CSS, ensure `.alb-mobile-view` and `.alb-desktop-view` switch cleanly using `@media (max-width: 859.98px)` and `@media (min-width: 860px)` to guarantee zero hydration mismatch, zero layout shift (CLS = 0), and no orphaned pinned containers.
4. Verify your changes:
   - Run `npm run build` and `npm run lint` and verify exit code 0.
   - Run the automated E2E tests for Feature 2 and Feature 3:
     `node e2e/runner.mjs --feature=F2`
     `node e2e/runner.mjs --feature=F3`
5. Write your handoff report to /home/shadymui/sycomosite/.agents/teamwork/teamwork_worker_m2/handoff.md.
6. Send a message to caller with a summary of changes and test results.
