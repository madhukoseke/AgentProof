import { createHash } from "node:crypto";
import type { EvaluationScenario } from "./schemas";

export function hashSuite(scenarios: EvaluationScenario[]) {
  return createHash("sha256").update(JSON.stringify(scenarios)).digest("hex");
}

export function assertSameSuite(scenarios: EvaluationScenario[], expectedHash: string) {
  if (hashSuite(scenarios) !== expectedHash) {
    throw new Error("Evaluation suite integrity check failed; regression suite was not changed.");
  }
}
