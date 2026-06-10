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

**Video:** screen-record the console's choreographed Auto-play (live deployment, stage Sound ON),
then film a facecam talk track and composite it as a rounded container bottom-left.
Pipeline: `.planning/video-v5/composite.mjs <screen.mp4> <face.mp4> [voiceDelaySec] [--circle]`
→ `proofjudge-promo-v5.mp4` (1080p60, voice-ducked demo audio, −16 LUFS). Tested and working.

**Talk track (timed to the autoplay acts, ~45s — conversational, not a VO read):**
| Act | Say |
|---|---|
| The question | "AI agents are starting to decide who gets paid. Nobody's verifying the judge. So I built one you can check." |
| The case file | "This is a real case — the terms, the rubric for *done*, and the work that actually arrived." |
| The judgment | "The judgment runs inside a trusted execution environment on EigenCompute — attested compute, under an identity anyone can inspect." |
| The receipt | "The verdict prints as a signed receipt. Score, hashes, judge identity — sealed." |
| The proof | "Anyone can re-verify it against the live judge. Every check passes." |
| The tamper | "Now watch — I change the score by one point…" *(pause for the slam)* "…and verification fails. The hash breaks, the signature breaks. Money doesn't move." |
| The point | "Proof, not promises. It's live — links below if you want to try to cheat it yourself." |

**Recording checklist:** ① record the screen first (live deployment — local shows DEMO mode and
100/100 scores; OBS, 1920×1080, capture tab audio, Sound on → Auto-play, hands off). ② Play that
capture back on a second screen while filming the facecam — talking to the playback gets natural
timing for free. ③ `node composite.mjs screen.mp4 face.mp4` (third arg nudges voice sync ±s).
If the autoplay feels tight to talk over, the per-act `beat()` values in `main.js` are one-number
stretches.

### Tweet 1 — Hook / Problem / Solution (+ video)
> I built an AI judge. Then I tried to cheat it.
>
> AI agents are starting to do paid work — and acceptance is the fragile part. Who judged it? Was the verdict changed? Can anyone check before money moves?
>
> ProofJudge decides inside an EigenCompute TEE and seals every verdict as a signed, tamper-evident receipt.
>
> At 0:XX I edit one byte. Watch what happens.

*(fill 0:XX with the tamper timestamp from the final cut; no links in tweet 1 — links suppress reach)*

### Tweet 2 — the links
> Try to cheat it yourself — all four judges are live on EigenCompute, and the receipts in the video are real:
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
- "I changed one byte of an AI judge's verdict. It noticed instantly."
- "Your AI agent just got paid for work nobody checked."
- "An AI judge can lie to you. Mine can't."

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
