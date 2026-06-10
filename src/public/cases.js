/*
 * PRESENTATION SEED DATA — case library + simulated activity feed.
 *
 * Every case below is a real input package: it is submitted to the real
 * /api/judge endpoint and scored, sealed, and signed by the real judge.
 * Nothing here fakes a verdict, a hash, or a signature.
 *
 * The ticker feed at the bottom IS simulated (and labeled as such in the UI).
 * It exists to show what a busy settlement layer looks like; it never renders
 * inside the receipt, the verifier, or anything claiming to be signed.
 */

export const CASE_LIBRARY = {
  code: [
    {
      id: "PJ-C-1042",
      title: "OAuth callback hardening",
      blurb: "State validation, token hygiene, and tests for a GitHub OAuth fix.",
      submitter: "kestrel-dev.eth",
      terms: "Ship a GitHub OAuth callback fix with clear error handling and tests.",
      rubric:
        "Must validate state parameter, avoid logging tokens, include unit tests covering happy path and error cases, and document failure modes in README.",
      work:
        'diff --git a/src/auth/callback.ts b/src/auth/callback.ts\n+ const expected = req.session.oauthState;\n+ if (!expected || req.query.state !== expected) {\n+   throw new OAuthStateError("state parameter mismatch");\n+ }\n- logger.info("oauth.callback", { token });\n+ logger.info("oauth.callback", { token: redact(token) });\nAdds callback.test.ts with 4 unit tests covering the happy path, state mismatch, expired authorization code, and token-endpoint network error, using a mock token endpoint. README gains a Failure Modes section documenting each error path and its recovery.'
    },
    {
      id: "PJ-C-1066",
      title: "Rate limiter for webhook ingestion",
      blurb: "Sliding-window limiter with retry headers and integration tests.",
      submitter: "agent://forge-07",
      terms: "Add a per-tenant rate limiter to the webhook ingestion endpoint with safe defaults and tests.",
      rubric:
        "Must enforce per-tenant limits, return Retry-After headers, validate tenant input, include tests for burst and sustained load, and document the limit defaults.",
      work:
        "Implements a sliding-window limiter keyed by tenant id. Input is validated and sanitized before the bucket lookup. Burst and sustained-load behavior covered in limiter.test.ts with mock clocks and assertion of Retry-After headers. Defaults documented in README with a tuning table. Typed interface for the store so Redis can replace memory."
    },
    {
      id: "PJ-C-1071",
      title: "CSV export rewrite",
      blurb: "Replaces a streaming exporter; tests thin, two TODOs left in place.",
      submitter: "rfx-builder",
      terms: "Rewrite the CSV export pipeline to stream rows without buffering the full dataset in memory.",
      rubric:
        "Must stream rows incrementally, handle encoding errors, include tests for large datasets, and document memory characteristics.",
      work:
        "Streams rows through a transform and no longer buffers the dataset. Encoding fallback added for latin-1 rows. One test checks a 100k-row export. TODO: encoding edge cases beyond latin-1. TODO: document memory profile. Error paths partially handled."
    },
    {
      id: "PJ-C-1088",
      title: "Session middleware patch",
      blurb: "Quick fix that hardcodes a fallback key and skips the test suite.",
      submitter: "0xANON-44",
      terms: "Patch the session middleware to rotate signing keys without downtime.",
      rubric:
        "Must rotate keys with overlap, avoid hardcoded secrets, include tests for rotation overlap, and document the rotation procedure.",
      work:
        "Rotation works in the demo. A fallback key is hardcoded for now; rotation overlap is a TODO and the suite was skipped because CI was red. console.log left in for debugging the key path. No test added for the overlap window."
    },
    {
      id: "PJ-C-1093",
      title: "GraphQL depth limiting",
      blurb: "Query-depth guard with malicious-query fixtures.",
      submitter: "lumen-agent",
      terms: "Protect the public GraphQL endpoint from deeply nested and recursive query attacks.",
      rubric:
        "Must limit query depth, reject recursive fragments, validate persisted query ids, include tests with malicious fixtures, and document the limits.",
      work:
        "Adds a depth visitor that rejects queries past the configured limit and detects recursive fragment cycles. Persisted query ids validated against the allowlist. Malicious fixtures in depth.test.ts: nested 40-deep query, fragment cycle, oversized alias fan-out — each asserts the typed error. Limits documented in README with a check on the default budget."
    }
  ],

  research: [
    {
      id: "PJ-R-2031",
      title: "Agent wallet infrastructure brief",
      blurb: "Sourced brief with a claims table and risk section.",
      submitter: "atlas-research.eth",
      terms: "Produce a sourced brief on verifiable AI infrastructure for agent wallets.",
      rubric:
        "Must cite primary sources, explicitly separate claims from assumptions, cover implementation risks, address competing approaches, and provide an executive summary under 200 words.",
      work:
        "Brief includes 8 citations (6 peer-reviewed, 2 primary protocol specs), a claims table separating established findings from stated assumptions, an analysis of competing approaches (TEE vs ZK attestation), a risk section covering key management and liveness, and an executive summary at 180 words. Each cited source is annotated with the specific claim it supports, with methodology notes where the data is secondary."
    },
    {
      id: "PJ-R-2044",
      title: "Restaking market sizing",
      blurb: "Useful data, but several figures arrive without sources.",
      submitter: "agent://scribe-2",
      terms: "Estimate the addressable market for restaking-secured agent services in 2026.",
      rubric:
        "Must cite data sources for every figure, separate measured data from projection assumptions, include a methodology note, and state confidence ranges.",
      work:
        "Market estimate lands at $4.1B with a methodology note and a projection table with a timeline. TVL figures are cited to two dashboards; the growth multiplier is probably conservative and the derivation is not shown. Several adoption figures arrive uncited. Assumption section exists but mixes measured data with projection in two rows."
    },
    {
      id: "PJ-R-2052",
      title: "TEE attestation literature scan",
      blurb: "Peer-reviewed scan with explicit evidence grading.",
      submitter: "veritas-lab",
      terms: "Survey the state of TEE remote attestation research relevant to verifiable agent compute.",
      rubric:
        "Must cite peer-reviewed sources, grade evidence quality per claim, identify open problems, cover known attack classes, and provide a structured summary.",
      work:
        "Scan covers 14 peer-reviewed papers and 3 primary vendor specs. Each claim row carries an evidence grade and the citation that supports it. Known attack classes (voltage glitching, side-channel data extraction, attestation replay) summarized with primary sources. Open problems section separates established findings from the authors' assumptions. Structured summary table with methodology and timeline of key results."
    },
    {
      id: "PJ-R-2067",
      title: "Competitor teardown: agent escrow",
      blurb: "Opinion-forward teardown; sourcing is thin and hedged.",
      submitter: "hawk-9",
      terms: "Tear down the three leading agent escrow products and their verification stories.",
      rubric:
        "Must cite product documentation, verify claimed capabilities against public evidence, separate observed behavior from inference, and list unknowns explicitly.",
      work:
        "Covers three products. Capability matrix is built from marketing pages; it seems the verification claims were not independently checked and several rows are uncited. We believe product B uses optimistic verification but the docs are unclear if that applies to settlement. Unknowns listed at the end, though most rows read as speculation."
    }
  ],

  negotiation: [
    {
      id: "PJ-N-3021",
      title: "Vendor build contract",
      blurb: "Proposal addressing budget, IP, fallback, and milestones.",
      submitter: "counterparty-a",
      terms: "Evaluate a vendor proposal against price, delivery, IP ownership, and fallback constraints.",
      rubric:
        "Must respect the $50k budget cap, include a 30-day fallback delivery clause, preserve IP ownership for the buyer, define payment milestones, and identify any unacceptable concessions.",
      work:
        "Proposal stays under the $48k budget cap, includes a 30-day fallback clause with a late-delivery penalty, transfers IP ownership to the buyer on final payment milestone, defines 3 payment milestones with acceptance terms per milestone, and flags a support-SLA concession with scope and liability noted for buyer review. Warranty and termination clause terms included."
    },
    {
      id: "PJ-N-3038",
      title: "Cloud capacity renewal",
      blurb: "Strong on price, silent on exit terms.",
      submitter: "agent://procure-x",
      terms: "Evaluate the renewal proposal for reserved compute capacity against negotiation constraints.",
      rubric:
        "Must stay under the $120k annual budget, include a termination clause with notice period, define a price-protection term for renewal, cap liability symmetrically, and state payment timeline.",
      work:
        "Pricing lands at $112k against the budget constraint with a defined payment timeline and quarterly milestone invoicing. Price-protection term included for one renewal cycle. Termination is at the vendor's sole discretion with no recourse for the buyer, and the liability section is missing the symmetric cap the rubric requires."
    },
    {
      id: "PJ-N-3049",
      title: "Data licensing term sheet",
      blurb: "One-sided draft with unbounded obligations.",
      submitter: "0xBROKER-12",
      terms: "Evaluate a data licensing term sheet for an agent training corpus.",
      rubric:
        "Must define license scope, cap the fee within the $30k budget, include a termination clause, preserve derivative IP for the licensee, and define audit terms with notice.",
      work:
        "Fee structure is unbounded after year one and the draft is over budget at $41k. Licensor retains sole discretion on derivative work, with a waiver of audit rights and no recourse on data quality. Termination unilateral at will by the licensor. Scope clause vague; no penalty for late delivery of corpus updates."
    },
    {
      id: "PJ-N-3055",
      title: "Joint integration agreement",
      blurb: "Balanced two-party draft with measured concessions.",
      submitter: "counterparty-b",
      terms: "Evaluate a joint integration agreement between two agent platforms.",
      rubric:
        "Must define integration scope and timeline, allocate engineering costs within the shared $80k budget, include mutual liability caps, preserve each party's IP, and define a termination clause with wind-down terms.",
      work:
        "Scope and timeline defined with a 12-week milestone plan inside the shared budget constraint. Engineering payment split 60/40 with a true-up clause. Mutual liability caps set at fees paid; each party retains its IP with a narrow license for the integration term. Termination clause includes 60-day notice and wind-down concession for in-flight users. One open risk flagged on data residency jurisdiction."
    }
  ],

  governance: [
    {
      id: "PJ-G-4017",
      title: "Security audit funding vote",
      blurb: "80 ETH audit proposal with timelock and multisig execution.",
      submitter: "dao-contributor-9",
      terms: "Evaluate this DAO governance proposal to fund a 6-week security audit of the lending protocol smart contracts.",
      rubric:
        "Must specify budget cap, auditor selection criteria, quorum threshold, 48-hour timelock, multisig execution mechanism, and protocol response plan if critical issues are found.",
      work:
        "Proposal: Allocate 80 ETH from treasury with a hard budget cap to Trail of Bits for a 6-week audit. Requires 4% token quorum threshold. 48-hour timelock before execution. 3-of-5 multisig executes the payment milestone schedule. Critical findings trigger the protocol pause safeguard and a committee response plan with an on-chain record. Auditor selection criteria documented and reversible if the committee vote fails."
    },
    {
      id: "PJ-G-4029",
      title: "Treasury diversification swap",
      blurb: "Reasonable goal, but execution detail is thin.",
      submitter: "agent://steward",
      terms: "Evaluate a proposal to diversify 15% of the treasury into staked ETH derivatives.",
      rubric:
        "Must define the treasury percentage cap, name the execution multisig, specify a timelock, define slippage limits, and include a quarterly reporting milestone.",
      work:
        "Proposal sets the cap at 15% and names a 2-of-3 multisig for execution with a quarterly reporting commitment. Timelock referenced but the duration is missing. Slippage limits deferred to the execution team's judgment, which leaves the boundary unclear. No halt condition defined if depeg emerges mid-execution."
    },
    {
      id: "PJ-G-4036",
      title: "Emergency parameter change",
      blurb: "Asks for standing emergency powers with no guardrails.",
      submitter: "0xWHALE-3",
      terms: "Evaluate a proposal granting the core team standing authority to adjust risk parameters.",
      rubric:
        "Must define scope limits, require a timelock for each change, set a quorum threshold for renewal, include a sunset clause, and define an on-chain audit trail.",
      work:
        "Grants the core team unrestricted authority over all risk parameters with immediate effect and no timelock. Renewal is automatic with no quorum check. Includes an emergency bypass path held by a single key. No sunset clause; changes are irrevocable until a counter-proposal passes. Audit trail left to a future proposal."
    },
    {
      id: "PJ-G-4048",
      title: "Grants round 7 allocation",
      blurb: "Structured allocation with committee oversight and milestones.",
      submitter: "grants-guild",
      terms: "Evaluate the proposal to allocate 120k USDC across grants round 7.",
      rubric:
        "Must define the total budget cap, committee review process, per-grant milestone schedule, clawback conditions, quorum threshold, and a timelock before disbursement.",
      work:
        "Budget cap fixed at 120k USDC from the grants treasury. 5-member committee scores applications against a published rubric with an on-chain record. Each grant disburses on a milestone schedule with clawback safeguard for missed deliverables. 3% quorum threshold and a 72-hour timelock before the first disbursement. Execution via the existing 4-of-7 multisig; the round is reversible at any checkpoint by committee vote."
    }
  ]
};

/*
 * SIMULATED ACTIVITY FEED — presentation only, labeled in the UI.
 * Receipt ids, hashes, and timings are generated locally for atmosphere.
 * Real receipts live in the Ledger and come only from /api/judge.
 */

const FEED_EVENTS = [
  { variant: "code", verdict: "pass", action: "release", subject: "OAuth callback hardening" },
  { variant: "code", verdict: "revise", action: "hold", subject: "CSV export rewrite" },
  { variant: "code", verdict: "pass", action: "release", subject: "GraphQL depth limiting" },
  { variant: "code", verdict: "fail", action: "reject", subject: "Session middleware patch" },
  { variant: "code", verdict: "pass", action: "release", subject: "Webhook rate limiter" },
  { variant: "research", verdict: "pass", action: "release", subject: "TEE attestation scan" },
  { variant: "research", verdict: "revise", action: "hold", subject: "Restaking market sizing" },
  { variant: "research", verdict: "fail", action: "reject", subject: "Escrow competitor teardown" },
  { variant: "research", verdict: "pass", action: "release", subject: "Agent wallet brief" },
  { variant: "negotiation", verdict: "pass", action: "release", subject: "Vendor build contract" },
  { variant: "negotiation", verdict: "revise", action: "hold", subject: "Cloud capacity renewal" },
  { variant: "negotiation", verdict: "fail", action: "reject", subject: "Data licensing term sheet" },
  { variant: "negotiation", verdict: "pass", action: "release", subject: "Joint integration agreement" },
  { variant: "governance", verdict: "pass", action: "release", subject: "Security audit funding" },
  { variant: "governance", verdict: "revise", action: "hold", subject: "Treasury diversification" },
  { variant: "governance", verdict: "fail", action: "reject", subject: "Emergency powers request" },
  { variant: "governance", verdict: "pass", action: "release", subject: "Grants round 7" },
  { variant: "code", verdict: "revise", action: "hold", subject: "Indexer backfill job" },
  { variant: "research", verdict: "pass", action: "release", subject: "MEV exposure survey" },
  { variant: "negotiation", verdict: "revise", action: "hold", subject: "API partnership terms" },
  { variant: "governance", verdict: "pass", action: "release", subject: "Validator set expansion" },
  { variant: "code", verdict: "pass", action: "release", subject: "Signature batching patch" }
];

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function fakeHashFragment(rand) {
  const hex = "0123456789abcdef";
  let head = "";
  let tail = "";
  for (let i = 0; i < 4; i += 1) head += hex[Math.floor(rand() * 16)];
  for (let i = 0; i < 4; i += 1) tail += hex[Math.floor(rand() * 16)];
  return `0x${head}…${tail}`;
}

/**
 * Build a shuffled, timestamped batch of simulated feed items.
 * A fresh seed per page load keeps repeat views from looking identical.
 */
export function buildTickerFeed(count = 18) {
  const rand = seededRandom(Date.now() % 2147483647);
  const pool = [...FEED_EVENTS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  let secondsAgo = 4 + Math.floor(rand() * 9);
  return pool.slice(0, count).map((event) => {
    const item = {
      ...event,
      hash: fakeHashFragment(rand),
      secondsAgo
    };
    secondsAgo += 11 + Math.floor(rand() * 49);
    return item;
  });
}
