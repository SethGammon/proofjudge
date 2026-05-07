# ProofJudge Submission Checklist

ProofJudge is one submission: one suite, four domain-specific verifiable judges, one public story, one receipt-centered demo.

## Engineering

- [x] Code deployment recorded: `34.12.29.220:3000`
- [x] Research deployment recorded: `35.204.155.165:3000`
- [x] Negotiation deployment recorded: `34.58.112.209:3000`
- [x] Governance deployment recorded: `34.87.56.225:3000`
- [x] Mainnet Alpha EigenVerify links recorded
- [x] `.env.*` files ignored by git
- [x] Local build passes
- [x] Smoke tests pass
- [x] Live health checks pass
- [x] Live judge and verify checks pass
- [x] Visual QA captured for desktop, tablet, and mobile
- [x] New Settlement Console deployed to live public URL
- [ ] Live receipt signing key populated; current public deployments use `signatureMode: simulated`

## Product

- [x] UI says EigenCompute/Mainnet Alpha, not Sepolia
- [x] Settlement receipt is the primary product surface
- [x] Settlement action is more prominent than score
- [x] App ID and EigenVerify link are visible
- [x] Evidence matrix is visible after verdict
- [x] Trust disclaimer is visible in the verifier
- [x] Code Bounty is the primary demo path
- [x] Cinematic title screen is skippable
- [x] Guided Code Bounty demo uses real judge and verify routes
- [x] Reduced-motion support is present

## Required Deliverables

- [x] Agent explainer: `docs/agent-explainer.md`
- [x] Architecture doc: `docs/architecture.md`
- [x] Architecture diagram: `docs/architecture-diagram.svg`
- [x] Product feedback doc: `docs/feedback.md`
- [x] Demo Day script: `docs/demo-day.md`
- [x] Public site/demo URL finalized with the new Settlement Console UI: `http://34.12.29.220:3000/`
- [ ] Video demo recorded and publicly accessible
- [ ] Demo Day attendance confirmed

## Demo Backups

- [x] Local fallback demo screenshots captured in `docs/demo-backups/`
- [x] Local demo server confirmed at `http://127.0.0.1:3000`
- [x] EigenVerify links ready in README and UI
- [x] Final line included in `docs/demo-day.md`: "ProofJudge does not make AI judgment perfect. It makes AI judgment accountable."
- [x] Live deployment backup screenshots captured after deployment in `docs/live-demo-backups/`
