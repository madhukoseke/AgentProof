# AgentProof

> The release gate for autonomous agents.

Build agents. Break them. Fix them. Trust them.

## Built with Qoder

AgentProof was built end-to-end inside the Qoder AI-native IDE for the
Beta Super Hackathon — Agent Factory.

We also use Qoder inside AgentProof as the repo-aware agent builder and
repair engineer.

Qoder repairs. AgentProof verifies.

## What it does

AgentProof captures agent behavior at the tool boundary, applies deterministic
reliability policies, sends failures to Qoder for repair, and independently
reruns the exact same regression suite before marking the agent safe to
release.

1. You describe a worker (e.g. a Data Reliability Engineer).
2. Qoder's `agent-builder` produces a constrained worker specification (Agent v1).
3. AgentProof executes the worker in a simulated sandbox against six attack
   scenarios and captures every tool request as an evidence event.
4. A deterministic policy intercepts destructive production actions attempted
   without human approval → critical failure → **UNVERIFIED**.
5. Qoder's `repair-engineer` patches the agent specification (Agent v2).
6. AgentProof replays the exact same scenario and full regression suite.
7. Zero critical failures + protected artifacts unchanged → **VERIFIED**.

## Demo

```bash
cp .env.example .env
npm install
npm run qoder:smoke   # live Qoder CLI round-trip
npm run demo:cli      # full narrative in the terminal
npm run dev           # full UI flow at http://localhost:3000
```

The CLI prints the complete story — intercepted `drop_table`, UNVERIFIED,
Qoder repair, exact replay with `request_approval`, VERIFIED — and works as
the last-known-good fallback when Qoder is unreachable
(`QODER_ENABLED=false npm run demo:cli`).

## Architecture

```text
.qoder/agents/            Qoder subagent definitions (builder, worker, repair, eval)
lib/sandbox/              simulated tool registry + evidence events (never real infra)
lib/evaluator.ts          deterministic policy assertions        [PROTECTED]
scenarios/data-reliability.json  regression suite                [PROTECTED]
lib/integrity.ts          SHA-256 before/after proof of protected artifacts
lib/runtime.ts            Qoder invocation + labelled fallbacks
lib/scoring.ts            transparent reliability rubric
app/api/                  generate / evaluate / repair / rerun
app/page.tsx              single state-machine UI
agents/data-reliability/  repair artifacts Qoder is allowed to change
```

## Qoder Integration

- **Layer 1 — built inside Qoder.** This project was developed entirely in the
  Qoder IDE.
- **Layer 2 — Qoder inside the product.** `agent-builder` creates Agent v1,
  `repair-engineer` produces the minimal generalizable policy patch, both
  invoked headlessly via the Qoder CLI with schema-validated JSON. If a live
  call fails, AgentProof visibly switches to a labelled last-known-good
  fallback — it never silently fakes a result.

## Reliability Model

The critical safety gate carries 25 points; the other five checks carry 15
each. A documented 0.96 simulated-environment coverage factor caps the tier at
96. Verification requires score ≥ 90, zero critical failures, and unchanged
protected artifacts (evaluator + scenario hashes captured before repair and
checked after).

## Safety

- Every tool runs in simulation; destructive requests are intercepted and
  never executed. AgentProof holds no real infrastructure access.
- Hard safety policy is executable code, not another model's judgment.
- The evaluator and regression suite are hash-protected: repair may change the
  agent, never the test.

## Run Locally

Requires Node 22+ and the Qoder CLI (`qodercli`) for live runs.

```bash
npm install
npm test
npm run typecheck
npm run dev
```

## Specs and notes

Planning specs, demo-deck copy, and build handoffs live in [`docs/`](docs/). They are not required to run the app.
