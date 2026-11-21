# BRIEFING — 2026-11-10T17:22:00Z

## Mission
Investigate Sycomo codebase architecture, package dependencies, Hero/Title implementation, mobile scroll blocking issues, and transition strategy for automatic intro entrance animation on page load.

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: codebase investigation, architecture survey, issue diagnosis
- Working directory: /home/shadymui/sycomosite/.agents/teamwork/teamwork_explorer_survey_1
- Original parent: eb4c9f20-9419-4dd0-80c1-aa6d20070a73
- Milestone: Hero & Title Survey & Animation Diagnosis

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Inspect Next.js version and docs in node_modules/next/dist/docs/ as per AGENTS.md
- Produce structured 5-component handoff report and notify parent

## Current Parent
- Conversation ID: eb4c9f20-9419-4dd0-80c1-aa6d20070a73
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `package.json`: Next.js 16.2.10, React 19.2.4, Tailwind CSS v4, Three.js 0.187.0, no GSAP/Framer Motion.
  - `src/app/page.tsx`, `src/app/pc-su-misura/page.tsx`, `src/app/layout.tsx`.
  - `src/components/ScrollDirector.tsx`: Root of scroll-triggered `--p` manipulation, `resetImmediato()`.
  - `src/components/Logo.tsx`, `src/components/SottoLogo.tsx`, `src/components/IntroCurtain.tsx`, `src/components/ScorrimentoFluido.tsx`, `src/components/HeroArt.tsx`, `src/components/CheComputer.tsx`.
  - `src/components/Album.tsx`, `src/components/HorizontalPinAlbum.tsx`.
  - `src/app/globals.css`: Detailed CSS tokens, `@property --p`, `.logo-fly`, `.scroll-track`, `.scroll-section`, `.site-header`, `.uso`, `.alb-pin-track`.
- **Key findings**:
  - The hero title `.logo-fly` is positioned via CSS variable `--p` (0 = screen center, 1 = header navbar).
  - Previously, `--p` was toggled strictly by scroll (`window.scrollY > 10px`), with a 100vh spacer track (`.scroll-section[data-label="apertura"]`) pushing introductory text `<CheComputer>` below the fold.
  - On mobile, elastic rubber-banding near top (`scrollY <= 4px`) triggers `resetImmediato()`, forcefully stripping transitions and snapping `--p` to 0.
  - The 100vh spacer forces users to scroll through an empty screen before seeing text.
  - Automated entrance animation on initial load should smoothly transition `--p` from 0 to 1, eliminate/collapse the 100vh dead-zone spacer, position `<CheComputer>` in the hero view, and keep the navbar open without resetting to center on scroll.
- **Unexplored areas**: None for hero survey. Ready for handoff synthesis.

## Key Decisions Made
- Confirmed CSS-driven transition (`@property --p`) is optimal for 60/120fps hardware acceleration with zero external dependencies.
- Determined that eliminating the 100vh empty spacer track allows `<CheComputer>` to enter smoothly as the hero introductory headline.

## Artifact Index
- handoff.md — Final investigation report
- progress.md — Liveness & task execution tracker
- DISPATCH.md — Task assignment record
