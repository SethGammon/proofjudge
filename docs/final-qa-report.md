# ProofJudge Final QA Report

Last checked: 2026-05-09

## What I Changed

| Area | Change |
|---|---|
| Entry screen | Reframed the opening copy around paid-agent work, counterparty proof, and signed EigenCompute settlement records. |
| Entry motion | Reduced intro delays so the product name, trust problem, and CTAs resolve quickly for screen sharing and screenshots. |
| Workbench headline | Changed the primary Code Bounty headline to `Settle a code bounty with proof.` |
| Workbench copy | Made EigenCompute and release/hold/reject settlement outcomes explicit in the main demo path. |
| Topbar tagline | Replaced generic acceptance copy with `Verifiable receipts for paid agent work.` |
| Tamper flow | Replaced the stale `Receipt verified` toast with `Tamper detected. Receipt no longer verifies.` after score tampering. |
| Tablet layout | Fixed oversized case cards by resetting sticky-rail minimum height below the tablet breakpoint. |
| Variant metadata | Cleaned non-ASCII/mojibake characters from `/api/variants` metadata. |
| Demo script | Tightened the hook around who verifies paid-work acceptance. |
| Submission packet | Added a Demo Day judging-alignment matrix against the guidance criteria. |

## Browser Verification

Opened local ProofJudge at:

```text
http://127.0.0.1:3100/
```

Captured and inspected:

| Screenshot | Status |
|---|---|
| `output/playwright/proofjudge-verified-2026-05-09/01-entry-desktop.png` | Pass |
| `output/playwright/proofjudge-verified-2026-05-09/02-console-desktop.png` | Pass |
| `output/playwright/proofjudge-verified-2026-05-09/03-receipt-desktop.png` | Pass |
| `output/playwright/proofjudge-verified-2026-05-09/04-verified-desktop.png` | Pass |
| `output/playwright/proofjudge-verified-2026-05-09/05-tamper-desktop.png` | Pass |
| `output/playwright/proofjudge-verified-2026-05-09/06-console-mobile.png` | Pass |
| `output/playwright/proofjudge-verified-2026-05-09/07-receipt-tablet.png` | Pass |

Browser results:

- No console errors.
- No page errors.
- No horizontal overflow on desktop, mobile, or tablet.
- Receipt generation works.
- Verification success state works.
- Tamper failure state works and now shows the correct toast.

## Automated Verification

```text
npm run check
Smoke checks passed for all ProofJudge variants.
```

```text
node --check src/public/main.js
```

Result: pass.

`/api/variants` metadata ASCII check: pass.

## Live Deployment Verification

All four public deployments were checked on 2026-05-09:

| Judge | Health | Mode | Provider | Signature | Verify | Tamper | Attestation |
|---|---|---|---|---|---|---|---|
| Code | Pass | `llm` | `eigen-gateway` | `signed` | Pass | Failed as expected | `eigencompute` |
| Research | Pass | `llm` | `eigen-gateway` | `signed` | Pass | Failed as expected | `eigencompute` |
| Negotiation | Pass | `llm` | `eigen-gateway` | `signed` | Pass | Failed as expected | `eigencompute` |
| Governance | Pass | `llm` | `eigen-gateway` | `signed` | Pass | Failed as expected | `eigencompute` |

## Remaining Risk

The product and demo path are ready. The remaining risk is not technical; it is payout classification. Eigen may count the four deployments as one suite or as multiple agents under the up-to-3-agents rule. Use `docs/payout-readiness.md` when clarifying that with Matt.

## 2026-05-11 UX Follow-Up

Additional browser audit captured:

```text
output/playwright/proofjudge-ux-audit-2026-05-11/
output/playwright/proofjudge-ux-verified-2026-05-11/
```

UX changes made:

- Rendered local-only missing attestation as `WARN` instead of a red blocking failure.
- Collapsed the raw JSON drawer by default in the receipt archive.
- Rebuilt the agent identity architecture flow into a clear left-to-right proof path.
- Cleared transient toasts when manually switching tabs.

Verification:

- `npm run check` passed.
- `node --check src/public/main.js` passed.
- Browser verification found no console errors, page errors, or horizontal overflow.

Deployment note:

- These latest UX polish changes are verified locally.
- The public Code deployment at `http://34.12.29.220:3000/` still serves the older copy as of 2026-05-11.
- Redeploy is required if these UX polish changes should appear on the public Demo Day URL.
