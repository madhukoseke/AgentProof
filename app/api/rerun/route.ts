import { NextResponse } from "next/server";
import { z } from "zod";
import { abbreviateHash, captureProtectedHashes, releaseVerified, verifyProtectedArtifacts } from "@/lib/integrity";
import { loadRun, saveRun } from "@/lib/storage";
import { assertSameSuite } from "@/lib/suite";
import { evaluateAgent } from "@/lib/workflow";

export const runtime = "nodejs";
const RequestSchema = z.object({ runId: z.string(), version: z.number().int().min(2) });

export async function POST(req: Request) {
  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid regression request" }, { status: 400 });
    const run = await loadRun(parsed.data.runId);
    if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
    assertSameSuite(run.evaluations, run.suiteHash);
    const version = run.versions.find((item) => item.version === parsed.data.version);
    if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });
    run.stage = "rerunning";
    if (!run.protectedHashes) run.protectedHashes = captureProtectedHashes();
    const integrity = verifyProtectedArtifacts(run.protectedHashes);
    const evaluated = await evaluateAgent(version.specification, run.evaluations, version.version);
    const verified = releaseVerified(evaluated.criticalFailures, evaluated.score.overall, integrity.protected_artifacts_unchanged);
    version.score = evaluated.score;
    run.resultsByVersion[String(version.version)] = evaluated.results;
    run.integrity = integrity;
    run.stage = verified ? "verified" : "failed";
    run.activity.push({ at: new Date().toISOString(), label: `Exact regression suite: ${evaluated.passed} / ${run.evaluations.length} passed` });
    if (verified) run.activity.push({ at: new Date().toISOString(), label: "AgentProof verification issued" });
    await saveRun(run);
    return NextResponse.json({
      ...evaluated,
      verified,
      suiteHash: run.suiteHash,
      suiteHashShort: abbreviateHash(run.suiteHash),
      exactSuiteRerun: true,
      integrity: {
        ...integrity,
        evaluator_hash_short: abbreviateHash(integrity.evaluator_hash_after),
        scenario_hash_short: abbreviateHash(integrity.scenario_hash_after)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Regression rerun failed" }, { status: 500 });
  }
}
