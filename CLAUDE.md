# ProofJudge — Project Instructions

These project rules **override** any global rules in `~/.claude/rules/*`. Most of those globals
(Kernel/OS/Domains layering, React/Zustand/Tailwind patterns, Framer Motion performance rules,
the design-system / domain-cartridge / tailored-realms skills) belong to a **different project
("Tailored Realms")** and do **not** apply here. Do not apply, cite, or "fix toward" them in this repo.

## What this project actually is

ProofJudge is a **verifiable acceptance layer for autonomous work**: submitted work is judged against
explicit terms + a rubric inside EigenCompute, producing a **signed, tamper-evident `DecisionArtifact`**
(a "settlement receipt") that anyone can re-verify. The shareable hero moment is: edit one field of a
signed receipt → verification fails. It is deployed 4× on EigenCompute (Code / Research / Negotiation /
Governance), one shared codebase per deployment.

## Stack reality (read this before assuming anything)

- **Frontend is vanilla HTML/CSS/JS.** No React, no framework, no JSX, no Tailwind, no build step for
  the client. `src/public/{index.html, main.js, styles.css}`. `main.js` is an ES module (`type="module"`).
- **Backend is Express + TypeScript, ESM, `moduleResolution: NodeNext`.**
- **Node version:** 22.x.

## Module resolution — the #1 thing that breaks here

This is an ESM + NodeNext project (`"type": "module"` in package.json, `tsconfig` NodeNext).
**Relative imports MUST carry the `.js` extension even though the source is `.ts`.** Example from
`src/judge.ts`: `import { variants } from "./variants.js";` (not `"./variants"`).
Dropping the extension causes `ERR_MODULE_NOT_FOUND` at runtime. This is the most common failure when a
model edits or adds backend files. Match the existing import style exactly.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | `tsx watch src/server.ts` — dev server with reload on `http://localhost:3000` |
| `npm run build` | `tsc` — type-check + emit to `dist/` (use this to verify backend changes) |
| `npm run check` | `build` + smoke tests; success prints `Smoke checks passed for all ProofJudge variants.` |
| `npm start` | `node dist/server.js` — runs the built output |

- Run the app with **`tsx` / `npm run dev`**, never `node src/server.ts` (Node can't execute `.ts`).
- Static files are served from `process.cwd()/src/public` (`server.ts:10`), so **launch from the repo root**
  or static assets 404.
- **Port 3000 may already be in use** (the user often has a server running). `EADDRINUSE` means a server is
  already up — reuse it, don't fight it. Only kill a server you started yourself.

## Workflow for this repo (overrides globals)

- **Starting the dev server is fine** — you do not need to ask. (The global "never auto-start dev servers"
  rule does not apply here.)
- **Visual verification is expected for UI work.** Take screenshots (Playwright MCP or otherwise) and
  actually look at them before claiming UI work is done. "It should render" is not verification.
- `npm run build` is the fast correctness gate for backend/TS changes. There is no `typecheck` script and
  no giant codebase — `build` is cheap, just run it.

## Hard constraints — do not break these

- **Do not change the backend judging/signing/verification semantics** unless explicitly asked. `src/judge.ts`
  (scoring, HMAC-SHA256 signing, tamper detection) and the `DecisionArtifact` schema in `src/types.ts` are the
  credibility of the product. The signing is honest crypto; keep it honest.
- **Do not break the public API contracts:** `GET /healthz`, `GET /api/variants`, `GET /api/demo/:variant`,
  `POST /api/judge`, `POST /api/verify`, and `GET /agents/:variant`. The live EigenCompute deployments depend
  on this shape.
- **Do not commit secrets.** `.env.*` deployment files exist locally and must stay untracked; only
  `.env.example` is tracked. Never push private PDFs in `docs/private-preview/`.
- **Demo/seed content must be clearly fake and clearly separated from the real judging path.** Real
  `/api/judge` stays real; presentation seed data is a separate, labeled layer. Do not fake crypto or fake
  verification results.

## File map

| File | Role |
|---|---|
| `src/server.ts` | Express routes, static serving, SPA fallback (74 lines) |
| `src/judge.ts` | Validation, LLM/heuristic scoring, artifact build, signing, verification (308 lines) |
| `src/variants.ts` | The 4 domain configs + **one** sample case each + signal sets + LLM prompts |
| `src/types.ts` | `DecisionArtifact` / `VerificationResult` types |
| `src/public/index.html` | Threshold entry + station overview + dock-rail console + Ledger/Trust drawer + Stage demo (~430 lines) |
| `src/public/main.js` | Routing (entry/station/chamber), judge/verify/tamper calls, 7-act Stage machine, docket + ticker (~1480 lines) |
| `src/public/styles.css` | "Settlement Desk" design system: slate+green glass, paper receipt hero, motion (~1815 lines) |
| `src/public/cases.js` | Presentation seed layer: case library (real inputs, judged live) + labeled simulated ticker feed |

## Design docs to read first

- `docs/ui-ux-redesign-brief.md` — the strategic review: ratings, the core problems, the target direction.
- `docs/redesign-improvement-catalog.md` — the exhaustive catalog of improvement surfaces by category.
- `docs/proofjudge-finish-line-master-plan.md` — original positioning/copy/motion system (still largely valid;
  note its own "avoid" list).
