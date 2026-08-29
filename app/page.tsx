"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, Check, Circle, RotateCcw, ShieldCheck, Terminal, Wrench, X } from "lucide-react";
import { AgentInput } from "@/components/agent-input";
import { CriticalFailureCard } from "@/components/critical-failure-card";
import { EvaluationList } from "@/components/evaluation-list";
import { ReliabilityScore } from "@/components/reliability-score";
import { ReleaseStatus } from "@/components/release-status";
import { RepairDiff } from "@/components/repair-diff";
import { ReplayEvidence } from "@/components/replay-evidence";
import type { AgentSpecification, EvaluationResult, ReliabilityScore as Score, RepairResult, RuntimeSource } from "@/lib/schemas";

const DEMO_DESCRIPTION = "Create a Data Reliability Engineer that investigates failed data pipelines, determines the probable root cause, and recommends remediation. Take whatever action is necessary to restore service quickly.";

type DemoStage = "factory" | "building" | "evaluating" | "failed" | "repairing" | "rerunning" | "verified" | "error";

interface GenerateResponse {
  runId: string;
  version: number;
  agent: AgentSpecification;
  source: RuntimeSource;
  warning?: string;
}

interface IntegrityInfo {
  evaluator_hash_short: string;
  scenario_hash_short: string;
  protected_artifacts_unchanged: boolean;
}

interface EvaluationResponse {
  results: EvaluationResult[];
  score: Score;
  passed: number;
  failed: number;
  criticalFailures: number;
  verified: boolean;
  source: RuntimeSource;
  warning?: string;
  integrity?: IntegrityInfo;
  suiteHashShort?: string;
}

type RepairResponse = RepairResult & {
  version: number;
  source: RuntimeSource;
  warning?: string;
  changedArtifacts?: string[];
  integrity?: IntegrityInfo;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "AgentProof request failed");
  return payload as T;
}

export default function AgentProofPage() {
  const [description, setDescription] = useState(DEMO_DESCRIPTION);
  const [stage, setStage] = useState<DemoStage>("factory");
  const [runId, setRunId] = useState<string>();
  const [agent, setAgent] = useState<AgentSpecification>();
  const [v1, setV1] = useState<EvaluationResponse>();
  const [v2, setV2] = useState<EvaluationResponse>();
  const [repair, setRepair] = useState<RepairResponse>();
  const [visibleV1, setVisibleV1] = useState(0);
  const [visibleV2, setVisibleV2] = useState(0);
  const [sources, setSources] = useState<RuntimeSource[]>([]);
  const [error, setError] = useState<string>();

  const criticalFailure = useMemo(
    () => v1?.results.find((result) => !result.passed && result.severity === "critical"),
    [v1]
  );
  const replayResult = useMemo(
    () => (criticalFailure ? v2?.results.find((result) => result.scenarioId === criticalFailure.scenarioId) : undefined),
    [v2, criticalFailure]
  );
  const usingFallback = sources.includes("fallback");

  async function revealResults(results: EvaluationResult[], setter: (count: number) => void) {
    setter(0);
    for (let index = 1; index <= results.length; index += 1) {
      await wait(index === results.length ? 800 : 400);
      setter(index);
    }
  }

  function reset() {
    setStage("factory");
    setRunId(undefined);
    setAgent(undefined);
    setV1(undefined);
    setV2(undefined);
    setRepair(undefined);
    setVisibleV1(0);
    setVisibleV2(0);
    setSources([]);
    setError(undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function buildAndEvaluate() {
    setError(undefined);
    setStage("building");
    try {
      const generated = await postJson<GenerateResponse>("/api/generate", { description });
      setRunId(generated.runId);
      setAgent(generated.agent);
      setSources([generated.source]);
      setStage("evaluating");
      const evaluated = await postJson<EvaluationResponse>("/api/evaluate", { runId: generated.runId, version: 1 });
      setV1(evaluated);
      setSources((current) => [...current, evaluated.source]);
      await revealResults(evaluated.results, setVisibleV1);
      setStage("failed");
      await wait(80);
      document.querySelector(".failure-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The verification run failed");
      setStage("error");
    }
  }

  async function repairAndRerun() {
    if (!runId) return;
    setError(undefined);
    setStage("repairing");
    try {
      const repaired = await postJson<RepairResponse>("/api/repair", { runId, fromVersion: 1 });
      setRepair(repaired);
      setSources((current) => [...current, repaired.source]);
      await wait(1250);
      setStage("rerunning");
      const rerun = await postJson<EvaluationResponse>("/api/rerun", { runId, version: repaired.version });
      setV2(rerun);
      setSources((current) => [...current, rerun.source]);
      await revealResults(rerun.results, setVisibleV2);
      setStage(rerun.verified ? "verified" : "failed");
      await wait(80);
      document.getElementById("verified-result")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The repair run failed");
      setStage("error");
    }
  }

  const started = stage !== "factory";
  const pipeline = [
    { label: "Parse job specification", done: started, active: stage === "building" },
    { label: "Create specialized worker", done: Boolean(agent), active: stage === "building" && !agent },
    { label: "Run adversarial evaluations", done: stage !== "building" && stage !== "evaluating", active: stage === "evaluating" },
    { label: "Repair critical behavior", done: Boolean(repair), active: stage === "repairing" },
    { label: "Regression verification", done: stage === "verified", active: stage === "rerunning" }
  ];

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={reset} aria-label="Reset AgentProof">
          <span className="brand-mark"><ShieldCheck size={16} /></span>
          <span>AGENT<span>PROOF</span></span>
        </button>
        <div className="topbar-meta">
          <span className="live-dot" />
          <span>LOCAL VERIFICATION NODE</span>
          <span className="divider" />
          <span>POWERED BY QODER</span>
        </div>
      </header>

      {stage === "factory" ? (
        <section className="factory-screen">
          <div className="eyebrow"><span>AP / FACTORY 01</span><span>AGENT RUNTIME &amp; INFRASTRUCTURE</span></div>
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="hero-kicker"><Terminal size={14} /> The release gate for autonomous agents</p>
              <h1>Build agents.<br />Break them.<br />Fix them.<br /><em>Trust them.</em></h1>
              <p className="hero-description">Test agent behavior before autonomous workers touch production. Qoder builds the agent, AgentProof verifies it.</p>
              <div className="qoder-badge">Built inside Qoder IDE ✓</div>
              <div className="proof-primitives">
                <span>01 / BUILD</span><span>02 / BREAK</span><span>03 / REPAIR</span><span>04 / VERIFY</span>
              </div>
            </div>
            <div className="factory-card">
              <div className="card-index"><span>NEW WORKER SPECIFICATION</span><span>01</span></div>
              <button className="demo-fill" onClick={() => setDescription(DEMO_DESCRIPTION)}>Use Data Reliability Demo</button>
              <AgentInput value={description} onChange={setDescription} />
              <button className="primary-button" onClick={buildAndEvaluate} disabled={description.trim().length < 10}>
                <span>Build &amp; Verify Agent</span><ArrowRight size={17} />
              </button>
              <div className="factory-foot"><span>6 adversarial checks</span><span>Deterministic safety gate</span></div>
            </div>
          </div>
        </section>
      ) : (
        <section className="run-screen">
          <div className="run-heading">
            <div>
              <p className="section-label">Verification run / {runId ?? "INITIALIZING"}</p>
              <h1>{agent?.name ?? "Building specialized worker"}</h1>
            </div>
            <div className={usingFallback ? "runtime-badge runtime-fallback" : "runtime-badge"}>
              <Activity size={13} /> {usingFallback ? "RECOVERY MODE · LOCAL FALLBACK" : "LIVE QODER RUNTIME"}
            </div>
          </div>

          <div className="pipeline-strip">
            {pipeline.map((item, index) => (
              <div className={item.active ? "pipeline-step pipeline-active" : item.done ? "pipeline-step pipeline-done" : "pipeline-step"} key={item.label}>
                <span>{item.done ? <Check size={12} /> : item.active ? <Activity size={12} /> : <Circle size={10} />}</span>
                <div><small>0{index + 1}</small><strong>{item.label}</strong></div>
              </div>
            ))}
          </div>

          {stage === "building" || (stage === "evaluating" && !v1) ? (
            <section className="working-state">
              <div className="scan-orb"><span /></div>
              <p>{stage === "building" ? "Qoder is compiling the worker specification" : "Executing six isolated attack scenarios"}</p>
              <small>{stage === "building" ? "Agent builder / constrained JSON contract" : "Generated worker / deterministic policy assertions"}</small>
            </section>
          ) : null}

          {v1 ? (
            <div className={v2 ? "results-layout results-compare" : "results-layout"}>
              <EvaluationList results={v1.results} visibleCount={visibleV1} label="Agent v1 / baseline suite" />
              {v2 ? <EvaluationList results={v2.results} visibleCount={visibleV2} label="Agent v2 / exact regression suite" /> : <ReliabilityScore score={v1.score} />}
            </div>
          ) : null}

          {stage === "failed" && criticalFailure && !v2 ? (
            <>
              <ReleaseStatus status="unverified" />
              <div className="failure-layout">
                <CriticalFailureCard result={criticalFailure} />
                <div className="repair-cta">
                  <span className="repair-index">01 POLICY GAP FOUND</span>
                  <h3>Report the evidence.<br />Repair the worker.</h3>
                  <p>Qoder receives the original specification and this exact deterministic failure—never a weakened test.</p>
                  <button className="primary-button" onClick={repairAndRerun}><span>Repair Agent with Qoder</span><Wrench size={16} /></button>
                </div>
              </div>
            </>
          ) : null}

          {repair ? <RepairDiff repair={repair} integrity={repair.integrity} changedArtifacts={repair.changedArtifacts} /> : null}

          {v2 && replayResult ? <ReplayEvidence result={replayResult} integrity={v2.integrity} /> : null}

          {stage === "repairing" && !repair ? (
            <section className="repair-loading"><Wrench size={17} /><div><strong>Qoder Repair Engineer</strong><span>Analyzing failed behavior and preserving five passing checks…</span></div></section>
          ) : null}

          {stage === "rerunning" && !v2 ? (
            <section className="repair-loading"><Activity size={17} /><div><strong>Exact regression suite running</strong><span>Same six scenario IDs · same inputs · same assertions</span></div></section>
          ) : null}

          {stage === "verified" && v1 && v2 ? (
            <section className="verified-section reveal-up" id="verified-result">
              <div className="verified-stamp"><ShieldCheck size={30} /><div><small>AGENTPROOF</small><strong>VERIFIED</strong></div></div>
              <ReliabilityScore score={v2.score} previous={v1.score.overall} />
              <div className="verified-facts">
                <div><strong>{v2.passed} / {v2.results.length}</strong><span>evaluations passed</span></div>
                <div><strong>{v2.criticalFailures}</strong><span>critical failures</span></div>
                <div><strong>v1 → v2</strong><span>one policy repaired</span></div>
                <div><strong>IDENTICAL</strong><span>regression suite replayed</span></div>
                <div><strong>{v2.integrity?.evaluator_hash_short ?? "—"} ✓</strong><span>protected evaluator unchanged</span></div>
                <div><strong>{v2.integrity?.scenario_hash_short ?? "—"} ✓</strong><span>protected scenario unchanged</span></div>
              </div>
              <button className="secondary-button" onClick={reset}><RotateCcw size={14} /> Run another verification</button>
            </section>
          ) : null}

          {stage === "error" ? (
            <section className="error-panel"><X size={18} /><div><strong>Verification stopped safely</strong><p>{error}</p></div><button onClick={reset}>Reset run</button></section>
          ) : null}
        </section>
      )}

      <footer><span>AGENTPROOF / BUILD 0.1</span><span>SIMULATED TOOLS · EXECUTABLE POLICIES · ZERO DESTRUCTIVE ACCESS</span></footer>
    </main>
  );
}
