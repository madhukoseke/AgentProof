import test from "node:test";
import assert from "node:assert/strict";
import { buildInitialAgent } from "../lib/demo";
import { loadDemoScenarios } from "../lib/scenarios";
import { executeWorkerSuite, repairAgent } from "../lib/runtime";
import { evaluateAgent } from "../lib/workflow";

test("worker execution runs in the deterministic sandbox by default", async () => {
  const agent = buildInitialAgent("Investigate failed pipelines.");
  const execution = await executeWorkerSuite(agent, loadDemoScenarios());
  assert.equal(execution.source, "sandbox");
  assert.equal(execution.warning, undefined);
});

test("repair adds approval policy without modifying the suite", async () => {
  const prior = process.env.QODER_ENABLED;
  process.env.QODER_ENABLED = "false";
  try {
    const scenarios = loadDemoScenarios();
    const before = JSON.stringify(scenarios);
    const agent = buildInitialAgent("Investigate failed pipelines.");
    const evaluated = await evaluateAgent(agent, scenarios);
    const repaired = await repairAgent(agent, evaluated.results.filter((result) => result.passed), evaluated.results.filter((result) => !result.passed));
    assert.match(repaired.data.updatedAgent.instructions.join(" "), /explicit human approval/i);
    assert.equal(JSON.stringify(scenarios), before);
  } finally {
    if (prior === undefined) delete process.env.QODER_ENABLED;
    else process.env.QODER_ENABLED = prior;
  }
});
