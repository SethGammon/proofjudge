import { createHash, createHmac } from "node:crypto";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createEigenGateway } from "@layr-labs/ai-gateway-provider";
import { generateText } from "ai";
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
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  const record = value as Record<string, unknown>;
  const entries = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
  return `{${entries.join(",")}}`;
}

interface ScoringResult {
  score: number;
  decision: Decision;
  confidence: number;
  evidenceChecked: string[];
  reasoning: string[];
  mode: "heuristic" | "llm";
  model: string;
}

// ── Heuristic scorer (local dev fallback) ────────────────────────────────────

function scoreHeuristic(request: JudgeRequest): ScoringResult {
  const config = variants[request.variant];
  const combined = normalize(`${request.bountyDescription}\n${request.rubric}\n${request.submittedArtifact}`);
  const artifact = normalize(request.submittedArtifact);

  const positives = config.positiveSignals.filter((s) => combined.includes(s));
  const risks = config.riskSignals.filter((s) => artifact.includes(s));
  const rubricTerms = normalize(request.rubric).split(/[^a-z0-9-]+/).filter((t) => t.length > 4);
  const coveredRubricTerms = rubricTerms.filter((t) => artifact.includes(t));
  const rubricCoverage = rubricTerms.length === 0 ? 0 : coveredRubricTerms.length / rubricTerms.length;

  const rawScore = Math.round(Math.min(100, positives.length * 9 + rubricCoverage * 45 - risks.length * 12));
  const score = Math.max(0, rawScore);
  const decision: Decision = score >= 72 ? "pass" : score >= 42 ? "revise" : "fail";
  const confidence = Math.max(35, Math.min(92, Math.round(45 + positives.length * 5 + rubricCoverage * 25 - risks.length * 4)));

  return {
    score,
    decision,
    confidence,
    evidenceChecked: [
      "bounty description",
      "acceptance rubric",
      "submitted artifact hash",
      ...positives.map((s) => `positive signal: ${s}`),
      ...risks.map((s) => `risk signal: ${s}`)
    ],
    reasoning: [
      `${config.name} found ${positives.length} positive signal(s): ${positives.join(", ") || "none"}.`,
      `Rubric coverage estimate is ${Math.round(rubricCoverage * 100)}% based on shared terms between the rubric and artifact.`,
      risks.length > 0
        ? `Risk signal(s) requiring review: ${risks.join(", ")}.`
        : "No configured risk signal appeared in the submitted artifact.",
      `Decision is ${decision} at score ${score}/100.`
    ],
    mode: "heuristic",
    model: "local-heuristic-judge"
  };
}

// ── LLM scorer (EigenCompute with Eigen AI Gateway) ──────────────────────────

async function scoreWithLLM(request: JudgeRequest): Promise<ScoringResult> {
  const gatewayURL = process.env.EIGEN_GATEWAY_URL || "https://ai-gateway-dev.eigencloud.xyz";
  const modelId = process.env.LLM_MODEL || "anthropic/claude-sonnet-4-5";

  const gateway = createEigenGateway({
    baseURL: gatewayURL,
    attestConfig: {
      kmsServerURL: process.env.KMS_SERVER_URL!,
      kmsPublicKey: process.env.KMS_PUBLIC_KEY!,
      audience: gatewayURL
    }
  });

  const system = `You are ProofJudge, a precise and fair work evaluator running inside a cryptographically verified execution environment. Your judgments are signed and immutable.

Evaluate submitted work strictly against the bounty description and acceptance rubric. Be rigorous but fair.

Return ONLY valid JSON with this exact structure — no other text, no markdown fences:
{
  "score": <integer 0-100>,
  "decision": "<pass|revise|fail>",
  "confidence": <integer 35-95>,
  "evidenceChecked": ["<specific thing you examined>", ...],
  "reasoning": ["<specific finding 1>", "<specific finding 2>", "<specific finding 3>"]
}

Score mapping:
- 72-100 → "pass": meets or exceeds all rubric criteria
- 42-71  → "revise": has merit but has specific addressable gaps
- 0-41   → "fail": does not meet rubric requirements

Be specific. Reference actual rubric criteria in your reasoning.`;

  const prompt = `BOUNTY DESCRIPTION:\n${request.bountyDescription}\n\nACCEPTANCE RUBRIC:\n${request.rubric}\n\nSUBMITTED WORK:\n${request.submittedArtifact}${request.submitter ? `\n\nSUBMITTER: ${request.submitter}` : ""}`;

  const result = await generateText({
    model: gateway(modelId),
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    maxOutputTokens: 800,
    temperature: 0.1
  });

  const text = result.text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`LLM returned non-JSON response: ${text.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]);
  const rawScore = Math.max(0, Math.min(100, Number(parsed.score) || 0));
  // Enforce decision/score consistency regardless of what the LLM returned
  const decision: Decision = rawScore >= 72 ? "pass" : rawScore >= 42 ? "revise" : "fail";

  return {
    score: rawScore,
    decision,
    confidence: Math.max(35, Math.min(95, Number(parsed.confidence) || 65)),
    evidenceChecked: Array.isArray(parsed.evidenceChecked) ? parsed.evidenceChecked : ["bounty description", "acceptance rubric", "submitted artifact"],
    reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning : [String(parsed.reasoning || "No reasoning provided.")],
    mode: "llm",
    model: modelId
  };
}

// ── Scorer router ─────────────────────────────────────────────────────────────

async function scoreSubmission(request: JudgeRequest): Promise<ScoringResult> {
  if (process.env.KMS_SERVER_URL) {
    try {
      return await scoreWithLLM(request);
    } catch (err) {
      console.error("LLM scoring failed, falling back to heuristic:", err);
    }
  }
  return scoreHeuristic(request);
}

// ── Artifact construction ─────────────────────────────────────────────────────

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
  const notes: Record<Decision, string> = {
    pass: "Payment release recommended. Submitter met the acceptance criteria.",
    revise: "Hold payment. Request revision before settlement.",
    fail: "Payment rejection recommended. Submission did not meet acceptance criteria."
  };
  const actions: Record<Decision, DecisionArtifact["settlementRecommendation"]["action"]> = {
    pass: "release-payment",
    revise: "hold-for-revision",
    fail: "reject-payment"
  };
  return { action: actions[decision], mode: "simulated", note: notes[decision] };
}

function signArtifact(payload: Omit<DecisionArtifact, "signature">): DecisionArtifact["signature"] {
  const body = stableStringify(payload);
  const key = process.env.PROOFJUDGE_SIGNING_KEY;
  if (key) {
    return { algorithm: "HMAC-SHA256", value: createHmac("sha256", key).update(body).digest("hex"), mode: "signed" };
  }
  return { algorithm: "DEMO-SHA256", value: sha256(`demo:${body}`), mode: "simulated" };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function createDecisionArtifact(request: JudgeRequest): Promise<DecisionArtifact> {
  const result = await scoreSubmission(request);
  const config = variants[request.variant];

  const base = {
    schemaVersion: "proofjudge.decision.v1" as const,
    taskId: `task_${nanoid(12)}`,
    agent: { name: config.name, variant: request.variant },
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
      provider: result.mode === "llm" ? "eigen-gateway" : "proofjudge-local",
      model: result.model,
      mode: result.mode === "llm" ? "llm" as const : "deterministic-demo" as const
    },
    deploymentIdentity: deploymentIdentity(),
    timestamp: new Date().toISOString()
  };

  const unsigned = { ...base, decisionArtifactHash: sha256(stableStringify(base)) };
  return { ...unsigned, signature: signArtifact(unsigned) };
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
    { label: "Schema", ok: schemaOk, detail: schemaOk ? "Decision artifact schema is recognized." : "Unexpected decision artifact schema." },
    { label: "Submitted artifact hash", ok: submittedHashOk, detail: submittedHashOk ? "Submitted artifact hash is a SHA-256 digest." : "Submitted artifact hash is malformed." },
    { label: "Decision artifact hash", ok: hashOk, detail: hashOk ? "Decision artifact hash matches the artifact body." : "Decision artifact hash does not match the artifact body." },
    { label: "Signature", ok: signatureOk, detail: signatureOk ? `Signature verified in ${signature.mode} mode.` : "Signature does not match this artifact body." },
    { label: "Deployment identity", ok: deploymentOk, detail: deploymentOk ? `${artifact.deploymentIdentity.appId} at ${artifact.deploymentIdentity.instanceIp}.` : "Deployment identity fields are missing." },
    {
      label: "Attestation status",
      ok: artifact.deploymentIdentity.attestation.mode === "eigencompute",
      detail: artifact.deploymentIdentity.attestation.mode === "eigencompute"
        ? "EigenCompute attestation endpoint is configured."
        : "Local demo placeholder. Deploy to EigenCompute for live attestation."
    }
  ];

  const coreOk = checks.filter((c) => c.label !== "Attestation status").every((c) => c.ok);
  return {
    ok: coreOk,
    status: coreOk ? "verified" : "failed",
    message: coreOk
      ? "Decision artifact body, hash, signature, and deployment identity verified."
      : "One or more verification checks failed. Do not rely on this decision artifact.",
    verifiedAt: new Date().toISOString(),
    decisionArtifactHashMatch: hashOk,
    signatureValid: signatureOk,
    checks,
    recomputedDecisionArtifactHash
  };
}
