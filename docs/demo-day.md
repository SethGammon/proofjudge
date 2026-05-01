# ProofJudge Demo Day Script

## 0:00 - Opening

ProofJudge Code is a verifiable judge for software bounty work. It evaluates whether a submitted PR, diff, or implementation summary satisfies a bounty rubric and emits a decision artifact that can be independently reviewed.

## 0:25 - Why It Matters

Autonomous agents will increasingly pay for work, accept work, and route funds based on outcomes. If the judge is just a hosted black box, users must trust the operator. ProofJudge is designed for EigenCompute so the judging code, deployment identity, and decision artifact can become externally verifiable.

## 0:55 - Product Demo

I will show ProofJudge Code first. The app loads a seeded software bounty, rubric, and implementation artifact. I submit it to the agent and it produces a pass, fail, or revise decision.

The same runtime also supports Research and Negotiation variants, but the deployment gate is ProofJudge Code.

## 1:50 - Artifact

The artifact includes the task id, rubric, submitted artifact hash, decision artifact hash, decision, score, confidence, evidence checked, reasoning, model metadata, deployment identity, attestation mode, timestamp, signature, and simulated settlement recommendation. In this local demo, attestation is marked as a placeholder. In EigenCompute deployment, the same field is where the TEE evidence is attached.

Then I click Verify Decision. The app recomputes the decision hash, verifies the signature, checks deployment identity, and clearly labels attestation as alpha placeholder or EigenCompute-backed.

## 2:30 - Why EigenCloud

EigenCloud is the right substrate because the value is not just agent execution. The value is agent execution with evidence: what code ran, where it ran, and what artifact it produced.

## 2:50 - Close

The next step is wiring the LLM proxy, attaching live EigenCompute attestation evidence, and anchoring decision hashes onchain. ProofJudge is intentionally narrow, but it demonstrates the larger pattern: agents that make accountable decisions about real work.
