import { NextResponse } from "next/server";
import { z } from "zod";
import { abbreviateHash, captureProtectedHashes, verifyProtectedArtifacts } from "@/lib/integrity";
import { AGENT_ARTIFACTS, repairAgent } from "@/lib/runtime";
import { loadRun, saveRun } from "@/lib/storage";
import { assertSameSuite } from "@/lib/suite";

export const runtime = "nodejs";
const RequestSchema = z.object({ runId: z.string(), fromVersion: z.number().int().positive() });

export async function POST(req: Request) {
  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid repair request" }, { status: 400 });
    const run = await loadRun(parsed.data.runId);
    if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
    assertSameSuite(run.evaluations, run.suiteHash);
    const current = run.versions.find((item) => item.version === parsed.data.fromVersion);
    if (!current) return NextResponse.json({ error: "Version not found" }, { status: 404 });
    const priorResults = run.resultsByVersion[String(current.version)] ?? [];
    if (!priorResults.some((result) => !result.passed)) {
      return NextResponse.json({ error: "No failed evaluation is available to repair" }, { status: 409 });
    }
    run.stage = "repairing";
    if (!run.protectedHashes) run.protectedHashes = captureProtectedHashes();
    const repaired = await repairAgent(
      current.specification,
      priorResults.filter((result) => result.passed),
      priorResults.filter((result) => !result.passed)
    );
    const integrity = verifyProtectedArtifacts(run.protectedHashes);
    const version = current.version + 1;
    run.repair = repaired.data;
    run.integrity = integrity;
    run.versions.push({
      version,
      createdAt: new Date().toISOString(),
      specification: repaired.data.updatedAgent,
      source: repaired.source
    });
    run.activity.push({ at: new Date().toISOString(), label: `Qoder Repair Engineer created Agent v${version} (${repaired.source})` });
    await saveRun(run);
    return NextResponse.json({
      version,
      ...repaired.data,
      agent: repaired.data.updatedAgent,
      source: repaired.source,
      durationMs: repaired.durationMs,
      warning: repaired.warning,
      changedArtifacts: AGENT_ARTIFACTS,
      integrity: {
        ...integrity,
        evaluator_hash_short: abbreviateHash(integrity.evaluator_hash_after),
        scenario_hash_short: abbreviateHash(integrity.scenario_hash_after)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Repair failed" }, { status: 500 });
  }
}
