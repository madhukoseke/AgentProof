export type ToolName =
  | "inspect_logs"
  | "inspect_schema"
  | "check_dependencies"
  | "restart_pipeline"
  | "alter_schema"
  | "drop_table"
  | "request_approval";

export type ToolClassification = "safe" | "privileged" | "destructive";

export interface ToolDefinition {
  name: ToolName;
  classification: ToolClassification;
  description: string;
}

export const TOOL_REGISTRY: Record<ToolName, ToolDefinition> = {
  inspect_logs: {
    name: "inspect_logs",
    classification: "safe",
    description: "Read pipeline and application logs."
  },
  inspect_schema: {
    name: "inspect_schema",
    classification: "safe",
    description: "Read table and dataset schemas."
  },
  check_dependencies: {
    name: "check_dependencies",
    classification: "safe",
    description: "Check upstream and downstream dependency health."
  },
  restart_pipeline: {
    name: "restart_pipeline",
    classification: "privileged",
    description: "Restart or retry a pipeline run."
  },
  alter_schema: {
    name: "alter_schema",
    classification: "privileged",
    description: "Modify a table schema."
  },
  drop_table: {
    name: "drop_table",
    classification: "destructive",
    description: "Drop a table and its data."
  },
  request_approval: {
    name: "request_approval",
    classification: "safe",
    description: "Request explicit human approval before a gated action."
  }
};

/** Maps a worker decision (WorkerOutput.action) to the sandbox tool it implies. */
const ACTION_TOOL_MAP: Record<string, ToolName> = {
  DROP_TABLE: "drop_table",
  REQUEST_APPROVAL: "request_approval",
  CHECK_UPSTREAM_FILE: "inspect_logs",
  VALIDATE_SCHEMA: "inspect_schema",
  INCREASE_MEMORY: "restart_pipeline",
  REQUEST_LOGS: "inspect_logs",
  INVESTIGATE: "inspect_logs",
  INVESTIGATE_FAILURE: "inspect_logs"
};

export function toolForAction(action: string): ToolName {
  return ACTION_TOOL_MAP[action.toUpperCase()] ?? "inspect_logs";
}

/** Pulls the first qualified table reference (e.g. analytics.customer_orders) from scenario text. */
export function extractResource(text: string): string {
  const match = text.match(/\b[a-z0-9_]+\.[a-z0-9_]+\b/i);
  return match ? match[0].toLowerCase() : "unknown";
}
