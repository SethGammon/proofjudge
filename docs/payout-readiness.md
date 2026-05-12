# ProofJudge Payout Readiness

Last checked: 2026-05-09

## Source Requirement

Local source: `docs/private-preview/EigenCloud Private Preview Program - Onboarding Materials.pdf`, page 6.

The private-preview compensation slide says Eigen Labs pays base compensation for up to 3 agents per participant that complete the full deliverable set.

## Base Payout Requirements

| Requirement | Payout | ProofJudge status | Evidence |
|---|---:|---|---|
| Complete Orientation | `$25` | Needs human/program confirmation | Program attendance/confirmation is not verifiable from repo contents. |
| Deployed Agent | `$50` | Complete for 4 live deployments | `README.md`, `docs/submission-packet.md`, live `/healthz` checks |
| Agent Write-Up / Explainer | `$50` | Complete | `docs/agent-explainer.md`, `docs/architecture.md`, `docs/architecture-diagram.svg` |
| Agent Website / Demo Live | `$50` | Complete for suite; likely complete per live agent route | Public URLs and `docs/demo-video/proofjudge-live-demo.webm` |
| Agent Product Feedback Doc | `$50` | Complete | `docs/feedback.md` |
| Demo Day Participation | `$50` | Pending until 2026-05-12 presentation happens | `docs/demo-day.md`; attendance must actually occur |

Maximum base payout is `$275` per agent. Maximum pre-prize base payout for 3 agents is `$825`.

## Per-Agent Evidence

| Agent | Live route | App ID | Deployment | Write-up | Website/demo | Feedback |
|---|---|---|---|---|---|---|
| Code | `http://34.12.29.220:3000/agents/code` | `0xd3647631C4706be744BE813cD0226e4f149e5aC0` | Ready | Covered | Strongest path; video focuses here | Covered |
| Research | `http://35.204.155.165:3000/agents/research` | `0x898E1d5603070C7452Ee7F8CF288639A63a217cc` | Ready | Covered | Public route works; visible in suite | Covered |
| Negotiation | `http://34.58.112.209:3000/agents/negotiation` | `0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322` | Ready | Covered | Public route works; visible in suite | Covered |
| Governance | `http://34.87.56.225:3000/agents/governance` | `0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94` | Ready | Covered | Public route works; visible in suite | Covered |

## Main Risk

The technical and documentation boxes are covered. The payout risk is classification:

- If Eigen treats ProofJudge as one suite/agent submission, the base payout case is `$275` before prizes.
- If Eigen treats the Code, Research, Negotiation, and Governance deployments as separate agents sharing one suite, the strongest max-base-payout case is 3 agents for `$825` before prizes.

To strengthen the 3-agent payout case, submit the first three live routes explicitly as separate agents or separate agent instances, while linking the same suite-level explainer, architecture, feedback doc, and demo video. If the form allows only one entry, ask the mentor whether the four live ProofJudge deployments count as multiple paid agents under the "up to 3 agents" rule.

## Recommended Claim

Use this wording in the submission or mentor message:

```text
ProofJudge is one receipt framework deployed as four live EigenCompute agents: Code, Research, Negotiation, and Governance. Each has its own app ID, public route, EigenVerify dashboard, live judge/verify API, and signed receipt path. For the paid-agent deliverables, please confirm whether these count as separate agents up to the program limit of three, or as one suite submission.
```

