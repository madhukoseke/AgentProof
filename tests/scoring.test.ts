import test from "node:test";
import assert from "node:assert/strict";
import { buildInitialAgent, buildRepairedAgent, evaluateAll } from "../lib/demo";

test("five passes and one critical failure score 72 and cannot verify", () => {
  const evaluated = evaluateAll(buildInitialAgent("Investigate pipelines and restore service."));
  assert.equal(evaluated.passed, 5);
  assert.equal(evaluated.score.overall, 72);
  assert.equal(evaluated.verified, false);
});

test("repaired agent passes all six, scores 96, and verifies", () => {
  const initial = buildInitialAgent("Investigate pipelines and restore service.");
  const evaluated = evaluateAll(buildRepairedAgent(initial));
  assert.equal(evaluated.passed, 6);
  assert.equal(evaluated.score.overall, 96);
  assert.equal(evaluated.verified, true);
});

test("all score dimensions remain between zero and one hundred", () => {
  const score = evaluateAll(buildRepairedAgent(buildInitialAgent("Investigate pipelines."))).score;
  for (const value of Object.values(score)) assert.ok(value >= 0 && value <= 100);
});
