# Guided Demo Story Mode QA

Last checked: 2026-05-11 America/New_York

## Scope

This pass verifies the new Run Guided Demo experience in the vanilla `src/public` app. The live console path still uses the existing `/api/judge`, `/api/verify`, and `/api/demo/code` APIs.

## What Was Verified

| Area | Result |
|---|---|
| Landing page | Pass. Entry screen loads at `http://127.0.0.1:3100/`. |
| Enter Console | Pass. Opens the console directly at `/agents/code#evaluate`. |
| Intro path | Pass. Topbar `Intro` returns to the landing entry screen. |
| Run Guided Demo | Pass. Opens the fullscreen Code Bounty Escrow story mode. |
| Story controls | Pass. Next, Back, Auto-play, Pause, Restart, and Skip to Live Console work. |
| Keyboard controls | Pass. ArrowRight advances, ArrowLeft goes back, Escape closes story mode. |
| Live handoff | Pass. Both Skip to Live Console and the final scene's Now Prove It Live handoff load Code Bounty in the real console and slowly run judge, verify, and tamper failure. |
| Console logs | Pass. Playwright console check reported `Errors: 0, Warnings: 0`. |
| Desktop responsiveness | Pass at 1280x720. Story text fits and controls remain clickable. |
| Mobile-ish responsiveness | Pass at 390x844. Story controls and progress are reachable in the first viewport. |

## Screenshots

Evidence folder:

```text
output/playwright/guided-demo-2026-05-11/
```

| Screenshot | Purpose |
|---|---|
| `01-opening-story.png` | Opening problem scene. |
| `02-eigencompute-scene.png` | EigenCompute app identity scene. |
| `03-signed-receipt-scene.png` | Signed DecisionArtifact scene. |
| `04-tamper-failure-scene.png` | Tamper failure story scene. |
| `05-live-console-handoff.png` | Final real console handoff after live judge, verify, and tamper. |
| `06-mobile-story.png` | Mobile-ish story-mode responsive check. |

## Checks Run

```text
node --check src/public/main.js
```

Result: pass.

```text
npm run check
```

Result: pass. `tsc` completed and smoke checks passed for all ProofJudge variants.

```text
git diff --check
```

Result: pass. Only existing CRLF warnings were reported.

## Browser Verification Notes

Local server reused:

```text
http://127.0.0.1:3100/
```

The live handoff generated a local signed artifact, verified it, then changed the score and showed:

```text
Verification failed - artifact was modified after the verdict was signed.
Tamper Detected
Hash check: MISMATCH
Signature: INVALID
```

Local verification still shows the expected local-only attestation warning:

```text
Demo placeholder. Deploy to EigenCompute for live attestation.
```

## HyperFrames Backup Note

The story is DOM/CSS driven and can be recorded later as a backup using HyperFrames or a browser recorder by stepping through the same eight scenes, then recording the live console handoff. HyperFrames is not required for the live app or the Demo Day flow.

## Caveats

- This pass did not redeploy EigenCompute.
- The public EigenCompute URL still needs redeploy if the new story mode should appear on the public Demo Day deployment.
- Local verification exercises the real local APIs, but local artifacts use the demo placeholder deployment identity until served from the EigenCompute deployment.
