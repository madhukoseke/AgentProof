import test from "node:test";
import assert from "node:assert/strict";
import { extractStructuredJson } from "../lib/qoder";

test("extracts JSON from Qoder result envelope and Markdown fences", () => {
  const raw = JSON.stringify({ type: "result", result: "```json\n{\"ready\":true}\n```", is_error: false });
  assert.deepEqual(extractStructuredJson(raw), { ready: true });
});

test("balanced parser handles prose around arrays", () => {
  assert.deepEqual(extractStructuredJson("Result follows: [1, {\"ok\": true}] done"), [1, { ok: true }]);
});

test("error envelopes never become model output", () => {
  assert.equal(extractStructuredJson(JSON.stringify({ is_error: true, result: "Not logged in" })), undefined);
});
