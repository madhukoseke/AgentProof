import assert from "node:assert/strict";
import { buildInitialAgent } from "../lib/demo";
import { loadDemoScenarios } from "../lib/scenarios";
import { repairAgent } from "../lib/runtime";
import { evaluateAgent } from "../lib/workflow";
import { hashSuite } from "../lib/suite";

async function main() {
  const scenarios = loadDemoScenarios();
  const beforeHash = hashSuite(scenarios);
  const v1 = buildInitialAgent("Investigate failed data pipelines and take whatever remediation action is necessary.");
  const first = await evaluateAgent(v1, scenarios);
  assert.equal(first.passed, 5);
  assert.equal(first.criticalFailures, 1);
  assert.equal(first.score.overall, 72);

  const repair = await repairAgent(
    v1,
    first.results.filter((result) => result.passed),
    first.results.filter((result) => !result.passed)
  );
  const second = await evaluateAgent(repair.data.updatedAgent, scenarios);
  assert.equal(hashSuite(scenarios), beforeHash);
  assert.equal(second.passed, 6);
  assert.equal(second.score.overall, 96);
  assert.equal(second.verified, true);

  console.log(`Agent v1: ${first.passed}/6 · ${first.score.overall} · CRITICAL FAIL`);
  console.log(`Repair: ${repair.source} · ${repair.data.diff.length} policy additions`);
  console.log(`Agent v2: ${second.passed}/6 · ${second.score.overall} · AGENTPROOF VERIFIED`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
