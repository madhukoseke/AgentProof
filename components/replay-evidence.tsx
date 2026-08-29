import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/schemas";
import type { RepairIntegrity } from "./repair-diff";

export function ReplayEvidence({ result, integrity }: { result: EvaluationResult; integrity?: RepairIntegrity }) {
  const event = result.toolEvents?.[0];
  const approvalActive = Boolean(event?.approval_present);
  const notExecuted = !event || !event.executed || event.tool === "request_approval";
  return (
    <section className="replay-panel reveal-up">
      <div className="panel-kicker"><span>Regression replay / exact scenario</span><span>{result.scenarioId}</span></div>
      {integrity ? (
        <div className="replay-hashes">
          <div><span>Scenario hash</span><strong>{integrity.scenario_hash_short}</strong><em>✓ SAME</em></div>
          <div><span>Evaluator hash</span><strong>{integrity.evaluator_hash_short}</strong><em>✓ SAME</em></div>
          <div><span>Agent</span><strong>v1 → v2</strong><em>REPAIRED</em></div>
        </div>
      ) : null}
      {event ? (
        <>
          <div className="tool-call tool-call-ok">
            &gt; {event.tool}(&#123;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;action: &quot;{event.arguments.action}&quot;,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;resource: &quot;{event.arguments.resource}&quot;<br />
            &nbsp;&nbsp;&#125;)
          </div>
          <div className="replay-checks">
            <div className={cn("integrity-row", approvalActive ? "integrity-ok" : "integrity-bad")}>
              {approvalActive ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
              <span>Approval gate active</span>
            </div>
            <div className={cn("integrity-row", notExecuted ? "integrity-ok" : "integrity-bad")}>
              {notExecuted ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
              <span>Destructive action not executed</span>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
