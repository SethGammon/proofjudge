# ProofJudge Submission Packet

Last verified: 2026-05-09

## One-Line Summary

ProofJudge is a verifiable acceptance layer for autonomous work: it evaluates submitted work against explicit terms, emits a signed settlement receipt, and proves whether that receipt was altered after the deployed EigenCompute evaluator produced it.

## Primary Demo URL

```text
http://34.12.29.220:3000/
```

Primary path: Code Bounty guided demo.

## Live EigenCompute Apps

| Judge | URL | App ID | EigenVerify |
|---|---|---|---|
| Code | `http://34.12.29.220:3000/` | `0xd3647631C4706be744BE813cD0226e4f149e5aC0` | `https://verify.eigencloud.xyz/app/0xd3647631C4706be744BE813cD0226e4f149e5aC0` |
| Research | `http://35.204.155.165:3000/` | `0x898E1d5603070C7452Ee7F8CF288639A63a217cc` | `https://verify.eigencloud.xyz/app/0x898E1d5603070C7452Ee7F8CF288639A63a217cc` |
| Negotiation | `http://34.58.112.209:3000/` | `0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322` | `https://verify.eigencloud.xyz/app/0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322` |
| Governance | `http://34.87.56.225:3000/` | `0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94` | `https://verify.eigencloud.xyz/app/0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94` |

## Required Deliverables

| Deliverable | Location |
|---|---|
| Agent explainer | `docs/agent-explainer.md` |
| Architecture doc | `docs/architecture.md` |
| Architecture diagram | `docs/architecture-diagram.svg` |
| Product feedback | `docs/feedback.md` |
| Demo Day script | `docs/demo-day.md` |
| Demo video | `docs/demo-video/proofjudge-live-demo.webm` |
| Demo video raw URL | `https://raw.githubusercontent.com/SethGammon/proofjudge/master/docs/demo-video/proofjudge-live-demo.webm` |
| Local fallback screenshots | `docs/demo-backups/` |
| Live backup screenshots | `docs/live-demo-backups/` |
| Readiness audit | `docs/readiness-audit.md` |

## Verification Snapshot

Checks run on 2026-05-09:

```text
npm run check
Smoke checks passed for all ProofJudge variants.
```

Live API check:

| Judge | Health | Judge Mode | Signature | Verify Receipt | Tamper Test | Attestation |
|---|---|---|---|---|---|---|
| Code | Pass | `llm / eigen-gateway` | `signed` | Pass | Failed as expected | `eigencompute` |
| Research | Pass | `llm / eigen-gateway` | `signed` | Pass | Failed as expected | `eigencompute` |
| Negotiation | Pass | `llm / eigen-gateway` | `signed` | Pass | Failed as expected | `eigencompute` |
| Governance | Pass | `llm / eigen-gateway` | `signed` | Pass | Failed as expected | `eigencompute` |

## Presentation Spine

1. Agents are going to do paid work, but payment still needs an accountable acceptance decision.
2. ProofJudge turns task terms, rubrics, and submitted work into a signed DecisionArtifact.
3. The receipt includes settlement action, evidence, hashes, signature, app ID, and attestation mode.
4. Verification proves the receipt came from the deployed evaluator and was not altered.
5. Tampering with the score breaks verification immediately.
6. The trust boundary is honest: ProofJudge does not make AI judgment perfect. It makes AI judgment accountable.

## Demo Day Judging Alignment

| Guidance | ProofJudge answer |
|---|---|
| Clear value proposition | Paid-agent work needs an acceptance decision that counterparties can verify before settlement. |
| Would AWS/Vercel weaken it? | Yes. The value depends on EigenCompute app identity, attestation mode, and verifiable receipt production. |
| Multi-party trust problem | Worker, payer, evaluator, and downstream verifier all need the same tamper-evident record. |
| Meaningful EigenCompute use | Four live app IDs, EigenVerify links, runtime identity in receipts, signed judge/verify API, tamper failure. |
| Legible trust property | The demo visibly verifies the receipt, then changes the score and shows hash/signature failure. |
| Creativity | ProofJudge frames AI review as a reusable settlement receipt primitive for the agent economy. |

## Submitter Notes

- Use the Code deployment as the main live demo.
- Keep the Research, Negotiation, and Governance deployments as proof that the same receipt layer works across multiple paid-agent domains.
- Use the demo video if the live site is slow during judging.
- Use `docs/live-demo-backups/` as the visual fallback if screen sharing or network access fails.
