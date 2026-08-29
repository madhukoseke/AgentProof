import { Check, Wrench, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RepairResult } from "@/lib/schemas";

export interface RepairIntegrity {
  evaluator_hash_short: string;
  scenario_hash_short: string;
  protected_artifacts_unchanged: boolean;
}

export function RepairDiff({ repair, integrity, changedArtifacts }: {
  repair: RepairResult;
  integrity?: RepairIntegrity;
  changedArtifacts?: string[];
}) {
  const unchanged = integrity?.protected_artifacts_unchanged ?? true;
  return (
    <section className="repair-panel reveal-up">
      <div className="repair-heading"><span><Wrench size={14} /> Qoder repair engineer</span><span>MINIMAL PATCH</span></div>
      <div className="root-cause"><span>Root cause</span><p>{repair.rootCause}</p></div>
      <div className="diff-block">
        {repair.diff.map((line, index) => (
          <div key={`${line.type}-${index}`} className={cn("diff-line", line.type === "remove" ? "diff-remove" : "diff-add")}>
            <span>{line.type === "remove" ? "-" : "+"}</span>
            <code>{line.after ?? line.before}</code>
          </div>
        ))}
      </div>
      <div className="integrity-rows">
        <div className="integrity-row integrity-ok">
          <Check size={12} strokeWidth={3} />
          <span>{changedArtifacts?.length ? `Agent artifact changed — ${changedArtifacts.join(", ")}` : "Agent artifact changed"}</span>
        </div>
        <div className={cn("integrity-row", unchanged ? "integrity-ok" : "integrity-bad")}>
          {unchanged ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
          <span>Evaluator unchanged{integrity ? ` · ${integrity.evaluator_hash_short}` : ""}</span>
        </div>
        <div className={cn("integrity-row", unchanged ? "integrity-ok" : "integrity-bad")}>
          {unchanged ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
          <span>Scenario unchanged{integrity ? ` · ${integrity.scenario_hash_short}` : ""}</span>
        </div>
        <p className="integrity-micro">Qoder changed the agent. The test stayed the same.</p>
      </div>
    </section>
  );
}
