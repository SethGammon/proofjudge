# ProofJudge security best-practices review

Date: 2026-08-01  
Scope: Express API, browser client, receipt cryptography, dependency tree, GitHub Actions, and Cloudflare edge proxy.

## Executive summary

The review found no unresolved critical or high-severity issue in ProofJudge-owned code after remediation. Public inputs are now bounded and schema-validated, API failures are contained, browser-facing security headers are explicit, local archive values are constrained before they enter HTML or CSS classes, and new receipts use an offline-verifiable Ed25519 signature anchored to a published ProofJudge public key.

`npm audit --omit=dev` now reports four moderate entries from one transitive chain: `@layr-labs/ai-gateway-provider` to `@layr-labs/ecloud-sdk` to `dockerode` to `uuid@10.0.0`. No compatible upstream fix is currently available. ProofJudge does not call Dockerode or UUID directly, but the chain remains present in the production dependency graph and should be upgraded when EigenCloud publishes a compatible SDK.

## Remediated findings

### SEC-001: Unbounded public judge workload and oversized fields

Severity before fix: High  
Status: Resolved

The public judge endpoint could invoke model work without request throttling, and individual text fields had no upper bounds. Request schemas now enforce explicit maximums and both judge and verification routes have bounded rate policies (`src/judge.ts:18`, `src/server.ts:43`, `src/server.ts:115`).

### SEC-002: Unvalidated receipt verification and incomplete error containment

Severity before fix: High  
Status: Resolved

`POST /api/verify` previously accepted arbitrary object shapes and could throw through nested access. The full receipt is now parsed through a strict schema before verification, async judge errors are forwarded to the central handler, and API 404/error responses are generic (`src/judge.ts:32`, `src/server.ts:128`, `src/server.ts:171`).

### SEC-003: Shared-secret-only receipt verification

Severity before fix: Medium  
Status: Resolved with backward compatibility

New receipts use Ed25519. The signing identity is part of the hashed receipt body, the verifier separately checks mathematical signature validity and membership in the published trust registry, and legacy HMAC comparisons use constant-time equality (`src/judge.ts:87`, `src/judge.ts:323`, `src/judge.ts:384`, `src/judge.ts:445`). Existing HMAC and deterministic demo receipts remain supported.

### SEC-004: Missing browser security headers and framework disclosure

Severity before fix: Medium  
Status: Resolved

Express no longer emits `X-Powered-By`. Helmet now sets a restrictive Content Security Policy, frame protections, MIME-sniffing protection, referrer policy, and related browser headers (`src/server.ts:21`). The policy explicitly allows only the existing Google Fonts stylesheet/font origins in addition to same-origin assets.

### SEC-005: Local archive values entering HTML and CSS classes

Severity before fix: Medium  
Status: Resolved

Browser local storage is attacker-controlled state. Receipt decisions are now reduced to a three-value allowlist before use as CSS classes, and hashes, signature metadata, and deployment identity values are escaped before HTML insertion (`src/public/main.js:652`, `src/public/main.js:922`, `src/public/main.js:1682`, `src/public/main.js:2217`).

### SEC-006: High-severity dependency advisories

Severity before fix: High  
Status: Resolved for every compatible update

The initial tree reported 16 findings, including six high-severity findings. Non-breaking production updates and a targeted development-tool update reduced the tree to four moderate transitive entries. `npm run check` passes after the updates.

### SEC-007: Mutable CI actions and non-actionable health checks

Severity before fix: Medium  
Status: Resolved

Official GitHub actions are pinned to immutable commit SHAs. The scheduled public readiness check now opens or updates a bounded incident, restarts only an app whose cloud state is exactly `Exited`, leaves `Failed` and unknown states for human review, rechecks public behavior, and fails visibly if the demo remains unhealthy (`.github/workflows/live-readiness.yml`, `scripts/recover-exited.mjs`).

## Residual risk and follow-up

1. Track an EigenCloud provider/SDK release that removes the Dockerode to UUID advisory chain. Do not force a major UUID override through Dockerode without upstream compatibility evidence.
2. The canonical HTTPS Worker is an availability and transport boundary, not a substitute for EigenCompute identity or attestation. The receipt continues to expose the EigenCompute app identity used for judging.
3. Automatic recovery is intentionally narrow. `Failed`, `Running` but unreachable, and unknown states create an incident rather than triggering an upgrade or repeated transaction.
4. Rotate the Ed25519 key only with `npm run signing:provision -- --rotate`; the generator retains prior public keys so old receipts remain verifiable.

## Verification performed

- `npm run check`: TypeScript build and smoke tests passed, including Ed25519 signing, trust validation, legacy modes, and tamper rejection.
- Local HTTP behavior: security headers present, four deployment states measured, malformed verification returned HTTP 400.
- `npm run live:verify`: all four existing public judges passed health, demo, live judgment, receipt signing, and verification before rollout.
- Wrangler 4.118.0: generated runtime/binding types and dry-run bundle completed successfully.
- `npm audit --omit=dev`: four moderate transitive entries remain; no critical or high entries remain.
