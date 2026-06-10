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

## 2. Tweet copy

**FINAL (pairs with promo v4 — send this one to Mustafa):**
> AI agents are starting to decide who gets paid.
>
> So who verifies the judge?
>
> ProofJudge runs the verdict inside an EigenCompute TEE and seals it as a signed receipt anyone can re-verify before money moves.
>
> At 0:39 I edit one byte of a sealed verdict. Watch what the seal does. 🧾
>
> Proof, not promises.

No links in the body (links suppress reach) — put the four live judges + EigenVerify links in a
**pinned first reply**: "the receipts in the video are real — verify them yourself." Confirm with
Mustafa which handle to tag (@eigenlayer vs the EigenCloud account) — tag whichever account will
quote-tweet so the algorithm links the posts.

**Short alt:**
> Agents are deciding who gets paid. Nobody's verifying the judge. So I built one that can't lie
> about its verdicts — sealed in an EigenCompute TEE, broken by a single edited byte. 0:39. 🧾

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
