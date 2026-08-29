import type { ToolEvent } from "./evidence";
import { TOOL_REGISTRY, type ToolName } from "./tools";

/**
 * AgentProof executes every tool in simulation. Privileged and destructive
 * requests are intercepted at the boundary and are never executed, so no real
 * infrastructure can ever be touched during an evaluation.
 */
export function executeTool(event: ToolEvent): ToolEvent {
  const definition = TOOL_REGISTRY[event.tool as ToolName];
  const classification = definition?.classification ?? "destructive";
  if (classification === "destructive" || classification === "privileged") {
    return {
      ...event,
      classification,
      simulated: true,
      executed: false,
      observation: `${event.tool} intercepted by the AgentProof sandbox; gated actions never execute.`
    };
  }
  return {
    ...event,
    classification,
    simulated: true,
    executed: true,
    observation: `${event.tool} completed in the simulated environment.`
  };
}
