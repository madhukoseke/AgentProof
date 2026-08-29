import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { z } from "zod";

const execFileAsync = promisify(execFile);

export interface QoderRunOptions {
  agent?: string;
  prompt: string;
  cwd?: string;
  timeoutMs?: number;
  outputFormat?: "text" | "json" | "stream-json";
}

export interface QoderRunResult {
  raw: string;
  parsed?: unknown;
  durationMs: number;
  success: boolean;
  error?: string;
}

function stripFence(text: string) {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function balancedJson(text: string): string | undefined {
  for (let start = 0; start < text.length; start += 1) {
    const opening = text[start];
    if (opening !== "{" && opening !== "[") continue;
    const stack: string[] = [];
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
      const char = text[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') {
        inString = true;
        continue;
      }
      if (char === "{" || char === "[") stack.push(char);
      if (char === "}" || char === "]") {
        const expected = char === "}" ? "{" : "[";
        if (stack.pop() !== expected) break;
        if (stack.length === 0) return text.slice(start, index + 1);
      }
    }
  }
  return undefined;
}

function parseCandidate(value: string): unknown {
  const clean = stripFence(value);
  try {
    return JSON.parse(clean);
  } catch {
    const balanced = balancedJson(clean);
    if (!balanced) return undefined;
    try {
      return JSON.parse(balanced);
    } catch {
      return undefined;
    }
  }
}

/** Extracts model JSON from either raw JSON, fenced text, or Qoder's result envelope. */
export function extractStructuredJson(raw: string): unknown {
  const outer = parseCandidate(raw);
  if (outer && typeof outer === "object" && !Array.isArray(outer)) {
    const record = outer as Record<string, unknown>;
    if (record.is_error === true) return undefined;
    for (const key of ["result", "content", "message", "output"]) {
      if (typeof record[key] === "string") {
        const nested = parseCandidate(record[key]);
        if (nested !== undefined) return nested;
      }
    }
  }
  return outer;
}

export async function runQoder(options: QoderRunOptions): Promise<QoderRunResult> {
  const binary = process.env.QODER_BIN?.trim() || "qodercli";
  const args: string[] = [];
  if (options.agent) args.push("--agent", options.agent);
  args.push(
    "-p",
    options.prompt,
    "--output-format",
    options.outputFormat ?? "json",
    "--no-session-persistence"
  );
  // Inherited Agent-SDK env vars force stream-json mode and break headless runs.
  const env = { ...process.env };
  for (const key of ["QODER_AGENT_SDK_ENTRYPOINT", "QODER_AGENT_SDK_VERSION", "QODER_SDK_AUTH_PAYLOAD_FILE", "QODER_SESSION_TYPE"]) {
    delete env[key];
  }
  const start = Date.now();
  try {
    const { stdout, stderr } = await execFileAsync(binary, args, {
      cwd: options.cwd ?? process.cwd(),
      env,
      maxBuffer: 10 * 1024 * 1024,
      timeout: options.timeoutMs ?? 120_000
    });
    const parsed = extractStructuredJson(stdout);
    const envelope = parseCandidate(stdout);
    const envelopeError = envelope && typeof envelope === "object" && !Array.isArray(envelope)
      ? (envelope as Record<string, unknown>).is_error === true
      : false;
    return {
      raw: stdout,
      parsed,
      durationMs: Date.now() - start,
      success: !envelopeError,
      error: envelopeError ? String((envelope as Record<string, unknown>).result ?? "Qoder returned an error") : stderr || undefined
    };
  } catch (error) {
    return {
      raw: "",
      durationMs: Date.now() - start,
      success: false,
      error: error instanceof Error ? error.message : "Unknown Qoder execution error"
    };
  }
}

export async function runQoderStructured<S extends z.ZodTypeAny>(
  options: QoderRunOptions,
  schema: S
): Promise<QoderRunResult & { data?: z.output<S> }> {
  const first = await runQoder(options);
  const validated = schema.safeParse(first.parsed);
  if (first.success && validated.success) return { ...first, data: validated.data };

  if (!first.success) return first;

  const retry = await runQoder({
    ...options,
    prompt: `${options.prompt}\n\nYour previous response was invalid. Return the same answer as VALID JSON ONLY. No Markdown fences or commentary.`
  });
  const retryValidated = schema.safeParse(retry.parsed);
  if (retry.success && retryValidated.success) return { ...retry, data: retryValidated.data };
  return {
    ...retry,
    success: false,
    error: retry.error ?? first.error ?? "Qoder returned invalid structured output"
  };
}
