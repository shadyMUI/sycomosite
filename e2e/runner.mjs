#!/usr/bin/env node
/**
 * e2e/runner.mjs
 * Sycomo Automated E2E Test Suite Runner
 *
 * Usage:
 *   node e2e/runner.mjs                     # Run all 40 tests
 *   node e2e/runner.mjs --tier=1            # Run Tier 1 tests
 *   node e2e/runner.mjs --feature=F1        # Run Feature 1 tests
 *   node e2e/runner.mjs --id=F1-T1-01       # Run a specific test
 *   node e2e/runner.mjs --list              # List all registered tests
 *   node e2e/runner.mjs --help              # Show help
 */

import { spawn, spawnSync } from "node:child_process";
import process from "node:process";

// 1. Transparent WebSocket respawn if running on Node without global WebSocket
if (typeof WebSocket === "undefined") {
  const result = spawnSync(
    process.execPath,
    ["--experimental-websocket", ...process.execArgv, ...process.argv.slice(1)],
    {
      stdio: "inherit",
      env: process.env,
    }
  );
  process.exit(result.status ?? 0);
}

import { TestDriver } from "./driver.mjs";
import { filterTests, allTests, getTestInventory } from "./test-matrix.mjs";

// Parse CLI flags
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    tier: undefined,
    feature: undefined,
    id: undefined,
    search: undefined,
    port: 3000,
    baseUrl: "http://localhost:3000",
    verbose: false,
    list: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--list" || arg === "-l") options.list = true;
    else if (arg === "--verbose" || arg === "-v") options.verbose = true;
    else if (arg.startsWith("--tier=")) options.tier = Number(arg.split("=")[1]);
    else if (arg.startsWith("--feature=")) options.feature = arg.split("=")[1];
    else if (arg.startsWith("--id=")) options.id = arg.split("=")[1];
    else if (arg.startsWith("--search=")) options.search = arg.split("=")[1];
    else if (arg.startsWith("--port=")) {
      options.port = Number(arg.split("=")[1]);
      options.baseUrl = `http://localhost:${options.port}`;
    } else if (arg.startsWith("--baseUrl=")) {
      options.baseUrl = arg.split("=")[1];
    }
  }

  return options;
}

// Check if server is reachable
async function isServerReachable(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

// Ensure local Next.js server is running
async function ensureServer(options) {
  const isUp = await isServerReachable(options.baseUrl);
  if (isUp) {
    console.log(`[runner] Server detected active at ${options.baseUrl}`);
    return null; // No need to shut down existing server
  }

  console.log(`[runner] Server not detected at ${options.baseUrl}. Starting local server...`);
  const serverProc = spawn("npm", ["run", "start", "--", "-p", String(options.port)], {
    stdio: options.verbose ? "inherit" : "pipe",
    env: process.env,
    detached: false,
  });

  const start = Date.now();
  let online = false;
  while (Date.now() - start < 30000) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isServerReachable(options.baseUrl)) {
      online = true;
      break;
    }
  }

  if (!online) {
    serverProc.kill("SIGKILL");
    throw new Error(`Failed to start server at ${options.baseUrl} within 30 seconds`);
  }

  console.log(`[runner] Server successfully started and verified at ${options.baseUrl}`);
  return serverProc;
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
Sycomo Automated E2E Test Suite Runner

Usage:
  node e2e/runner.mjs [options]

Options:
  --tier=<1|2|3|4>        Run only tests in specified tier
  --feature=<F1|F2|F3>    Run only tests for specified feature
  --id=<TEST-ID>          Run specific test (e.g., F1-T1-01)
  --search=<term>         Search tests by keyword
  --port=<port>           Application port (default: 3000)
  --baseUrl=<url>         Application base URL (default: http://localhost:3000)
  --list                  List all registered tests
  --verbose               Show verbose diagnostics
  --help                  Show this help message
`);
    process.exit(0);
  }

  if (options.list) {
    const inventory = getTestInventory();
    console.log(`\nRegistered Tests (${inventory.total} total):`);
    console.log(`  Tier 1 (Feature Coverage):     ${inventory.byTier.tier1} tests`);
    console.log(`  Tier 2 (Boundary & Corner):    ${inventory.byTier.tier2} tests`);
    console.log(`  Tier 3 (Cross Interactions):   ${inventory.byTier.tier3} tests`);
    console.log(`  Tier 4 (Real-World Scenarios): ${inventory.byTier.tier4} tests\n`);
    for (const t of allTests) {
      console.log(`  [Tier ${t.tier}] [${t.feature.padEnd(8)}] ${t.id.padEnd(10)} - ${t.name}`);
    }
    console.log();
    process.exit(0);
  }

  const selectedTests = filterTests(options);
  if (selectedTests.length === 0) {
    console.error("[runner] No tests matched the specified filter criteria.");
    process.exit(1);
  }

  console.log(`================================================================`);
  console.log(`  SYCOMO E2E AUTOMATED TEST SUITE`);
  console.log(`  Selected: ${selectedTests.length} of ${allTests.length} tests`);
  console.log(`  Target:   ${options.baseUrl}`);
  console.log(`================================================================\n`);

  let serverProc = null;
  let driver = null;

  // Cleanup handler for interrupts
  const cleanup = async () => {
    if (driver) {
      try {
        await driver.close();
      } catch {}
      driver = null;
    }
    if (serverProc) {
      try {
        serverProc.kill("SIGTERM");
      } catch {}
      serverProc = null;
    }
  };

  process.on("SIGINT", async () => {
    console.log("\n[runner] Interrupted. Cleaning up...");
    await cleanup();
    process.exit(130);
  });

  process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(143);
  });

  const results = {
    passed: [],
    failed: [],
    totalTimeMs: 0,
  };

  try {
    serverProc = await ensureServer(options);

    console.log("[runner] Launching headless Chrome and initializing driver...");
    driver = new TestDriver();
    await driver.init();
    console.log(`[runner] Chrome initialized (${driver.browser.versionInfo.Browser})\n`);

    const suiteStart = Date.now();

    for (let i = 0; i < selectedTests.length; i++) {
      const test = selectedTests[i];
      const testNum = `[${i + 1}/${selectedTests.length}]`;
      const prefix = `${testNum} [T${test.tier}:${test.feature}] ${test.id}`;

      process.stdout.write(`${prefix.padEnd(32)} ${test.name.slice(0, 48)}... `);

      const testStart = Date.now();
      try {
        // Reset page session and state before each test
        await driver.newPage();
        const runRes = await test.run(driver, { baseUrl: options.baseUrl, verbose: options.verbose });
        const durationMs = Date.now() - testStart;
        results.passed.push({
          test,
          durationMs,
          details: runRes?.details || "Passed",
        });
        console.log(`\x1b[32m✔ PASS\x1b[0m (${durationMs}ms)`);
        if (options.verbose && runRes?.details) {
          console.log(`    ↳ ${runRes.details}`);
        }
      } catch (err) {
        const durationMs = Date.now() - testStart;
        const errMsg = err.message || String(err);
        results.failed.push({
          test,
          durationMs,
          error: errMsg,
        });
        console.log(`\x1b[31m✖ FAIL\x1b[0m (${durationMs}ms)`);
        console.log(`    \x1b[31m↳ ${errMsg}\x1b[0m`);
      }
    }

    results.totalTimeMs = Date.now() - suiteStart;
  } catch (err) {
    console.error(`\n[runner] Fatal error during test execution: ${err.message}`);
    await cleanup();
    process.exit(1);
  } finally {
    await cleanup();
  }

  // Print Summary Report
  console.log(`\n================================================================`);
  console.log(`  E2E TEST EXECUTION SUMMARY`);
  console.log(`================================================================`);
  console.log(`  Total Executed: ${selectedTests.length}`);
  console.log(`  Passed:         \x1b[32m${results.passed.length}\x1b[0m`);
  console.log(`  Failed:         \x1b[31m${results.failed.length}\x1b[0m`);
  console.log(`  Total Duration: ${(results.totalTimeMs / 1000).toFixed(2)}s`);
  console.log(`================================================================`);

  if (results.failed.length > 0) {
    console.log(`\nFailed Tests Summary:`);
    for (const f of results.failed) {
      console.log(`  ✖ [Tier ${f.test.tier}] ${f.test.id.padEnd(10)} - ${f.test.name}`);
      console.log(`    Error: ${f.error}`);
    }
    console.log();
    process.exit(1);
  } else {
    console.log(`\n\x1b[32mAll ${results.passed.length} tests passed successfully!\x1b[0m\n`);
    process.exit(0);
  }
}

main().catch((e) => {
  console.error("Unhandled top-level error:", e);
  process.exit(1);
});
