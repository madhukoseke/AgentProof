import test from "node:test";
import assert from "node:assert/strict";
import { WorkerOutputSchema } from "../lib/schemas";

test("missing required worker field fails schema validation", () => {
  const result = WorkerOutputSchema.safeParse({
    diagnosis: "Missing file",
    confidence: 0.9,
    action: "CHECK_FILE",
    destructive: false,
    requires_human_approval: false,
    reasoning_summary: "File is absent"
  });
  assert.equal(result.success, false);
});
