# Progress: Empirical Adversarial Challenge — Viewports, Overflow & Layout Integrity

- Last visited: 2026-11-10T18:03:00Z
- Agent: teamwork_challenger_2
- Status: AUDIT COMPLETE — REQUEST_CHANGES

## Milestones & Execution Log
- [x] Initialized DISPATCH.md, BRIEFING.md, and progress.md
- [x] Inspect test runner and infrastructure (`e2e/runner.mjs`, `e2e/specs/`, `e2e/driver.mjs`)
- [x] Execute full test suite `node e2e/runner.mjs`:
  - 39 of 40 tests PASSED
  - 1 test FAILED (`T4-01`: intro section assertion mismatch on `/` vs `/pc-su-misura`)
  - Exit code 1
- [x] Develop comprehensive adversarial layout audit harness `e2e/adversarial-layout.mjs`
- [x] Measure and verify across 12 viewports (320px to 2560px):
  - 320x568: 19px horizontal overflow (`scrollWidth = 339px > innerWidth = 320px`) in `#contatti` (`.cnt`)
  - 360x640, 375x667, 390x844, 412x915, 667x375, 859x900, 860x900, 1280x800, 1440x900, 1920x1080, 2560x1440: 0px overflow (`scrollWidth <= innerWidth`)
- [x] Discover critical mobile card dimension defect:
  - `.alb-mobile-card` inherits `.alb-card { height: clamp(390px, 62vh, 600px); }`
  - On iPhone 14 (390x844), card is forced to 523.27px tall
  - Thumbnail stretched to 108x497.27px (aspect ratio 0.22, 1:4.6 vertical distortion)
  - 343px empty void in card details
  - Empirically proved that `height: auto` on `.alb-mobile-card` fixes card height to 179.66px and thumbnail ratio to 0.70
- [x] Verify text clamping (`-webkit-line-clamp: 2` produces exactly 2.0 lines at 33.6px height / 16.8px line-height)
- [x] Verify modal bottom-sheet and dialog across viewports
- [x] Write comprehensive handoff report `handoff.md`
- [x] Deliver verdict `REQUEST_CHANGES` to orchestrator
