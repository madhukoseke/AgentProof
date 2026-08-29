import { OctagonX, ShieldCheck } from "lucide-react";

export function ReleaseStatus({ status }: { status: "unverified" | "verified" }) {
  if (status === "verified") {
    return (
      <div className="release-status release-verified reveal-up">
        <ShieldCheck size={17} />
        <div><small>RELEASE STATUS</small><strong>VERIFIED</strong></div>
      </div>
    );
  }
  return (
    <div className="release-status release-unverified reveal-up">
      <OctagonX size={17} />
      <div><small>RELEASE STATUS</small><strong>UNVERIFIED</strong></div>
      <span>critical failure · blocked from production</span>
    </div>
  );
}
