import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { AgentProofRunSchema, type AgentProofRun } from "./schemas";

const runsDir = path.join(process.cwd(), "data", "runs");
const demoDir = path.join(process.cwd(), "data", "demo");

async function ensure(dir: string) {
  await mkdir(dir, { recursive: true });
}

export async function saveRun(run: AgentProofRun) {
  await ensure(runsDir);
  const validated = AgentProofRunSchema.parse(run);
  await writeFile(path.join(runsDir, `${run.id}.json`), JSON.stringify(validated, null, 2));
}

export async function loadRun(runId: string): Promise<AgentProofRun | null> {
  if (!/^run_[a-zA-Z0-9-]+$/.test(runId)) return null;
  try {
    const raw = await readFile(path.join(runsDir, `${runId}.json`), "utf8");
    return AgentProofRunSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function saveDemoArtifact(name: string, data: unknown) {
  await ensure(demoDir);
  await writeFile(path.join(demoDir, name), JSON.stringify(data, null, 2));
}

export async function loadDemoArtifact(name: string): Promise<unknown | null> {
  if (!/^[a-z0-9-]+\.json$/.test(name)) return null;
  try {
    return JSON.parse(await readFile(path.join(demoDir, name), "utf8"));
  } catch {
    return null;
  }
}
