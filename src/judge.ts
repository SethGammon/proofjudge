import {
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  sign as signBytes,
  timingSafeEqual,
  verify as verifyBytes
} from "node:crypto";
import { nanoid } from "nanoid";
import { z } from "zod";
import { eigen } from "@layr-labs/ai-gateway-provider";
import { generateText } from "ai";
import type { AgentVariant, Decision, DecisionArtifact, JudgeRequest, VerificationResult } from "./types.js";
import { trustedEd25519PublicKeys } from "./trusted-signing-keys.js";
import { variants } from "./variants.js";

export const judgeRequestSchema = z.object({
  variant: z.enum(["code", "research", "negotiation", "governance"]),
  bountyDescription: z.string().trim().min(10).max(12_000),
  rubric: z.string().trim().min(10).max(12_000),
  submittedArtifact: z.string().trim().min(10).max(120_000),
  submitter: z.string().trim().max(200).optional()
}).strict();

const signingIdentitySchema = z.object({
  algorithm: z.literal("Ed25519"),
  keyId: z.string().regex(/^ed25519:[a-f0-9]{64}$/),
  publicKey: z.string().min(40).max(200)
}).strict();

export const decisionArtifactSchema: z.ZodType<DecisionArtifact> = z.object({
  schemaVersion: z.literal("proofjudge.decision.v1"),
  taskId: z.string().min(1).max(100),
  agent: z.object({
    name: z.string().min(1).max(100),
    variant: z.enum(["code", "research", "negotiation", "governance"])
  }).strict(),
  bountyDescription: z.string().max(12_000),
  rubric: z.string().max(12_000),
  submitter: z.string().max(200).optional(),
  submittedArtifactHash: z.string().regex(/^[a-f0-9]{64}$/),
  decisionArtifactHash: z.string().regex(/^[a-f0-9]{64}$/),
  decision: z.enum(["pass", "fail", "revise"]),
  score: z.number().int().min(0).max(100),
  confidence: z.number().int().min(0).max(100),
  evidenceChecked: z.array(z.string().max(2_000)).max(100),
  reasoning: z.array(z.string().max(4_000)).max(100),
  settlementRecommendation: z.object({
    action: z.enum(["release-payment", "hold-for-revision", "reject-payment"]),
    mode: z.literal("simulated"),
    note: z.string().max(2_000)
  }).strict(),
  modelMetadata: z.object({
    provider: z.string().max(200),
    model: z.string().max(200),
    mode: z.enum(["deterministic-demo", "llm"])
  }).strict(),
  deploymentIdentity: z.object({
    appId: z.string().min(1).max(200),
    instanceIp: z.string().min(1).max(200),
    attestation: z.object({
      mode: z.enum(["demo-placeholder", "eigencompute"]),
      endpoint: z.string().url().max(2_000).optional(),
      note: z.string().max(2_000)
    }).strict()
  }).strict(),
  signingIdentity: signingIdentitySchema.optional(),
  timestamp: z.string().datetime(),
  signature: z.object({
    algorithm: z.enum(["Ed25519", "HMAC-SHA256", "DEMO-SHA256"]),
    value: z.string().min(32).max(512),
    mode: z.enum(["asymmetric", "signed", "simulated"])
  }).strict()
}).strict();

const normalize = (value: string) => value.toLowerCase();
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const publicKeyId = (publicKey: string) => `ed25519:${sha256(publicKey)}`;

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function configuredSigningIdentity(): DecisionArtifact["signingIdentity"] | undefined {
  const privateKeyValue = process.env.PROOFJUDGE_ED25519_PRIVATE_KEY;
  if (!privateKeyValue) return undefined;

  const privateKey = createPrivateKey({
    key: Buffer.from(privateKeyValue, "base64"),
    format: "der",
    type: "pkcs8"
  });
  const publicKey = createPublicKey(privateKey).export({ format: "der", type: "spki" }).toString("base64");
  const configuredPublicKey = process.env.PROOFJUDGE_ED25519_PUBLIC_KEY;
  if (configuredPublicKey && !safeEqual(publicKey, configuredPublicKey)) {
    throw new Error("Configured Ed25519 public key does not match the private signing key.");
  }

  return { algorithm: "Ed25519", keyId: publicKeyId(publicKey), publicKey };
}

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

const modelScoringSchema = z.object({
  score: z.coerce.number().finite().min(0).max(100),
  decision: z.enum(["pass", "revise", "fail"]).optional(),
  confidence: z.coerce.number().finite().min(35).max(95).default(65),
  evidenceChecked: z.array(z.string().trim().min(1).max(1_000)).min(1).max(20),
  reasoning: z.array(z.string().trim().min(1).max(2_000)).min(1).max(20)
}).strict();

// ── Per-variant LLM system prompts ────────────────────────────────────────────

function getSystemPrompt(variant: AgentVariant): string {
  const base = `Return ONLY valid JSON with this exact structure — no other text, no markdown fences:
{
  "score": <integer 0-100>,
  "decision": "<pass|revise|fail>",
  "confidence": <integer 35-95>,
  "evidenceChecked": ["<specific criterion you checked>", ...],
  "reasoning": ["<specific finding 1>", "<specific finding 2>", "<specific finding 3>"]
}

Score mapping: 72-100 → "pass" | 42-71 → "revise" | 0-41 → "fail"
Be specific. Reference exact rubric criteria. Do not pad reasoning.`;

  const prompts: Record<AgentVariant, string> = {
    code: `You are ProofJudge Code, a precise evaluator of technical work running inside a cryptographically verified TEE. Your verdicts are signed and immutable.

Evaluate code submissions against the bounty description and acceptance rubric. Assess:
- Correctness: does it solve the stated problem including edge cases?
- Test coverage quality: not just presence — do tests cover the specified scenarios?
- Security posture: input validation, injection surfaces, credential handling, privilege checks
- Rubric compliance: every criterion listed must be checked individually
- Consistency: naming, error handling, patterns consistent with rubric requirements

${base}`,

    research: `You are ProofJudge Research, a rigorous evaluator of knowledge work running inside a cryptographically verified TEE. Your verdicts are signed and immutable.

Evaluate research submissions using the Claims-Arguments-Evidence (CAE) framework:
- Decompose the submission into individual claims
- For each claim: is it backed by a cited source, or presented as an assumption?
- Source quality: does the citation actually SUPPORT the claim, or merely mention the topic?
- Completeness: are all rubric-specified areas covered with adequate depth?
- Risk coverage: are limitations, competing evidence, and failure modes acknowledged?

${base}`,

    negotiation: `You are ProofJudge Negotiation, a neutral evaluator of negotiation proposals running inside a cryptographically verified TEE. You are not a participant in this negotiation. Your verdicts are signed and immutable.

Evaluate proposals for COMPLETENESS against the stated rubric — not for who "wins":
- Did the proposal address EVERY material term listed in the rubric?
- Are proposed terms feasible and executable as stated?
- Flag any rubric requirement that was ignored, vague, or one-sidedly defined
- Note: you score completeness and rubric compliance, not advantage to either party

${base}`,

    governance: `You are ProofJudge Governance, a verifiable evaluator of DAO governance proposals running inside a cryptographically verified TEE. Your signed verdict is published before any vote opens.

Evaluate governance proposals against the stated rubric, assessing:
- TREASURY RISK: what percentage of treasury is at risk? Is execution reversible? Timeline clear?
- FEASIBILITY: are milestones realistic? Is the executing party accountable?
- ATTACK SURFACE: could this proposal be exploited via flash loan, sybil, front-running, or emergency bypass?
- EXECUTION MECHANISM: are quorum, timelock, multisig, and fallback conditions all specified?
- COMPLETENESS: does the proposal address every criterion in the evaluation rubric?

${base}`
  };

  return prompts[variant];
}

// ── Heuristic scorer (fallback when LLM gateway unavailable) ─────────────────

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
  const modelId = process.env.LLM_MODEL || "anthropic/claude-sonnet-4-5";

  const prompt = `BOUNTY DESCRIPTION:\n${request.bountyDescription}\n\nACCEPTANCE RUBRIC:\n${request.rubric}\n\nSUBMITTED WORK:\n${request.submittedArtifact}${request.submitter ? `\n\nSUBMITTER: ${request.submitter}` : ""}`;

  const result = await generateText({
    model: eigen(modelId),
    messages: [
      { role: "system", content: getSystemPrompt(request.variant) },
      { role: "user", content: prompt }
    ],
    maxOutputTokens: 800,
    temperature: 0.1
  });

  const text = result.text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`LLM returned non-JSON response: ${text.slice(0, 200)}`);

  const parsed = modelScoringSchema.parse(JSON.parse(jsonMatch[0]));
  const rawScore = Math.round(parsed.score);
  const decision: Decision = rawScore >= 72 ? "pass" : rawScore >= 42 ? "revise" : "fail";

  return {
    score: rawScore,
    decision,
    confidence: Math.round(parsed.confidence),
    evidenceChecked: parsed.evidenceChecked,
    reasoning: parsed.reasoning,
    mode: "llm",
    model: modelId
  };
}

// ── Scorer router ─────────────────────────────────────────────────────────────

async function scoreSubmission(request: JudgeRequest): Promise<ScoringResult> {
  if (process.env.KMS_SERVER_URL || process.env.KMS_AUTH_JWT) {
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
  if (payload.signingIdentity?.algorithm === "Ed25519") {
    const privateKeyValue = process.env.PROOFJUDGE_ED25519_PRIVATE_KEY;
    if (!privateKeyValue) throw new Error("Ed25519 signing identity is present but no private signing key is configured.");
    const privateKey = createPrivateKey({
      key: Buffer.from(privateKeyValue, "base64"),
      format: "der",
      type: "pkcs8"
    });
    const derivedPublicKey = createPublicKey(privateKey).export({ format: "der", type: "spki" }).toString("base64");
    if (!safeEqual(derivedPublicKey, payload.signingIdentity.publicKey)) {
      throw new Error("Ed25519 signing identity does not match the configured private key.");
    }
    return {
      algorithm: "Ed25519",
      value: signBytes(null, Buffer.from(body), privateKey).toString("base64"),
      mode: "asymmetric"
    };
  }
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
  const signingIdentity = configuredSigningIdentity();

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
    ...(signingIdentity ? { signingIdentity } : {}),
    timestamp: new Date().toISOString()
  };

  const unsigned = { ...base, decisionArtifactHash: sha256(stableStringify(base)) };
  return { ...unsigned, signature: signArtifact(unsigned) };
}

export function verifyDecisionArtifact(
  artifact: DecisionArtifact,
  options: { trustedPublicKeys?: readonly string[] } = {}
): VerificationResult {
  const { signature, decisionArtifactHash, ...base } = artifact;
  const recomputedDecisionArtifactHash = sha256(stableStringify(base));
  const hashOk = decisionArtifactHash === recomputedDecisionArtifactHash;
  const signedBody = stableStringify({ ...base, decisionArtifactHash });
  const configuredPublicKey = process.env.PROOFJUDGE_ED25519_PUBLIC_KEY;
  const trustedPublicKeys = new Set([
    ...trustedEd25519PublicKeys,
    ...(configuredPublicKey ? [configuredPublicKey] : []),
    ...(options.trustedPublicKeys ?? [])
  ]);

  let signatureOk = false;
  let signerTrusted = false;
  let signatureDetail = "Signature algorithm or signing identity is invalid.";
  if (signature.algorithm === "Ed25519" && artifact.signingIdentity?.algorithm === "Ed25519") {
    const identity = artifact.signingIdentity;
    const identityOk = identity.keyId === publicKeyId(identity.publicKey);
    signerTrusted = identityOk && trustedPublicKeys.has(identity.publicKey);
    try {
      const publicKey = createPublicKey({
        key: Buffer.from(identity.publicKey, "base64"),
        format: "der",
        type: "spki"
      });
      signatureOk = identityOk && verifyBytes(null, Buffer.from(signedBody), publicKey, Buffer.from(signature.value, "base64"));
    } catch {
      signatureOk = false;
    }
    signatureDetail = signatureOk
      ? "Ed25519 signature is mathematically valid for this receipt body."
      : "Ed25519 signature does not match this receipt body.";
  } else if (signature.algorithm === "HMAC-SHA256") {
    const key = process.env.PROOFJUDGE_SIGNING_KEY;
    if (key) {
      const expected = createHmac("sha256", key).update(signedBody).digest("hex");
      signatureOk = safeEqual(signature.value, expected);
      signerTrusted = signatureOk;
      signatureDetail = signatureOk
        ? "Legacy service HMAC verified with the configured shared key."
        : "Legacy HMAC does not match this receipt body.";
    }
  } else if (signature.algorithm === "DEMO-SHA256") {
    signatureOk = safeEqual(signature.value, sha256(`demo:${signedBody}`));
    signerTrusted = signatureOk;
    signatureDetail = signatureOk
      ? "Deterministic demo seal matches this receipt body."
      : "Deterministic demo seal does not match this receipt body.";
  }
  const schemaOk = artifact.schemaVersion === "proofjudge.decision.v1";
  const submittedHashOk = /^[a-f0-9]{64}$/.test(artifact.submittedArtifactHash);
  const deploymentOk = Boolean(artifact.deploymentIdentity.appId && artifact.deploymentIdentity.instanceIp);

  const checks = [
    { label: "Schema", ok: schemaOk, detail: schemaOk ? "Decision artifact schema is recognized." : "Unexpected decision artifact schema." },
    { label: "Submitted artifact hash", ok: submittedHashOk, detail: submittedHashOk ? "Submitted artifact hash is a valid SHA-256 digest." : "Submitted artifact hash is malformed." },
    { label: "Decision artifact hash", ok: hashOk, detail: hashOk ? "Decision artifact hash matches the artifact body." : "Decision artifact hash does not match — artifact was modified after signing." },
    { label: "Signature", ok: signatureOk, detail: signatureDetail },
    {
      label: "Signer trust",
      ok: signerTrusted,
      detail: signerTrusted
        ? artifact.signingIdentity
          ? `Signer ${artifact.signingIdentity.keyId} is in the published ProofJudge trust registry.`
          : "Legacy service seal was verified by the configured ProofJudge service."
        : "The signature may be mathematically valid, but its public key is not in the ProofJudge trust registry."
    },
    { label: "Deployment identity", ok: deploymentOk, detail: deploymentOk ? `${artifact.deploymentIdentity.appId} at ${artifact.deploymentIdentity.instanceIp}.` : "Deployment identity fields are missing." },
    {
      label: "Attestation status",
      ok: artifact.deploymentIdentity.attestation.mode === "eigencompute",
      detail: artifact.deploymentIdentity.attestation.mode === "eigencompute"
        ? "EigenCompute TEE attestation endpoint is configured."
        : "Demo placeholder. Deploy to EigenCompute for live attestation."
    }
  ];

  const coreOk = checks.filter((c) => c.label !== "Attestation status").every((c) => c.ok);
  return {
    ok: coreOk,
    status: coreOk ? "verified" : "failed",
    message: coreOk
      ? "Decision artifact body, hash, signature, and deployment identity all verified."
      : "Verification failed — artifact was modified after the verdict was signed.",
    verifiedAt: new Date().toISOString(),
    decisionArtifactHashMatch: hashOk,
    signatureValid: signatureOk,
    signerTrusted,
    checks,
    recomputedDecisionArtifactHash
  };
}
