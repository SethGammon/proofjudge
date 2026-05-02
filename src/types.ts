export type AgentVariant = "code" | "research" | "negotiation" | "governance";

export type Decision = "pass" | "fail" | "revise";

export interface JudgeRequest {
  variant: AgentVariant;
  bountyDescription: string;
  rubric: string;
  submittedArtifact: string;
  submitter?: string;
}

export interface ModelMetadata {
  provider: string;
  model: string;
  mode: "deterministic-demo" | "llm";
}

export interface DeploymentIdentity {
  appId: string;
  instanceIp: string;
  attestation: {
    mode: "demo-placeholder" | "eigencompute";
    endpoint?: string;
    note: string;
  };
}

export interface DecisionArtifact {
  schemaVersion: "proofjudge.decision.v1";
  taskId: string;
  agent: {
    name: string;
    variant: AgentVariant;
  };
  bountyDescription: string;
  rubric: string;
  submitter?: string;
  submittedArtifactHash: string;
  decisionArtifactHash: string;
  decision: Decision;
  score: number;
  confidence: number;
  evidenceChecked: string[];
  reasoning: string[];
  settlementRecommendation: {
    action: "release-payment" | "hold-for-revision" | "reject-payment";
    mode: "simulated";
    note: string;
  };
  modelMetadata: ModelMetadata;
  deploymentIdentity: DeploymentIdentity;
  timestamp: string;
  signature: {
    algorithm: "HMAC-SHA256" | "DEMO-SHA256";
    value: string;
    mode: "signed" | "simulated";
  };
}

export interface VerificationResult {
  ok: boolean;
  status: "verified" | "failed";
  message: string;
  verifiedAt: string;
  decisionArtifactHashMatch: boolean;
  signatureValid: boolean;
  checks: Array<{
    label: string;
    ok: boolean;
    detail: string;
  }>;
  recomputedDecisionArtifactHash: string;
}
