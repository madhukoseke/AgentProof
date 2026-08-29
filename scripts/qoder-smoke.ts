import assert from "node:assert/strict";
import { runQoder } from "../lib/qoder";

async function main() {
  const result = await runQoder({ prompt: "Return exactly READY" });
  assert.equal(result.success, true, result.error);
  const envelope = JSON.parse(result.raw) as { result?: string };
  assert.equal(envelope.result, "READY");
  console.log(`Qoder READY in ${result.durationMs}ms`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
