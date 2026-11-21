# BRIEFING — 2026-11-10T19:57:30Z

## Mission
Investigate IntroCurtain descent mechanics and CheComputer / .uso entrance transitions & micro-staggering for organic fluid reveals and 60/120fps performance.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: /home/shadymui/sycomosite/.agents/teamwork/teamwork_explorer_anim_2
- Original parent: ac563d37-3860-4e5b-857e-863101dc04d2
- Milestone: IntroCurtain & CheComputer entrance transitions and micro-staggering

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in source code
- Follow Handoff Protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method)
- Animation performance: 60/120fps (GPU accelerated, transform/opacity only)

## Current Parent
- Conversation ID: ac563d37-3860-4e5b-857e-863101dc04d2
- Updated: 2026-11-10T19:57:30Z

## Investigation State
- **Explored paths**:
  - `src/components/IntroCurtain.tsx`
  - `src/app/globals.css` (lines 144-242, 265-340, 1458-1570)
  - `src/components/ScrollDirector.tsx`
  - `src/components/CheComputer.tsx`
  - `src/app/page.tsx`
  - `src/app/pc-su-misura/page.tsx`
  - `e2e/runner.mjs`, `e2e/specs/tier1-features.mjs`, `e2e/specs/tier4-scenarios.mjs`
  - Skill: `/home/shadymui/.gemini/config/skills/emil-design-eng/SKILL.md`
- **Key findings**:
  - `IntroCurtain` uses CSS keyframe `intro-fall` on `.intro-sheet` and `intro-done` on `.intro`.
  - The easing curve in `globals.css` was steep ease-in (`cubic-bezier(0.42, 0.12, 0.72, 0.85)` / `(0.5, 0.15, 0.78, 0.72)`), which creates an abrupt, unnatural, late-accelerating descent without fluid inertia.
  - In `ScrollDirector.tsx`, `DELAY_INGRESSO_MS` was set to `350ms`, prematurely triggering `apri(false)` before the 850ms curtain finished dropping. This desynchronized the curtain with the entrance.
  - `<CheComputer>` (`.uso`) currently animates as a single monolithic block: all children (`.uso-domanda`, `.uso-dot`, `.uso-testo`, `span`, `strong`, `em`) move together 20px and fade in synchronously with no staggering.
  - Micro-staggering can be achieved cleanly using `.figs-on` cascading transition delays (30-80ms intervals) on `.uso-domanda`, `.uso-dot`, and `.uso-testo > span`.
  - Non-replaced inline elements (`span`) ignore CSS `transform` unless `display: inline-block` is explicitly set.
  - 60/120fps GPU performance requires animating only `transform` and `opacity` with layer promotion (`will-change: transform`).
- **Unexplored areas**: None within scope.

## Key Decisions Made
- Selected `cubic-bezier(0.16, 1, 0.3, 1)` / `cubic-bezier(0.25, 1, 0.5, 1)` for fluid curtain inertia and micro-staggered reveals.
- Coordinated timing: `intro-fall` 0.95s-1.05s (delay 0.12s), `intro-done` at 1.18s, `DELAY_INGRESSO_MS` at 1200ms.
- Stagger sequence: headline (0ms) -> red dot (+50ms) -> description paragraph (+80ms) -> use case tokens (+30-40ms each) -> accent phrase (+40ms).
- Prepared before/after review table per `emil-design-eng` skill.

## Artifact Index
- /home/shadymui/sycomosite/.agents/teamwork/teamwork_explorer_anim_2/DISPATCH.md — Incoming dispatches
- /home/shadymui/sycomosite/.agents/teamwork/teamwork_explorer_anim_2/BRIEFING.md — Persistent context & memory
- /home/shadymui/sycomosite/.agents/teamwork/teamwork_explorer_anim_2/progress.md — Heartbeat progress
- /home/shadymui/sycomosite/.agents/teamwork/teamwork_explorer_anim_2/handoff.md — Final structured report
