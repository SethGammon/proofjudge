# ProofJudge — Post Kit (Eigen showcase)

For the Thursday-morning EigenCloud post. Mustafa's framing: *"show other developers/founders
what's possible to build with TEEs."* Everything below is built around that — the video is a
TEE-capability demo wearing a product's clothes.

---

## 1. The 60–90s capture

**Setup:** 1920×1080 browser window (or 2560×1440 for crispness), `http://localhost:3000/agents/code`
(or a live deployment URL — live is better: LLM mode gives varied scores and `eigencompute`
attestation). Hide bookmarks bar. Cursor visible — the tamper click is a human moment.

**The capture is just the Stage in autoplay:** click **Run the proof** → click **Auto-play** →
record until the close card settles. One take, no editing required except trimming the ends.
If you want manual pacing for emphasis, drive it with `→` instead and linger on the tamper frame.

| Time (approx) | Act | What's on screen | Muted-autoplay caption already on screen |
|---|---|---|---|
| 0:00–0:05 | 01 · The question | Breathing seal → "Agents are deciding who gets paid." / *Who verifies the judge?* | yes — title card |
| 0:05–0:12 | 02 · The case file | Three sheets assemble: terms, rubric, submitted work | "A case file hits the desk." |
| 0:12–0:20 | 03 · The judgment | Identity bar (EigenCompute · attested TEE · app ID) + 5-step pipeline runs — **real `/api/judge` call** | "The judge runs inside EigenCompute." |
| 0:20–0:28 | 04 · The receipt | The paper prints large, score counts up, seal stamps | "The verdict prints as a signed receipt." |
| 0:28–0:36 | 05 · The proof | VERIFIED stamp + six checks cascade — **real `/api/verify` call** | "Anyone can re-verify it." |
| 0:36–0:48 | 06 · The tamper test | Score clicked +1 → red **VERIFICATION FAILED** stamp, seal cracks, hash mismatch shown | "Verification fails. The seal did its job." |
| 0:48–0:60 | 07 · The point | "Proof, not promises." + *Built on EigenCompute · attested TEE compute* | closing card |

**Thumbnail / pause-frame:** the tamper act, just after the stamp slams — red
"VERIFICATION FAILED" across the green ACCEPTED, broken score row, failing checks on the right.
Screenshot it at full res for the tweet's static fallback.

---

## 2. The v5 video (facecam over autoplay) + thread

Per Mustafa's feedback (face + voice performs best; copy = Hook / Problem / Solution, links in
tweet 2, build detail in tweet 3).

**Format: the real product, driven by hand.** A walkthrough from the home page → console → Code
judge with three contrasting verdicts, facecam container bottom-left. ~75 seconds. No motion
graphics — the seal doing its job *is* the show.

**Recording (one sitting):**
1. Redeploy the current frontend first — the live deployments predate the new console, and
   recording locally shows `demo-placeholder` attestation on the receipts.
2. **OBS**: 1920×1080 display capture of the browser, **mic muted** (desktop-audio track left
   enabled so the file has an audio stream). You drive.
3. **Windows Camera** (1080p, eye level, light in front): records simultaneously — this is the
   voice track. **Clap once on camera before you start driving** — I use it to sync the two files.
4. Drop both in `.planning/video-v5/` → `node composite.mjs screen.mp4 face.mp4 [voiceDelaySec]`.

**Shot list + script.** Spoken language, written to be said out loud while you drive. Point at
what you're talking about with the cursor. Don't rush the tamper beat.

1. **Home page** (hold a few seconds, then click *Open the console*)
   "So this is ProofJudge. The whole idea is that AI agents are starting to decide who gets
   paid, and right now there's no good way to verify the judge. ProofJudge turns every
   acceptance decision into a signed receipt that anyone can check. Let me show you what
   that actually looks like."

2. **Console overview** (sweep the four cards, then click *Enter chamber* on Code)
   "This is the console. There are four judges running live on EigenCompute. One for code
   review, one for research, one for negotiations, and one for governance. They're all the
   same proof machine, and each one is deployed under its own identity that you can actually
   go inspect."

3. **OAuth case** (point at the three panels, then click *Judge this work*)
   "Here's a real case. You've got the terms of what was promised, the rubric that defines
   what done means, and the actual code that was submitted. When I hit judge, it hashes the
   inputs, scores the work against the rubric, collects its evidence, and then seals and
   signs the whole thing inside the TEE."

4. **The receipt prints** (let it land, point at the verdict)
   "And there's the receipt. Accepted, with the score, the hashes, and the judge's identity,
   all signed. The recommendation says release the payment."

5. **Tamper test** (click *Tamper test*, hold on the broken receipt, then *Restore original*)
   "Now here's my favorite part. Watch what happens if anyone touches this after it's been
   sealed. The tamper test changes the score by a single point. And verification fails
   instantly. The hash doesn't match anymore, the signature breaks, and the money doesn't
   move. When I restore the original, it verifies clean again."

6. **CSV case** (click *CSV export rewrite*, then *Judge this work*)
   "It's also not just a yes machine. This next submission has thin tests and a couple of
   TODOs left in it, so the judge comes back with revise. Hold the payment, send it back."

7. **Session patch** (click *Session middleware patch*, then *Judge this work*)
   "And this one hardcodes a key and skips the test suite entirely. Straight up rejected."

8. **Close** (hover the receipt, glance at the EigenVerify link)
   "So that's ProofJudge. Every one of these receipts can be re-verified by anyone, against
   a judge whose identity is public. Proof, not promises. Links are below if you want to go
   break a receipt yourself."

The accept, revise, reject arc is the quiet flex: three different verdicts from the same judge
proves it's judging, not rubber-stamping.

### Tweet 1 — Hook / Problem / Solution (+ video)
> AI agents are deciding who gets paid. Nobody verifies the judge.
>
> Acceptance is the fragile part of agent work — who judged it, was the verdict changed, can anyone check it before money moves?
>
> ProofJudge settles this with hardware, not promises: every verdict is decided inside an EigenCompute TEE and sealed as a signed receipt.
>
> At 0:XX one edited byte kills the payment.

*(fill 0:XX with the slam timestamp from the final cut; no links in tweet 1 — links suppress reach.
The hook is the exact line the video opens with — copy and video say the same thing on purpose.)*

### Tweet 2 — the links
> Break one yourself — all four judges are live on EigenCompute, and the receipts in the video are real:
>
> Code · Research · Negotiation · Governance: [live links]
>
> Each judge's TEE identity is publicly inspectable on EigenVerify: [links]

### Tweet 3 (optional) — the build
> Under the hood: terms + rubric + work are hashed, judged inside attested TEE compute, and the verdict ships as a DecisionArtifact — HMAC-signed in the enclave, re-verifiable via /api/verify.
>
> Change any field — score, hash, identity — and verification fails.
>
> One codebase, four deployments. Built to show what you can ship on TEEs.

**Hook alternates (same slot, pick one):**
- "Money is starting to move on AI verdicts nobody can check."
- "An AI verdict is just a row in a database — until you seal it."
- "One edited byte just stopped a payment."

Confirm with Mustafa which handle to tag — tag whichever account will quote-tweet so the
algorithm links the posts.

### Earlier variants (superseded)

**A — the hook:**
> Agents are starting to decide who gets paid.
>
> So who verifies the judge?
>
> ProofJudge — built on @eigenlayer's EigenCompute — turns work acceptance into a signed,
> tamper-evident receipt. Judged inside a TEE. Re-verifiable by anyone. Edit one field and
> verification fails.
>
> Proof, not promises. 🧾

**B — the developer angle (Eigen's framing):**
> What can you actually build with TEEs?
>
> Here's ProofJudge: an acceptance judge for agent work that runs inside EigenCompute. Every
> verdict ships as a signed DecisionArtifact — hashes, judge identity, settlement action — and
> anyone can re-verify it before money moves.
>
> Watch what happens when you tamper with one field 👇

**C — short + punchy:**
> AI judges are coming for the "should this get paid?" decision.
>
> ProofJudge makes that judgment accountable: sealed in a TEE, signed, and broken by a single
> edited byte. Built on EigenCompute.

**Suggested pinned reply:** the four live judge deployments, each with its EigenVerify link
(Code / Research / Negotiation / Governance app IDs), plus "the receipts in the video are real —
here's the verifier."

---

## 3. Honesty checklist (don't get community-noted)

- Say "signed inside EigenCompute" / "TEE-attested runtime" — **don't** claim on-chain settlement
  (settlement action is `mode: simulated`) or offline third-party signature verification
  (HMAC is service-verifiable today; the app's Trust tab says so).
- The Stage badge says "real judge · real signatures" — true on a live deployment; record there.
- The entry ticker is labeled SIMULATED FEED on screen; avoid framing it as live volume.
