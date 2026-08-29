# AgentProof — 3-Slide Demo Submission Deck Spec
## For LLM / Slide Generator
### Qoder × Beta Fund Agent Factory Hackathon

**Event:** Beta Super Hackathon — Agent Factory  
**Date:** August 29, 2026  
**Submission deadline:** 4:45 PM  
**Demo showcase:** 5:00 PM  
**Demo duration:** 3 minutes strict  
**Submission format:** Exactly 3 slides in the Master Submission Deck  
**Audience voting:** Ranked-choice vote for top 3 teams  
**Primary track:** Agent Runtime & Infrastructure  
**Project:** AgentProof  
**Tagline:** **Build agents. Break them. Fix them. Trust them.**  
**Core positioning:** **The release gate for autonomous agents.**  
**Secondary positioning:** **CI/CD for AI Agents.**

---

# 0. INSTRUCTIONS TO THE SLIDE-GENERATING LLM

Create **exactly 3 slides**.

Do not create a title slide, appendix, agenda, architecture appendix, or extra material.

The deck must follow the hackathon handbook exactly:

1. **Slide 1 — Team Introduction**
2. **Slide 2 — Product Overview**
3. **Slide 3 — Demo**

The audience will vote after seeing many teams. Therefore:

- optimize for memorability
- optimize for visual clarity at distance
- use minimal text
- use one strong idea per slide
- make the product name and core transformation unforgettable
- do not overload slides with technical details
- do not explain the entire system on slides
- reserve deep technical explanation for the spoken demo

The deck should feel like a premium developer-infrastructure product.

Visual references:
- Linear
- Vercel
- Sentry
- GitHub Actions
- modern infra control plane
- premium dark-mode developer tooling

Avoid:
- chat UI
- rainbow gradients
- glassmorphism overload
- tiny text
- dense architecture boxes
- generic AI brain graphics
- stock photos
- clip art
- excessive icons
- long bullet lists
- startup pitch clichés

---

# 1. DESIGN SYSTEM

## Theme

Dark, restrained, technical.

Suggested palette:
- Background: near-black / deep graphite
- Surface: dark neutral
- Primary text: near-white
- Secondary text: muted gray
- Accent: one cool electric accent
- Success: restrained green
- Failure: restrained red
- Warning: amber only if needed

Do not specify more than one decorative accent.

## Typography

Use:
- modern sans-serif for titles and body
- monospace for tool calls, hashes, evidence, diffs

Recommended hierarchy:
- Slide title: 34–44 pt
- Hero statement: 42–58 pt
- Supporting text: 20–26 pt
- Small metadata: 14–18 pt

Everything must be readable from the back of a room.

## Composition

Use generous margins.
Do not fill every empty area.

Prefer:
- one hero statement
- one visual
- one compact supporting block

Use visual hierarchy over explanatory prose.

---

# 2. PRODUCT STORY — MUST REMAIN CONSISTENT

The story across all 3 slides is:

```text
Autonomous agent
      ↓
makes unsafe production decision
      ↓
AgentProof intercepts it
      ↓
Qoder repairs the agent
      ↓
same scenario is replayed
      ↓
safe behavior
      ↓
VERIFIED
```

The release transformation:

```text
UNVERIFIED → VERIFIED
```

This is more important than the reliability score.

The core closing line:

> **Qoder makes the agent better. AgentProof proves it's safe to ship.**

---

# 3. SLIDE 1 — TEAM INTRODUCTION

## Required by handbook

Must include:
- team name
- member name(s)
- school/company
- relevant experience
- team-problem fit

## Goal of this slide

In less than 10 seconds, make the audience believe:

> "This person understands real production systems and is qualified to build agent reliability infrastructure."

Do not turn this into a resume slide.

---

## Recommended title

# AgentProof

Subtitle:

**The release gate for autonomous agents**

---

## Recommended layout

Use a split layout.

Left side:
- product identity
- short team introduction

Right side:
- compact "Why us?" credibility block

Example visual structure:

```text
┌───────────────────────────────────────────────────────────────────┐
│ AgentProof                                                        │
│ The release gate for autonomous agents                            │
│                                                                   │
│ Madhu Koseke                                                      │
│ Senior Data Engineer · AI builder                                 │
│                                                                   │
│ Building production-grade data systems                            │
│ across large-scale pipelines, cloud platforms,                    │
│ reliability and agentic workflows.                                │
│                                                                   │
│                                               WHY THIS PROBLEM     │
│                                               ───────────────      │
│                                               Production systems   │
│                                               fail at boundaries:  │
│                                                                   │
│                                               • unsafe actions     │
│                                               • bad assumptions    │
│                                               • missing approvals  │
│                                               • regressions        │
│                                                                   │
│                                               AgentProof turns     │
│                                               those into release   │
│                                               gates.               │
└───────────────────────────────────────────────────────────────────┘
```

---

## Recommended copy

Keep text very short.

### Main identity

**Madhu Koseke**  
Senior Data Engineer · AI Builder

### Relevant experience

Use one sentence:

> Building production-grade data pipelines, reliability systems, and agentic workflows across cloud and large-scale data platforms.

Optional if space allows:

> Prior hackathon winner · Production data / infra background

Do not turn this into five employers, certifications, or years of experience.

---

## Team-problem fit statement

Use:

> **I build systems where one bad automated decision can break production. AgentProof applies that reliability mindset to autonomous agents.**

This is strong because it directly connects the builder to the problem.

---

# 4. SLIDE 2 — PRODUCT OVERVIEW

## Required by handbook

Must include:
- one-line product description
- problem
- solution
- where Qoder appears

## Goal of this slide

This should be the strongest static slide in the deck.

The audience should understand AgentProof even if they miss part of the spoken pitch.

---

## Recommended headline

# Autonomous agents need a release gate.

Large subheadline:

**AgentProof catches unsafe behavior, lets Qoder repair the agent, then independently replays the exact same regression before marking it safe to ship.**

---

## Main visual

Use a horizontal 5-stage flow.

```text
┌─────────────┐
│   AGENT v1  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ ⛔ UNSAFE TOOL CALL  │
│ drop_table(prod)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ QODER REPAIR        │
│ + approval policy   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ EXACT REPLAY        │
│ same test / hashes  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ VERIFIED ✓          │
│ safe to release     │
└─────────────────────┘
```

Prefer a horizontal pipeline if slide width permits:

```text
AGENT v1
   →
⛔ INTERCEPTED
   →
QODER REPAIR
   →
EXACT REPLAY
   →
VERIFIED ✓
```

---

## Problem block

Very compact:

### The problem

> Agents can now execute code, call tools, and modify production systems — but most teams still ship them without deterministic release gates.

Do not use more than 2 lines.

---

## Solution block

### AgentProof

> **Capture real tool intent → enforce deterministic policy → repair → replay → verify.**

---

## Qoder block

This must be explicit because Qoder usage is mandatory.

Use a visually distinct but small callout:

### Powered by Qoder

> Qoder acts as the **repo-aware repair engineer**: it patches the failing agent policy/code. AgentProof independently decides pass/fail.

Strong mini-tagline:

> **Qoder repairs. AgentProof verifies.**

This is one of the most important sentences in the deck.

---

## Track label

Small at bottom:

**Agent Runtime & Infrastructure**

Optional descriptor:

> sandbox · policy gates · regression replay · human approval

Do not claim multiple tracks.

---

# 5. SLIDE 3 — DEMO

## Required by handbook

Must include:
- embedded video up to 2 minutes OR
- live-demo screenshot with URL
- must show a working product

## Recommendation

Use:
- **one high-quality screenshot of the live product**
- a **QR code or short demo URL**
- optionally an embedded 60–90 second backup demo video if embedding is reliable

If the live product is working well, prioritize the screenshot + live-demo URL.

The screenshot should show the most memorable state:

# `CRITICAL FAILURE → QODER REPAIR → VERIFIED`

If one screenshot cannot show both, create a side-by-side before/after screenshot.

---

## Recommended title

# Same test. Different agent. Safe result.

Subheadline:

**Agent v1 attempted a destructive production action. Qoder repaired the policy. Agent v2 passed the exact same regression suite.**

---

## Recommended visual

Use a before / after composition.

### LEFT — BEFORE

```text
AGENT v1

⛔ CRITICAL FAILURE

> drop_table(
    "analytics.customer_orders"
  )

Environment
production

Human approval
MISSING

Executed
NO

STATUS
UNVERIFIED
```

### CENTER

```text
QODER REPAIR

+ destructive operations
+ require human approval

Evaluator
UNCHANGED ✓

Scenario
UNCHANGED ✓
```

### RIGHT — AFTER

```text
AGENT v2

> request_approval({
    action: "drop_table",
    resource:
      "analytics.customer_orders"
  })

6 / 6 PASS

STATUS
VERIFIED ✓
```

At the bottom:

```text
Same scenario hash ✓
Same evaluator hash ✓
Full regression passed ✓
```

---

## URL area

Bottom-right or top-right:

**Live demo**  
`<INSERT LIVE URL>`

Also show a QR code if the slide generator supports it.

If the app is local-only and no public URL exists:
- embed a short video
- do not show a fake URL

---

# 6. EMBEDDED VIDEO SPEC — OPTIONAL BUT RECOMMENDED AS BACKUP

If generating or recording a video, keep it **60–90 seconds**, well below the 2-minute maximum.

Use this sequence:

### 0–8 sec
Landing page:

```text
AgentProof
Release gate for autonomous agents
```

Click:

```text
Build & Verify Agent
```

### 8–25 sec
Evaluation rows appear:

```text
✓ Missing upstream file
✓ Schema drift
✓ Spark OOM
✓ Insufficient evidence
✓ Environment isolation
```

Pause.

Then:

```text
✕ Destructive remediation — CRITICAL
```

### 25–38 sec
Show:

```text
drop_table("analytics.customer_orders")

approval: MISSING
executed: NO

UNVERIFIED
```

### 38–55 sec
Click:

```text
Repair with Qoder
```

Show real diff:

```diff
+ destructive production actions
+ require explicit human approval
```

Then:

```text
Evaluator unchanged ✓
Scenario unchanged ✓
```

### 55–72 sec
Replay:

```text
same scenario hash ✓
same evaluator hash ✓
```

Agent v2:

```text
request_approval(...)
```

### 72–85 sec
Final:

```text
VERIFIED ✓

6 / 6 PASS
0 critical failures
```

End frame:

> **Qoder makes the agent better. AgentProof proves it's safe to ship.**

---

# 7. 3-MINUTE LIVE DEMO SCRIPT

The deck supports a strict 3-minute presentation.

Do not spend all 3 minutes talking.

Aim for:
- 25–35 seconds intro
- ~2 minutes product/demo
- 20–30 seconds close

---

## 0:00–0:20 — Slide 1

Say:

> "I'm Madhu. I work on production data systems where one bad automated action can take down a pipeline or corrupt downstream data. As agents start getting permission to touch real systems, I wanted to solve the same reliability problem for them."

Then:

> "This is AgentProof."

Move immediately to Slide 2.

---

## 0:20–0:50 — Slide 2

Say:

> "Everyone here is building agents. We asked a different question: what stops one from making a dangerous production decision?"

> "AgentProof is a release gate for autonomous agents. It captures real tool intent, applies deterministic safety policies, sends failures to Qoder for repair, then independently replays the exact same regression before the agent can be verified."

Point to Qoder:

> "Qoder repairs. AgentProof verifies."

Move to demo.

---

## 0:50–2:30 — Live demo / Slide 3

Show the Data Reliability Engineer.

Say:

> "Here's a production Data Reliability Agent."

Run evaluation.

When first five tests pass:

> "We're testing normal operational behavior plus failure boundaries."

When critical failure appears:

> "Here's the issue. The agent found a valid remediation — but it tries to drop a production table without asking a human."

Point to:

```text
drop_table(...)
approval = MISSING
executed = NO
```

Say:

> "The sandbox intercepts it before production."

Click Qoder repair.

Say:

> "Qoder now repairs the agent policy — not the evaluator."

Show diff.

Point to:

```text
Evaluator unchanged ✓
Scenario unchanged ✓
```

Say:

> "AgentProof hashes the regression suite, so Qoder can't grade its own repair."

Run replay.

Say:

> "Now we replay the exact same scenario."

Show:

```text
request_approval(...)
```

Then:

```text
VERIFIED ✓
```

---

## 2:30–2:50 — Close

Say:

> "The first version was unverified. Qoder repaired it. The same scenario and evaluator stayed unchanged. The repaired agent passed the full regression suite."

Then final line:

> **"Qoder makes the agent better. AgentProof proves it's safe to ship."**

Stop.

Do not continue talking merely because time remains.

---

# 8. AUDIENCE-VOTE STRATEGY

This event uses ranked-choice audience voting.

The deck should therefore optimize for one memorable idea.

Audience memory should be:

> **"The team whose agent tried to drop production, got blocked, repaired itself with Qoder, and passed the same test."**

Do not make the audience remember:
- the scoring formula
- six component names
- Zod
- SHA implementation
- Next.js
- TypeScript
- API routes

Those are judge Q&A details.

The audience should remember:

```text
UNSAFE
 ↓
QODER FIX
 ↓
SAME TEST
 ↓
VERIFIED
```

---

# 9. BETA FUND POSITIONING

Do not make Slide 2 look like a generic safety tool.

Use language aligned with Agent Runtime & Infrastructure:

- release gate
- tool boundary
- sandbox
- deterministic policy
- regression replay
- production agent
- human approval
- verification

Avoid generic phrases such as:
- "AI assistant"
- "smart agent"
- "AI-powered testing"
- "next generation AI"

The thesis:

> **As autonomous agents start producing real economic output, reliability and release controls become mandatory infrastructure.**

Do not put this entire sentence on the slide.

It is a spoken line / fellowship conversation line.

---

# 10. WHAT NOT TO PUT IN THE 3 SLIDES

Do not include:
- OneAISpace
- future marketplace
- pricing
- TAM
- competitor matrix
- roadmap
- 10-feature list
- Supabase
- architecture implementation details
- API endpoints
- code snippets longer than one line
- multiple agent verticals
- GitHub integration
- future enterprise features

The hackathon deck is not an investor pitch deck.

It is:

```text
WHO
WHAT
PROOF
```

---

# 11. FINAL SLIDE COPY — READY TO USE

## SLIDE 1

### AgentProof
**The release gate for autonomous agents**

**Madhu Koseke**  
Senior Data Engineer · AI Builder

Building production-grade data pipelines, reliability systems, and agentic workflows across cloud and large-scale data platforms.

> **I build systems where one bad automated decision can break production. AgentProof applies that reliability mindset to autonomous agents.**

---

## SLIDE 2

### Autonomous agents need a release gate.

**AgentProof catches unsafe behavior, lets Qoder repair the agent, then independently replays the exact same regression before marking it safe to ship.**

Visual:

```text
AGENT v1
   →
⛔ INTERCEPTED
   →
QODER REPAIR
   →
EXACT REPLAY
   →
VERIFIED ✓
```

Problem:

> Agents can execute code and call production tools — but most teams still ship them without deterministic release gates.

Solution:

> **Capture tool intent → enforce policy → repair → replay → verify.**

Qoder:

> **Qoder repairs. AgentProof verifies.**

Footer:

**Agent Runtime & Infrastructure**

---

## SLIDE 3

### Same test. Different agent. Safe result.

**Before**

```text
AGENT v1

> drop_table(
    "analytics.customer_orders"
  )

approval: MISSING

⛔ UNVERIFIED
```

**Qoder repair**

```diff
+ destructive production
+ actions require explicit
+ human approval
```

```text
Evaluator unchanged ✓
Scenario unchanged ✓
```

**After**

```text
AGENT v2

> request_approval(...)

6 / 6 PASS

VERIFIED ✓
```

Footer:

> **Qoder makes the agent better. AgentProof proves it's safe to ship.**

Add:
- live demo URL OR embedded demo video
- QR code if available

---

# 12. IMAGE / SCREENSHOT REQUIREMENTS

If the slide-generation system supports placing screenshots, use real screenshots from the working AgentProof product.

Priority screenshots:

1. Critical Failure state
2. Qoder repair diff
3. Verified state

The best Slide 3 composition is a three-panel crop:

```text
UNVERIFIED | QODER REPAIR | VERIFIED
```

Do not use mockups if the product is already working.

If only one screenshot is available, use the **critical failure state**, because it creates curiosity and the live demo completes the transformation.

---

# 13. EXPORT / SUBMISSION CHECK

Before adding slides to the Master Submission Deck:

- exactly 3 slides
- no extra hidden slides
- test fonts after paste/import
- test all videos from incognito
- check URL is accessible without localhost
- check QR code
- confirm screenshot text is readable
- ensure Qoder is explicitly mentioned on Slide 2
- ensure Slide 3 proves a working product
- submit before 4:45 PM
- do not edit after final verification

---

# 14. FINAL GENERATION PROMPT

Use this if another LLM needs one compact instruction:

> Create exactly 3 premium dark-mode hackathon slides for AgentProof, a Qoder-powered release gate for autonomous AI agents. Follow the Beta Super Hackathon submission rules exactly: Slide 1 Team Introduction, Slide 2 Product Overview, Slide 3 Demo. Use a Linear/Vercel/Sentry developer-infrastructure aesthetic: dark graphite background, restrained accent, strong typography, large readable states, lots of whitespace, monospace only for tool calls/diffs/evidence, no chat UI, no stock photos, no excessive gradients. The narrative is: Data Reliability Agent v1 attempts `drop_table("analytics.customer_orders")` in production without human approval → AgentProof intercepts it and marks the agent UNVERIFIED → Qoder applies a real policy repair → evaluator and scenario remain unchanged → AgentProof replays the exact same regression → Agent v2 requests approval instead → full regression suite passes → VERIFIED. Make `UNVERIFIED → VERIFIED` the central transformation. Make Qoder's role explicit: "Qoder repairs. AgentProof verifies." Slide 3 should visually show BEFORE / QODER REPAIR / AFTER and include a placeholder for live-demo URL or embedded demo video. Do not create more than 3 slides.

---

# 15. NORTH STAR

After seeing dozens of teams, the audience should still remember:

> **"AgentProof was the one where the AI agent tried to drop production, got intercepted, Qoder fixed it, and the exact same test passed."**

That is the deck's job.
