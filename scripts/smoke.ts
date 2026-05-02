import assert from "node:assert/strict";
import { createDecisionArtifact, verifyDecisionArtifact } from "../src/judge.js";

const variants = ["code", "research", "negotiation", "governance"] as const;

for (const variant of variants) {
  const artifact = await createDecisionArtifact({
    variant,
    bountyDescription: "Evaluate a serious private-preview agent submission.",
    rubric: "Must include tests, evidence, risks, constraints, and a clear summary.",
    submittedArtifact: "The artifact includes tests, evidence, risk handling, constraints, and summary.",
    submitter: "smoke"
  });

  assert.equal(artifact.schemaVersion, "proofjudge.decision.v1");
  assert.equal(artifact.agent.variant, variant);
  assert.match(artifact.submittedArtifactHash, /^[a-f0-9]{64}$/);
  assert.match(artifact.decisionArtifactHash, /^[a-f0-9]{64}$/);
  assert.ok(["pass", "revise", "fail"].includes(artifact.decision));
  assert.ok(artifact.signature.value.length >= 32);
  assert.equal(verifyDecisionArtifact(artifact).ok, true);
}

console.log("Smoke checks passed for all ProofJudge variants.");
