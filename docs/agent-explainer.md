# ProofJudge Agent Explainer

ProofJudge is a verifiable judging runtime for autonomous work. A user defines a bounty, rubric, and submitted artifact. A focused agent evaluates whether the artifact satisfies the rubric and emits a signed `DecisionArtifact` that can be stored, reviewed, or anchored onchain.

The first submission target is ProofJudge Code: a verifiable software bounty judge. The shared runtime also supports Research and Negotiation variants, but those should be packaged as separate submissions only after Eigen mentor confirmation.

## Why EigenCloud

Judging work becomes more valuable when third parties can verify what code ran and where the decision came from. ProofJudge is designed to run inside EigenCompute so the decision pipeline can attach deployment identity and, when available, real TEE attestation evidence.

The current local build uses demo-mode attestation and deterministic signatures. That keeps the product honest for EigenCompute alpha: the interface is ready for real attestation, but the app does not claim trustless execution until those deployment values are available.

## Agent Variants

### ProofJudge Code

Evaluates a pull request, diff, or implementation summary against a bounty rubric. It focuses on tests, validation, secret handling, error handling, and documentation.

### ProofJudge Research

Evaluates a research brief against source and rubric requirements. It focuses on citations, evidence, risks, assumptions, claim separation, and executive summary quality.

### ProofJudge Negotiation

Evaluates an offer or proposal against constraints. It focuses on budget, fallback terms, non-negotiables, concessions, risk, and timeline.

## Decision Artifact

Each judgment produces a JSON artifact with:

- task id
- bounty description
- rubric
- submitter
- submitted artifact hash
- decision artifact hash
- pass, revise, or fail decision
- confidence
- evidence checked
- score
- reasoning
- simulated settlement recommendation
- model metadata
- Eigen deployment identity fields
- attestation metadata
- signature or simulated signature

## Demo Flow

1. Choose one of the three ProofJudge variants.
2. Load the seeded example or paste a real bounty, rubric, and artifact.
3. Click `Judge Artifact`.
4. Review the decision artifact, hash, deployment identity, attestation mode, and signature mode.
5. Click `Verify Decision` to check schema, input hash shape, decision hash, signature, deployment identity, and attestation status.

## Production Path

The next production version should replace local heuristics with an LLM-backed judge, wire the EigenCloud LLM proxy, attach real EigenCompute attestation evidence, and optionally anchor artifact hashes onchain.
