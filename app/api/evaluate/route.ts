import { NextResponse } from "next/server";
import { z } from "zod";
import { loadRun, saveRun } from "@/lib/storage";
import { assertSameSuite } from "@/lib/suite";
import { evaluateAgent } from "@/lib/workflow";

export const runtime = "nodejs";
const RequestSchema = z.object({ runId: z.string(), version: z.number().int().positive() });

export async function POST(req: Request) {
  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid evaluation request" }, { status: 400 });
    const run = await loadRun(parsed.data.runId);
    if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
    assertSameSuite(run.evaluations, run.suiteHash);
    const version = run.versions.find((item) => item.version === parsed.data.version);
    if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });
    run.stage = "evaluating";
    const evaluated = await evaluateAgent(version.specification, run.evaluations, version.version);
    version.score = evaluated.score;
    run.resultsByVersion[String(version.version)] = evaluated.results;
    run.stage = evaluated.criticalFailures > 0 ? "failed" : evaluated.verified ? "verified" : "failed";
    run.activity.push({ at: new Date().toISOString(), label: `${evaluated.passed} / ${run.evaluations.length} evaluations passed` });
    await saveRun(run);
    return NextResponse.json(evaluated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Evaluation failed" }, { status: 500 });
  }
}
