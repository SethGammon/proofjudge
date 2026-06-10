# ProofJudge — UI/UX Redesign Brief & Demo Readiness Review

**Prepared:** 2026-06-09
**Context:** EigenCloud (Mustafa) wants to showcase ProofJudge on Eigen's social channels. Target deliverable is a **60–90s demo video** optimized for the X algorithm, plus tweet copy and a tailored blog write-up. This document is the single source of truth for the facelift: what the project is, how it's built, what it's worth, an honest demo rating, and a concrete UI/UX direction to aim for.

---

## 1. What ProofJudge Is (one paragraph)

ProofJudge is a **verifiable acceptance layer for autonomous work**. When an agent or human submits paid work (a PR, a research brief, a deal proposal, a governance proposal), ProofJudge evaluates it against explicit terms + a rubric inside EigenCompute, then emits a **signed, tamper-evident `DecisionArtifact`** — a "settlement receipt." Anyone can re-verify that the receipt came from the deployed evaluator and was not altered after signing. The pitch in one line: *"Agents are going to decide whether work gets paid. Who verifies the judge?"*

It is deliberately **not** "AI reviews your code." The durable primitive is the **signed acceptance record** that downstream systems use to release payment, hold, reject, escalate, or anchor reputation.

---

## 2. The Value Proposition (and why Eigen cares)

| EigenCloud thesis | ProofJudge's answer |
|---|---|
| Verifiable offchain compute | The judge runtime runs inside EigenCompute |
| Agent identity | Each judge carries App ID, instance IP, attestation link, signer metadata |
| High-stakes agent actions | The verdict gates real money: release / hold / reject / escalate |
| Proof over promise | The `DecisionArtifact` can be re-verified and tamper-tested |
| Agent economy | Other agents can `POST /api/judge` and consume JSON receipts |

This is genuinely well-aligned with Eigen's "verifiability as a programmable cloud service" story — which is *why* they want to feature it. The honest framing ("we prove provenance + integrity, not objective correctness") is a strength, not a weakness: it sounds like engineering, not hype.

**The single best moment in the whole product:** change one field in a signed receipt → verification fails instantly. Non-crypto audiences get it in two seconds. That moment is the demo. Everything else is setup for it.

---

## 3. How It's Currently Built

**Stack:** Express + TypeScript backend, **vanilla HTML/CSS/JS** static SPA frontend (no React/framework). Deployed 4× on EigenCompute as domain-specific judges sharing one codebase.

### Backend (clean, small, solid — leave it mostly alone)
| File | Lines | Role |
|---|---|---|
| `src/server.ts` | 74 | Routes: `/api/judge`, `/api/verify`, `/api/demo/:variant`, `/api/variants`, `/healthz`, SPA fallback |
| `src/judge.ts` | 308 | Zod validation → LLM scoring (Eigen AI Gateway, `claude-sonnet-4-5`) or heuristic fallback → artifact construction → HMAC-SHA256 signing → verification |
| `src/variants.ts` | 97 | The 4 domain configs + **one** sample case each + keyword signal sets + LLM system prompts |
| `src/types.ts` | 75 | `DecisionArtifact` / `VerificationResult` schema |

The judging logic is real. LLM path is live on all four deployments; heuristic fallback keeps it usable offline. Signing/verification/tamper-detection is honest crypto (HMAC-SHA256), with the limitation correctly disclosed (service-verifiable, not offline third-party verifiable).

### Frontend (this is where the work is)
| File | Lines | Notes |
|---|---|---|
| `src/public/index.html` | 575 | Three sections: cinematic **entry layer**, **story-mode** guided-demo modal, and the **console** (`.app-shell`) |
| `src/public/main.js` | 1,990 | Routing, guided demo (`STORY_SCENES`), judge/verify calls, receipt rendering, local receipt archive |
| `src/public/styles.css` | **5,288** | The tell. This is a *lot* of CSS for a 3-pane console |

The console is a three-column grid: **case rail** (`clamp(184px, 18vw, 232px)`) | **workbench** with 5 tabs (Workbench / Receipts / Agents / Verifier / Demo) | **receipt rail** (`clamp(280px, 24vw, 318px)`).

---

## 4. Harsh Demo-Readiness Rating

I'm separating three things people usually blur together:

| Dimension | Rating | Verdict |
|---|---|---|
| **Concept & value prop** | **8.5 / 10** | Strong, on-thesis for Eigen, honestly framed. The "who verifies the judge?" hook is real. |
| **Backend / correctness** | **8 / 10** | Real LLM judging, real signing, real tamper detection. Not a mockup. |
| **Current demo-readiness (as a 60–90s scroll-stopper)** | **4.5 / 10** | This is the problem. Great idea, under-served by the current UI. |

### Why current demo-readiness is a 4.5, specifically

You're right on both counts, and here's the diagnosis:

1. **The landing page tries to do everything at once.** Count what competes for attention in the first viewport (`index.html:69–149`): an eyebrow badge, H1, a paragraph, 3 "proof points," a mobile receipt card, 2 CTA buttons, **4 judge-identity buttons**, a **5-stage pipeline**, a "proof readout" block (with its own rail + scope + 3 checks + a boundary note), and a 3-item status strip — *plus* a floating receipt-stack visual and a "proof bridge." That's ~10 distinct UI clusters and two background animations before the user has done anything. The result reads as "important-looking" but parses as noise. Nothing is the hero.

2. **The console is cramped by construction.** The side rails are clamped narrow (`184–232px` and `280–318px` — `styles.css:29–30`) while the center holds a form *and* an evidence matrix *and* a reasoning trace. On a 1440px laptop this is three thin columns of small dark-on-dark text. There's no breathing room and no focal point. "Cramped and inelegant" is accurate.

3. **5,288 lines of CSS is a symptom, not a flex.** The entry layer alone carries cursor-tilt tracking, light fields, a "proof bridge," receipt fans, and parallax (`--cursor-tilt-x`, `--receipt-fan-rotate`, etc.). Ironically, your own master plan (`docs/proofjudge-finish-line-master-plan.md:271`) explicitly warned against "overly cinematic UI with little information density" — and the entry layer drifted into exactly that. Motion is being spent on chrome, not on the one thing that matters (the seal breaking).

4. **The content is static and singular.** Each judge has exactly **one** hardcoded sample (`variants.ts`), and there is no randomization anywhere (`grep` for `Math.random`/`sample`/`varied` → zero hits in `main.js`). Every run shows the same bounty, same score, same verdict. For something meant to feel like a *live* settlement layer, it feels like a slideshow. This is the gap behind your "dynamic and varied dummy content" ask.

5. **The hero moment is buried.** The tamper-fails-verification payoff — the single most legible, screenshot-worthy thing in the product — lives behind the *Verifier* tab, after a wall of secondary metadata. In a 60s video that moment should arrive by ~second 35 and fill the screen.

**Bottom line:** you have an 8.5/10 idea presented at 4.5/10. The facelift isn't polish — it's re-prioritization. The assets are all here; they're just ordered wrong and styled flat.

---

## 5. What To Aim For — UI/UX Direction

### North-star principle
> **One hero. One motion. One payoff.** Every screen should be building toward the seal breaking. If an element doesn't set up or pay off "this receipt is verifiable and tamper-evident," it's a candidate for deletion.

### 5.1 Make the receipt a *physical object*
Right now the receipt is a dark panel of `dt/dd` rows. It should read as a **sealed credential** — a card with weight, a visible wax-seal / signature glyph, an embossed verdict, and hash/signature rows that look *locked*. When tampered, the seal should **visibly crack** and the affected row should physically break alignment. This single metaphor does more work than all the cursor-tilt parallax combined.

### 5.2 Radical hierarchy — make something BIG
The current UI is uniformly small text. Establish a real scale:
- **Hero tier (huge):** the **verdict** (ACCEPT / REVISE / REJECT) and the **settlement action** (Release / Hold / Reject / Escalate).
- **Support tier (medium):** score, confidence, the 4-judge selector.
- **Forensic tier (small, monospace):** hashes, signature, app ID, attestation mode — these should look like machine output, deliberately.

### 5.3 Choreograph the payoff, don't bury it
Collapse the journey to a spine the eye can follow: **Terms → Judge → Signed Receipt → Verify → Tamper → Break.** The verification + tamper sequence should be a first-class, full-bleed moment, not a tab. Reuse the good pipeline language you already have (`PIPELINE_STEPS` in `main.js:84`) but spend the motion budget *here*.

### 5.4 Dynamic, varied dummy content (real endpoints, alive feel)
Keep `/api/judge` real, but make the demo feel alive:
- Build a **content library** (8–15 cases per judge) instead of one sample each — varied bounties, varied submitted work, varied verdicts/scores. Rotate them so repeat views never look identical.
- Add a **live receipt ticker**: a background stream of "receipts being issued" across the 4 judges (varied verdicts, timestamps, redacted hashes) so the console feels like infrastructure under load, not a single-player form.
- Vary the seeded numbers within believable bands so two screenshots are never the same.
- This is presentation seed data, clearly separated from the real judging path — not fake crypto.

### 5.5 Depth and layering — but disciplined
You want depth; the way to get it *without* another 5,000 lines of CSS:
- **3 planes:** background (faint proof-graph / ticker), mid-ground (the console), foreground (the receipt). Subtle parallax between planes, nothing else.
- One ambient motion, GPU-composited, that reinforces "verifiable compute" (e.g. a slow data/hash flow), not decorative orbs.
- Accent-code the 4 judges (green/blue/amber/violet already exist as tokens — `styles.css:11–16`) so switching judges visibly re-tints the world. That's "four lenses, one product" made visible.

### 5.6 Explain-as-you-go (technical detail, made legible)
You asked for "easy-to-understand aspects + technical detail." Do both via **progressive disclosure**: each pipeline stage carries a one-line plain-English caption ("we hash the inputs so the judge can't be quietly changed"), with the raw hash/JSON one click away. The architecture diagram (`index.html:454`) is currently a static row of nodes — make it the live spine that lights up as the real run progresses.

### 5.7 Landing page: cut it down or merge it in
Two viable options (pick one):
- **(A) Tight intro → fast drop-in:** one headline, one sentence, one "Watch it work" CTA that launches the choreographed run. Kill the proof-points/readout/status-strip pileup.
- **(B) Console-as-landing:** no separate marketing layer at all — open directly into the console with the choreographed demo auto-playing in a "presenter" state. Strong for a video, since there's no dead intro to trim.
For an X video, **(B)** is likely better: every second is product.

---

## 6. Specifically For The 60–90s X Video

Design the happy path as a **choreographed, repeatable script** (it can drive both the live demo and the recording):

```
0:00–0:08   Hook on screen: "Agents are deciding who gets paid. Who verifies the judge?"
            Console visible, accent-tinted, receipt ticker alive in the background.
0:08–0:25   A real code-bounty case loads. Pipeline runs stage-by-stage with plain captions.
0:25–0:35   The Signed Receipt assembles as a physical card — verdict + settlement action BIG,
            seal stamps on, hashes/signature lock in.
0:35–0:55   Verify: each check flips to ✓ in sequence. The receipt is "proven."
0:55–1:10   Tamper: change the score. Seal CRACKS, the row breaks, signature row goes red,
            "TAMPER DETECTED" locks in. This is the screenshot people share.
1:10–1:30   Pull back: 4 judges, one EigenCompute identity each, EigenVerify link.
            Close line: "ProofJudge doesn't make AI judgment perfect. It makes it accountable."
```

Optimize for the still-frame: at least one moment (the cracked seal) must be legible and striking as a *single paused frame*, because that's the thumbnail.

---

## 7. Scope Guardrails (don't regress)

- **Keep the backend and live EigenCompute deployments intact.** This is the facelift's credibility — don't break the real `/api/judge`, `/api/verify`, or the App IDs.
- **Don't add a 5th judge or new domains.** Depth over breadth.
- **Don't reintroduce decorative orbs/gradient-blob hero.** The master plan's "avoid" list (`master-plan.md:267–274`) is still correct.
- **Respect `prefers-reduced-motion`** — keep the existing reduced-motion path working.
- **Net CSS should shrink, not grow.** If the rewrite adds lines, it's probably adding chrome, not clarity.

---

## 8. Suggested Sequence

1. **Content library + ticker** (`variants.ts` / a new seed module) — makes everything below feel alive immediately.
2. **Receipt-as-object redesign** — the hero component; biggest visual ROI.
3. **Choreographed verify→tamper sequence** — the payoff; pull it out of the buried tab.
4. **Console decramp** — wider center, stronger hierarchy, planes/parallax.
5. **Landing decision (A or B)** — last, once the console can stand alone.
6. **Record the 60–90s path.**

---

*Open question for Seth: do you want me to spin up the local server and capture before/after screenshots so the review is anchored to the actual rendered state (and so we have a baseline for the video)? I held off auto-starting it per your workflow rules.*
