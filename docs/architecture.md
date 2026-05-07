# ProofJudge Architecture

ProofJudge is one Express + static SPA codebase deployed as a suite of four domain-specific EigenCompute judges. Each deployment exposes the same API shape and returns a signed `DecisionArtifact` that the UI presents as a settlement receipt.

Architecture diagram: [docs/architecture-diagram.svg](architecture-diagram.svg)

## System Flow

```text
Task terms + acceptance rubric + submitted work
  -> Settlement Console
  -> POST /api/judge
  -> judge runtime
  -> Eigen AI Gateway scoring or deterministic fallback
  -> DecisionArtifact construction
  -> HMAC-SHA256 service signature
  -> Signed Decision Receipt
  -> POST /api/verify or tamper test
```

## Runtime Boundaries

| File | Responsibility |
|---|---|
| `src/server.ts` | HTTP routes, static asset serving, SPA route fallback |
| `src/judge.ts` | request validation, scoring, artifact construction, signing, verification |
| `src/variants.ts` | domain configs, sample cases, signal sets, LLM system prompts |
| `src/types.ts` | API-facing TypeScript types |
| `src/public/index.html` | static SPA shell, cinematic entry, console surfaces |
| `src/public/main.js` | routing, guided demo, judge/verify calls, receipt rendering |
| `src/public/styles.css` | console layout, proof motion, responsive and reduced-motion behavior |

## Request Flow

1. The user enters the console or runs the guided Code Bounty demo.
2. The UI loads seeded case data from `GET /api/demo/:variant`.
3. The UI sends `POST /api/judge` with `variant`, task terms, rubric, submitted work, and optional submitter.
4. `judge.ts` validates the request with Zod.
5. If Eigen gateway credentials are present, the runtime attempts LLM scoring through the Eigen AI Gateway.
6. If the LLM path is unavailable, deterministic heuristic scoring keeps the service usable.
7. The runtime creates a `proofjudge.decision.v1` artifact with decision, score, confidence, reasoning, evidence checked, settlement recommendation, model metadata, deployment identity, timestamp, hashes, and signature.
8. The UI renders the artifact as a Signed Decision Receipt and stores recent receipts in browser local storage.

## Verification Flow

`POST /api/verify` accepts a DecisionArtifact and returns a verification result:

- schema recognized
- submitted artifact hash has valid SHA-256 shape
- decision artifact hash matches the artifact body
- service HMAC-SHA256 signature matches
- deployment identity fields are present
- attestation mode is reported
- the UI also checks timestamp presence

Important limitation: the verifier does not recompute the submitted artifact hash from raw submitted text because the raw submitted text is not included in the artifact. It verifies the receipt body, hash, signature, identity fields, and hash shape.

## EigenCompute Integration

- The service listens on `0.0.0.0:${PORT}` for EigenCompute.
- Deployment identity comes from `EIGEN_APP_ID`, `EIGEN_INSTANCE_IP`, and `EIGEN_ATTESTATION_ENDPOINT`.
- Eigen AI Gateway scoring activates when `KMS_SERVER_URL` or `KMS_AUTH_JWT` is present.
- The signing key comes from `PROOFJUDGE_SIGNING_KEY` when configured; otherwise local development uses simulated signature mode.
- The UI links every app ID to `https://verify.eigencloud.xyz/app/<APP_ID>`.

## Live App Registry

| Judge | App ID | IP |
|---|---|---|
| Code | `0xd3647631C4706be744BE813cD0226e4f149e5aC0` | `34.12.29.220:3000` |
| Research | `0x898E1d5603070C7452Ee7F8CF288639A63a217cc` | `35.204.155.165:3000` |
| Negotiation | `0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322` | `34.58.112.209:3000` |
| Governance | `0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94` | `34.87.56.225:3000` |

## Design Decisions

### Why settlement receipts?

The product is not a generic AI reviewer. The durable primitive is the signed acceptance record that can be used for settlement, appeal, audit, or reputation.

### Why HMAC first?

HMAC-SHA256 is enough for the current service-verifiable demo path: the deployed verifier can confirm that a receipt body still matches the embedded signature. Offline third-party verification is a future trust upgrade and should use asymmetric signing.

### Why keep heuristic fallback?

The live demo should not fail if the LLM gateway is unavailable. The fallback preserves API behavior and still demonstrates artifact signing, verification, deployment identity, and tamper detection.

### What is proof-safe to claim?

ProofJudge proves which deployed evaluator produced which decision artifact, under which rubric, with tamper-evident output. It does not prove that the verdict is objectively correct.
