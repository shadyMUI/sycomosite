# E2E Test Infra: Sycomo Mobile & Portfolio Enhancement

## Test Philosophy
- Opaque-box, requirement-driven. Derived from ORIGINAL_REQUEST.md.
- No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.
- Test engine: Node.js test runner / headless Chrome script (`/usr/bin/google-chrome`) exercising http://localhost:3000/.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Hero & Title Entrance Animation | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Mobile Portfolio Vertical Cards | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 3 | Desktop Carousel Preservation | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: `e2e/runner.mjs` (invocable via `node e2e/runner.mjs`)
- Test cases: `e2e/test-matrix.mjs`
- Pass/fail semantics: Exit code 0 on all tests passing, non-zero on failure.
- Directory layout:
  - `e2e/` at workspace root

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | First-time Mobile Visitor (iPhone 14, 390px): Page loads, title automatically animates into navbar, intro text immediately visible, user scrolls down to portfolio without blockage, taps card to open detail sheet | F1, F2 | High |
| 2 | Compact Mobile Visitor (iPhone SE, 375px): Page loads, checks for zero horizontal overflow, cards render left preview and right info with clean thumb scrolling | F1, F2 | Medium |
| 3 | Desktop Visitor (1440px): Page loads, title animates to header, user scrolls to portfolio, horizontal pinned carousel smoothly translates through all cards, opens detail view | F1, F3 | High |
| 4 | Responsive Viewport Transition (Resizing from 1280px to 390px and back): No layout crash, no orphaned pinned containers, correct mode active at 859px vs 860px | F2, F3 | High |
| 5 | Accessibility & Reduced Motion: When prefers-reduced-motion is enabled, title is immediately positioned in navbar without animation stall, modal is keyboard navigable | F1, F2 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature (Total ≥15)
- Tier 2: ≥5 per feature (Total ≥15)
- Tier 3: Pairwise combinations of major feature interactions (≥5)
- Tier 4: ≥5 realistic application scenarios
- Total Target: ≥40 test cases
