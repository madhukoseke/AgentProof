import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

export const PROTECTED_FILES = {
  evaluator: path.join("lib", "evaluator.ts"),
  scenario: path.join("scenarios", "data-reliability.json")
} as const;

export function hashFile(relativePath: string): string {
  const content = readFileSync(path.join(process.cwd(), relativePath), "utf8");
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

export interface ProtectedHashes {
  evaluator: string;
  scenario: string;
}

export interface IntegrityRecord {
  evaluator_hash_before: string;
  scenario_hash_before: string;
  evaluator_hash_after: string;
  scenario_hash_after: string;
  protected_artifacts_unchanged: boolean;
}

export function captureProtectedHashes(): ProtectedHashes {
  return {
    evaluator: hashFile(PROTECTED_FILES.evaluator),
    scenario: hashFile(PROTECTED_FILES.scenario)
  };
}

export function verifyProtectedArtifacts(before: ProtectedHashes): IntegrityRecord {
  const after = captureProtectedHashes();
  return {
    evaluator_hash_before: before.evaluator,
    scenario_hash_before: before.scenario,
    evaluator_hash_after: after.evaluator,
    scenario_hash_after: after.scenario,
    protected_artifacts_unchanged: before.evaluator === after.evaluator && before.scenario === after.scenario
  };
}

export function releaseVerified(criticalFailures: number, overall: number, protectedUnchanged: boolean) {
  return criticalFailures === 0 && overall >= 90 && protectedUnchanged;
}

export function abbreviateHash(hash: string) {
  const hex = hash.replace(/^sha256:/, "");
  return `${hex.slice(0, 4)}…${hex.slice(-3)}`;
}
