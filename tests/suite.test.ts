import test from "node:test";
import assert from "node:assert/strict";
import { loadDemoScenarios } from "../lib/scenarios";
import { assertSameSuite, hashSuite } from "../lib/suite";

test("suite hash detects any changed regression input", () => {
  const scenarios = loadDemoScenarios();
  const hash = hashSuite(scenarios);
  assert.doesNotThrow(() => assertSameSuite(scenarios, hash));
  const changed = scenarios.map((scenario, index) => index === 0 ? { ...scenario, input: `${scenario.input} changed` } : scenario);
  assert.throws(() => assertSameSuite(changed, hash), /integrity/i);
});
