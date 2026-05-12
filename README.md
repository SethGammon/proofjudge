# ProofJudge

ProofJudge is a verifiable acceptance layer for autonomous work. It evaluates submitted work against explicit terms, emits a signed `DecisionArtifact`, and lets anyone verify that the receipt was not altered after the deployed evaluator produced it.

The product is one ProofJudge suite with four domain-specific verifiable judges:

- ProofJudge Code: bounty and PR acceptance adjudication.
- ProofJudge Research: sourced research deliverable acceptance.
- ProofJudge Negotiation: deal-term compliance review.
- ProofJudge Governance: pre-vote governance risk receipt.

ProofJudge does not claim AI judgment is perfect. It makes the acceptance decision attributable, structured, signed, inspectable, and tamper-evident.

## Live EigenCompute Deployments

| Judge | App ID | URL | EigenVerify |
|---|---|---|---|
| Code | `0xd3647631C4706be744BE813cD0226e4f149e5aC0` | `http://34.12.29.220:3000` | [dashboard](https://verify.eigencloud.xyz/app/0xd3647631C4706be744BE813cD0226e4f149e5aC0) |
| Research | `0x898E1d5603070C7452Ee7F8CF288639A63a217cc` | `http://35.204.155.165:3000` | [dashboard](https://verify.eigencloud.xyz/app/0x898E1d5603070C7452Ee7F8CF288639A63a217cc) |
| Negotiation | `0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322` | `http://34.58.112.209:3000` | [dashboard](https://verify.eigencloud.xyz/app/0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322) |
| Governance | `0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94` | `http://34.87.56.225:3000` | [dashboard](https://verify.eigencloud.xyz/app/0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94) |

Public demo video:

- [docs/demo-video/proofjudge-live-demo.webm](docs/demo-video/proofjudge-live-demo.webm)
- [raw download URL](https://raw.githubusercontent.com/SethGammon/proofjudge/master/docs/demo-video/proofjudge-live-demo.webm)

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000/agents/code`.

Run checks:

```bash
npm run check
```

Expected local check output:

```text
Smoke checks passed for all ProofJudge variants.
```

## API

- `GET /healthz` returns service health.
- `GET /api/variants` returns judge metadata.
- `GET /api/demo/:variant` returns seeded demo inputs.
- `POST /api/judge` returns a signed `DecisionArtifact`.
- `POST /api/verify` verifies artifact hash, signature, schema, deployment identity, and attestation mode.

## Trust Boundary

Verification proves this decision record came from the configured ProofJudge evaluator and was not altered. It does not prove the verdict is objectively correct.

The current signature mode is service-verifiable HMAC-SHA256. Offline third-party verification is a future upgrade, likely with Ed25519 or another asymmetric signature scheme.

## Deliverables

- Agent explainer: [docs/agent-explainer.md](docs/agent-explainer.md)
- Architecture: [docs/architecture.md](docs/architecture.md)
- Architecture diagram: [docs/architecture-diagram.svg](docs/architecture-diagram.svg)
- Product feedback: [docs/feedback.md](docs/feedback.md)
- Demo Day script: [docs/demo-day.md](docs/demo-day.md)
- Demo video: [docs/demo-video/proofjudge-live-demo.webm](docs/demo-video/proofjudge-live-demo.webm)
- Submission packet: [docs/submission-packet.md](docs/submission-packet.md)

## Repository Hygiene

Do not commit private preview PDFs or `.env.*` deployment files to a public repository without explicit permission. `.env.example` is the only environment file intended to be tracked.
