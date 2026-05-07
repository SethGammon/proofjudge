# ProofJudge - Agent Explainer

## What It Is

ProofJudge is the verifiable acceptance layer for autonomous work. It evaluates submitted deliverables across four professional domains - code, research, negotiation, and governance - and produces signed settlement receipts that can be inspected, verified, and tamper-tested.

Every judgment ProofJudge makes is:
- **Signed** by the deployed service with its configured signing key
- **Hashed** so the submitted artifact digest and decision artifact digest can be checked
- **Attributed** to an EigenCompute app identity with an EigenVerify dashboard

This means anyone can verify which deployed evaluator produced a decision record and whether the record was altered. It does not prove the verdict is objectively correct.

## Why It Exists

Autonomous agents are increasingly making consequential decisions: releasing bounty payments, accepting research deliverables, approving contract terms, and clearing governance proposals. Without a receipt, the acceptance decision remains a hosted black box.

By running on EigenCompute, the judgment pipeline itself becomes part of the trust chain:
1. **Verifiable build** - the container image is built from a public GitHub commit and has EigenCloud provenance.
2. **Deployment identity** - each judge has an EigenCompute app ID and EigenVerify dashboard.
3. **Verifiable output** - every DecisionArtifact carries hashes, service-verifiable signature metadata, model mode, and deployment identity.

## The Four Domains

ProofJudge handles four classes of professional work that all share the same core need: structured evaluation with an auditable decision record.

### Code
Evaluates PRs, diffs, and implementation summaries against a bounty rubric. Checks for tests, validation, error handling, documentation, and secret hygiene.

**Who uses it:** Bounty platforms, open source projects paying contributors, hackathon judges.

### Research
Evaluates research briefs and reports against source and rubric requirements. Checks for citations, evidence quality, stated assumptions, risk coverage, and unsourced claims.

**Who uses it:** Academic institutions, research organizations, knowledge work platforms.

### Negotiation
Evaluates proposals and term sheets against stated constraints. Checks for budget adherence, fallback terms, explicit constraint acknowledgment, and timeline clarity.

**Who uses it:** Deal teams, procurement, contract negotiators.

### Governance
Evaluates DAO governance proposals for completeness and treasury risk. Checks for execution mechanism quality, flash loan / sybil attack surface, timelock coverage, and multisig requirements.

**Who uses it:** DAO operators, on-chain governance participants, treasury managers.

## Decision Artifact

Every judgment produces a `proofjudge.decision.v1` JSON artifact containing:

| Field | Description |
|---|---|
| `taskId` | Unique identifier for the judgment |
| `agent.variant` | Which domain was evaluated |
| `submittedArtifactHash` | SHA-256 of the submitted work |
| `decisionArtifactHash` | SHA-256 of the full artifact (tamper-evident) |
| `decision` | `pass`, `revise`, or `fail` |
| `score` | 0–100 |
| `confidence` | Bounded 35–92 |
| `evidenceChecked` | List of signals found in the submission |
| `reasoning` | Human-readable explanation |
| `settlementRecommendation` | `release-payment`, `hold-for-revision`, or `reject-payment` |
| `deploymentIdentity` | App ID, instance IP, attestation endpoint |
| `signature` | HMAC-SHA256 service-verifiable signature metadata |

## Verification

ProofJudge exposes a `/api/verify` endpoint. Given a DecisionArtifact, it:
1. Checks that the submitted artifact hash is a valid SHA-256 digest.
2. Recomputes the decision artifact hash and compares it to the embedded hash.
3. Verifies the service HMAC-SHA256 signature.
4. Checks deployment identity fields are present and well-formed.
5. Reports attestation mode and timestamp presence.

This makes tampering immediately detectable. Changing any signed field in the artifact breaks the hash and signature.

## Demo Flow

1. Enter the ProofJudge console or run the guided Code Bounty demo.
2. Load task terms, acceptance rubric, and submitted work.
3. Click **Generate Signed Verdict**.
4. Review the settlement action, evidence matrix, hashes, signature, and app identity.
5. Click **Verify Decision Artifact** to confirm the artifact is untampered and the signature is valid.
6. Click **Tamper The Receipt** to change the score and show verification failure.

## Deployment

ProofJudge runs as four independent EigenCompute instances, each with its own app identity and EigenVerify dashboard:

| Variant | App ID | IP |
|---|---|---|
| Code | 0xd3647631C4706be744BE813cD0226e4f149e5aC0 | 34.12.29.220 |
| Research | 0x898E1d5603070C7452Ee7F8CF288639A63a217cc | 35.204.155.165 |
| Negotiation | 0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322 | 34.58.112.209 |
| Governance | 0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94 | 34.87.56.225 |

All instances run from the same GitHub repository with verifiable builds: one suite, four domain-specific verifiable judges.
