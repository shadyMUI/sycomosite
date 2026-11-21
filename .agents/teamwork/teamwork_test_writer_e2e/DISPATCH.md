## 2026-11-10T17:24:02Z
You are teamwork_test_writer_e2e.
Your working directory is /home/shadymui/sycomosite/.agents/teamwork/teamwork_test_writer_e2e/
Your identity is teamwork_test_writer.

Read the user requirements file at:
/home/shadymui/sycomosite/.agents/teamwork/ORIGINAL_REQUEST.md

Read the project specification at:
/home/shadymui/sycomosite/.agents/teamwork/PROJECT.md

Read the test infrastructure specification at:
/home/shadymui/sycomosite/.agents/teamwork/TEST_INFRA.md

Read the explorer investigation report at:
/home/shadymui/sycomosite/.agents/teamwork/teamwork_explorer_survey_3/handoff.md

Write Ownership:
You EXCLUSIVELY own:
- All files in `e2e/` (e.g. `e2e/runner.mjs`, `e2e/test-matrix.mjs`, etc.)
- `/home/shadymui/sycomosite/.agents/teamwork/TEST_READY.md`
You MUST NOT modify any application source code in `src/`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objectives:
1. Build an opaque-box automated E2E test suite in `e2e/` using Node.js and headless Chrome (`/usr/bin/google-chrome` is pre-installed) that tests the running Next.js application at `http://localhost:3000/`.
2. Follow the 4-Tier test methodology specified in TEST_INFRA.md:
   - Tier 1: Feature Coverage (≥5 tests per feature: Title Entrance & Nav Lockup, Mobile Vertical Cards Layout, Desktop Horizontal Carousel Preservation).
   - Tier 2: Boundary & Corner Cases (≥5 tests per feature: Mobile viewports 375px, 390px, 412px; Breakpoint boundary 859px vs 860px; Desktop viewports 1280px, 1920px; Zero horizontal overflow; Fast scroll bounds).
   - Tier 3: Cross-Feature Interactions (≥5 tests: Entrance animation followed by mobile card tap and modal opening; Viewport resizing across 860px; Reduced motion mode across features).
   - Tier 4: Real-World Scenarios (≥5 tests: Mobile visitor complete journey, compact screen journey, desktop journey, modal focus & escape, accessibility).
3. Implement `node e2e/runner.mjs` which can launch a test server if needed (or test an active one), run all tests sequentially or concurrently, format output cleanly, and exit with code 0 on all passing (or non-zero on failure).
4. Once created and verified, publish the `/home/shadymui/sycomosite/.agents/teamwork/TEST_READY.md` signal file per the template in TEST_INFRA.md.
5. Write your handoff report to `/home/shadymui/sycomosite/.agents/teamwork/teamwork_test_writer_e2e/handoff.md`.
6. Send a message to caller with a summary of the test suite and results.
