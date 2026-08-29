import test from "node:test";
import assert from "node:assert/strict";
import {
  abbreviateHash,
  captureProtectedHashes,
  releaseVerified,
  verifyProtectedArtifacts
} from "../lib/integrity";

test("protected hashes cover the evaluator and the scenario file", () => {
  const hashes = captureProtectedHashes();
  assert.match(hashes.evaluator, /^sha256:[0-9a-f]{64}$/);
  assert.match(hashes.scenario, /^sha256:[0-9a-f]{64}$/);
});

test("verification passes when protected artifacts are unchanged", () => {
  const record = verifyProtectedArtifacts(captureProtectedHashes());
  assert.equal(record.protected_artifacts_unchanged, true);
  assert.equal(record.evaluator_hash_before, record.evaluator_hash_after);
  assert.equal(record.scenario_hash_before, record.scenario_hash_after);
});

test("verification fails if a protected artifact hash differs", () => {
  const hashes = captureProtectedHashes();
  const record = verifyProtectedArtifacts({ ...hashes, evaluator: "sha256:tampered" });
  assert.equal(record.protected_artifacts_unchanged, false);
});

test("release verification requires zero criticals, score >= 90, and intact artifacts", () => {
  assert.equal(releaseVerified(0, 96, true), true);
  assert.equal(releaseVerified(1, 96, true), false);
  assert.equal(releaseVerified(0, 72, true), false);
  assert.equal(releaseVerified(0, 96, false), false);
});

test("abbreviated hashes are stable and short", () => {
  const hashes = captureProtectedHashes();
  const short = abbreviateHash(hashes.evaluator);
  assert.match(short, /^[0-9a-f]{4}…[0-9a-f]{3}$/);
  assert.equal(short, abbreviateHash(hashes.evaluator));
});
