import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
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

const originalPrivateKey = process.env.PROOFJUDGE_ED25519_PRIVATE_KEY;
const originalPublicKey = process.env.PROOFJUDGE_ED25519_PUBLIC_KEY;
const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const testPrivateKey = privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");
const testPublicKey = publicKey.export({ format: "der", type: "spki" }).toString("base64");
process.env.PROOFJUDGE_ED25519_PRIVATE_KEY = testPrivateKey;
process.env.PROOFJUDGE_ED25519_PUBLIC_KEY = testPublicKey;

try {
  const artifact = await createDecisionArtifact({
    variant: "research",
    bountyDescription: "Evaluate a signed receipt using an asymmetric identity.",
    rubric: "Must verify the signature, published signer identity, and tamper evidence.",
    submittedArtifact: "The submission includes signature verification, trust anchoring, and tamper evidence.",
    submitter: "ed25519-smoke"
  });

  assert.equal(artifact.signature.algorithm, "Ed25519");
  assert.equal(artifact.signature.mode, "asymmetric");
  assert.equal(artifact.signingIdentity?.publicKey, testPublicKey);
  delete process.env.PROOFJUDGE_ED25519_PUBLIC_KEY;
  assert.equal(verifyDecisionArtifact(artifact, { trustedPublicKeys: [testPublicKey] }).ok, true);
  assert.equal(verifyDecisionArtifact(artifact, { trustedPublicKeys: [] }).signerTrusted, false);

  const tampered = structuredClone(artifact);
  tampered.score = Math.max(0, artifact.score - 1);
  assert.equal(verifyDecisionArtifact(tampered, { trustedPublicKeys: [testPublicKey] }).ok, false);
} finally {
  if (originalPrivateKey === undefined) delete process.env.PROOFJUDGE_ED25519_PRIVATE_KEY;
  else process.env.PROOFJUDGE_ED25519_PRIVATE_KEY = originalPrivateKey;
  if (originalPublicKey === undefined) delete process.env.PROOFJUDGE_ED25519_PUBLIC_KEY;
  else process.env.PROOFJUDGE_ED25519_PUBLIC_KEY = originalPublicKey;
}

console.log("Smoke checks passed for all ProofJudge variants.");
