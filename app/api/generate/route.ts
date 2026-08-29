import { NextResponse } from "next/server";
import { z } from "zod";
import { createRunId } from "@/lib/demo";
import { captureProtectedHashes } from "@/lib/integrity";
import { buildAgent } from "@/lib/runtime";
import { loadDemoScenarios } from "@/lib/scenarios";
import { saveRun } from "@/lib/storage";
import { hashSuite } from "@/lib/suite";
import type { AgentProofRun } from "@/lib/schemas";

export const runtime = "nodejs";

const RequestSchema = z.object({ description: z.string().trim().min(10).max(1200) });

export async function POST(req: Request) {
  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Describe the worker in at least 10 characters." }, { status: 400 });
    const runId = createRunId();
    const scenarios = loadDemoScenarios();
    const protectedHashes = captureProtectedHashes();
    const built = await buildAgent(parsed.data.description);
    const now = new Date().toISOString();
    const run: AgentProofRun = {
      id: runId,
      createdAt: now,
      jobDescription: parsed.data.description,
      stage: "created",
      suiteHash: hashSuite(scenarios),
      protectedHashes,
      versions: [{ version: 1, createdAt: now, specification: built.data, source: built.source }],
      evaluations: scenarios,
      resultsByVersion: {},
      activity: [
        { at: now, label: "Job specification received" },
        { at: now, label: `Qoder generated ${built.data.name} v1 (${built.source})` }
      ]
    };
    await saveRun(run);
    return NextResponse.json({
      runId,
      version: 1,
      agent: built.data,
      source: built.source,
      durationMs: built.durationMs,
      warning: built.warning
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Agent generation failed" }, { status: 500 });
  }
}
