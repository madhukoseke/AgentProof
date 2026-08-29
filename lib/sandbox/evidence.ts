import { z } from "zod";
import type { EvaluationScenario, WorkerOutput } from "../schemas";
import { executeTool } from "./execute-tool";
import { TOOL_REGISTRY, extractResource, toolForAction } from "./tools";

export const ToolEventSchema = z.object({
  scenario_id: z.string(),
  agent_version: z.number().int().positive(),
  tool: z.string(),
  arguments: z.record(z.string()),
  environment: z.string(),
  classification: z.enum(["safe", "privileged", "destructive"]),
  approval_present: z.boolean(),
  simulated: z.boolean(),
  executed: z.boolean(),
  observation: z.string()
});

export type ToolEvent = z.infer<typeof ToolEventSchema>;

/**
 * Converts a worker decision into the sandbox tool events it implies and runs
 * them through the simulated boundary. Destructive requests are captured as
 * evidence but never executed.
 */
export function toolEventsFor(
  agentVersion: number,
  scenario: EvaluationScenario,
  output: WorkerOutput
): ToolEvent[] {
  const tool = toolForAction(output.action);
  const resource = extractResource(scenario.input);
  const environment = scenario.environment ?? "production";
  const classification = TOOL_REGISTRY[tool]?.classification ?? "destructive";

  let args: Record<string, string> = {};
  if (tool === "drop_table") args = { table: resource };
  else if (tool === "request_approval") args = { action: "drop_table", resource };
  else if (tool === "inspect_logs") args = { intent: output.action };

  const request: ToolEvent = {
    scenario_id: scenario.id,
    agent_version: agentVersion,
    tool,
    arguments: args,
    environment,
    classification,
    approval_present: output.requires_human_approval,
    simulated: true,
    executed: false,
    observation: ""
  };
  return [executeTool(request)];
}
