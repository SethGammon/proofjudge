import type { AgentVariant } from "./types.js";

export interface VariantConfig {
  id: AgentVariant;
  name: string;
  tagline: string;
  sampleBounty: string;
  sampleRubric: string;
  sampleArtifact: string;
  positiveSignals: string[];
  riskSignals: string[];
}

export const variants: Record<AgentVariant, VariantConfig> = {
  code: {
    id: "code",
    name: "ProofJudge Code",
    tagline: "Verifiable review for PR bounties and implementation claims.",
    sampleBounty: "Ship a GitHub OAuth callback fix with clear error handling and tests.",
    sampleRubric: "Must validate state, avoid logging secrets, include tests, and document failure modes.",
    sampleArtifact: "Diff validates oauth state, removes token logs, adds callback.test.ts, and updates README troubleshooting.",
    positiveSignals: ["test", "validate", "state", "error", "document", "readme", "type", "lint"],
    riskSignals: ["secret", "token log", "todo", "hardcode", "skip", "unsafe", "any"]
  },
  research: {
    id: "research",
    name: "ProofJudge Research",
    tagline: "Verifiable grading for sourced research briefs.",
    sampleBounty: "Produce a sourced brief on verifiable AI infrastructure for agent wallets.",
    sampleRubric: "Must cite sources, separate claims from assumptions, cover risks, and provide an executive summary.",
    sampleArtifact: "Brief includes 8 citations, a claims table, risk section, and concise executive summary.",
    positiveSignals: ["cite", "source", "risk", "summary", "assumption", "evidence", "claim", "timeline"],
    riskSignals: ["uncited", "probably", "unknown", "missing", "hallucinated", "no source"]
  },
  negotiation: {
    id: "negotiation",
    name: "ProofJudge Negotiation",
    tagline: "Verifiable checks for offers against stated constraints.",
    sampleBounty: "Evaluate a vendor proposal against price, delivery, and fallback constraints.",
    sampleRubric: "Must respect budget, include fallback terms, preserve must-haves, and identify unacceptable concessions.",
    sampleArtifact: "Proposal stays under budget, includes fallback timeline, lists non-negotiables, and flags support risk.",
    positiveSignals: ["budget", "fallback", "constraint", "term", "must-have", "risk", "timeline", "concession"],
    riskSignals: ["over budget", "unbounded", "no fallback", "unclear", "concede", "missing"]
  }
};

export const variantList = Object.values(variants);
