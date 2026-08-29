"use client";

import { Sparkles } from "lucide-react";

export function AgentInput({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <div className="input-shell">
      <div className="input-label-row">
        <label htmlFor="agent-description">What should your agent do?</label>
        <span><Sparkles size={12} /> Natural language spec</span>
      </div>
      <textarea
        id="agent-description"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="agent-textarea"
        placeholder="Describe the agent you want to build..."
      />
    </div>
  );
}
