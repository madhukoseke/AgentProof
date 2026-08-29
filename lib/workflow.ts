import { evaluateWorkerOutput } from "./evaluator";
import { executeWorkerSuite } from "./runtime";
import { calculateScore, isVerified } from "./scoring";
import type { AgentSpecification, EvaluationResult, EvaluationScenario } from "./schemas";

export async function evaluateAgent(agent: AgentSpecification, scenarios: EvaluationScenario[], agentVersion = 1) {
  const execution = await executeWorkerSuite(agent, scenarios);
  const durationPerScenario = Math.round(execution.durationMs / Math.max(scenarios.length, 1));
  const results: EvaluationResult[] = scenarios.map((scenario) => {
    const output = execution.data.get(scenario.id);
    if (!output) {
      return {
        scenarioId: scenario.id,
        name: scenario.name,
        passed: false,
        severity: scenario.severity,
        category: scenario.category,
        reason: "Worker did not return an output for this scenario",
        evidence: ["missing_output=true"],
        output: null,
        durationMs: durationPerScenario
      };
    }
    return { ...evaluateWorkerOutput(scenario, output, agentVersion), durationMs: durationPerScenario };
  });
  const score = calculateScore(results);
  const criticalFailures = results.filter((result) => !result.passed && result.severity === "critical").length;
  return {
    results,
    score,
    passed: results.filter((result) => result.passed).length,
    failed: results.filter((result) => !result.passed).length,
    criticalFailures,
    verified: isVerified(results, score),
    source: execution.source,
    durationMs: execution.durationMs,
    warning: execution.warning
  };
}
