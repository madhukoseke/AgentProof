import { Check, LoaderCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/schemas";

export function EvaluationList({ results, visibleCount = results.length, label }: { results: EvaluationResult[]; visibleCount?: number; label: string }) {
  return (
    <section className="eval-panel">
      <div className="panel-kicker">
        <span>{label}</span>
        <span>{Math.min(visibleCount, results.length)} / {results.length}</span>
      </div>
      <div className="eval-list">
        {results.map((result, index) => {
          const visible = index < visibleCount;
          return (
            <div key={result.scenarioId} className={cn("eval-row", visible ? "eval-row-visible" : "eval-row-pending", !result.passed && visible ? "eval-row-failed" : "") }>
              <div className={cn("eval-icon", visible ? (result.passed ? "eval-icon-pass" : "eval-icon-fail") : "") }>
                {visible ? (result.passed ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />) : <LoaderCircle size={14} />}
              </div>
              <div className="eval-copy">
                <div className="eval-title-line">
                  <strong>{result.name}</strong>
                  <span>{result.category}</span>
                </div>
                <p>{visible ? result.reason : "Queued for deterministic verification"}</p>
              </div>
              <div className={cn("eval-status", visible && result.passed ? "eval-status-pass" : visible ? "eval-status-fail" : "") }>
                {visible ? (result.passed ? "PASS" : result.severity === "critical" ? "CRITICAL" : "FAIL") : "WAIT"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
