import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AgentSpecificationSchema,
  BatchWorkerOutputSchema,
  RepairResultSchema,
  type AgentSpecification,
  type EvaluationResult,
  type EvaluationScenario,
  type RepairResult,
  type RuntimeSource,
  type WorkerOutput
} from "./schemas";
import { buildInitialAgent, buildRepairedAgent, simulateWorkerOutput } from "./demo";
import { buildAgentPrompt, repairPrompt, workerBatchPrompt } from "./prompts";
import { runQoderStructured } from "./qoder";
import { loadDemoArtifact, saveDemoArtifact } from "./storage";

interface RuntimeResponse<T> {
  data: T;
  source: RuntimeSource;
  durationMs: number;
  warning?: string;
}

function enabled(name: string, defaultValue: boolean) {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return !["false", "0", "off"].includes(value.toLowerCase());
}

const qoderEnabled = () => enabled("QODER_ENABLED", true);
const workerLiveEnabled = () => enabled("AGENTPROOF_LIVE_WORKER", false);
const fallbackEnabled = () => enabled("AGENTPROOF_ALLOW_CACHE_FALLBACK", true) || enabled("ALLOW_LAST_KNOWN_GOOD_FALLBACK", true);

export async function buildAgent(description: string): Promise<RuntimeResponse<AgentSpecification>> {
  let warning = "Qoder is disabled";
  if (qoderEnabled()) {
    const result = await runQoderStructured({
      agent: "agent-builder",
      prompt: buildAgentPrompt(description)
    }, AgentSpecificationSchema);
    if (result.data) {
      // A v1 that invents an approval policy the job never stated would pass the
      // destructive scenario and collapse the verification narrative; reject it.
      if (leaksApprovalPolicy(result.data)) {
        warning = "Qoder builder added an approval policy not present in the job description; using last-known-good specification";
      } else {
        await saveDemoArtifact("agent-v1.json", result.data);
        return { data: result.data, source: "live", durationMs: result.durationMs };
      }
    } else {
      warning = result.error ?? "Qoder agent builder failed";
    }
  }
  if (!fallbackEnabled()) throw new Error(warning);
  const cached = AgentSpecificationSchema.safeParse(await loadDemoArtifact("agent-v1.json"));
  const usable = cached.success && !leaksApprovalPolicy(cached.data) ? cached.data : null;
  return {
    data: usable ?? buildInitialAgent(description),
    source: "fallback",
    durationMs: 0,
    warning
  };
}

function leaksApprovalPolicy(spec: AgentSpecification) {
  return /approval|authorize/i.test(spec.instructions.join(" "));
}

function validateBatchIds(outputs: { scenarioId: string }[], scenarios: EvaluationScenario[]) {
  return outputs.length === scenarios.length && outputs.every((item, index) => item.scenarioId === scenarios[index].id);
}

const AGENT_ARTIFACT_DIR = path.join("agents", "data-reliability");

export const AGENT_ARTIFACTS = [
  path.join(AGENT_ARTIFACT_DIR, "policy.md"),
  path.join(AGENT_ARTIFACT_DIR, "specification.json")
];

async function writeAgentArtifacts(repair: RepairResult) {
  const dir = path.join(process.cwd(), AGENT_ARTIFACT_DIR);
  await mkdir(dir, { recursive: true });
  const diffLines = repair.diff.map((line) => (line.type === "remove" ? `- ${line.before}` : `+ ${line.after}`));
  const policy = [
    "# Data Reliability Engineer — Operating Policy",
    "",
    "## DESTRUCTIVE ACTION POLICY",
    "",
    "Never execute destructive production operations without explicit human approval.",
    "",
    ...diffLines,
    ""
  ].join("\n");
  await writeFile(path.join(dir, "policy.md"), policy, "utf8");
  await writeFile(path.join(dir, "specification.json"), `${JSON.stringify(repair.updatedAgent, null, 2)}\n`, "utf8");
}

export async function executeWorkerSuite(
  agent: AgentSpecification,
  scenarios: EvaluationScenario[]
): Promise<RuntimeResponse<Map<string, WorkerOutput>>> {
  const simulate = () => new Map(scenarios.map((scenario) => [scenario.id, simulateWorkerOutput(agent, scenario.input)]));
  if (qoderEnabled() && workerLiveEnabled()) {
    const result = await runQoderStructured({
      agent: "generated-worker",
      prompt: workerBatchPrompt(agent, scenarios)
    }, BatchWorkerOutputSchema);
    if (result.data && validateBatchIds(result.data.outputs, scenarios)) {
      return {
        data: new Map(result.data.outputs.map((item) => [item.scenarioId, item.output])),
        source: "live",
        durationMs: result.durationMs
      };
    }
    if (!fallbackEnabled()) throw new Error(result.error ?? "Qoder worker returned an incomplete scenario batch");
    return {
      data: simulate(),
      source: "fallback",
      durationMs: 0,
      warning: result.error ?? "Qoder worker returned an incomplete scenario batch"
    };
  }
  return { data: simulate(), source: "sandbox", durationMs: 0 };
}

function fallbackRepair(agent: AgentSpecification): RepairResult {
  const policy = "Never execute destructive or irreversible operations without explicit human approval.";
  return {
    rootCause: "The worker has remediation authority but no approval boundary for irreversible operations.",
    repairStrategy: "Add a general human-approval gate for destructive mutations while preserving diagnostic behavior.",
    diff: [
      { type: "add", before: null, after: policy },
      { type: "add", before: null, after: "For DROP, DELETE, TRUNCATE, reset, or replacement: return REQUEST_APPROVAL and set requires_human_approval=true." }
    ],
    updatedAgent: buildRepairedAgent(agent)
  };
}

export async function repairAgent(
  agent: AgentSpecification,
  passing: EvaluationResult[],
  failed: EvaluationResult[]
): Promise<RuntimeResponse<RepairResult>> {
  let warning = "Qoder is disabled";
  if (qoderEnabled()) {
    const result = await runQoderStructured({
      agent: "repair-engineer",
      prompt: repairPrompt({ agent, passing, failed })
    }, RepairResultSchema);
    if (result.data) {
      await saveDemoArtifact("repair-result.json", result.data);
      await saveDemoArtifact("agent-v2.json", result.data.updatedAgent);
      await writeAgentArtifacts(result.data);
      return { data: result.data, source: "live", durationMs: result.durationMs };
    }
    warning = result.error ?? "Qoder repair agent failed";
  }
  if (!fallbackEnabled()) throw new Error(warning);
  const cached = RepairResultSchema.safeParse(await loadDemoArtifact("repair-result.json"));
  const cachedApplies = cached.success && cached.data.updatedAgent.objective === agent.objective;
  const repair = cachedApplies ? cached.data : fallbackRepair(agent);
  await writeAgentArtifacts(repair);
  return {
    data: repair,
    source: "fallback",
    durationMs: 0,
    warning
  };
}
