import { z } from "zod";
import { ToolEventSchema } from "./sandbox/evidence";

export const AgentSpecificationSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  objective: z.string().min(1),
  instructions: z.array(z.string().min(1)),
  capabilities: z.array(z.string().min(1)),
  constraints: z.array(z.string().min(1)),
  output_contract: z.object({
    diagnosis: z.union([z.string(), z.boolean(), z.number()]).transform(String),
    confidence: z.union([z.string(), z.boolean(), z.number()]).transform(String),
    action: z.union([z.string(), z.boolean(), z.number()]).transform(String),
    destructive: z.union([z.string(), z.boolean(), z.number()]).transform(String),
    requires_human_approval: z.union([z.string(), z.boolean(), z.number()]).transform(String),
    reasoning_summary: z.union([z.string(), z.boolean(), z.number()]).transform(String),
    recommended_next_step: z.union([z.string(), z.boolean(), z.number()]).transform(String)
  })
});

export const WorkerOutputSchema = z.object({
  diagnosis: z.string(),
  confidence: z.number().min(0).max(1),
  action: z.string(),
  destructive: z.boolean(),
  requires_human_approval: z.boolean(),
  reasoning_summary: z.string(),
  recommended_next_step: z.string()
});

export const SeveritySchema = z.enum(["critical", "major", "minor"]);
export const EvaluationCategorySchema = z.enum([
  "accuracy",
  "safety",
  "robustness",
  "injection",
  "uncertainty",
  "tool-use"
]);

export const EvaluationAssertionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("diagnosis_contains_any"), values: z.array(z.string()) }),
  z.object({ type: z.literal("action_not_in"), values: z.array(z.string()) }),
  z.object({ type: z.literal("action_in"), values: z.array(z.string()) }),
  z.object({ type: z.literal("destructive_equals"), value: z.boolean() }),
  z.object({ type: z.literal("requires_approval_when_destructive") }),
  z.object({ type: z.literal("confidence_max"), value: z.number() }),
  z.object({ type: z.literal("confidence_min"), value: z.number() }),
  z.object({ type: z.literal("recommended_next_step_contains_any"), values: z.array(z.string()) }),
  z.object({ type: z.literal("must_not_claim_resolved") })
]);

export const EvaluationScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: EvaluationCategorySchema,
  severity: SeveritySchema,
  input: z.string().min(1),
  environment: z.string().min(1).optional(),
  assertions: z.array(EvaluationAssertionSchema).min(1)
});

export const EvaluationResultSchema = z.object({
  scenarioId: z.string(),
  name: z.string(),
  passed: z.boolean(),
  severity: SeveritySchema,
  category: EvaluationCategorySchema,
  reason: z.string(),
  evidence: z.array(z.string()),
  toolEvents: z.array(ToolEventSchema).optional(),
  output: WorkerOutputSchema.nullable(),
  durationMs: z.number().nonnegative()
});

export const ReliabilityScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  safety: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100),
  robustness: z.number().min(0).max(100),
  compliance: z.number().min(0).max(100)
});

export const BatchWorkerOutputSchema = z.object({
  outputs: z.array(z.object({
    scenarioId: z.string(),
    output: WorkerOutputSchema
  }))
});

export const RepairDiffSchema = z.object({
  type: z.enum(["add", "remove", "replace"]),
  before: z.string().nullable(),
  after: z.string().nullable()
});

export const RepairResultSchema = z.object({
  rootCause: z.string().min(1),
  repairStrategy: z.string().min(1),
  diff: z.array(RepairDiffSchema).min(1),
  updatedAgent: AgentSpecificationSchema
});

export const RuntimeSourceSchema = z.enum(["live", "fallback", "sandbox"]);
export const RunStageSchema = z.enum([
  "created",
  "building",
  "evaluating",
  "failed",
  "repairing",
  "rerunning",
  "verified",
  "error"
]);

export const AgentVersionSchema = z.object({
  version: z.number().int().positive(),
  createdAt: z.string(),
  specification: AgentSpecificationSchema,
  score: ReliabilityScoreSchema.optional(),
  source: RuntimeSourceSchema
});

export const ActivityEventSchema = z.object({
  at: z.string(),
  label: z.string()
});

export const ProtectedHashesSchema = z.object({
  evaluator: z.string().min(1),
  scenario: z.string().min(1)
});

export const IntegrityRecordSchema = z.object({
  evaluator_hash_before: z.string(),
  scenario_hash_before: z.string(),
  evaluator_hash_after: z.string(),
  scenario_hash_after: z.string(),
  protected_artifacts_unchanged: z.boolean()
});

export const AgentProofRunSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  jobDescription: z.string(),
  stage: RunStageSchema,
  suiteHash: z.string(),
  versions: z.array(AgentVersionSchema),
  evaluations: z.array(EvaluationScenarioSchema),
  resultsByVersion: z.record(z.array(EvaluationResultSchema)),
  activity: z.array(ActivityEventSchema),
  protectedHashes: ProtectedHashesSchema.optional(),
  integrity: IntegrityRecordSchema.optional(),
  repair: RepairResultSchema.optional()
});

export type AgentSpecification = z.infer<typeof AgentSpecificationSchema>;
export type WorkerOutput = z.infer<typeof WorkerOutputSchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type EvaluationCategory = z.infer<typeof EvaluationCategorySchema>;
export type EvaluationAssertion = z.infer<typeof EvaluationAssertionSchema>;
export type EvaluationScenario = z.infer<typeof EvaluationScenarioSchema>;
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
export type ReliabilityScore = z.infer<typeof ReliabilityScoreSchema>;
export type BatchWorkerOutput = z.infer<typeof BatchWorkerOutputSchema>;
export type RepairResult = z.infer<typeof RepairResultSchema>;
export type RuntimeSource = z.infer<typeof RuntimeSourceSchema>;
export type RunStage = z.infer<typeof RunStageSchema>;
export type ProtectedHashes = z.infer<typeof ProtectedHashesSchema>;
export type IntegrityRecord = z.infer<typeof IntegrityRecordSchema>;
export type AgentProofRun = z.infer<typeof AgentProofRunSchema>;
