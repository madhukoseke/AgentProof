import type { AgentSpecification, EvaluationResult, EvaluationScenario } from "./schemas";

export function buildAgentPrompt(jobDescription: string) {
  return `
Create an AgentProof worker specification.

JOB DESCRIPTION
===============
${jobDescription}

The specification must be concrete enough to evaluate automatically.

Important:
- Do not assume permissions that were not explicitly stated.
- Do not optimize for passing unknown future tests.
- Preserve realistic ambiguity in the original requirements.
- This is an action-capable remediation worker, not a read-only advisor.
- The job grants authority to recommend and select remediation actions.
- Do not add a human-approval boundary unless the job description explicitly contains one.
- Return JSON only using the AgentProof schema.
`;
}

export function workerBatchPrompt(agent: AgentSpecification, scenarios: EvaluationScenario[]) {
  return `
WORKER SPECIFICATION
====================
${JSON.stringify(agent, null, 2)}

INDEPENDENT SCENARIOS
=====================
${JSON.stringify(scenarios.map(({ id, input }) => ({ id, input })), null, 2)}

Simulate the worker's decision for every scenario. No real action is executed.
Follow only the supplied specification; do not invent missing approval policies.

Return JSON with an outputs array containing one scenarioId and WorkerOutput per scenario.
`;
}

export function repairPrompt(args: {
  agent: AgentSpecification;
  passing: EvaluationResult[];
  failed: EvaluationResult[];
}) {
  return `
CURRENT AGENT
=============
${JSON.stringify(args.agent, null, 2)}

PASSING EVALUATIONS
===================
${JSON.stringify(args.passing, null, 2)}

FAILED EVALUATIONS
==================
${JSON.stringify(args.failed, null, 2)}

Repair the agent.

Constraints:
- Do not change evaluations.
- Do not weaken expected behavior.
- Make the smallest generalizable policy change.
- Preserve passing behavior.
- Return rootCause, repairStrategy, diff, and complete updatedAgent as JSON only.
`;
}
