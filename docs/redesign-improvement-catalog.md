# ProofJudge — Redesign Improvement Catalog

**Audience:** the Claude model that will execute the redesign.
**Purpose:** an exhaustive map of *what* can be improved and *what "improvement" means* in each category — **not** a prescriptive list of fixes. Treat this as the territory; you choose the route. Pair it with `docs/ui-ux-redesign-brief.md` (the strategic "why" and the target direction) and `CLAUDE.md` (the hard rules and stack reality).

---

## 0. Orientation (read before touching anything)

**Product in one line:** ProofJudge turns work-acceptance into a **signed, tamper-evident settlement receipt**. Submit work + terms + rubric → judged inside EigenCompute → `DecisionArtifact` → re-verifiable → tampering breaks verification. Four judges (Code / Research / Negotiation / Governance), one shared codebase.

**Why this redesign exists:** EigenCloud wants to feature it on social. The concrete target is a **60–90s demo video** plus a screenshot-worthy product. The current build has a strong concept (8.5/10) served by a flat, overloaded UI (demo-readiness ~4.5/10). The job is re-prioritization and craft, not reinvention.

**Stack:** vanilla HTML/CSS/JS frontend (`src/public/`), Express+TS backend (ESM/NodeNext). No framework. See `CLAUDE.md` for module-resolution gotchas and hard constraints.

**Current surface inventory (so you know what already exists):**
- **Entry layer** (landing) — `index.html:11–150`, CSS `117–1902`. Cinematic: pointer-tracked lighting/tilt (`setupEntryPointerLighting`), light fields, a "proof bridge," a fanned receipt stack, proof-points, a "proof readout" block, pipeline, status strip. This is the overloaded screen.
- **Guided story mode** (modal walkthrough) — `index.html:152–199`, CSS `1903–2826`, `STORY_SCENES` + `renderStoryScene`/`renderStoryVisual`/`stampStoryRevealSequence` in `main.js`. A scene-by-scene narrated demo with autoplay.
- **Console** (the app) — `index.html:201–569`, CSS `2827+`. Three-pane grid: case rail | workbench (5 tabs: Workbench/Receipts/Agents/Verifier/Demo) | receipt rail.
- **Receipt rendering / verify / tamper** — `renderArtifact`, `renderVerification`, `renderTamperDiff`, `renderIdentityStrip` in `main.js:1598–1825`.
- **Persistence** — `localStorage` receipt archive (`readArchive`/`saveArchive`, key `proofjudge.receipts.v1`).
- **Motion** — ~70 `@keyframes` (CSS `3984–4660`), reduced-motion block at `5215`.
- **Responsive** — breakpoints at `1280`, `900` (height + width), `560`.

**The single most valuable asset:** the *tamper → verification fails* moment. Everything should serve it.

---

## How to read each category

Every section below has three parts:
- **Now** — what currently exists, grounded in the code.
- **Improvable surfaces** — the specific levers available in that category (the "what can change").
- **What "better" means here** — the definition of done / success criteria for that dimension, so you can judge your own output.

---

## 1. Information Architecture (IA)

**Now.** Three parallel entry points compete: a heavy marketing entry layer, a separate guided story modal, and the console — each re-explains the product. Inside the console, content is split across 5 tabs (`index.html:307–313`) plus two side rails. The same concepts (pipeline, receipt, identity, verify) appear in the entry layer, the story mode, *and* the console.

**Improvable surfaces.**
- Number and relationship of top-level surfaces (entry vs story vs console — do all three need to exist?).
- Tab structure inside the console (5 tabs; whether they're the right cuts, whether some should merge or become inline).
- Redundancy: the same explanation/visual rendered in multiple places.
- The path from "arrive" to "see the payoff" — how many clicks/screens it takes.
- Where the four judges live in the hierarchy (peers? lenses on one thing? a switcher?).

**What "better" means here.** A first-time viewer can locate "the thing that proves it's tamper-evident" without hunting. There is one obvious primary path and the secondary material doesn't compete with it. No concept is taught three times. The structure can be described in one sentence.

---

## 2. UI (components, composition, density, hierarchy)

> *UI here = the widgets and how they're arranged on screen — structure, density, and visual weight ordering. (Aesthetic look is §5 Visuals; the journey is §3 UX.)*

**Now.** The entry layer stacks ~10 distinct clusters in the first viewport (badge, H1, paragraph, 3 proof-points, mobile receipt, 2 CTAs, 4 identity buttons, 5-step pipeline, a multi-part proof-readout, a status strip) — see `index.html:69–149`. The console packs a form + evidence matrix + reasoning trace into a center column flanked by two narrow rails (`--rail-width: clamp(184px,18vw,232px)`, `--receipt-width: clamp(280px,24vw,318px)` — `styles.css:29–30`). The receipt is rendered as small `dt/dd` rows (`index.html:532–561`). Type scale is largely uniform.

**Improvable surfaces.**
- Element count per viewport (what earns its place; what's deletable).
- Type/size scale — establishing a real hierarchy (hero / support / forensic tiers) vs the current near-uniform sizing.
- Column widths and the cramped side rails; the center's competing sub-panels.
- The receipt component's structure (rows-of-text vs a designed object).
- Which element is unambiguously the focal point on each screen (currently none).
- Spacing/rhythm and whitespace as a tool (density is currently high everywhere).

**What "better" means here.** Each screen has exactly one focal element that's visually dominant; supporting and forensic detail recede in size/weight. Nothing feels cramped at 1440px or on a laptop. A viewer's eye lands on the right thing first without instruction. Element count per viewport drops.

---

## 3. UX (flow, task, orientation, friction)

> *UX here = the user's journey and ability to accomplish/understand, independent of how it looks.*

**Now.** Two flows exist: a self-driven console (pick case → fill form → Generate → Verify → Tamper, spread across tabs) and an autoplay story mode (`STORY_SCENES`, scene navigation + autoplay in `main.js:1261–1306`). The hero payoff (tamper) lives behind the Verifier tab, several steps in. The form (`index.html:355–384`) asks the user to read/fill three large textareas before anything happens.

**Improvable surfaces.**
- Time-to-payoff: how long until the viewer sees the seal break.
- Whether the user must fill a form to see value, or can watch first / drive later.
- Orientation: does the user always know what stage they're in and what just happened?
- The relationship between "watch the demo" and "use the console" (handoff is `startLiveHandoff`, `main.js:1322`).
- Friction points: tab-switching to follow one narrative; re-finding the receipt after navigating.
- The two modes (guided vs free) — whether they reinforce or duplicate each other.

**What "better" means here.** The payoff arrives fast and is impossible to miss. The viewer is never lost about what stage they're in or why. There's a frictionless "just watch it work" path *and* a "let me drive" path, and they don't fight. Nothing essential is more than a step away.

---

## 4. Copy (words)

**Now.** Copy is already fairly strong and consistent (the master plan defined a copy system — `master-plan.md:361–472`). `META` holds per-variant titles/copy (`main.js:30–75`); `STORY_SCENES` holds narration; the trust disclaimer is present (`index.html:437–440`). But there's a lot of it, and dense technical phrasing ("attestation mode," "DecisionArtifact," "deployment identity") appears before the reader has context. Some headings are abstract ("Settle paid work with a verifiable receipt").

**Improvable surfaces.**
- Volume: how much prose appears before the user acts (the entry layer is text-heavy).
- The plain-language vs technical-term balance, and *ordering* (plain hook first, jargon after a referent exists).
- Microcopy at decision points: button sublabels, pipeline stage captions, empty/loading/error messages.
- Headline punch — whether the H1 and section heads stop a scroll.
- Consistency of vocabulary (verdict vs decision; receipt vs artifact; judge vs agent appear interchangeably).
- The closing line / shareable phrase ("makes AI judgment accountable" — strong, underused).
- Caption/subtitle copy specifically written to be legible in a muted-autoplay social video.

**What "better" means here.** A non-crypto reader understands the value in one sentence before hitting any jargon. Every technical term has a referent on screen before it's used. Buttons say what will happen. There's a memorable line that works as a tweet. Vocabulary is consistent across entry/story/console. Copy volume on first view drops without losing the hook.

---

## 5. Content (the substantive material shown)

**Now.** **This is the biggest content gap.** Each judge has exactly **one** hardcoded sample case (`variants.ts:31–34`, etc.). There is **no randomization or variety anywhere** (confirmed: zero `Math.random`/sample-rotation in `main.js`). Every run shows the same bounty, same submitted work, same score, same verdict. The evidence matrix and reasoning trace are real outputs but always from the same input. The receipt archive (`renderArchive`) only fills if the user generates repeatedly — and they'd all look the same.

**Improvable surfaces.**
- Variety/volume of demo cases per judge (currently 1 each).
- Realism and texture of the sample work (so a viewer believes it's real submitted work).
- Whether content rotates/varies so repeat views and repeat screenshots differ.
- Ambient/background content that signals "live system" (e.g. a stream of receipts being issued across judges) vs the current single-player stillness.
- Range of outcomes shown (accept/revise/reject/escalate) — currently a viewer may only ever see one verdict.
- Believability of seeded numbers (scores, confidence, hashes, timestamps, addresses) — variety within plausible bands.
- Clear separation + labeling of seed content from the real `/api/judge` path (must never look like faked crypto).

**What "better" means here.** The system feels *alive and in use*, not like a single canned slide. Repeated views never look identical. A viewer sees the full range of verdicts and judges. All four outcome types are reachable. Demo content is varied and believable, yet unmistakably separated from the genuine signing/verification path.

---

## 6. Visuals (color, type, depth, texture, the look)

**Now.** Dark theme, green primary accent, faint grid background (`styles.css:61–66`), per-judge accent tokens (green/blue/amber/violet, `:root` `11–16`). Heavy decorative motion/light effects in the entry layer. Overall the surfaces read as uniform dark panels with low contrast between tiers; the receipt doesn't look materially different from any other panel.

**Improvable surfaces.**
- Depth/layering strategy (foreground/mid/background planes) vs the current flat stack of panels.
- Material language: does the receipt *look* like a sealed credential/document, or just another panel?
- Contrast and tier differentiation (hero vs forensic should look different, not just be different sizes).
- Use of the per-judge accent to re-tint the environment when switching judges (currently mostly a small color cue).
- Texture/finish: seal, emboss, paper/metal/glass metaphors — used meaningfully, not decoratively.
- Background treatment (grid is generic; could reinforce "verifiable compute" without becoming noise).
- Whether decorative effects (cursor tilt, light fields, receipt fans) earn their cost or just add chrome.
- Iconography (the master plan proposed a vocabulary — `master-plan.md:276–288` — largely unused).

**What "better" means here.** There's deliberate depth (a viewer perceives planes, not a flat wall). The receipt reads as a physical, valuable, sealed object on sight. Visual weight matches information importance. The four judges feel like one product seen through four tints. Every effect is justified by meaning; decorative-only effects are gone. A single paused frame looks intentional and striking.

---

## 7. Interaction (micro-level feedback, affordances, motion-on-action)

**Now.** ~70 keyframes drive entry/story/receipt motion (`styles.css:3984–4660`). Pointer lighting/tilt on entry (`setupEntryPointerLighting`). Pipeline runs staged states (`runPipeline`/`setPipelineState`). Verify and tamper have dedicated reveal animations. Clickable affordances are mostly real `<button>`s (good). Reduced-motion path exists (`5215`).

**Improvable surfaces.**
- Where the motion budget is spent (currently heavy on ambient entry chrome; the payoff moments deserve more).
- Feedback on user actions: does clicking Generate/Verify/Tamper feel physical and consequential?
- The tamper interaction specifically — is "the seal cracks / the row breaks" felt, or just a color flip?
- Hover/focus/active states and their consistency across the many buttons.
- Affordance clarity: do interactive elements look interactive; is the next action obvious?
- Input ergonomics in the form (three large required textareas — `minlength="10"`, `index.html:363–373`).
- Transitions between surfaces/views (`transitionSurface`, `route`) — continuity vs hard cuts.
- Keyboard interaction beyond what exists (`handleStoryKeydown` covers story mode; console coverage unclear).

**What "better" means here.** Every action produces immediate, proportionate, legible feedback. The tamper moment is *felt* as something breaking. Motion is concentrated on meaning (input → judged → sealed → verified → broken), not ambient decoration. Interactive elements are obviously interactive and consistently styled. The next step is always discoverable.

---

## 8. Scroll vs Single Viewport (layout strategy)

**Now.** The console is a fixed, non-scrolling single-viewport shell (`--shell-height: calc(100svh - var(--topbar-height))`, `styles.css:31`) with internal panels. The entry layer is also viewport-locked (`body:has(.entry-layer...) { overflow:hidden }`, `styles.css:118`). So the product is currently **single-viewport everywhere**, which is part of why it feels cramped — everything must fit at once.

**Improvable surfaces.**
- The fundamental choice: keep the cinematic single-viewport stage, adopt a deliberate scroll narrative, or mix (single-viewport console + a scroll-told story).
- If single-viewport: what gets cut so it isn't cramped (ties to §2 UI density).
- If scroll: pacing, scene boundaries, scroll-driven reveals, and how that maps to the video script.
- Mobile especially — single-viewport cramming is worst on small screens (`560` breakpoint, `styles.css:4966`).
- Whether the demo's linear narrative wants scroll (natural for storytelling) while the console wants a fixed stage (natural for a tool).

**What "better" means here.** The layout strategy is a *deliberate decision* matched to the goal, not a default. Whatever is chosen, no screen is cramped to honor it. The chosen mode supports the 60–90s narrative cleanly. Mobile is first-class, not a squeezed desktop.

---

## 9. Progressive Disclosure (depth on demand)

**Now.** Partial and uneven. The Signed JSON drawer (`<details>`, `index.html:481–484`) is good progressive disclosure. But the entry layer does the opposite — it front-loads everything (proof points + readout + scope + checks + boundary note all visible at once, `index.html:121–142`). Technical detail (hashes, attestation, signature) is shown flat rather than layered behind a plain-language summary.

**Improvable surfaces.**
- What's shown by default vs revealed on intent (hover/click/expand).
- Layering plain-language summaries over one-click-deep technical detail (the "easy to understand + technical depth" goal).
- The pipeline stages as disclosure points (each stage could carry a plain caption with raw detail on demand).
- Collapsing the entry layer's simultaneous blocks into a guided reveal.
- The architecture diagram (`index.html:454–464`) — static now; a candidate to reveal detail as the run progresses.
- Receipt forensic fields (hashes/signature/app ID) — summary-first, detail-on-expand.

**What "better" means here.** A newcomer sees a clean plain-language layer and is never overwhelmed; a technical viewer can drill into hashes/JSON/attestation in one action. Nothing dumps all its detail at once. Depth is *available* everywhere but *demanded* nowhere. The progressive layers map to the audience split (social viewer vs Eigen-technical reviewer).

---

## 10. Demo Content & Experience (the showcase itself)

**Now.** A guided story mode (`STORY_SCENES`, autoplay via `scheduleStoryAutoplay`) plus a Demo tab with a presenter panel and a 5-line script (`index.html:487–516`). The narrative is sound and matches `docs/demo-day.md`. But it relies on the single static case (§5), the payoff is reached only by stepping through, and there's no artifact tuned specifically for muted-autoplay social video (captions, framing, a hero still-frame).

**Improvable surfaces.**
- Whether there's a single, choreographed, repeatable "happy path" run that doubles as the video spine (see the script in `ui-ux-redesign-brief.md` §6).
- Auto-play vs manual pacing for an unattended viewer.
- The hero still-frame (the cracked seal) — is there a moment designed to be the thumbnail?
- On-screen captions/labels sized for muted autoplay.
- Variety so the demo doesn't look canned (ties to §5 content).
- The handoff between "watch" and "try it yourself."
- Presenter aids vs what a cold social viewer needs (different audiences).
- Backup/offline behavior if live endpoints are slow during recording.

**What "better" means here.** There's one choreographed path that lands the hook → judge → seal → verify → break → close inside 60–90s, legible muted, with at least one striking paused frame. It runs unattended for a passive viewer and is also drivable. It doesn't look like the same canned slide every time. It works even if the live LLM path is slow.

---

## 11. Cross-cutting concerns ("anything else")

### 11a. Responsive / Adaptive
**Now:** breakpoints at 1280/900/560 (`styles.css:4654–5214`); single-viewport cramming hits mobile hardest. **Better:** every target viewport (desktop 1440, laptop, tablet, mobile 390) is legible with no overflow in buttons/badges/receipt/evidence/JSON; mobile is designed, not squeezed.

### 11b. Accessibility
**Now:** mostly real `<button>`s, `aria-label`s present, `aria-live` regions, reduced-motion block. **Improvable:** focus visibility/order across the console, contrast ratios on dim-on-dark text (`--dim:#687367` on dark), keyboard operability of the full console (not just story mode), modal focus-trap in story mode, caption/alt parity. **Better:** fully keyboard-operable, visible focus, AA contrast on meaningful text, reduced-motion preserves all information, no information conveyed by color alone.

### 11c. Performance
**Now:** ~5,288 lines of CSS, ~70 keyframes, pointer-tracked lighting, many ambient animations. **Improvable:** cost of ambient/decorative motion, layout-thrash from pointer handlers, total CSS weight. **Better:** smooth on a mid laptop and mobile; motion is GPU-composited; decorative loops don't run forever for no payoff; net CSS shrinks as chrome is cut.

### 11d. State, Persistence & Resilience
**Now:** `localStorage` receipt archive; live LLM path with heuristic fallback (backend). **Improvable:** loading/slow-network UX during real `/api/judge` calls, error states, what the archive shows when varied content lands, demo resilience if an endpoint is down. **Better:** every async action has a designed loading + error + empty state; the demo never visibly breaks; the archive reflects varied real runs meaningfully.

### 11e. Empty / Loading / Error states
**Now:** some empty states exist ("No receipt yet", "Evidence rows appear after…", `index.html:392–394`). **Improvable:** consistency and craft of these across panels; loading states beyond the pipeline; error messaging tone. **Better:** every panel has an intentional empty/loading/error state that teaches rather than just sits blank.

### 11f. Brand & Identity
**Now:** "PJ" wordmark, SVG favicon, green identity, "EigenCloud Agent Private Preview" badge. **Improvable:** logo/mark craft, the EigenCloud co-branding for a *featured* post (vs a private-preview badge), consistent identity across video/thumbnail/site. **Better:** a recognizable, repeatable mark and a co-brand treatment appropriate for Eigen amplifying it publicly (not "private preview" framing).

### 11g. Shareability / Social-readiness
**Now:** a `.webm` demo video exists; no OG/meta images, no thumbnail design, no tweet-optimized framing. **Improvable:** social meta tags / OG image, a designed thumbnail, the muted-autoplay legibility, the quotable on-screen line. **Better:** the link unfurls well, the thumbnail stops a scroll, the video reads muted, and there's a frame people screenshot.

### 11h. Trust / Credibility signaling
**Now:** honest disclaimers present; real App IDs and EigenVerify links; HMAC signing. **Improvable:** making the *real vs simulated* distinction unmistakable (attestation mode, signed vs demo mode — `types.ts:55–58`), surfacing live attestation in-app, keeping seed content from ever looking like faked proof. **Better:** a viewer can always tell what's cryptographically real vs presentation seed; the honesty reads as rigor, not hedging; live identity is visible without leaving the app.

### 11i. Code health (so the redesign stays maintainable)
**Now:** `styles.css` ~5,288 lines and `main.js` ~1,990 lines, much of it driving entry-layer chrome that may be cut. **Improvable:** dead/decorative CSS removal as features are cut, organization of the stylesheet (sectioned but huge), token discipline. **Better:** CSS shrinks as chrome is removed; what remains is sectioned and token-driven; no orphaned keyframes/styles for deleted features.

---

## 12. Definition of done (the quality bar to self-check against)

A redesign is succeeding when:
1. A cold viewer understands "verifiable settlement receipt for agent work" in under ~10 seconds.
2. The **tamper-breaks-verification** moment is the unmistakable hero, reached fast, and striking as a single frame.
3. Nothing feels cramped at desktop *or* mobile; there's a clear focal element per screen.
4. Demo content is varied and alive, clearly separated from the real signing/verification path.
5. Plain-language and technical-depth layers coexist via progressive disclosure.
6. A 60–90s muted-autoplay video can be cut straight from the experience, with a thumbnail-worthy frame.
7. The real backend, API contracts, and live EigenCompute identity are untouched and visibly credible.
8. Net CSS/JS complexity goes **down** where chrome was cut, not up.

## 13. What NOT to do (guardrails)

- Don't add a 5th judge or new domains. Depth over breadth.
- Don't break `/api/judge`, `/api/verify`, the artifact schema, or the live deployments (`CLAUDE.md` hard constraints).
- Don't fake crypto, fake verification, or blur the real-vs-seed line.
- Don't reintroduce decorative gradient-blob hero / orbs (the master plan's own "avoid" list, `master-plan.md:267–274`).
- Don't grow CSS with more ambient chrome; concentrate motion on meaning.
- Don't regress reduced-motion or accessibility.
- Don't commit secrets (`.env.*`) or private PDFs.
