import { CASE_LIBRARY, buildTickerFeed } from "./cases.js";

/* ────────────────────────────── constants ─────────────────────────────── */

const ARCHIVE_KEY = "proofjudge.receipts.v1";

const APP_REGISTRY = {
  code: {
    appId: "0xd3647631C4706be744BE813cD0226e4f149e5aC0",
    ip: "34.12.29.220:3000",
    label: "Code Judge",
    verifyUrl: "https://verify.eigencloud.xyz/app/0xd3647631C4706be744BE813cD0226e4f149e5aC0"
  },
  research: {
    appId: "0x898E1d5603070C7452Ee7F8CF288639A63a217cc",
    ip: "35.204.155.165:3000",
    label: "Research Judge",
    verifyUrl: "https://verify.eigencloud.xyz/app/0x898E1d5603070C7452Ee7F8CF288639A63a217cc"
  },
  negotiation: {
    appId: "0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322",
    ip: "34.58.112.209:3000",
    label: "Negotiation Judge",
    verifyUrl: "https://verify.eigencloud.xyz/app/0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322"
  },
  governance: {
    appId: "0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94",
    ip: "34.87.56.225:3000",
    label: "Governance Judge",
    verifyUrl: "https://verify.eigencloud.xyz/app/0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94"
  }
};

const META = {
  code: {
    kicker: "Code judge",
    labels: { terms: "Task terms", rubric: "Acceptance rubric", work: "Submitted code / diff" }
  },
  research: {
    kicker: "Research judge",
    labels: { terms: "Research objective", rubric: "Evidence standard", work: "Submitted brief" }
  },
  negotiation: {
    kicker: "Negotiation judge",
    labels: { terms: "Deal context", rubric: "Required terms", work: "Submitted proposal" }
  },
  governance: {
    kicker: "Governance judge",
    labels: { terms: "Protocol context", rubric: "Risk rubric", work: "Proposal text" }
  }
};

/* station card copy — overridden by live GET /api/variants when available */
const STATION_META = {
  code: {
    icon: "{ }",
    tagline: "Verifiable review for code bounties and PRs.",
    problem: "Payment workflows can move value on-chain while acceptance still depends on off-chain evaluation with weak audit trails."
  },
  research: {
    icon: "◎",
    tagline: "Claims require sources. Sources require verification.",
    problem: "AI research tools can hallucinate citations or overstate support. Claims are traced to evidence and the evaluation is signed."
  },
  negotiation: {
    icon: "⇄",
    tagline: "Neutral ground. Both parties can verify.",
    problem: "Most negotiation tools serve one party. This judge is a party-neutral completeness check both sides can verify."
  },
  governance: {
    icon: "▲",
    tagline: "Proposals verified before votes are cast.",
    problem: "Proposals can move treasury funds before voters understand the risk. The preflight assessment is signed before the vote opens."
  }
};

const VERDICT_LABELS = { pass: "ACCEPTED", revise: "REVISE", fail: "REJECTED" };

const SETTLEMENT_LABELS = {
  "release-payment": "Release payment",
  "hold-for-revision": "Hold for revision",
  "reject-payment": "Reject payment",
  "escalate": "Escalate for appeal"
};

const PIPELINE_MIN_MS = 1500;

/* ────────────────────────────── state ─────────────────────────────────── */

let currentJudge = "code";
let currentCase = null;
let currentDrawer = null;
let drawerOpener = null;
let currentArtifact = null;
let tamperedView = false;
let stationOpen = false;
let judgedCases = {};
let runtimeOnline = null;
let variantConfigs = {};

/* ────────────────────────────── refs ──────────────────────────────────── */

const $ = (id) => document.getElementById(id);

const refs = {
  entry: $("entry"),
  console: $("console"),
  chamber: $("chamber"),
  station: $("station"),
  stationGrid: $("station-grid"),
  stationStats: $("station-stats"),
  stationRecentRows: $("station-recent-rows"),
  stationSlot: $("station-slot"),
  watchProofBtn: $("watch-proof-btn"),
  enterConsoleBtn: $("enter-console-btn"),
  tickerTrack: $("ticker-track"),

  runtimePill: $("runtime-pill"),
  headerVerifyLink: $("header-verify-link"),
  proofBtn: $("proof-btn"),

  docketList: $("docket-list"),
  docketCount: $("docket-count"),
  shuffleBtn: $("shuffle-case-btn"),

  caseKicker: $("case-kicker"),
  caseId: $("case-id"),
  caseTitle: $("case-title"),
  caseBlurb: $("case-blurb"),
  configuredAppId: $("configured-app-id"),
  attestationMode: $("attestation-mode"),

  form: $("judge-form"),
  labelTerms: $("label-terms"),
  labelRubric: $("label-rubric"),
  labelWork: $("label-work"),
  judgeBtn: $("judge-btn"),
  judgeBtnLabel: $("judge-btn-label"),
  pipeline: $("pipeline"),

  findings: $("findings"),

  drawer: $("drawer"),
  drawerVeil: $("drawer-veil"),
  drawerTitle: $("drawer-title"),
  drawerClose: $("drawer-close"),
  openLedgerBtn: $("open-ledger"),
  openTrustBtn: $("open-trust"),

  ledgerCount: $("ledger-count"),
  archiveTable: $("archive-table"),
  artifactPre: $("artifact-pre"),
  copyJsonBtn: $("copy-json-btn"),

  verifyJson: $("verify-json"),
  verifyPasteBtn: $("verify-paste-btn"),
  pasteReadout: $("paste-readout"),
  registryGrid: $("registry-grid"),

  deskSlot: $("desk-slot"),
  receipt: $("receipt"),
  receiptBanner: $("receipt-banner"),
  receiptJudge: $("receipt-judge"),
  receiptVerdictBlock: $("receipt-verdict-block"),
  receiptVerdict: $("receipt-verdict"),
  receiptAction: $("receipt-action"),
  receiptActionNote: $("receipt-action-note"),
  receiptCase: $("receipt-case"),
  receiptScore: $("receipt-score"),
  receiptSubmitter: $("receipt-submitter"),
  receiptTime: $("receipt-time"),
  receiptInputHash: $("receipt-input-hash"),
  receiptArtifactHash: $("receipt-artifact-hash"),
  receiptSignature: $("receipt-signature"),
  receiptAppId: $("receipt-app-id"),
  receiptModel: $("receipt-model"),
  receiptAttestation: $("receipt-attestation"),
  verifyBtn: $("verify-btn"),
  tamperBtn: $("tamper-btn"),
  railVerifyLink: $("rail-verify-link"),
  verifyReadout: $("verify-readout"),

  stage: $("stage"),
  stageCanvas: $("stage-canvas"),
  stageCaption: $("stage-caption"),
  stageKicker: $("stage-kicker"),
  stageLine: $("stage-line"),
  stageSub: $("stage-sub"),
  stageRail: $("stage-rail"),
  stageCursor: $("stage-cursor"),
  stageSound: $("stage-sound"),
  stageBack: $("stage-back"),
  stageNext: $("stage-next"),
  stageAuto: $("stage-auto"),
  stageExit: $("stage-exit"),

  toast: $("toast")
};

/* ────────────────────────────── routing ───────────────────────────────── */

function route(options = {}) {
  const path = window.location.pathname;
  const match = path.match(/^\/agents\/(\w+)$/);
  if (match && META[match[1]]) {
    hideEntry({ instant: true });
    showChamber(match[1], { push: false });
  } else if (path === "/console" || path === "/agents") {
    hideEntry({ instant: true });
    showStation({ push: false });
  } else {
    showEntry();
  }
  const hash = window.location.hash.replace("#", "");
  if (hash === "ledger" || hash === "trust") {
    openDrawer(hash, { push: false });
  } else {
    closeDrawer({ push: false });
  }
}

/* ── surfaces: station (overview floor) vs chamber (one judge's bench) ── */

async function showStation(options = {}) {
  if (options.push !== false) {
    history.pushState(null, "", "/console");
  }

  /* already on the floor — don't re-run the entrance */
  if (stationOpen && !refs.station.hidden) {
    refs.stationSlot.classList.add("active");
    return;
  }

  stationOpen = true;
  pendingJudge = null; /* leaving the chamber voids any queued swap */
  refs.stationSlot.classList.add("active");
  document.querySelectorAll(".dock-rail .dock-slot[data-judge]").forEach((el) => el.classList.remove("active"));

  /* step off the chamber floor: contents dim out before the lift */
  const leavingChamber = !refs.chamber.hidden;
  if (leavingChamber && !prefersReducedMotion()) {
    refs.chamber.classList.add("floor-exit");
    await wait(200);
    refs.chamber.classList.remove("floor-exit");
    if (!stationOpen) return; /* user changed their mind mid-exit */
  }

  refs.station.hidden = false;
  refs.chamber.hidden = true;
  renderStation();

  /* the floor assembles piece by piece — every arrival, same ritual */
  if (!prefersReducedMotion()) {
    refs.station.classList.remove("arriving");
    void refs.station.offsetWidth;
    refs.station.classList.add("arriving");
    window.clearTimeout(showStation.arriveTimer);
    showStation.arriveTimer = window.setTimeout(() => refs.station.classList.remove("arriving"), 1500);
  }
}

/* ── cartridge swap sequencer ──
   Ghosts are snapshots of the old shells that wipe away while the real data
   changes beneath them. Clicking another judge mid-wipe QUEUES a follow-up
   swap: the running scan finishes revealing its target, then a fresh scan
   triggers for the queued judge. Latest click wins the queue; nothing ever
   resets mid-flight. */

let swapGhostTimer = 0;
let swapRunning = false;
let pendingJudge = null;

/* total wipe time: longest delay (2 × 140ms) + duration (950ms) + buffer */
const SWAP_WIPE_MS = 1290;
/* overview→chamber: a single canvas-wide ghost, no stagger — duration + buffer */
const DOCK_WIPE_MS = 1010;

function highlightDockSlot(judge) {
  document.querySelectorAll(".dock-rail .dock-slot[data-judge]").forEach((el) => {
    el.classList.toggle("active", el.dataset.judge === judge);
  });
  refs.stationSlot.classList.remove("active");
}

/* a ghost is a pixel-faithful snapshot: a copy of the fixed atmosphere layer,
   aligned to where it sat behind the source element, with the element's clone
   (its own glass, borders, shadows — nothing approximated) on top. Frame one
   of a swap is therefore invisible; only the scan line announces it. */
function buildGhost(sourceEl, viewportRect) {
  const ghost = document.createElement("div");
  ghost.classList.add("swap-ghost");
  ghost.setAttribute("aria-hidden", "true");

  /* freeze the OLD judge's accent: the rail and root accent flip to the new
     judge immediately, but the snapshot keeps its original tint while wiping */
  const rootStyle = getComputedStyle(document.documentElement);
  ["--accent", "--accent-rgb", "--accent-ink"]
    .forEach((name) => ghost.style.setProperty(name, rootStyle.getPropertyValue(name)));

  const atmo = document.querySelector(".atmosphere");
  if (atmo) {
    const backdrop = atmo.cloneNode(true);
    backdrop.classList.add("ghost-backdrop");
    backdrop.style.left = `${-viewportRect.left}px`;
    backdrop.style.top = `${-viewportRect.top}px`;
    backdrop.style.width = `${window.innerWidth}px`;
    backdrop.style.height = `${window.innerHeight}px`;
    ghost.appendChild(backdrop);
  }

  const shell = sourceEl.cloneNode(true);
  shell.removeAttribute("id");
  shell.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
  shell.classList.add("ghost-shell");
  shell.classList.remove("arriving"); /* never replay entrance animations */
  ghost.appendChild(shell);

  const line = document.createElement("i");
  line.className = "swap-scanline";
  ghost.appendChild(line);
  return { ghost, shell };
}

function spawnSwapGhosts() {
  const bodyRect = refs.chamber.getBoundingClientRect();
  const shells = [".docket", ".bench", ".desk"]
    .map((sel) => refs.chamber.querySelector(sel))
    .filter(Boolean);

  shells.forEach((shellEl, index) => {
    const rect = shellEl.getBoundingClientRect();
    const { ghost, shell } = buildGhost(shellEl, rect);
    ghost.style.left = `${rect.left - bodyRect.left}px`;
    ghost.style.top = `${rect.top - bodyRect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.setProperty("--ghost-delay", `${index * 140}ms`);
    refs.chamber.appendChild(ghost);
    shell.scrollTop = shellEl.scrollTop; /* keep the column's scroll position */
    /* the last wipe to finish ends the swap; the timer is only a fallback */
    if (index === shells.length - 1) {
      ghost.addEventListener("animationend", (e) => {
        if (e.target === ghost) finishSwap();
      });
    }
  });

  swapRunning = true;
  window.clearTimeout(swapGhostTimer);
  swapGhostTimer = window.setTimeout(finishSwap, SWAP_WIPE_MS);
}

/* overview→chamber: snapshot the whole floor as ONE ghost covering the canvas;
   the chamber stands ready beneath while the scan wipes the floor away */
function spawnDockGhost() {
  const host = refs.station.parentElement; /* .console-main */
  const { ghost, shell } = buildGhost(refs.station, host.getBoundingClientRect());
  ghost.classList.add("dock-ghost");
  host.appendChild(ghost);
  shell.scrollTop = refs.station.scrollTop; /* keep the floor's scroll position */
  ghost.addEventListener("animationend", (e) => {
    if (e.target === ghost) finishSwap();
  });

  swapRunning = true;
  window.clearTimeout(swapGhostTimer);
  swapGhostTimer = window.setTimeout(finishSwap, DOCK_WIPE_MS);
}

function finishSwap() {
  if (!swapRunning) return; /* animationend and the fallback timer both arrive here */
  swapRunning = false;
  window.clearTimeout(swapGhostTimer);
  document.querySelectorAll(".swap-ghost").forEach((ghost) => ghost.remove());

  /* rail + accent already flipped at click time (selectJudge) — nothing to
     re-assert here. A judge queued mid-scan triggers its own scan now — unless
     the user has meanwhile left the chamber (station/stage own the screen) */
  const next = pendingJudge;
  pendingJudge = null;
  if (next && next !== currentJudge && !stationOpen && !refs.chamber.hidden && !stage.open) {
    showChamber(next, { push: false }); /* URL already points at the latest */
  }
}

function showChamber(judge, options = {}) {
  const cartridgeSwap = !stationOpen && !refs.chamber.hidden && currentJudge !== judge;
  const docking = stationOpen; /* arriving from the overview floor */

  if (options.push !== false) {
    history.pushState(null, "", `/agents/${judge}`);
  }

  /* scan in flight: queue this click. The rail acknowledges immediately;
     the swap itself runs the moment the current scan completes. */
  if (swapRunning) {
    pendingJudge = judge;
    highlightDockSlot(judge);
    return;
  }

  if (currentJudge === judge && !stationOpen && !refs.chamber.hidden) {
    highlightDockSlot(judge);
    return; /* already seated — nothing to swap */
  }

  /* snapshot the old surface BEFORE the data changes: panel ghosts for an
     agent→agent swap, one canvas-wide floor ghost when docking from overview */
  if (cartridgeSwap && !prefersReducedMotion()) {
    spawnSwapGhosts();
  }
  if (docking && !prefersReducedMotion()) {
    spawnDockGhost();
  }

  stationOpen = false;
  refs.station.hidden = true;
  refs.chamber.hidden = false;
  refs.stationSlot.classList.remove("active");
  loadCase.suppressDelivery = true;
  selectJudge(judge, { push: false });
  loadCase.suppressDelivery = false;

  /* the rail, accent, and content have all flipped at click time — the ghosts
     hold the old tint; ride the wipe line in the incoming judge's color */
  if ((cartridgeSwap || docking) && !prefersReducedMotion()) {
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb");
    document.querySelectorAll(".swap-scanline").forEach((line) => line.style.setProperty("--accent-rgb", accent));
  }
}

function showEntry() {
  refs.entry.hidden = false;
  refs.entry.classList.remove("leaving");
  document.body.classList.add("entry-open");
  renderTicker();
  startTicker();
}

function hideEntry(options = {}) {
  document.body.classList.remove("entry-open");
  stopTicker();
  if (refs.entry.hidden) return;
  if (options.instant || prefersReducedMotion()) {
    refs.entry.hidden = true;
    return;
  }
  refs.entry.classList.add("leaving");
  window.setTimeout(() => {
    refs.entry.hidden = true;
    refs.entry.classList.remove("leaving");
  }, 480);
}

function enterChamber(judge, options = {}) {
  hideEntry();
  showChamber(judge, options);
}

/* ────────────────────────────── drawer ────────────────────────────────── */

const DRAWER_TITLES = { ledger: "Ledger", trust: "Trust" };

function openDrawer(name, options = {}) {
  if (!DRAWER_TITLES[name]) return;
  currentDrawer = name;
  drawerOpener = options.opener ?? null;
  refs.drawerTitle.textContent = DRAWER_TITLES[name];
  document.querySelectorAll("[data-drawer-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.drawerPanel === name);
  });
  refs.drawer.classList.add("open");
  refs.drawerVeil.classList.add("open");
  refs.drawerClose.focus({ preventScroll: true });
  if (options.push !== false) {
    history.replaceState(null, "", `${window.location.pathname}#${name}`);
  }
}

function closeDrawer(options = {}) {
  if (!currentDrawer) return;
  currentDrawer = null;
  refs.drawer.classList.remove("open");
  refs.drawerVeil.classList.remove("open");
  if (options.push !== false) {
    history.replaceState(null, "", window.location.pathname);
  }
  drawerOpener?.focus({ preventScroll: true });
  drawerOpener = null;
}

/* ────────────────────────────── judges & cases ────────────────────────── */

function selectJudge(judge, options = {}) {
  if (!META[judge]) return;
  const changed = currentJudge !== judge;
  currentJudge = judge;

  document.documentElement.dataset.judge = judge;
  document.querySelectorAll("[data-judge], [data-entry-judge]").forEach((el) => {
    const value = el.dataset.judge ?? el.dataset.entryJudge;
    if (el.classList.contains("judge-chip") || el.classList.contains("dock-slot")) {
      el.classList.toggle("active", value === judge && !stationOpen);
    }
  });

  const meta = META[judge];
  const app = APP_REGISTRY[judge];
  refs.labelTerms.textContent = meta.labels.terms;
  refs.labelRubric.textContent = meta.labels.rubric;
  refs.labelWork.textContent = meta.labels.work;
  refs.caseKicker.textContent = meta.kicker;
  refs.configuredAppId.textContent = shortAddress(app.appId);
  refs.headerVerifyLink.href = app.verifyUrl;
  refs.railVerifyLink.href = app.verifyUrl;

  renderRegistry();
  renderDocket();

  if (changed || !currentCase) {
    loadCase(CASE_LIBRARY[judge][0], { resetReceipt: changed });
  }

  if (options.push) {
    history.pushState(null, "", `/agents/${judge}${currentDrawer ? `#${currentDrawer}` : ""}`);
  }
}

function renderDocket() {
  const cases = CASE_LIBRARY[currentJudge];
  refs.docketCount.textContent = `${cases.length} case files`;
  refs.docketList.innerHTML = cases
    .map(
      (c) => `
      <button type="button" role="listitem" class="case-card ${currentCase?.id === c.id ? "active" : ""}" data-case="${c.id}">
        <span class="case-meta"><span>${esc(c.id)}</span>${
          judgedCases[c.id] ? `<i class="case-verdict-dot ${judgedCases[c.id]}" title="judged this session: ${judgedCases[c.id]}"></i>` : ""
        }</span>
        <strong>${esc(c.title)}</strong>
        <small>${esc(c.blurb)}</small>
      </button>`
    )
    .join("");
}

function loadCase(caseFile, options = {}) {
  if (!caseFile) return;
  currentCase = caseFile;
  refs.caseId.textContent = caseFile.id;
  refs.caseTitle.textContent = caseFile.title;
  refs.caseBlurb.textContent = caseFile.blurb;
  refs.form.elements.bountyDescription.value = caseFile.terms;
  refs.form.elements.rubric.value = caseFile.rubric;
  refs.form.elements.submittedArtifact.value = caseFile.work;
  refs.form.elements.submitter.value = caseFile.submitter ?? "";
  refs.docketList.querySelectorAll(".case-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.case === caseFile.id);
  });
  window.requestAnimationFrame(() => autosizeDossier());

  /* the case visibly lands on the bench (unless a full cartridge swap is animating) */
  const benchPanel = $("view-bench");
  if (!prefersReducedMotion() && !refs.chamber.hidden && !loadCase.suppressDelivery) {
    benchPanel.classList.remove("delivering");
    void benchPanel.offsetWidth;
    benchPanel.classList.add("delivering");
    window.clearTimeout(loadCase.deliverTimer);
    loadCase.deliverTimer = window.setTimeout(() => benchPanel.classList.remove("delivering"), 700);
  }

  if (options.resetReceipt !== false) resetReceipt();
}

function shuffleCase() {
  const cases = CASE_LIBRARY[currentJudge].filter((c) => c.id !== currentCase?.id);
  const next = cases[Math.floor(Math.random() * cases.length)];
  loadCase(next);
  showToast(`Case file ${next.id} on the bench.`);
}

/* ────────────────────────────── judging ───────────────────────────────── */

async function generateReceipt(options = {}) {
  const body = {
    variant: currentJudge,
    bountyDescription: refs.form.elements.bountyDescription.value,
    rubric: refs.form.elements.rubric.value,
    submittedArtifact: refs.form.elements.submittedArtifact.value,
    submitter: refs.form.elements.submitter.value || undefined
  };

  setJudging(true);
  clearVerifyReadout();
  refs.deskSlot.dataset.state = "pending";
  refs.receipt.hidden = true;
  refs.receiptBanner.hidden = true;

  try {
    const [data] = await Promise.all([
      apiFetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }),
      runPipeline()
    ]);
    if (currentCase) {
      judgedCases[currentCase.id] = data.artifact.decision;
      renderDocket();
    }
    renderReceipt(data.artifact, { animate: true, save: true });
    return data.artifact;
  } catch (error) {
    resetPipeline();
    showToast(`Judging failed: ${error.message}`, "error");
    throw error;
  } finally {
    setJudging(false);
  }
}

function setJudging(on) {
  refs.judgeBtn.disabled = on;
  refs.judgeBtn.classList.toggle("loading", on);
  refs.judgeBtnLabel.textContent = on ? "Judging" : "Judge this work";
}

async function runPipeline() {
  resetPipeline();
  const stepMs = prefersReducedMotion() ? 10 : PIPELINE_MIN_MS / 5;
  const steps = refs.pipeline.querySelectorAll(".pipe-step");
  for (const step of steps) {
    step.classList.add("active");
    await wait(stepMs);
    step.classList.remove("active");
    step.classList.add("done");
  }
}

function resetPipeline() {
  refs.pipeline.querySelectorAll(".pipe-step").forEach((s) => s.classList.remove("active", "done"));
}

/* ────────────────────────────── receipt ───────────────────────────────── */

function renderReceipt(artifact, options = {}) {
  currentArtifact = artifact;
  tamperedView = false;
  const app = APP_REGISTRY[artifact.agent?.variant] ?? APP_REGISTRY[currentJudge];
  const appId = artifact.deploymentIdentity?.appId || app.appId;
  const settlement = artifact.settlementRecommendation;

  refs.receipt.hidden = false;
  refs.receiptBanner.hidden = true;
  refs.receiptJudge.textContent = `${artifact.agent?.name ?? "Decision"} · receipt`;
  refs.receiptVerdictBlock.className = `paper-verdict ${artifact.decision}`;
  refs.receiptVerdict.textContent = VERDICT_LABELS[artifact.decision] ?? artifact.decision.toUpperCase();
  refs.receiptAction.textContent = SETTLEMENT_LABELS[settlement.action] ?? settlement.action;
  refs.receiptActionNote.textContent = settlement.note;
  refs.receiptCase.textContent = `${artifact.taskId}`;
  if (options.animate && !prefersReducedMotion()) {
    refs.receiptScore.textContent = `0 / 100 · ${artifact.confidence}% confidence`;
    window.setTimeout(() => countUp(refs.receiptScore, artifact.score, ` / 100 · ${artifact.confidence}% confidence`), 350);
  } else {
    refs.receiptScore.textContent = `${artifact.score} / 100 · ${artifact.confidence}% confidence`;
  }
  refs.receiptSubmitter.textContent = artifact.submitter || "anonymous";
  refs.receiptTime.textContent = formatTime(artifact.timestamp);
  refs.receiptInputHash.textContent = shortHash(artifact.submittedArtifactHash);
  refs.receiptArtifactHash.textContent = shortHash(artifact.decisionArtifactHash);
  refs.receiptSignature.textContent = `${artifact.signature.algorithm} · ${shortHash(artifact.signature.value)}`;
  refs.receiptAppId.textContent = shortAddress(appId);
  refs.receiptModel.textContent = `${artifact.modelMetadata.mode} · ${artifact.modelMetadata.model}`;
  refs.receiptAttestation.textContent = artifact.deploymentIdentity?.attestation?.mode ?? "—";
  refs.receiptScoreRow().classList.remove("broken");

  refs.attestationMode.textContent = artifact.deploymentIdentity?.attestation?.mode ?? "—";
  refs.railVerifyLink.href = eigenVerifyUrl(appId, currentJudge);

  refs.verifyBtn.disabled = false;
  refs.tamperBtn.disabled = false;
  refs.tamperBtn.textContent = "Tamper test";
  refs.copyJsonBtn.disabled = false;

  refs.deskSlot.dataset.state = options.animate ? "sealing" : "sealed";
  if (options.animate && !prefersReducedMotion()) {
    window.setTimeout(() => {
      if (refs.deskSlot.dataset.state === "sealing") refs.deskSlot.dataset.state = "sealed";
    }, 950);
  } else {
    refs.deskSlot.dataset.state = "sealed";
  }

  renderFindings(artifact);
  refs.artifactPre.textContent = JSON.stringify(artifact, null, 2);

  /* on stacked layouts the desk sits below the findings — bring the moment on screen */
  if (options.animate && window.matchMedia("(max-width: 880px)").matches) {
    refs.deskSlot.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  }

  if (options.save) {
    saveArchive(artifact);
    showToast("Receipt sealed and signed.");
  }
  renderArchive();
  if (stationOpen) renderStation();
}

refs.receiptScoreRow = () => refs.receipt.querySelector('[data-row="score"]');

function resetReceipt() {
  currentArtifact = null;
  tamperedView = false;
  refs.deskSlot.dataset.state = "pending";
  refs.receipt.hidden = true;
  refs.receiptBanner.hidden = true;
  refs.verifyBtn.disabled = true;
  refs.tamperBtn.disabled = true;
  refs.tamperBtn.textContent = "Tamper test";
  refs.copyJsonBtn.disabled = true;
  refs.artifactPre.textContent = "{}";
  refs.attestationMode.textContent = "awaiting receipt";
  clearVerifyReadout();
  resetPipeline();
  renderFindings(null);
}

const META_EVIDENCE = new Set(["bounty description", "acceptance rubric", "submitted artifact hash", "submitted artifact"]);

function renderFindings(artifact) {
  if (!artifact) {
    refs.findings.innerHTML = `
      <p class="empty-note findings-empty">
        The judge shows its work. After judgment, every checked signal and the full reasoning trace
        land here — and both are signed into the receipt.
      </p>`;
    return;
  }

  const chips = artifact.evidenceChecked
    .map((item, index) => {
      const risk = /^risk signal/i.test(item);
      const label = item.replace(/^positive signal:\s*/i, "").replace(/^risk signal:\s*/i, "");
      const meta = META_EVIDENCE.has(label.toLowerCase());
      return `<span class="signal-chip ${risk ? "risk" : meta ? "meta" : ""}" style="--row-delay:${Math.min(index * 35, 540)}ms">${esc(label)}</span>`;
    })
    .join("");

  const reasoning = artifact.reasoning
    .map((item, index) => `<li style="--row-delay:${index * 90}ms">${esc(item)}</li>`)
    .join("");

  refs.findings.innerHTML = `
    <section class="finding-block">
      <header><h3>Evidence matrix</h3><small>${artifact.evidenceChecked.length} signals checked · signed into the receipt</small></header>
      <div class="signal-cloud">${chips}</div>
    </section>
    <section class="finding-block">
      <header><h3>Reasoning trace</h3><small>signed into the receipt</small></header>
      <ol class="reasoning-list">${reasoning}</ol>
    </section>`;
}

/* ────────────────────────────── verification ──────────────────────────── */

async function verifyArtifact(artifact) {
  const data = await apiFetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artifact })
  });
  return data.verification;
}

async function verifyCurrentReceipt() {
  if (!currentArtifact) return null;
  refs.verifyReadout.innerHTML = `<p class="empty-note">Checking the receipt against the live verifier…</p>`;
  const verification = await verifyArtifact(currentArtifact);
  renderVerifyReadout(refs.verifyReadout, verification, currentArtifact);
  refs.deskSlot.dataset.state = verification.ok ? "verified" : "tampered";
  showReceiptBanner(verification.ok ? "VERIFIED" : "VERIFICATION FAILED", verification.ok);
  revealReadout();
  return verification;
}

async function tamperCurrentReceipt() {
  if (!currentArtifact) return null;

  if (tamperedView) {
    /* restore: put the untouched original back on the desk and re-verify it */
    tamperedView = false;
    refs.tamperBtn.textContent = "Tamper test";
    refs.receiptScoreRow().classList.remove("broken");
    refs.receiptScore.textContent = `${currentArtifact.score} / 100 · ${currentArtifact.confidence}% confidence`;
    refs.receiptBanner.hidden = true;
    refs.deskSlot.dataset.state = "sealed";
    clearVerifyReadout();
    showToast("Original receipt restored. It still verifies.");
    return null;
  }

  const tampered = JSON.parse(JSON.stringify(currentArtifact));
  const originalScore = tampered.score;
  tampered.score = originalScore < 100 ? originalScore + 1 : originalScore - 1;

  const verification = await verifyArtifact(tampered);

  tamperedView = true;
  refs.receiptScore.textContent = `${tampered.score} / 100 · ${tampered.confidence}% confidence`;
  refs.receiptScoreRow().classList.add("broken");
  refs.deskSlot.dataset.state = "tampered";
  showReceiptBanner("VERIFICATION FAILED", false);
  refs.tamperBtn.textContent = "Restore original";

  renderVerifyReadout(refs.verifyReadout, verification, tampered, {
    compare: { originalScore, tamperedScore: tampered.score, embedded: currentArtifact.decisionArtifactHash, recomputed: verification.recomputedDecisionArtifactHash }
  });
  revealReadout();
  showToast("One field changed. The receipt no longer verifies.", "error");
  return verification;
}

function showReceiptBanner(text, ok) {
  refs.receiptBanner.hidden = false;
  refs.receiptBanner.textContent = text;
  refs.receiptBanner.className = `receipt-banner ${ok ? "ok" : ""}`;
}

function renderVerifyReadout(target, verification, artifact, options = {}) {
  const timestampOk = Boolean(artifact?.timestamp && !Number.isNaN(Date.parse(artifact.timestamp)));
  const rows = [
    ...verification.checks,
    { label: "Timestamp", ok: timestampOk, detail: timestampOk ? `Present: ${formatTime(artifact.timestamp)}` : "Timestamp missing or invalid." }
  ];

  const compare = options.compare
    ? `
      <div class="tamper-compare">
        <div><span>Original score</span><strong>${options.compare.originalScore} / 100</strong></div>
        <div><span>Edited score</span><strong class="bad">${options.compare.tamperedScore} / 100</strong></div>
        <div><span>Embedded hash</span><strong>${shortHash(options.compare.embedded)}</strong></div>
        <div><span>Recomputed hash</span><strong class="bad">${shortHash(options.compare.recomputed)}</strong></div>
      </div>`
    : "";

  target.innerHTML = `
    <div class="verify-summary ${verification.ok ? "ok" : "fail"}">
      <strong>${verification.ok ? "Receipt verified" : "Verification failed"}</strong>
      <span>${esc(verification.message)}</span>
    </div>
    ${compare}
    ${rows
      .map((check, index) => {
        const state = check.ok ? "ok" : check.label === "Attestation status" ? "warn" : "fail";
        const word = state === "ok" ? "PASS" : state === "warn" ? "INFO" : "FAIL";
        return `
        <div class="verify-row ${state}" style="--row-delay:${index * 70}ms">
          <span class="vr-state">${word}</span>
          <b>${esc(check.label)}</b>
          <small>${esc(check.detail)}</small>
        </div>`;
      })
      .join("")}
  `;
}

function revealReadout() {
  /* the readout sits below the receipt inside the desk column — make sure
     the summary row is on screen without yanking the receipt away */
  window.setTimeout(() => {
    refs.verifyReadout.firstElementChild?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest"
    });
  }, 150);
}

function clearVerifyReadout() {
  refs.verifyReadout.innerHTML = "";
  refs.pasteReadout.innerHTML = "";
}

/* ────────────────────────────── ledger ────────────────────────────────── */

function saveArchive(artifact) {
  const archive = readArchive().filter((r) => r.artifact.taskId !== artifact.taskId);
  archive.unshift({ artifact });
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive.slice(0, 14)));
}

function readArchive() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderArchive() {
  const archive = readArchive();
  refs.ledgerCount.hidden = archive.length === 0;
  refs.ledgerCount.textContent = String(archive.length);

  if (archive.length === 0) {
    refs.archiveTable.innerHTML = `<p class="empty-note">No receipts yet. Judge a case on the Bench and the sealed record lands here.</p>`;
    return;
  }

  refs.archiveTable.innerHTML = `
    <table>
      <thead><tr><th>Sealed</th><th>Judge</th><th>Verdict</th><th>Settlement</th><th>Artifact hash</th><th></th></tr></thead>
      <tbody>
        ${archive
          .map((record, index) => {
            const a = record.artifact;
            return `
            <tr>
              <td>${esc(formatTime(a.timestamp))}</td>
              <td>${esc(APP_REGISTRY[a.agent.variant]?.label ?? a.agent.variant)}</td>
              <td><span class="table-verdict ${a.decision}">${VERDICT_LABELS[a.decision] ?? a.decision}</span></td>
              <td>${esc(SETTLEMENT_LABELS[a.settlementRecommendation.action] ?? a.settlementRecommendation.action)}</td>
              <td class="mono">${shortHash(a.decisionArtifactHash)}</td>
              <td><button class="btn btn-quiet btn-compact" type="button" data-load-receipt="${index}">Load</button></td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

/* ────────────────────────────── registry ──────────────────────────────── */

function renderRegistry() {
  refs.registryGrid.innerHTML = Object.entries(APP_REGISTRY)
    .map(
      ([judge, app]) => `
      <article class="registry-card ${judge === currentJudge ? "active" : ""}" data-judge="${judge}">
        <span class="reg-name"><i></i>${esc(app.label)}</span>
        <span class="reg-id">${shortAddress(app.appId)}</span>
        <span class="reg-ip">${esc(app.ip)}</span>
        <a href="${app.verifyUrl}" target="_blank" rel="noopener">Inspect on EigenVerify ↗</a>
      </article>`
    )
    .join("");
}

/* ────────────────────────────── station ───────────────────────────────── */

function renderStation() {
  const archive = readArchive();

  /* stats strip */
  const runtimeStat = runtimeOnline === null
    ? `<span><b>Runtime</b> checking…</span>`
    : runtimeOnline
      ? `<span class="stat-ok"><b>Runtime online</b></span>`
      : `<span><b>Runtime offline</b></span>`;
  refs.stationStats.innerHTML = `
    <span><b>4</b> deployed judges</span>
    ${runtimeStat}
    <span><b>${archive.length}</b> receipt${archive.length === 1 ? "" : "s"} sealed here</span>
    <span><b>HMAC-SHA256</b> signing</span>
  `;

  /* cartridge cards */
  refs.stationGrid.innerHTML = Object.entries(APP_REGISTRY)
    .map(([judge, app]) => {
      const live = variantConfigs[judge];
      const meta = STATION_META[judge];
      const tagline = live?.tagline ?? meta.tagline;
      const lastRecord = archive.find((r) => r.artifact.agent.variant === judge);
      const lastVerdict = lastRecord
        ? `<span class="table-verdict ${lastRecord.artifact.decision}">${VERDICT_LABELS[lastRecord.artifact.decision]}</span>`
        : "none yet";
      return `
      <button type="button" class="judge-cartridge" data-station-judge="${judge}">
        <span class="jc-head">
          <span class="jc-icon">${esc(meta.icon)}</span>
          <span><strong>${esc(app.label)}</strong><small>${esc(tagline)}</small></span>
        </span>
        <p class="jc-problem">${esc(live?.problemStatement ?? meta.problem)}</p>
        <dl class="jc-rows">
          <div><dt>App ID</dt><dd>${shortAddress(app.appId)}</dd></div>
          <div><dt>Docket</dt><dd>${CASE_LIBRARY[judge].length} case files</dd></div>
          <div><dt>Last verdict</dt><dd>${lastVerdict}</dd></div>
        </dl>
        <span class="jc-foot">
          <span class="jc-enter">Enter chamber →</span>
          <a class="jc-verify" href="${app.verifyUrl}" target="_blank" rel="noopener">EigenVerify ↗</a>
        </span>
      </button>`;
    })
    .join("");

  /* recent receipts — real, from this browser */
  if (archive.length === 0) {
    refs.stationRecentRows.innerHTML = `
      <p class="empty-note">Nothing sealed yet. Run the proof, or dock into a chamber and judge a case —
      real receipts land here.</p>`;
    return;
  }
  refs.stationRecentRows.innerHTML = archive
    .slice(0, 5)
    .map((record, index) => {
      const a = record.artifact;
      return `
      <button type="button" class="recent-row" data-recent-receipt="${index}">
        <span class="rr-time">${esc(formatTime(a.timestamp))}</span>
        <span class="rr-judge">${esc(APP_REGISTRY[a.agent.variant]?.label ?? a.agent.variant)}</span>
        <span class="table-verdict ${a.decision}">${VERDICT_LABELS[a.decision] ?? a.decision}</span>
        <span>${esc(SETTLEMENT_LABELS[a.settlementRecommendation.action] ?? a.settlementRecommendation.action)}</span>
        <span class="rr-hash">${shortHash(a.decisionArtifactHash)}</span>
        <span class="rr-open">load on desk →</span>
      </button>`;
    })
    .join("");
}

/* ────────────────────────────── ticker ────────────────────────────────── */

/* JS-driven marquee: hover eases to a halt, leave eases back up.
   The loop cancels itself when fully stopped and when the tab is hidden. */
const ticker = {
  raf: 0,
  x: 0,
  speed: 0,
  target: 0,
  base: -80, // px per second — comfortable reading pace
  last: 0,
  half: 1
};

function startTicker() {
  if (prefersReducedMotion()) return;
  ticker.half = refs.tickerTrack.scrollWidth / 2 || 1;
  ticker.target = ticker.base;
  if (!ticker.raf) {
    ticker.speed = ticker.base; // snap to full speed on cold start — no lerp ramp-up
    ticker.last = performance.now();
    ticker.raf = window.requestAnimationFrame(tickTicker);
  }
}

function stopTicker() {
  ticker.target = 0;
  ticker.speed = 0;
  if (ticker.raf) {
    window.cancelAnimationFrame(ticker.raf);
    ticker.raf = 0;
  }
}

function tickTicker(now) {
  ticker.raf = window.requestAnimationFrame(tickTicker);
  const dt = Math.min((now - ticker.last) / 1000, 0.05);
  ticker.last = now;

  ticker.speed += (ticker.target - ticker.speed) * Math.min(1, dt * 5);
  if (ticker.target === 0 && Math.abs(ticker.speed) < 0.4) {
    window.cancelAnimationFrame(ticker.raf);
    ticker.raf = 0;
    return;
  }

  ticker.x = (ticker.x + ticker.speed * dt) % ticker.half;
  refs.tickerTrack.style.transform = `translateX(${ticker.x.toFixed(2)}px)`;
}

function renderTicker() {
  const items = buildTickerFeed();
  const markup = items
    .map(
      (item) => `
      <span class="tick" data-verdict="${item.verdict}">
        <i></i>
        <span class="tick-verdict">${item.verdict.toUpperCase()}</span>
        <b>${esc(item.subject)}</b>
        <span>${esc(APP_REGISTRY[item.variant]?.label ?? item.variant)}</span>
        <span class="mono">${esc(item.hash)}</span>
        <small>${item.secondsAgo}s ago · ${esc(item.action)}</small>
      </span>`
    )
    .join("");
  /* duplicated track = seamless loop */
  refs.tickerTrack.innerHTML = markup + markup;
  ticker.half = refs.tickerTrack.scrollWidth / 2 || 1;
}

/* ────────────────────────────── stage ─────────────────────────────────── */
/* The proof, presented: seven acts on a clean stage. User-stepped by
   default; autoplay is an explicit mode (and the video capture mode).
   Every judgment and verification on stage is a real API call. */

const stage = {
  open: false,
  act: 0,
  maxAct: 0, /* furthest act reached — the rail lets you revisit anything ≤ this */
  auto: false,
  token: 0,
  busy: false,
  artifact: null,
  verification: null,
  tampered: null,
  printed: false, /* the receipt prints once; revisits find it already sealed */
  caseFile: null,
  returnTo: "station",
  timer: 0
};

const STAGE_ACTS = [
  {
    id: "question",
    kicker: "the question",
    sub: "Everything you are about to see runs live — a real judge, real signatures.",
    nextLabel: "Begin →",
    autoMs: 4600
  },
  {
    id: "case",
    kicker: "the case file",
    line: "A case file hits the desk.",
    sub: "What was promised, what “done” means, and what actually arrived — captured together, ready to hash.",
    nextLabel: "Send to the judge →",
    autoMs: 6400
  },
  {
    id: "judgment",
    kicker: "the judgment",
    line: "The judge runs inside EigenCompute.",
    sub: "Scored inside attested TEE compute, under an app identity anyone can inspect — then sealed and signed.",
    nextLabel: "Print the receipt →",
    autoMs: 1600
  },
  {
    id: "receipt",
    kicker: "the receipt",
    line: "The verdict prints as a signed receipt.",
    sub: "Verdict, settlement action, hashes, judge identity — locked under an HMAC-SHA256 signature.",
    nextLabel: "Verify it →",
    autoMs: 5600
  },
  {
    id: "verify",
    kicker: "the proof",
    line: "Anyone can re-verify it.",
    sub: "Six checks against the live judge: schema, hashes, signature, deployment identity, attestation, timestamp.",
    nextLabel: "Now try to break it →",
    autoMs: 5200
  },
  {
    id: "tamper",
    kicker: "the tamper test",
    line: "Your turn — change the score.",
    sub: "Click the score on the receipt. One point is enough.",
    nextLabel: "Tamper →",
    autoMs: 3000
  },
  {
    id: "close",
    kicker: "the point",
    sub: "",
    nextLabel: "Open the console →",
    autoMs: 0
  }
];

function startStage() {
  stage.token += 1;
  stage.open = true;
  stage.auto = false;
  stage.busy = false;
  stage.artifact = null;
  stage.verification = null;
  stage.tampered = null;
  stage.printed = false;
  stage.maxAct = 0;
  stage.returnTo = document.body.classList.contains("entry-open")
    ? "entry"
    : stationOpen ? "station" : "chamber";
  stage.caseFile = CASE_LIBRARY[currentJudge][0];

  /* keep the chamber in sync so exiting lands on a coherent desk */
  hideEntry({ instant: true });
  closeDrawer();
  if (!stationOpen) loadCase(stage.caseFile);

  /* the proof plays itself — touching anything hands the controls over */
  stage.auto = true;
  refs.stageAuto.setAttribute("aria-pressed", "true");
  if (localStorage.getItem("pj-stage-sound") === "1") soundSetEnabled(true);
  window.clearTimeout(stopStage.closeTimer);
  refs.stage.classList.remove("closing");
  refs.stage.hidden = false;
  document.body.classList.add("stage-active");
  actorJumpTo(refs.stageNext); /* the hand starts at rest on the controls */
  goToAct(0);
}

/* any interaction while the proof is playing pauses it — the viewer takes the
   wheel; the Auto-play button hands it back */
function pauseStageAuto() {
  if (!stage.auto) return;
  stage.auto = false;
  refs.stageAuto.setAttribute("aria-pressed", "false");
  window.clearTimeout(stage.timer);
  renderStageRail(false);
  hideStageCursor();
}

function stopStage(options = {}) {
  if (!stage.open) return;
  stage.token += 1;
  stage.open = false;
  stage.auto = false;
  window.clearTimeout(stage.timer);
  hideStageCursor();
  refs.stageCursor.hidden = true;

  /* the sealed receipt waits on the judge's desk either way */
  if (stage.artifact) {
    loadCase.suppressDelivery = true;
    loadCase(stage.caseFile, { resetReceipt: false });
    loadCase.suppressDelivery = false;
    renderReceipt(stage.artifact, { animate: false, save: false });
  }

  /* set the destination first, then lift the curtain off it */
  document.body.classList.remove("stage-active");
  const arrive = !prefersReducedMotion();
  if (options.toStation) {
    showStation({ push: true, arrive });
  } else if (stage.returnTo === "entry" && !stage.artifact) {
    history.pushState(null, "", "/");
    showEntry();
  } else if (stage.returnTo === "chamber") {
    showChamber(currentJudge, { push: false });
  } else {
    showStation({ push: stage.returnTo === "entry", arrive });
  }

  if (prefersReducedMotion()) {
    refs.stage.hidden = true;
    return;
  }
  refs.stage.classList.add("closing");
  window.clearTimeout(stopStage.closeTimer);
  stopStage.closeTimer = window.setTimeout(() => {
    refs.stage.hidden = true;
    refs.stage.classList.remove("closing");
  }, 520);
}

function goToAct(index) {
  const token = stage.token;
  window.clearTimeout(stage.timer);
  stage.act = Math.max(0, Math.min(STAGE_ACTS.length - 1, index));
  stage.maxAct = Math.max(stage.maxAct, stage.act);
  const act = STAGE_ACTS[stage.act];

  refs.stage.dataset.act = act.id;
  refs.stageKicker.textContent = `${String(stage.act + 1).padStart(2, "0")} / ${String(STAGE_ACTS.length).padStart(2, "0")} · ${act.kicker}`;
  refs.stageLine.textContent = act.line ?? "";
  refs.stageLine.hidden = !act.line;
  refs.stageSub.textContent = act.sub;
  refs.stageSub.hidden = !act.sub;
  refs.stageBack.disabled = stage.act === 0;
  refs.stageNext.disabled = false;
  refs.stageNext.textContent = act.nextLabel;
  renderStageRail();
  restartStageCaption();

  const renderers = {
    question: renderActQuestion,
    case: renderActCase,
    judgment: renderActJudgment,
    receipt: renderActReceipt,
    verify: renderActVerify,
    tamper: renderActTamper,
    close: renderActClose
  };
  renderers[act.id](token);
}

function renderStageRail(filling = stage.auto) {
  refs.stageRail.innerHTML = STAGE_ACTS.map((act, i) => {
    const cls = i < stage.act ? "done" : i === stage.act ? `now ${filling ? "filling" : ""}` : "";
    const reachable = i <= stage.maxAct;
    return `<button type="button" class="${cls}" data-act-jump="${i}" ${reachable ? "" : "disabled"}
      aria-label="Act ${i + 1} · ${esc(act.kicker)}" title="${esc(act.kicker)}"></button>`;
  }).join("");
}

function restartStageCaption() {
  refs.stageCaption.style.animation = "none";
  void refs.stageCaption.offsetWidth;
  refs.stageCaption.style.animation = "";
}

/* ── stage sound: the film's cue palette, synthesized live, opt-in ──
   Paper, felt, glass, electricity — the same character as the promo score,
   built from oscillators and filtered noise. No assets, honest synthesis. */

const sound = { on: false, ctx: null };

function tone(ctx, t0, { freq = 440, to = null, dur = 0.1, gain = 0.1 }) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function snip(ctx, t0, { dur = 0.08, gain = 0.1, filter = null, freq = 1500 }) {
  const src = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node = src;
  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    node.connect(f);
    node = f;
  }
  node.connect(g).connect(ctx.destination);
  src.start(t0);
}

const SOUND_CUES = {
  tick: (ctx, t) => tone(ctx, t, { freq: 1280, dur: 0.05, gain: 0.09 }),
  blip: (ctx, t, i = 0) => tone(ctx, t, { freq: [620, 760, 920, 1100, 1320][i % 5], dur: 0.07, gain: 0.08 }),
  printer: (ctx, t) => {
    for (let i = 0; i < 24; i += 1) snip(ctx, t + i * 0.026, { dur: 0.012, gain: 0.06, filter: "bandpass", freq: 2300 });
  },
  stamp: (ctx, t, soft = false) => {
    tone(ctx, t, { freq: 82, dur: 0.34, gain: soft ? 0.14 : 0.26 });
    snip(ctx, t, { dur: 0.05, gain: 0.07, filter: "lowpass", freq: 500 });
  },
  verify: (ctx, t) => {
    tone(ctx, t, { freq: 659, dur: 0.16, gain: 0.09 });
    tone(ctx, t + 0.16, { freq: 880, dur: 0.16, gain: 0.09 });
    tone(ctx, t + 0.32, { freq: 1318, dur: 0.3, gain: 0.08 });
  },
  check: (ctx, t) => tone(ctx, t, { freq: 980, dur: 0.05, gain: 0.05 }),
  subhit: (ctx, t) => {
    tone(ctx, t, { freq: 52, to: 30, dur: 0.85, gain: 0.5 });
    snip(ctx, t, { dur: 0.06, gain: 0.09, filter: "highpass", freq: 1200 });
  },
  fail: (ctx, t) => tone(ctx, t, { freq: 290, dur: 0.07, gain: 0.07 }),
  resolve: (ctx, t) => {
    tone(ctx, t, { freq: 220, dur: 1.6, gain: 0.06 });
    tone(ctx, t, { freq: 329.63, dur: 1.6, gain: 0.05 });
  }
};

function cue(name, delayMs = 0, arg) {
  if (!sound.on || !sound.ctx || !stage.open) return;
  SOUND_CUES[name]?.(sound.ctx, sound.ctx.currentTime + delayMs / 1000, arg);
}

function soundSetEnabled(on) {
  sound.on = on;
  localStorage.setItem("pj-stage-sound", on ? "1" : "0");
  refs.stageSound.setAttribute("aria-pressed", String(on));
  refs.stageSound.textContent = on ? "Sound on" : "Sound off";
  if (on) {
    sound.ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    sound.ctx.resume?.();
    cue("tick");
  }
}

/* ── the autoplay actor: a hand that tours the proof, not a timer ──
   X and Y ride different easing curves so every path bends like a wrist.
   Speed scales with distance. It hesitates before pressing. Between beats
   it hovers the thing being talked about. */

const actor = { x: 0, y: 0, run: 0 };

function actorPoint(el, ax = 0.5, ay = 0.5) {
  const r = el.getBoundingClientRect();
  const sr = refs.stage.getBoundingClientRect();
  return { x: r.left - sr.left + r.width * ax, y: r.top - sr.top + r.height * ay };
}

function actorJumpTo(el, ax = 0.5, ay = 0.5) {
  if (!el || prefersReducedMotion()) return;
  const { x, y } = actorPoint(el, ax, ay);
  const cur = refs.stageCursor;
  const yEl = cur.firstElementChild;
  cur.style.transition = "opacity 0.3s ease";
  yEl.style.transition = "none";
  cur.style.transform = `translateX(${x}px)`;
  yEl.style.transform = `translateY(${y}px)`;
  actor.x = x;
  actor.y = y;
  cur.hidden = false;
  void cur.offsetWidth;
  cur.classList.add("visible");
}

function actorGlide(el, opts = {}) {
  return new Promise((resolve) => {
    if (!el || prefersReducedMotion()) {
      resolve();
      return;
    }
    const { x, y } = actorPoint(el, opts.ax ?? 0.5, opts.ay ?? 0.5);
    const dist = Math.hypot(x - actor.x, y - actor.y);
    const ms = opts.ms ?? Math.round(Math.min(900, Math.max(380, dist * 1.05)));
    const cur = refs.stageCursor;
    const yEl = cur.firstElementChild;
    cur.hidden = false;
    cur.classList.add("visible");
    cur.style.transition = `opacity 0.3s ease, transform ${ms}ms cubic-bezier(0.33, 0.02, 0.22, 1)`;
    yEl.style.transition = `transform ${ms}ms cubic-bezier(0.55, 0.06, 0.2, 1.14)`;
    cur.style.transform = `translateX(${x}px)`;
    yEl.style.transform = `translateY(${y}px)`;
    actor.x = x;
    actor.y = y;
    window.setTimeout(resolve, ms + 30);
  });
}

async function actorPress(el) {
  if (prefersReducedMotion()) return;
  await wait(150 + Math.random() * 130); /* a hand hesitates before it commits */
  refs.stageCursor.classList.add("pressing");
  el?.classList.add("cursor-pressed");
  cue("tick");
  await wait(170);
  refs.stageCursor.classList.remove("pressing");
  window.setTimeout(() => el?.classList.remove("cursor-pressed"), 240);
  await wait(70);
}

async function actorHover(el, ms = 650, opts = {}) {
  if (!el) return;
  await actorGlide(el, opts);
  el.classList.add("cursor-hover");
  await wait(ms);
  el.classList.remove("cursor-hover");
}

function hideStageCursor() {
  refs.stageCursor.classList.remove("visible", "pressing");
}

/* per-act choreography, anchored to real events: renderers call this only
   once their content is actually on stage (after the seal lands, after the
   checks render) — the scripts add breath and gesture, not blind clocks */
function runAutoScript(actId, railMs) {
  if (!stage.auto || !stage.open) return;
  const token = stage.token;
  const run = ++actor.run;
  const alive = () => stage.auto && stage.open && token === stage.token && run === actor.run;
  refs.stage.style.setProperty("--act-ms", `${railMs}ms`);
  renderStageRail(true);

  const beat = async (ms) => {
    await wait(prefersReducedMotion() ? Math.min(ms, 400) : ms);
    return alive();
  };
  const goNext = async () => {
    await actorGlide(refs.stageNext, { ay: 0.55 });
    if (!alive()) return;
    await actorPress(refs.stageNext);
    if (!alive()) return;
    stageNext();
  };
  const q = (sel) => refs.stageCanvas.querySelector(sel);
  const qa = (sel) => [...refs.stageCanvas.querySelectorAll(sel)];

  const SCRIPTS = {
    question: async () => {
      if (await beat(3000)) await goNext();
    },
    case: async () => {
      if (!(await beat(700))) return;
      for (const sheet of qa(".act-case .sheet")) { /* a clerk's pass over the papers */
        await actorHover(sheet, 560, { ay: 0.3 });
        if (!alive()) return;
      }
      if (await beat(250)) await goNext();
    },
    judgment: async () => {
      if (await beat(1500)) await goNext();
    },
    receipt: async () => {
      if (!(await beat(1400))) return; /* let it print, count, and stamp */
      await actorHover(q('[data-row="score"]'), 520, { ax: 0.72 });
      if (!alive()) return;
      await actorHover(qa(".paper-rows > div").at(-2), 560, { ax: 0.72 }); /* the signature */
      if (!alive()) return;
      await actorHover(q(".paper-foot .seal"), 480);
      if (alive()) await goNext();
    },
    verify: async () => {
      if (!(await beat(900))) return;
      await actorHover(q(".verify-row"), 700, { ax: 0.2 });
      if (!alive()) return;
      if (await beat(1300)) await goNext();
    },
    tamper: async () => {
      if (!(await beat(900))) return;
      const row = q('[data-row="score"]');
      if (!row) return;
      await actorGlide(row, { ms: 1200, ax: 0.72, ay: 0.55 }); /* slow, deliberate approach */
      if (!alive()) return;
      row.classList.add("cursor-hover");
      await wait(760); /* let the invite pulse breathe under the hand */
      row.classList.remove("cursor-hover");
      if (!alive()) return;
      await actorPress(row);
      if (!alive()) return;
      runStageTamper(token);
      /* then stillness — the slam owns the room; the "failed" script resumes after */
    },
    failed: async () => {
      if (await beat(5400)) await goNext();
    }
  };
  SCRIPTS[actId]?.().catch(() => {});
}

/* ── act renderers ── */

function renderActQuestion(token) {
  refs.stageCanvas.innerHTML = `
    <div class="act act-question">
      <span class="aq-seal" aria-hidden="true">
        <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="32" r="22.5" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3.5"/><path d="M21 32.5l7.5 7.5L43 25.5" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      <h1>Agents are deciding<br />who gets paid.</h1>
      <p class="aq-q">Who verifies the judge?</p>
    </div>`;
  runAutoScript("question", 4400);
}

function renderActCase(token) {
  const c = stage.caseFile;
  const meta = META[currentJudge];
  refs.stageCanvas.innerHTML = `
    <div class="act act-case">
      <div class="sheet">
        <div class="sheet-label"><b>${esc(meta.labels.terms)}</b><small>what was promised</small></div>
        <p>${esc(c.terms)}</p>
      </div>
      <div class="sheet">
        <div class="sheet-label"><b>${esc(meta.labels.rubric)}</b><small>what “done” means</small></div>
        <p>${esc(c.rubric)}</p>
      </div>
      <div class="sheet sheet-work">
        <div class="sheet-label"><b>${esc(meta.labels.work)}</b><small>what actually arrived · from ${esc(c.submitter)}</small></div>
        <p>${esc(c.work)}</p>
      </div>
    </div>`;
  cue("tick", 80);
  cue("tick", 260);
  cue("tick", 440);
  runAutoScript("case", 6400);
}

async function renderActJudgment(token) {
  /* the case sheets feed into the machine — the cut becomes a hand-off */
  const caseAct = refs.stageCanvas.querySelector(".act-case");
  if (caseAct && !prefersReducedMotion()) {
    caseAct.classList.add("ingesting");
    await wait(430);
    if (token !== stage.token) return;
  }

  const app = APP_REGISTRY[currentJudge];
  const steps = [
    ["Hash the inputs", "SHA-256"],
    ["Apply the rubric", "criterion by criterion"],
    ["Collect the evidence", "working notes kept"],
    ["Seal the artifact", "record frozen"],
    ["Sign the receipt", "HMAC-SHA256"]
  ];
  refs.stageCanvas.innerHTML = `
    <div class="act act-judgment">
      <div class="aj-identity">
        <div><span>Runtime</span><strong>EigenCompute · attested TEE</strong></div>
        <div><span>Judge identity</span><strong class="mono">${shortAddress(app.appId)}</strong></div>
        <div><span>Signing</span><strong>HMAC-SHA256</strong></div>
      </div>
      <div class="aj-pipeline">
        ${steps.map(([b, s], i) => `<div class="aj-step" data-aj="${i}"><i></i><b>${b}</b><small>${s}</small></div>`).join("")}
      </div>
    </div>`;

  if (stage.artifact) {
    /* re-entry via Back: show the pipeline complete, no re-judging */
    refs.stageCanvas.querySelectorAll(".aj-step").forEach((s) => s.classList.add("done"));
    runAutoScript("judgment", 2600);
    return;
  }

  stage.busy = true;
  refs.stageNext.disabled = true;
  refs.stageNext.textContent = "Sealing…";

  const stepEls = [...refs.stageCanvas.querySelectorAll(".aj-step")];
  const lastStep = stepEls[stepEls.length - 1];
  const animate = (async () => {
    const ms = prefersReducedMotion() ? 20 : 520;
    for (const el of stepEls.slice(0, -1)) {
      if (token !== stage.token) return;
      el.classList.add("active");
      cue("blip", 0, stepEls.indexOf(el));
      await wait(ms);
      el.classList.remove("active");
      el.classList.add("done");
    }
    if (token !== stage.token) return;
    /* the signature step holds until the judge actually signs — real latency, on stage */
    lastStep.classList.add("active");
    cue("blip", 0, 4);
  })();

  try {
    const c = stage.caseFile;
    const [data] = await Promise.all([
      apiFetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant: currentJudge,
          bountyDescription: c.terms,
          rubric: c.rubric,
          submittedArtifact: c.work,
          submitter: c.submitter
        })
      }),
      animate
    ]);
    if (token !== stage.token) return;
    lastStep.classList.remove("active");
    lastStep.classList.add("done");
    stage.artifact = data.artifact;
    judgedCases[c.id] = data.artifact.decision;
    saveArchive(data.artifact);
    renderArchive();
    renderDocket();
    stage.busy = false;
    refs.stageNext.disabled = false;
    refs.stageNext.textContent = STAGE_ACTS[2].nextLabel;
    runAutoScript("judgment", 2600);
  } catch (error) {
    if (token !== stage.token) return;
    stage.busy = false;
    showToast(`The judge could not be reached: ${error.message}`, "error");
    stopStage();
  }
}

function stagePaperHTML(options = {}) {
  const artifact = stage.artifact;
  if (!artifact) return "";
  const settlement = artifact.settlementRecommendation;
  const scoreText = options.scoreText ?? `${artifact.score} / 100 · ${artifact.confidence}% confidence`;
  const banner = options.banner
    ? `<div class="receipt-banner ${options.bannerOk ? "ok" : ""}">${options.banner}</div>`
    : "";
  return `
    <article class="paper receipt">
      ${banner}
      <header class="paper-head">
        <span class="paper-brand">ProofJudge</span>
        <span class="paper-doc">${esc(artifact.agent.name)} · receipt</span>
      </header>
      <div class="paper-verdict ${artifact.decision}">
        <small>Verdict</small>
        <strong>${VERDICT_LABELS[artifact.decision] ?? artifact.decision}</strong>
        <span>${esc(SETTLEMENT_LABELS[settlement.action] ?? settlement.action)}</span>
      </div>
      <p class="paper-note action-note">${esc(settlement.note)}</p>
      <dl class="paper-rows">
        <div><dt>Case</dt><dd>${esc(artifact.taskId)}</dd></div>
        <div data-row="score" class="${options.broken ? "broken" : ""}"><dt>Score</dt><dd id="stage-score">${scoreText}</dd></div>
        <div><dt>Submitter</dt><dd>${esc(artifact.submitter || "anonymous")}</dd></div>
        <div><dt>Input hash</dt><dd class="mono">${shortHash(artifact.submittedArtifactHash)}</dd></div>
        <div><dt>Artifact hash</dt><dd class="mono">${shortHash(artifact.decisionArtifactHash)}</dd></div>
        <div><dt>Signature</dt><dd class="mono">${artifact.signature.algorithm} · ${shortHash(artifact.signature.value)}</dd></div>
        <div><dt>Judge identity</dt><dd class="mono">${shortAddress(artifact.deploymentIdentity?.appId)}</dd></div>
      </dl>
      <div class="paper-foot">
        <span class="paper-note">Signed inside EigenCompute.<br />Edit any field and verification fails.</span>
        <span class="seal ${options.cracked ? "" : ""}" aria-hidden="true">
          <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="22.5" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3.5"/><path d="M21 32.5l7.5 7.5L43 25.5" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </div>
    </article>`;
}

/* ── the receipt scene ──
   Acts 4–6 share ONE persistent DOM scene. Nothing remounts between them: the
   side panel expands and retracts, the paper recenters via flex, banners stamp
   on and lift off. data-phase drives every move:
     receipt → side collapsed, paper centered
     verify  → side expands with the six checks, VERIFIED stamps on
     tamper  → VERIFIED lifts off, checks retract, paper recenters, score waits
     failed  → the slam: side re-expands with the post-mortem readout */

function ensureReceiptScene() {
  let scene = refs.stageCanvas.querySelector(".act-receipt");
  if (scene && scene.dataset.case === stage.artifact.taskId) return scene;
  const printing = !stage.printed && !prefersReducedMotion();
  refs.stageCanvas.innerHTML = `
    <div class="act act-receipt" data-case="${esc(stage.artifact.taskId)}" data-phase="receipt">
      <div class="stage-paper-wrap">
        <div class="desk-slot" data-state="${printing ? "sealing" : "sealed"}">
          ${stagePaperHTML(printing ? { scoreText: `0 / 100 · ${stage.artifact.confidence}% confidence` } : {})}
        </div>
      </div>
      <aside class="stage-side">
        <div class="stage-checks verify-readout" id="stage-checks"></div>
      </aside>
    </div>`;
  return refs.stageCanvas.querySelector(".act-receipt");
}

/* stepping back to an earlier act restores the pristine paper */
function resetStagePaper(scene) {
  if (!stage.tampered) return;
  stage.tampered = null;
  const scoreEl = scene.querySelector("#stage-score");
  if (scoreEl) scoreEl.textContent = `${stage.artifact.score} / 100 · ${stage.artifact.confidence}% confidence`;
  scene.querySelector('[data-row="score"]')?.classList.remove("broken");
}

function setStageBanner(slot, text, ok = false) {
  const paper = slot.querySelector(".paper");
  const existing = paper.querySelector(".receipt-banner");
  if (!text) {
    if (existing && !existing.classList.contains("leaving")) {
      existing.classList.add("leaving");
      window.setTimeout(() => existing.remove(), 420);
    }
    return;
  }
  if (existing) existing.remove();
  paper.insertAdjacentHTML("afterbegin", `<div class="receipt-banner ${ok ? "ok" : ""}">${text}</div>`);
}

function renderActReceipt(token) {
  const scene = ensureReceiptScene();
  const slot = scene.querySelector(".desk-slot");
  resetStagePaper(scene);
  setStageBanner(slot, null);
  scene.dataset.phase = "receipt";
  if (slot.dataset.state === "sealing") {
    stage.printed = true;
    cue("printer", 60);
    const scoreEl = scene.querySelector("#stage-score");
    window.setTimeout(() => {
      if (token !== stage.token) return;
      countUp(scoreEl, stage.artifact.score, ` / 100 · ${stage.artifact.confidence}% confidence`);
      slot.dataset.state = "sealed";
      cue("stamp");
    }, 900);
  } else {
    slot.dataset.state = "sealed"; /* verified glow eases back off on revisit */
  }
  runAutoScript("receipt", 5800);
}

async function renderActVerify(token) {
  const scene = ensureReceiptScene();
  const slot = scene.querySelector(".desk-slot");
  resetStagePaper(scene);
  scene.dataset.phase = "verify";
  const checks = scene.querySelector("#stage-checks");
  if (!stage.verification) {
    checks.innerHTML = `<p class="empty-note">Checking against the live verifier…</p>`;
  }
  try {
    const verification = stage.verification ?? (await verifyArtifact(stage.artifact));
    if (token !== stage.token) return;
    stage.verification = verification;
    renderVerifyReadout(checks, verification, stage.artifact);
    slot.dataset.state = verification.ok ? "verified" : "tampered";
    setStageBanner(slot, verification.ok ? "VERIFIED" : "VERIFICATION FAILED", verification.ok);
    cue("verify");
    for (let i = 0; i < 7; i += 1) cue("check", 180 + i * 70);
    cue("stamp", 420, true);
    runAutoScript("verify", 5400);
  } catch (error) {
    if (token !== stage.token) return;
    showToast(`Verification could not run: ${error.message}`, "error");
  }
}

function renderActTamper(token) {
  const scene = ensureReceiptScene();
  const slot = scene.querySelector(".desk-slot");
  resetStagePaper(scene);
  scene.dataset.phase = "tamper"; /* checks retract, the paper slides back center */
  slot.dataset.state = "sealed";  /* the verified glow eases off — clean slate to break */
  setStageBanner(slot, null);     /* VERIFIED lifts away */
  const scoreRow = scene.querySelector('[data-row="score"]');
  if (scoreRow) scoreRow.onclick = () => runStageTamper(stage.token);
  runAutoScript("tamper", 3800);
}

async function runStageTamper(token) {
  if (token !== stage.token || stage.tampered) return;
  const scene = refs.stageCanvas.querySelector(".act-receipt");
  if (!scene) return;
  const tampered = JSON.parse(JSON.stringify(stage.artifact));
  const originalScore = tampered.score;
  tampered.score = originalScore < 100 ? originalScore + 1 : originalScore - 1;
  stage.tampered = tampered;

  /* the edit lands instantly — the click must feel like it did something */
  const scoreEl = scene.querySelector("#stage-score");
  const scoreRow = scene.querySelector('[data-row="score"]');
  scoreEl.textContent = `${tampered.score} / 100 · ${tampered.confidence}% confidence`;
  scoreRow.classList.add("broken");

  try {
    const verification = await verifyArtifact(tampered);
    if (token !== stage.token) return;

    const slot = scene.querySelector(".desk-slot");
    slot.dataset.state = "tampered";
    setStageBanner(slot, "VERIFICATION FAILED", false);
    cue("subhit");
    for (let i = 0; i < 3; i += 1) cue("fail", 480 + i * 160);
    scene.dataset.phase = "failed"; /* the side returns, carrying the post-mortem */
    renderVerifyReadout(scene.querySelector("#stage-checks"), verification, tampered, {
      compare: {
        originalScore,
        tamperedScore: tampered.score,
        embedded: stage.artifact.decisionArtifactHash,
        recomputed: verification.recomputedDecisionArtifactHash
      }
    });

    refs.stageKicker.textContent = `06 / 07 · the tamper test`;
    refs.stageLine.textContent = "Verification fails. The seal did its job.";
    refs.stageSub.textContent = "One point changed after sealing — the recomputed hash no longer matches and the signature breaks. Money doesn’t move.";
    refs.stageNext.textContent = "Why it matters →";
    restartStageCaption();
    runAutoScript("failed", 6400);
  } catch (error) {
    if (token !== stage.token) return;
    resetStagePaper(scene); /* restores the score and clears stage.tampered — the click can be tried again */
    showToast(`Tamper test could not run: ${error.message}`, "error");
  }
}

function renderActClose(token) {
  stage.auto = false;
  refs.stageAuto.setAttribute("aria-pressed", "false");
  hideStageCursor();
  cue("resolve", 250);
  renderStageRail();
  refs.stageCanvas.innerHTML = `
    <div class="act act-close">
      <h1>Proof, not promises.</h1>
      <p class="ac-sub">
        ProofJudge doesn’t make AI judgment perfect — it makes it accountable.
        Everything you just watched was judged, sealed, signed, and re-verified by a live deployment.
      </p>
      <p class="ac-built">Built on EigenCompute · attested TEE compute · <span class="ac-judges" aria-hidden="true"><i></i><i></i><i></i><i></i></span> four deployed judges</p>
      <div class="ac-actions">
        <button class="btn btn-primary btn-marquee" type="button" id="stage-open-console">
          <span class="btn-stack"><b>Open the console</b><small>your receipt is in the ledger — and on the ${esc(APP_REGISTRY[currentJudge].label)}’s desk</small></span>
        </button>
        <button class="btn btn-ghost btn-marquee" type="button" id="stage-replay">
          <span class="btn-stack"><b>Replay</b><small>run the proof again</small></span>
        </button>
      </div>
    </div>`;
  refs.stageCanvas.querySelector("#stage-open-console").addEventListener("click", () => stopStage({ toStation: true }));
  refs.stageCanvas.querySelector("#stage-replay").addEventListener("click", () => {
    stage.artifact = null;
    stage.verification = null;
    stage.tampered = null;
    stage.printed = false;
    stage.maxAct = 0;
    stage.auto = true; /* replay = watch again */
    refs.stageAuto.setAttribute("aria-pressed", "true");
    goToAct(0);
  });
}

/* ── stage controls ── */

function stageNext() {
  if (!stage.open || stage.busy) return;
  const act = STAGE_ACTS[stage.act];
  if (act.id === "tamper" && !stage.tampered) {
    runStageTamper(stage.token);
    return;
  }
  if (act.id === "close") {
    stopStage({ toStation: true });
    return;
  }
  goToAct(stage.act + 1);
}

function stageToggleAuto() {
  stage.auto = !stage.auto;
  refs.stageAuto.setAttribute("aria-pressed", String(stage.auto));
  if (stage.auto) {
    actorJumpTo(refs.stageAuto); /* the hand starts where yours just was */
    goToAct(stage.act); /* re-enter the act so its script arms */
  } else {
    window.clearTimeout(stage.timer);
    renderStageRail(false);
    hideStageCursor();
  }
}

function countUp(el, target, suffix, ms = 900) {
  if (!el) return;
  if (prefersReducedMotion()) {
    el.textContent = `${target}${suffix}`;
    return;
  }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${Math.round(target * eased)}${suffix}`;
    if (t < 1) window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
}

/* ────────────────────────────── runtime ───────────────────────────────── */

async function pingRuntime() {
  try {
    const health = await apiFetch("/healthz");
    runtimeOnline = Boolean(health.ok);
    refs.runtimePill.className = `runtime-pill ${health.ok ? "online" : ""}`;
    refs.runtimePill.innerHTML = `<i></i>${health.ok ? "runtime online" : "status unknown"}`;
  } catch {
    runtimeOnline = false;
    refs.runtimePill.className = "runtime-pill offline";
    refs.runtimePill.innerHTML = "<i></i>runtime offline";
  }
  if (stationOpen) renderStation();
}

async function loadVariantConfigs() {
  try {
    const data = await apiFetch("/api/variants");
    variantConfigs = Object.fromEntries(data.variants.map((v) => [v.id, v]));
  } catch {
    variantConfigs = {};
  }
  if (stationOpen) renderStation();
}

/* ────────────────────────────── events ────────────────────────────────── */

refs.watchProofBtn.addEventListener("click", () => startStage());
refs.enterConsoleBtn.addEventListener("click", () => {
  hideEntry();
  showStation({ push: true });
});
refs.proofBtn.addEventListener("click", () => startStage());
refs.stageNext.addEventListener("click", () => stageNext());
refs.stageBack.addEventListener("click", () => goToAct(stage.act - 1));
refs.stageAuto.addEventListener("click", () => stageToggleAuto());
refs.stageSound.addEventListener("click", () => soundSetEnabled(!sound.on));
refs.stageExit.addEventListener("click", () => stopStage());
refs.stageRail.addEventListener("click", (event) => {
  const dot = event.target.closest("[data-act-jump]");
  if (!dot || dot.disabled || stage.busy || !stage.open) return;
  goToAct(Number(dot.dataset.actJump));
});
/* touching anything on the stage (except Auto/Sound) pauses the performance */
refs.stage.addEventListener("pointerdown", (event) => {
  if (!stage.auto) return;
  if (event.target.closest("#stage-auto, #stage-sound")) return;
  pauseStageAuto();
}, true);

document.querySelectorAll("[data-entry-judge]").forEach((button) => {
  button.addEventListener("click", () => enterChamber(button.dataset.entryJudge, { push: true }));
});

document.querySelectorAll(".dock-rail [data-judge]").forEach((button) => {
  button.addEventListener("click", () => showChamber(button.dataset.judge, { push: true }));
});

refs.stationSlot.addEventListener("click", () => showStation({ push: true }));

refs.stationGrid.addEventListener("click", (event) => {
  const verifyLink = event.target.closest("a");
  if (verifyLink) return; /* let EigenVerify links be links */
  const card = event.target.closest("[data-station-judge]");
  if (card) showChamber(card.dataset.stationJudge, { push: true });
});

refs.stationRecentRows.addEventListener("click", (event) => {
  const row = event.target.closest("[data-recent-receipt]");
  if (!row) return;
  const record = readArchive()[Number(row.dataset.recentReceipt)];
  if (!record?.artifact) return;
  showChamber(record.artifact.agent.variant, { push: true });
  renderReceipt(record.artifact, { animate: false, save: false });
  showToast(`Receipt ${record.artifact.taskId} back on the desk.`);
});

refs.openLedgerBtn.addEventListener("click", () => openDrawer("ledger", { opener: refs.openLedgerBtn }));
refs.openTrustBtn.addEventListener("click", () => openDrawer("trust", { opener: refs.openTrustBtn }));
refs.drawerClose.addEventListener("click", () => closeDrawer());
refs.drawerVeil.addEventListener("click", () => closeDrawer());

const tickerEl = document.querySelector(".ticker");
tickerEl.addEventListener("pointerenter", () => {
  ticker.target = 0;
});
tickerEl.addEventListener("pointerleave", () => {
  if (!document.body.classList.contains("entry-open")) return;
  startTicker();
});
window.addEventListener("resize", () => {
  /* ghost geometry is frozen at spawn — on resize, snap the swap to done */
  if (swapRunning) finishSwap();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopTicker();
  } else if (document.body.classList.contains("entry-open")) {
    startTicker();
  }
});

/* dossier textareas grow with their content — documents, not boxes */
const AUTOSIZE_IDS = ["bountyDescription", "rubric", "submittedArtifact"];
function autosizeDossier() {
  AUTOSIZE_IDS.forEach((id) => {
    const el = $(id);
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  });
}
AUTOSIZE_IDS.forEach((id) => $(id).addEventListener("input", autosizeDossier));
window.addEventListener("resize", () => {
  window.clearTimeout(autosizeDossier.timer);
  autosizeDossier.timer = window.setTimeout(autosizeDossier, 120);
});

refs.docketList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-case]");
  if (!card) return;
  const next = CASE_LIBRARY[currentJudge].find((c) => c.id === card.dataset.case);
  loadCase(next);
});

refs.shuffleBtn.addEventListener("click", () => shuffleCase());

refs.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await generateReceipt().catch(() => {});
});

refs.verifyBtn.addEventListener("click", () => {
  verifyCurrentReceipt().catch((error) => showToast(`Verification failed to run: ${error.message}`, "error"));
});

refs.tamperBtn.addEventListener("click", () => {
  tamperCurrentReceipt().catch((error) => showToast(`Tamper test failed to run: ${error.message}`, "error"));
});

refs.verifyPasteBtn.addEventListener("click", async () => {
  refs.pasteReadout.innerHTML = `<p class="empty-note">Checking…</p>`;
  try {
    const artifact = JSON.parse(refs.verifyJson.value);
    const verification = await verifyArtifact(artifact);
    renderVerifyReadout(refs.pasteReadout, verification, artifact);
  } catch (error) {
    refs.pasteReadout.innerHTML = `
      <div class="verify-summary fail">
        <strong>Could not verify</strong>
        <span>${esc(error.message)}</span>
      </div>`;
  }
});

refs.copyJsonBtn.addEventListener("click", async () => {
  if (!currentArtifact) return;
  const json = JSON.stringify(currentArtifact, null, 2);
  try {
    await navigator.clipboard.writeText(json);
    showToast("Receipt JSON copied. Paste it anywhere — including the Trust tab.");
  } catch {
    refs.verifyJson.value = json;
    openDrawer("trust");
    showToast("Clipboard unavailable — JSON placed in the Trust verifier.");
  }
});

refs.archiveTable.addEventListener("click", (event) => {
  const button = event.target.closest("[data-load-receipt]");
  if (!button) return;
  const record = readArchive()[Number(button.dataset.loadReceipt)];
  if (!record?.artifact) return;
  renderReceipt(record.artifact, { animate: false, save: false });
  showToast(`Receipt ${record.artifact.taskId} back on the desk.`);
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("//")) return;
  event.preventDefault();
  if (href === "/" || link.dataset.showEntry !== undefined) {
    history.pushState(null, "", "/");
    showEntry();
  }
});

window.addEventListener("popstate", () => route());

document.addEventListener("keydown", (event) => {
  if (stage.open) {
    if (event.key === "Escape") {
      event.preventDefault();
      stopStage();
    } else if (event.key === "ArrowRight" || event.key === " ") {
      if (event.target.closest("button, a, input, textarea")) return;
      event.preventDefault();
      pauseStageAuto();
      stageNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      pauseStageAuto();
      if (stage.act > 0) goToAct(stage.act - 1);
    }
    return;
  }
  if (event.key === "Escape" && currentDrawer) {
    event.preventDefault();
    closeDrawer();
  }
});

/* ────────────────────────────── helpers ───────────────────────────────── */

async function apiFetch(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new Error(body || `HTTP ${response.status}`);
  }
  return response.json();
}

function eigenVerifyUrl(appId, judge) {
  if (appId && appId.startsWith("0x")) return `https://verify.eigencloud.xyz/app/${appId}`;
  return APP_REGISTRY[judge].verifyUrl;
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortHash(value) {
  const text = String(value || "—");
  return text.length > 18 ? `${text.slice(0, 10)}…${text.slice(-8)}` : text;
}

function shortAddress(value) {
  const text = String(value || "—");
  return text.startsWith("0x") && text.length > 14 ? `${text.slice(0, 8)}…${text.slice(-6)}` : text;
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function showToast(message, tone = "ok") {
  /* the stage narrates its own run — only let errors through */
  if (tone !== "error" && document.body.classList.contains("stage-active")) return;
  refs.toast.textContent = message;
  refs.toast.className = `toast ${tone === "error" ? "error" : ""}`;
  refs.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    refs.toast.hidden = true;
  }, 3400);
}

/* ────────────────────────────── init ──────────────────────────────────── */

function init() {
  selectJudge("code", { push: false });
  renderArchive();
  resetReceipt();
  renderTicker();
  route();
  pingRuntime();
  loadVariantConfigs();
}

init();
