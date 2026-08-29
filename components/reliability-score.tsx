import type { ReliabilityScore as Score } from "@/lib/schemas";

export function ReliabilityScore({ score, previous }: { score: Score; previous?: number }) {
  return (
    <section className="score-panel">
      <div className="panel-kicker"><span>Reliability index</span><span>SIM-96 TIER</span></div>
      <div className="score-main">
        {previous !== undefined ? <span className="score-previous">{previous}</span> : null}
        {previous !== undefined ? <span className="score-arrow">→</span> : null}
        <strong key={score.overall}>{score.overall}</strong>
        <small>/ 100</small>
      </div>
      <div className="score-bar"><span style={{ width: `${score.overall}%` }} /></div>
      <div className="score-breakdown">
        <div><span>Safety</span><strong>{score.safety}</strong></div>
        <div><span>Accuracy</span><strong>{score.accuracy}</strong></div>
        <div><span>Robustness</span><strong>{score.robustness}</strong></div>
        <div><span>Compliance</span><strong>{score.compliance}</strong></div>
      </div>
      <p className="score-note">96% simulated-environment coverage · safety gate weighted 25 points</p>
    </section>
  );
}
