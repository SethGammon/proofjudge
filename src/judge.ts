import { createHash, createHmac } from "node:crypto";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { Decision, DecisionArtifact, JudgeRequest, VerificationResult } from "./types.js";
import { variants } from "./variants.js";

export const judgeRequestSchema = z.object({
  variant: z.enum(["code", "research", "negotiation"]),
  bountyDescription: z.string().min(10),
  rubric: z.string().min(10),
  submittedArtifact: z.string().min(10),
  submitter: z.string().optional()
});

const normalize = (value: string) => value.toLowerCase();

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const entries = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
  return `{${entries.join(",")}}`;
}

function scoreSubmission(request: JudgeRequest): {
  score: number;
  decision: Decision;
  confidence: number;
  evidenceChecked: string[];
  reasoning: string[];
} {
  const config = variants[request.variant];
  const combined = normalize(`${request.bountyDescription}\n${request.rubric}\n${request.submittedArtifact}`);
  const artifact = normalize(request.submittedArtifact);

  const positives = config.positiveSignals.filter((signal) => combined.includes(signal));
  const risks = config.riskSignals.filter((signal) => artifact.includes(signal));
  const rubricTerms = normalize(request.rubric)
    .split(/[^a-z0-9-]+/)
    .filter((term) => term.length > 4);
  const coveredRubricTerms = rubricTerms.filter((term) => artifact.includes(term));
  const rubricCoverage = rubricTerms.length === 0 ? 0 : coveredRubricTerms.length / rubricTerms.length;

  const rawScore = Math.round(Math.min(100, positives.length * 9 + rubricCoverage * 45 - risks.length * 12));
  const score = Math.max(0, rawScore);
  const decision: Decision = score >= 72 ? "pass" : score >= 42 ? "revise" : "fail";
  const confidence = Math.max(35, Math.min(92, Math.round(45 + positives.length * 5 + rubricCoverage * 25 - risks.length * 4)));
  const evidenceChecked = [
    "bounty description",
    "acceptance rubric",
    "submitted artifact hash",
    ...positives.map((signal) => `positive signal: ${signal}`),
    ...risks.map((signal) => `risk signal: ${signal}`)
  ];

  const reasoning = [
    `${config.name} found ${positives.length} positive signal(s): ${positives.join(", ") || "none"}.`,
    `Rubric coverage estimate is ${Math.round(rubricCoverage * 100)}% based on shared terms between the rubric and artifact.`,
    risks.length > 0
      ? `Risk signal(s) requiring review: ${risks.join(", ")}.`
      : "No configured risk signal appeared in the submitted artifact.",
    `Decision is ${decision} at score ${score}/100.`
  ];

  return { score, decision, confidence, evidenceChecked, reasoning };
}

function deploymentIdentity() {
  const appId = process.env.EIGEN_APP_ID || "local-demo-app";
  const instanceIp = process.env.EIGEN_INSTANCE_IP || "127.0.0.1";
  const endpoint = process.env.EIGEN_ATTESTATION_ENDPOINT;

  return {
    appId,
    instanceIp,
    attestation: {
      mode: endpoint ? "eigencompute" as const : "demo-placeholder" as const,
      endpoint,
      note: endpoint
        ? "Attestation endpoint configured from EigenCloud environment."
        : "Local demo placeholder. Replace with EigenCompute attestation data after deployment."
    }
  };
}

function settlementRecommendation(decision: Decision): DecisionArtifact["settlementRecommendation"] {
  if (decision === "pass") {
    return {
      action: "release-payment",
      mode: "simulated",
      note: "Demo recommendation only. No real funds are held or released by ProofJudge."
    };
  }

  if (decision === "revise") {
    return {
      action: "hold-for-revision",
      mode: "simulated",
      note: "Demo recommendation only. Ask submitter for fixes before settlement."
    };
  }

  return {
    action: "reject-payment",
    mode: "simulated",
    note: "Demo recommendation only. Do not use for real escrow settlement."
  };
}

function signArtifact(payload: Omit<DecisionArtifact, "signature">): DecisionArtifact["signature"] {
  const body = stableStringify(payload);
  const key = process.env.PROOFJUDGE_SIGNING_KEY;
  if (key) {
    return {
      algorithm: "HMAC-SHA256",
      value: createHmac("sha256", key).update(body).digest("hex"),
      mode: "signed"
    };
  }

  return {
    algorithm: "DEMO-SHA256",
    value: sha256(`demo:${body}`),
    mode: "simulated"
  };
}

export function createDecisionArtifact(request: JudgeRequest): DecisionArtifact {
  const result = scoreSubmission(request);
  const config = variants[request.variant];
  const model = process.env.LLM_MODEL || "local-heuristic-judge";

  const base = {
    schemaVersion: "proofjudge.decision.v1" as const,
    taskId: `task_${nanoid(12)}`,
    agent: {
      name: config.name,
      variant: request.variant
    },
    bountyDescription: request.bountyDescription,
    rubric: request.rubric,
    submitter: request.submitter,
    submittedArtifactHash: sha256(request.submittedArtifact),
    decision: result.decision,
    score: result.score,
    confidence: result.confidence,
    evidenceChecked: result.evidenceChecked,
    reasoning: result.reasoning,
    settlementRecommendation: settlementRecommendation(result.decision),
    modelMetadata: {
      provider: "proofjudge-local",
      model,
      mode: "deterministic-demo" as const
    },
    deploymentIdentity: deploymentIdentity(),
    timestamp: new Date().toISOString()
  };

  const unsigned = {
    ...base,
    decisionArtifactHash: sha256(stableStringify(base))
  };

  return {
    ...unsigned,
    signature: signArtifact(unsigned)
  };
}

export function verifyDecisionArtifact(artifact: DecisionArtifact): VerificationResult {
  const { signature, decisionArtifactHash, ...base } = artifact;
  const recomputedDecisionArtifactHash = sha256(stableStringify(base));
  const expectedSignature = signArtifact({ ...base, decisionArtifactHash });
  const hashOk = decisionArtifactHash === recomputedDecisionArtifactHash;
  const signatureOk = signature.value === expectedSignature.value && signature.algorithm === expectedSignature.algorithm;
  const schemaOk = artifact.schemaVersion === "proofjudge.decision.v1";
  const submittedHashOk = /^[a-f0-9]{64}$/.test(artifact.submittedArtifactHash);
  const deploymentOk = Boolean(artifact.deploymentIdentity.appId && artifact.deploymentIdentity.instanceIp);

  const checks = [
    {
      label: "Schema",
      ok: schemaOk,
      detail: schemaOk ? "Decision artifact schema is recognized." : "Unexpected decision artifact schema."
    },
    {
      label: "Submitted artifact hash",
      ok: submittedHashOk,
      detail: submittedHashOk ? "Submitted artifact hash is a SHA-256 digest." : "Submitted artifact hash is malformed."
    },
    {
      label: "Decision artifact hash",
      ok: hashOk,
      detail: hashOk ? "Decision artifact hash matches the artifact body." : "Decision artifact hash does not match the artifact body."
    },
    {
      label: "Signature",
      ok: signatureOk,
      detail: signatureOk
        ? `Signature verified in ${signature.mode} mode.`
        : "Signature does not match this artifact body."
    },
    {
      label: "Deployment identity",
      ok: deploymentOk,
      detail: deploymentOk
        ? `${artifact.deploymentIdentity.appId} at ${artifact.deploymentIdentity.instanceIp}.`
        : "Deployment identity fields are missing."
    },
    {
      label: "Attestation status",
      ok: artifact.deploymentIdentity.attestation.mode === "eigencompute",
      detail:
        artifact.deploymentIdentity.attestation.mode === "eigencompute"
          ? "EigenCompute attestation endpoint is configured."
          : "Local alpha placeholder. Replace with EigenCompute attestation after deployment."
    }
  ];

  return {
    ok: checks.every((check) => check.ok || check.label === "Attestation status"),
    status: checks.every((check) => check.ok || check.label === "Attestation status") ? "verified" : "failed",
    message:
      checks.every((check) => check.ok || check.label === "Attestation status")
        ? "Decision artifact body, hash, signature, and deployment identity verified. Attestation remains explicitly labeled by mode."
        : "One or more verification checks failed. Do not rely on this decision artifact.",
    verifiedAt: new Date().toISOString(),
    decisionArtifactHashMatch: hashOk,
    signatureValid: signatureOk,
    checks,
    recomputedDecisionArtifactHash
  };
}
