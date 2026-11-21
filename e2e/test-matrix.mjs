/**
 * e2e/test-matrix.mjs
 * Central registry of all 40 E2E tests across Tiers 1-4
 */

import { tier1Tests } from "./specs/tier1-features.mjs";
import { tier2Tests } from "./specs/tier2-boundaries.mjs";
import { tier3Tests } from "./specs/tier3-interactions.mjs";
import { tier4Tests } from "./specs/tier4-scenarios.mjs";

export const allTests = [
  ...tier1Tests,
  ...tier2Tests,
  ...tier3Tests,
  ...tier4Tests,
];

/**
 * Filter tests by CLI options
 */
export function filterTests(options = {}) {
  let list = [...allTests];

  if (options.tier !== undefined) {
    const targetTier = Number(options.tier);
    list = list.filter((t) => t.tier === targetTier);
  }

  if (options.feature) {
    const targetFeature = String(options.feature).toUpperCase();
    list = list.filter((t) => t.feature.toUpperCase() === targetFeature);
  }

  if (options.id) {
    const ids = String(options.id).split(",").map((s) => s.trim().toUpperCase());
    list = list.filter((t) => ids.includes(t.id.toUpperCase()));
  }

  if (options.search) {
    const term = String(options.search).toLowerCase();
    list = list.filter(
      (t) =>
        t.id.toLowerCase().includes(term) ||
        t.name.toLowerCase().includes(term) ||
        t.feature.toLowerCase().includes(term)
    );
  }

  return list;
}

/**
 * Metadata breakdown
 */
export function getTestInventory() {
  const byTier = { 1: [], 2: [], 3: [], 4: [] };
  const byFeature = { F1: [], F2: [], F3: [], Cross: [], Scenario: [] };

  for (const t of allTests) {
    if (byTier[t.tier]) byTier[t.tier].push(t);
    if (byFeature[t.feature]) byFeature[t.feature].push(t);
  }

  return {
    total: allTests.length,
    byTier: {
      tier1: byTier[1].length,
      tier2: byTier[2].length,
      tier3: byTier[3].length,
      tier4: byTier[4].length,
    },
    byFeature: {
      F1: byFeature.F1.length,
      F2: byFeature.F2.length,
      F3: byFeature.F3.length,
      Cross: byFeature.Cross.length,
      Scenario: byFeature.Scenario.length,
    },
  };
}
