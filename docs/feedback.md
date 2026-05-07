# EigenCloud Product Feedback - ProofJudge

Submitted by: Seth Gammon

Agent: ProofJudge, a verifiable acceptance layer for autonomous work.

Live app IDs:

| Judge | App ID |
|---|---|
| Code | `0xd3647631C4706be744BE813cD0226e4f149e5aC0` |
| Research | `0x898E1d5603070C7452Ee7F8CF288639A63a217cc` |
| Negotiation | `0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322` |
| Governance | `0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94` |

## Summary

ProofJudge tests whether EigenCompute can host a verifiable agent that produces signed settlement receipts for professional work acceptance. The core pattern works: an evaluator can run behind a public HTTP API, attach deployment identity to the artifact, and return a receipt that can be verified and tamper-tested.

## What Worked Well

**Verifiable app identity**

The EigenVerify dashboard is useful in the demo because it gives the audience a concrete app identity to inspect. The link format is simple enough to put directly in a receipt UI:

```text
https://verify.eigencloud.xyz/app/<APP_ID>
```

**Environment variable injection**

`EIGEN_APP_ID`, `EIGEN_INSTANCE_IP`, and attestation endpoint values are straightforward to expose in the artifact. This made deployment identity part of the receipt instead of a separate claim.

**HTTP service model**

The Express service model maps cleanly to agent APIs. `/api/judge`, `/api/verify`, `/healthz`, and seeded demo routes worked well for both local testing and live deployment.

**Tamper demo clarity**

The most effective proof moment is changing one field in the receipt and watching verification fail. Non-crypto audiences understand the value quickly when the score changes and the hash/signature rows fail.

## Friction Points

**LLM gateway readiness**

The LLM gateway path depends on Eigen-provided credentials and can fall back to deterministic scoring when unavailable. For serious agent demos, gateway readiness and failure modes should be surfaced clearly in docs and logs.

**Multi-deployment workflow**

ProofJudge uses four live deployments. Sequencing upgrades, environment files, and rate limits is manageable but not obvious. A documented multi-agent deployment pattern would help.

**In-app attestation evidence**

The external dashboard is useful, but a small SDK helper or standard endpoint for pulling a compact attestation summary into the app would make demos stronger.

**Payment hooks**

ProofJudge can produce a settlement recommendation, but there is no first-class payment trigger yet. A mock-to-real payment handoff would make the agent economy story much more concrete.

## Verifiability Feedback

What the demo can explain well:

- which app identity produced the receipt
- whether the artifact body still matches the embedded hash
- whether the service verifier accepts the signature
- whether the deployment identity and attestation mode are present

What remains trust-based:

- objective correctness of the verdict
- offline third-party HMAC verification
- model and inference determinism unless a future EigenAI verification path exposes stronger evidence

## Suggested Improvements

1. Publish a minimal Express agent template with health check, public port, Eigen env vars, and verifier route.
2. Add a compact attestation evidence helper for browser demos.
3. Document multi-instance deployment and upgrade sequencing.
4. Make LLM gateway auth requirements and failure states explicit.
5. Provide a payment or escrow integration example that consumes a signed decision artifact.

## Final Verdict

I would use EigenCompute again for verifiable agent demos. The strongest part is the identity and provenance story: ProofJudge can point to a live app ID, generate a receipt, verify it, and show tamper failure.

For production funds, the next requirements are reliable LLM gateway behavior, stronger offline-verifiable signatures, persistent receipt storage, and a payment trigger.
