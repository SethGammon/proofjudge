import type { AgentVariant } from "./types.js";

export interface VariantConfig {
  id: AgentVariant;
  name: string;
  tagline: string;
  icon: string;
  accent: string;
  problemStatement: string;
  bullets: [string, string, string];
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
    tagline: "Verifiable review for code bounties and PRs.",
    icon: "{ }",
    accent: "#00ff9d",
    problemStatement: "AI slop floods bug bounty inboxes — curl ended their HackerOne program after 8× more reports, only 5% real. Gitcoin puts payment on-chain but evaluation off-chain with no audit trail. ProofJudge Code produces a signed, per-criterion verdict that anyone can verify.",
    bullets: [
      "Rubric-based scoring per criterion, not holistic guessing",
      "Security surface check: injection, auth, credential handling",
      "Signed reasoning trace — every flag is auditable"
    ],
    sampleBounty: "Ship a GitHub OAuth callback fix with clear error handling and tests.",
    sampleRubric: "Must validate state parameter, avoid logging tokens, include unit tests covering happy path and error cases, and document failure modes in README.",
    sampleArtifact: "Diff validates oauth state param, removes token from logs, adds callback.test.ts with 4 cases covering state mismatch, expired code, and success path. README troubleshooting section updated.",
    positiveSignals: ["test", "validate", "state", "error", "document", "readme", "type", "lint", "auth", "sanitize", "check", "handle", "coverage", "assertion", "mock", "interface", "typed", "throws"],
    riskSignals: ["secret", "token log", "todo", "hardcode", "skip", "unsafe", "any", "eval(", "innerhtml", "no test", "bypass", "console.log", "disable", "ignore"]
  },

  research: {
    id: "research",
    name: "ProofJudge Research",
    tagline: "Claims require sources. Sources require verification.",
    icon: "◎",
    accent: "#38bdf8",
    problemStatement: "17–33% of AI legal research tools hallucinate citations. NeurIPS 2025 had 100+ fabricated citations in accepted papers. ProofJudge Research traces each claim to its source using the CAE framework and signs the evaluation.",
    bullets: [
      "CAE framework: Claims, Arguments, Evidence decomposition",
      "Source support check — cited ≠ supported",
      "Risk coverage and assumption separation scored separately"
    ],
    sampleBounty: "Produce a sourced brief on verifiable AI infrastructure for agent wallets.",
    sampleRubric: "Must cite primary sources, explicitly separate claims from assumptions, cover implementation risks, address competing approaches, and provide an executive summary under 200 words.",
    sampleArtifact: "Brief includes 8 citations (6 peer-reviewed), claims table distinguishing established facts from assumptions, risk section covering key-management and liveness tradeoffs, executive summary at 180 words covering main finding.",
    positiveSignals: ["cite", "source", "risk", "summary", "assumption", "evidence", "claim", "timeline", "peer-reviewed", "methodology", "finding", "conclusion", "analysis", "primary", "secondary", "cited", "data", "study"],
    riskSignals: ["uncited", "probably", "unknown", "missing", "hallucinated", "no source", "we believe", "it seems", "unclear if", "not verified", "might be", "speculation", "anecdotal"]
  },

  negotiation: {
    id: "negotiation",
    name: "ProofJudge Negotiation",
    tagline: "Neutral ground. Both parties can verify.",
    icon: "⚖",
    accent: "#fbbf24",
    problemStatement: "Harvey, Ironclad, and ContractPodAi all serve one party. There is no neutral evaluator both sides can trust. ProofJudge Negotiation is not a participant — it's the first party-neutral completeness check, and both parties can verify the same signed rubric was applied.",
    bullets: [
      "Completeness scoring: every required term addressed?",
      "Party-neutral — not deployed by either side",
      "Same model hash applied to all proposals — verifiable consistency"
    ],
    sampleBounty: "Evaluate a vendor proposal against price, delivery, IP ownership, and fallback constraints.",
    sampleRubric: "Must respect the $50k budget cap, include a 30-day fallback delivery clause, preserve IP ownership for the buyer, define payment milestones, and identify any unacceptable concessions.",
    sampleArtifact: "Proposal stays under $48k, includes a 30-day penalty clause for late delivery, transfers IP on final payment, defines 3 milestones, and flags a support SLA clause the buyer may find limiting.",
    positiveSignals: ["budget", "fallback", "constraint", "term", "must-have", "risk", "timeline", "concession", "scope", "liability", "warranty", "ip", "jurisdiction", "payment", "termination", "milestone", "clause", "penalty"],
    riskSignals: ["over budget", "unbounded", "no fallback", "unclear", "concede", "missing", "sole discretion", "at will", "no recourse", "waiver", "exclude all liability", "unilateral", "no penalty"]
  },

  governance: {
    id: "governance",
    name: "ProofJudge Governance",
    tagline: "Proposals verified before votes are cast.",
    icon: "⬡",
    accent: "#c084fc",
    problemStatement: "Compound GoldenBoyz redirected $25M through coordinated governance manipulation. Beanstalk lost $182M in a single flash loan attack. ProofJudge Governance produces a signed risk assessment — treasury exposure, attack surface, feasibility — before any vote opens.",
    bullets: [
      "Treasury risk, attack vector, and feasibility scoring",
      "Signed verdict published on-chain before vote opens",
      "Same rubric applied to all proposals — no information asymmetry"
    ],
    sampleBounty: "Evaluate this DAO governance proposal to fund a 6-week security audit of the lending protocol smart contracts.",
    sampleRubric: "Must specify budget cap, auditor selection criteria, quorum threshold, 48-hour timelock, multisig execution mechanism, and protocol response plan if critical issues are found.",
    sampleArtifact: "Proposal: Allocate 80 ETH to Trail of Bits for 6-week audit. Requires 4% token quorum. 48-hour timelock before execution. 3-of-5 multisig. Critical findings trigger protocol pause. Auditor selected by 3-member committee vote with on-chain record.",
    positiveSignals: ["quorum", "timelock", "multisig", "milestone", "treasury", "budget", "feasible", "audit", "executable", "delegate", "risk", "scope", "safeguard", "threshold", "pause", "committee", "on-chain", "reversible"],
    riskSignals: ["no timelock", "immediate", "unlimited", "no audit", "flash loan", "emergency bypass", "single key", "no quorum", "irrevocable", "sole authority", "no cap", "unrestricted", "bypass"]
  }
};

export const variantList = Object.values(variants);
