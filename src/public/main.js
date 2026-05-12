const ARCHIVE_KEY = "proofjudge.receipts.v1";

const APP_REGISTRY = {
  code: {
    appId: "0xd3647631C4706be744BE813cD0226e4f149e5aC0",
    ip: "34.12.29.220:3000",
    label: "Code Bounty",
    verifyUrl: "https://verify.eigencloud.xyz/app/0xd3647631C4706be744BE813cD0226e4f149e5aC0"
  },
  research: {
    appId: "0x898E1d5603070C7452Ee7F8CF288639A63a217cc",
    ip: "35.204.155.165:3000",
    label: "Research Deliverable",
    verifyUrl: "https://verify.eigencloud.xyz/app/0x898E1d5603070C7452Ee7F8CF288639A63a217cc"
  },
  negotiation: {
    appId: "0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322",
    ip: "34.58.112.209:3000",
    label: "Deal Terms",
    verifyUrl: "https://verify.eigencloud.xyz/app/0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322"
  },
  governance: {
    appId: "0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94",
    ip: "34.87.56.225:3000",
    label: "Governance Preflight",
    verifyUrl: "https://verify.eigencloud.xyz/app/0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94"
  }
};

const META = {
  code: {
    accent: "#37d67a",
    caseType: "Code Bounty",
    title: "Settle a code bounty with proof.",
    copy: "Evaluate submitted work against bounty terms inside EigenCompute, then seal the release, hold, or reject decision as a verifiable receipt.",
    labels: {
      bounty: "Task Terms",
      rubric: "Acceptance Rubric",
      artifact: "Submitted Code / Diff"
    }
  },
  research: {
    accent: "#5bb8ff",
    caseType: "Research Deliverable",
    title: "Accept research with evidence.",
    copy: "Check submitted research against the promised evidence standard, then issue a receipt another team or agent can verify.",
    labels: {
      bounty: "Research Objective",
      rubric: "Evidence Standard",
      artifact: "Submitted Brief"
    }
  },
  negotiation: {
    accent: "#f0b84a",
    caseType: "Deal Terms",
    title: "Check deal-term compliance.",
    copy: "Check required constraints before agreement and surface exceptions both counterparties can inspect in the signed receipt.",
    labels: {
      bounty: "Deal Context",
      rubric: "Required Terms",
      artifact: "Submitted Proposal"
    }
  },
  governance: {
    accent: "#b692ff",
    caseType: "Governance Preflight",
    title: "Preflight a governance vote.",
    copy: "Surface voting, treasury, and execution risk before a proposal reaches a vote, then preserve the preflight result as a verifiable receipt.",
    labels: {
      bounty: "DAO / Protocol Context",
      rubric: "Governance Risk Rubric",
      artifact: "Proposal Text"
    }
  }
};

const SETTLEMENT_LABELS = {
  "release-payment": "Release payment",
  "hold-for-revision": "Hold for revision",
  "reject-payment": "Reject payment",
  "escalate": "Escalate for appeal"
};

const PIPELINE_STEPS = [
  "Hashing input",
  "Evaluating acceptance rubric",
  "Checking evidence",
  "Sealing DecisionArtifact",
  "Preparing verification receipt"
];

const STORY_SCENES = [
  {
    id: "problem",
    short: "Problem",
    label: "Scene 1 / Problem",
    title: "A builder finished paid bounty work.",
    copy: "The sponsor wants to release payment, but a private chat or dashboard screenshot is not enough proof when money moves.",
    points: [
      "Builder or agent submits completed OAuth callback work.",
      "Sponsor needs a neutral acceptance record.",
      "Payment waits for proof the judge and receipt can be verified."
    ],
    duration: 6800
  },
  {
    id: "submission",
    short: "Submission",
    label: "Scene 2 / Submission",
    title: "The work package moves into ProofJudge.",
    copy: "Task terms, rubric, submitted diff, and submitter identity become the input package for a verifiable judging run.",
    points: [
      "Terms and submitted work are captured together.",
      "The input package can be hashed.",
      "The sponsor no longer depends on a loose claim of completion."
    ],
    duration: 6600
  },
  {
    id: "terms",
    short: "Terms",
    label: "Scene 3 / Terms",
    title: "Acceptance terms lock before judgment.",
    copy: "The rubric is explicit before funds move: state validation, token safety, tests, and documented failure modes.",
    points: [
      "Validate OAuth state parameter.",
      "Avoid logging tokens.",
      "Include tests and document failure modes."
    ],
    duration: 7000
  },
  {
    id: "compute",
    short: "EigenCompute",
    label: "Scene 4 / EigenCompute",
    title: "ProofJudge runs inside EigenCompute.",
    copy: "The judging call is tied to an app identity, so the receipt can point back to the deployed evaluator that produced it.",
    points: [
      "Runtime: EigenCompute Mainnet Alpha.",
      "App ID is carried into the receipt.",
      "The live console preserves the same judge and verify APIs."
    ],
    duration: 7200
  },
  {
    id: "receipt",
    short: "Receipt",
    label: "Scene 5 / Receipt",
    title: "A signed DecisionArtifact appears.",
    copy: "The output is not just a score. It includes decision, confidence, settlement action, hashes, app identity, and signature metadata.",
    points: [
      "Decision: pass, revise, or fail.",
      "Settlement action: release, hold, reject, or escalate.",
      "Artifact hash and signature make edits detectable."
    ],
    duration: 7300
  },
  {
    id: "verify",
    short: "Verify",
    label: "Scene 6 / Verify",
    title: "EigenVerify-style checks turn green.",
    copy: "Verification checks the body, hash, signature, deployment identity, attestation mode, and timestamp before anyone trusts the receipt.",
    points: [
      "Body integrity still matches.",
      "Signature and artifact hash verify.",
      "The deployed app identity is visible."
    ],
    duration: 6900
  },
  {
    id: "tamper",
    short: "Tamper",
    label: "Scene 7 / Tamper",
    title: "Changing the score breaks verification.",
    copy: "If someone edits the score after the receipt is sealed, the recomputed hash and signature checks fail clearly.",
    points: [
      "Original score and edited score diverge.",
      "Artifact hash mismatch is visible.",
      "Tamper failure protects the settlement record."
    ],
    duration: 7100
  },
  {
    id: "live",
    short: "Live",
    label: "Scene 8 / Live Handoff",
    title: "Now prove it live.",
    copy: "The story hands into the real ProofJudge console, loads Code Bounty, and slowly runs judge, signed receipt, verify, and tamper failure.",
    points: [
      "Live Code Bounty case loads in the console.",
      "The real /api/judge and /api/verify calls run.",
      "Tamper failure is shown in the live verifier."
    ],
    duration: 5600
  }
];

const STORY_ASSETS = {
  builder: "/assets/demo/builder.svg",
  sponsor: "/assets/demo/sponsor.svg",
  compute: "/assets/demo/compute-node.svg",
  receipt: "/assets/demo/receipt.svg",
  verifier: "/assets/demo/verifier.svg",
  tamper: "/assets/demo/tamper-fracture.svg"
};

const ENTRY_STORY_SCENES = {
  terms: "terms",
  compute: "compute",
  receipt: "receipt",
  verify: "verify",
  live: "live"
};

const STORY_OPEN_MS = 520;
const STORY_CLOSE_MS = 440;
const STORY_REVEAL_BASE_MS = 90;
const STORY_REVEAL_STEP_MS = 115;

let currentVariant = "code";
let currentView = "evaluate";
let currentArtifact = null;
let variantConfigs = {};
let guidedRunning = false;
let storyState = {
  open: false,
  index: 0,
  autoplay: false,
  timer: 0,
  variant: "code",
  liveRunning: false,
  closeTimer: 0,
  sequence: 0
};
let transitionChain = Promise.resolve();

const refs = {
  appShell: document.getElementById("app-shell"),
  consoleGrid: document.getElementById("console-grid"),
  workbench: document.querySelector(".workbench"),
  entryLayer: document.getElementById("entry-layer"),
  skipEntryBtn: document.getElementById("skip-entry-btn"),
  enterConsoleBtn: document.getElementById("enter-console-btn"),
  runGuidedBtn: document.getElementById("run-guided-btn"),
  entryVariantBtns: document.querySelectorAll("[data-entry-variant]"),
  entryStoryBtns: document.querySelectorAll("[data-entry-story]"),
  storyMode: document.getElementById("story-mode"),
  storyCloseBtn: document.getElementById("story-close-btn"),
  storyKicker: document.getElementById("story-kicker"),
  storyTitle: document.getElementById("story-title"),
  storyProgress: document.getElementById("story-progress"),
  storyStepLabel: document.getElementById("story-step-label"),
  storyHeading: document.getElementById("story-heading"),
  storyCopy: document.getElementById("story-copy"),
  storyPoints: document.getElementById("story-points"),
  storyVisual: document.getElementById("story-visual"),
  storyBackBtn: document.getElementById("story-back-btn"),
  storyNextBtn: document.getElementById("story-next-btn"),
  storyAutoplayBtn: document.getElementById("story-autoplay-btn"),
  storyRestartBtn: document.getElementById("story-restart-btn"),
  storySkipLiveBtn: document.getElementById("story-skip-live-btn"),
  liveHandoffBanner: document.getElementById("live-handoff-banner"),
  liveHandoffTitle: document.getElementById("live-handoff-title"),
  liveHandoffCopy: document.getElementById("live-handoff-copy"),
  runtimePill: document.getElementById("runtime-pill"),
  headerVerifyLink: document.getElementById("header-verify-link"),
  configuredAppId: document.getElementById("configured-app-id"),
  configuredVerifyLink: document.getElementById("configured-verify-link"),
  railVerifyLink: document.getElementById("rail-verify-link"),
  caseType: document.getElementById("case-type"),
  caseTitle: document.getElementById("case-title"),
  caseCopy: document.getElementById("case-copy"),
  settlementGate: document.getElementById("settlement-gate"),
  identityStrip: document.getElementById("identity-strip"),
  labelBounty: document.getElementById("label-bounty"),
  labelRubric: document.getElementById("label-rubric"),
  labelArtifact: document.getElementById("label-artifact"),
  form: document.getElementById("judge-form"),
  submitBtn: document.getElementById("submit-btn"),
  submitLabel: document.getElementById("submit-label"),
  loadDemoBtn: document.getElementById("load-demo-btn"),
  clearFormBtn: document.getElementById("clear-form-btn"),
  proofStepper: document.getElementById("proof-stepper"),
  evidenceGrid: document.getElementById("evidence-grid"),
  evidenceCount: document.getElementById("evidence-count"),
  reasoningList: document.getElementById("reasoning-list"),
  verifyCurrentBtn: document.getElementById("verify-current-btn"),
  verifyPasteBtn: document.getElementById("verify-paste-btn"),
  verifyJson: document.getElementById("verify-json"),
  verificationChecklist: document.getElementById("verification-checklist"),
  tamperBtn: document.getElementById("tamper-btn"),
  tamperDiff: document.getElementById("tamper-diff"),
  registryGrid: document.getElementById("registry-grid"),
  archiveTable: document.getElementById("archive-table"),
  artifactPre: document.getElementById("artifact-pre"),
  copyJsonBtn: document.getElementById("copy-json-btn"),
  guidedStatus: document.getElementById("guided-status"),
  demoAutoBtn: document.getElementById("demo-auto-btn"),
  demoResetBtn: document.getElementById("demo-reset-btn"),
  demoSkipReceiptBtn: document.getElementById("demo-skip-receipt-btn"),
  demoOpenVerifyBtn: document.getElementById("demo-open-verify-btn"),
  railVerifyBtn: document.getElementById("rail-verify-btn"),
  receiptRail: document.getElementById("receipt-rail"),
  receiptState: document.getElementById("receipt-state"),
  receiptSettlement: document.getElementById("receipt-settlement"),
  receiptDecision: document.getElementById("receipt-decision"),
  receiptScore: document.getElementById("receipt-score"),
  receiptModel: document.getElementById("receipt-model"),
  receiptAppId: document.getElementById("receipt-app-id"),
  receiptInputHash: document.getElementById("receipt-input-hash"),
  receiptArtifactHash: document.getElementById("receipt-artifact-hash"),
  receiptSignature: document.getElementById("receipt-signature"),
  toast: document.getElementById("toast")
};

document.querySelectorAll("[data-variant]").forEach((button) => {
  button.addEventListener("click", () => {
    selectVariant(button.dataset.variant, { push: true });
  });
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    clearToast();
    setView(button.dataset.view, { push: true });
  });
});

document.querySelectorAll("[data-preview-demo]").forEach((button) => {
  button.addEventListener("click", async () => {
    enterConsole();
    await selectVariant(button.dataset.previewDemo, { push: true, loadDemo: true });
    await setView("evaluate", { push: true });
    updateGuidedStatus("Preview loaded");
  });
});

document.querySelectorAll("[data-run-demo]").forEach((button) => {
  button.addEventListener("click", () => runGuidedDemo(button.dataset.runDemo));
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("//")) return;
  event.preventDefault();

  if (href === "/" || link.dataset.showEntry !== undefined) {
    showEntry({ push: true });
    return;
  }

  history.pushState(null, "", href);
  route();
});

window.addEventListener("popstate", route);

refs.skipEntryBtn?.addEventListener("click", () => enterConsole());
refs.enterConsoleBtn.addEventListener("click", () => enterConsole());
refs.runGuidedBtn.addEventListener("click", () => runGuidedDemo(currentVariant));
refs.entryVariantBtns.forEach((button) => {
  button.addEventListener("click", () => selectEntryVariant(button.dataset.entryVariant));
});
refs.entryStoryBtns.forEach((button) => {
  button.addEventListener("click", () => openStoryMode(currentVariant, { startScene: button.dataset.entryStory }));
});
refs.storyCloseBtn.addEventListener("click", () => closeStoryMode());
refs.storyBackBtn.addEventListener("click", () => previousStoryScene());
refs.storyNextBtn.addEventListener("click", () => nextStoryScene());
refs.storyAutoplayBtn.addEventListener("click", () => toggleStoryAutoplay());
refs.storyRestartBtn.addEventListener("click", () => restartStoryMode());
refs.storySkipLiveBtn.addEventListener("click", () => startLiveHandoff({ source: "skip" }));
refs.storyProgress.addEventListener("click", (event) => {
  const button = event.target.closest("[data-story-jump]");
  if (!button) return;
  goToStoryScene(Number(button.dataset.storyJump), Number(button.dataset.storyJump) >= storyState.index ? "forward" : "back");
});
refs.loadDemoBtn.addEventListener("click", () => loadDemo(currentVariant));
refs.clearFormBtn.addEventListener("click", () => {
  refs.form.reset();
  resetReceipt();
});
refs.demoAutoBtn.addEventListener("click", () => runGuidedDemo(currentVariant));
refs.demoResetBtn.addEventListener("click", () => resetGuidedDemo());
refs.demoSkipReceiptBtn.addEventListener("click", async () => {
  enterConsole();
  await loadDemo(currentVariant);
  await generateReceipt({ guided: true });
});
refs.demoOpenVerifyBtn.addEventListener("click", () => {
  const href = refs.railVerifyLink.href;
  if (href) window.open(href, "_blank", "noopener");
});

refs.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await generateReceipt();
});

document.addEventListener("keydown", (event) => {
  if (storyState.open) {
    handleStoryKeydown(event);
    return;
  }

  if (!guidedRunning && event.key !== "Escape") return;
  if (event.key === "r" || event.key === "R") resetGuidedDemo();
  if (event.key === "v" || event.key === "V") verifyCurrentReceipt();
  if (event.key === "t" || event.key === "T") refs.tamperBtn.click();
  if (event.key === "e" || event.key === "E") refs.demoOpenVerifyBtn.click();
  if (event.key === "Escape") {
    guidedRunning = false;
    updateGuidedStatus("Exited");
    clearSpotlights();
  }
});

async function generateReceipt(options = {}) {
  const body = {
    variant: currentVariant,
    bountyDescription: refs.form.elements.bountyDescription.value,
    rubric: refs.form.elements.rubric.value,
    submittedArtifact: refs.form.elements.submittedArtifact.value,
    submitter: refs.form.elements.submitter.value || undefined
  };

  setLoading(true);
  resetVerification();

  try {
    const judgePromise = apiFetch("/api/judge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const [data] = await Promise.all([judgePromise, runPipeline()]);
    renderArtifact(data.artifact, { save: true });
    showToast("Signed DecisionArtifact generated.");
  } catch (error) {
    showToast(`Judging failed: ${error.message}`, "error");
    resetPipeline();
  } finally {
    setLoading(false);
  }
}

refs.verifyCurrentBtn.addEventListener("click", () => verifyCurrentReceipt());
refs.railVerifyBtn.addEventListener("click", () => verifyCurrentReceipt());

refs.verifyPasteBtn.addEventListener("click", async () => {
  try {
    const artifact = JSON.parse(refs.verifyJson.value);
    await verifyArtifact(artifact, { source: "pasted" });
  } catch (error) {
    refs.verificationChecklist.innerHTML = failRow("Pasted JSON", `Unable to parse or verify JSON: ${error.message}`);
  }
});

refs.tamperBtn.addEventListener("click", () => {
  tamperCurrentReceipt();
});

refs.copyJsonBtn.addEventListener("click", async () => {
  if (!currentArtifact) return;
  const json = JSON.stringify(currentArtifact, null, 2);
  try {
    await navigator.clipboard.writeText(json);
    showToast("Current receipt JSON copied.");
  } catch {
    refs.verifyJson.value = json;
    setView("verify", { push: true });
    showToast("Clipboard unavailable. JSON placed in verifier.");
  }
});

refs.archiveTable.addEventListener("click", (event) => {
  const loadButton = event.target.closest("[data-load-receipt]");
  if (!loadButton) return;
  const archive = readArchive();
  const record = archive[Number(loadButton.dataset.loadReceipt)];
  if (!record?.artifact) return;
  renderArtifact(record.artifact, { save: false });
  setView("receipts", { push: true });
});

async function init() {
  renderRegistry();
  renderArchive();
  resetReceipt();

  try {
    const data = await apiFetch("/api/variants");
    variantConfigs = Object.fromEntries(data.variants.map((variant) => [variant.id, variant]));
  } catch {
    variantConfigs = {};
  }

  await route({ transition: false });
  await loadDemo(currentVariant, { transition: false });
  pingRuntime();
  if (window.location.pathname.startsWith("/agents/")) {
    refs.entryLayer.hidden = true;
  }
}

function enterConsole(options = {}) {
  closeStoryMode({ silent: true });
  if (options.push !== false && !window.location.pathname.startsWith("/agents/")) {
    history.pushState(null, "", `/agents/${currentVariant}#${currentView}`);
  }
  if (refs.entryLayer.hidden) return;
  window.scrollTo({ top: 0, behavior: "auto" });
  refs.entryLayer.classList.add("leaving");
  sessionStorage.setItem("proofjudge.entry.dismissed", "true");
  window.setTimeout(() => {
    refs.entryLayer.hidden = true;
  }, prefersReducedMotion() ? 1 : 520);
}

function showEntry(options = {}) {
  guidedRunning = false;
  closeStoryMode({ silent: true });
  clearSpotlights();
  clearToast();
  hideLiveHandoffBanner();
  sessionStorage.removeItem("proofjudge.entry.dismissed");

  if (options.push && (window.location.pathname !== "/" || window.location.search || window.location.hash)) {
    history.pushState(null, "", "/");
  }

  refs.entryLayer.hidden = false;
  refs.entryLayer.classList.remove("leaving");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function runGuidedDemo(variant = currentVariant) {
  openStoryMode(variant);
}

function openStoryMode(variant = "code", options = {}) {
  if (storyState.liveRunning) return;
  window.clearTimeout(storyState.closeTimer);
  storyState.open = true;
  storyState.variant = variant;
  storyState.index = storySceneIndex(options.startScene);
  storyState.autoplay = false;
  window.clearTimeout(storyState.timer);
  refs.storyMode.hidden = false;
  refs.storyMode.classList.remove("closing");
  refs.entryLayer.classList.add("story-launching");
  document.body.classList.add("story-open");
  refs.storyKicker.textContent = "Code Bounty Escrow";
  renderStoryScene({ direction: "forward" });
  window.requestAnimationFrame(() => {
    refs.storyMode.classList.add("active");
  });
}

function storySceneIndex(sceneId) {
  if (!sceneId) return 0;
  const resolvedId = ENTRY_STORY_SCENES[sceneId] ?? sceneId;
  const index = STORY_SCENES.findIndex((scene) => scene.id === resolvedId);
  return index >= 0 ? index : 0;
}

function selectEntryVariant(variant) {
  if (!META[variant]) return;
  selectVariant(variant, { push: false, transition: false });
}

function updateEntryVariantSelection(variant) {
  refs.entryVariantBtns.forEach((button) => {
    const active = button.dataset.entryVariant === variant;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".entry-receipt-card").forEach((card, index) => {
    const order = ["code", "research", "negotiation", "governance"];
    const active = order[index] === variant;
    card.classList.toggle("selected", active);
  });
}

function closeStoryMode(options = {}) {
  if (!storyState.open && refs.storyMode.hidden) return;
  pauseStoryAutoplay();
  storyState.open = false;
  refs.storyMode.classList.remove("active", "is-sequencing");
  refs.storyMode.classList.add("closing");
  window.clearTimeout(storyState.closeTimer);
  const finish = () => {
    refs.storyMode.hidden = true;
    refs.storyMode.classList.remove("closing");
    refs.entryLayer.classList.remove("story-launching");
  };
  if (options.instant || prefersReducedMotion()) {
    finish();
  } else {
    storyState.closeTimer = window.setTimeout(finish, STORY_CLOSE_MS);
  }
  document.body.classList.remove("story-open");
  if (!options.silent) {
    refs.runGuidedBtn?.focus({ preventScroll: true });
  }
}

function renderStoryScene(options = {}) {
  const scene = STORY_SCENES[storyState.index] ?? STORY_SCENES[0];
  storyState.sequence += 1;
  refs.storyMode.dataset.scene = scene.id;
  refs.storyMode.dataset.direction = options.direction ?? "forward";
  refs.storyMode.dataset.sequence = String(storyState.sequence);
  refs.storyTitle.textContent = scene.title;
  refs.storyStepLabel.textContent = scene.label;
  refs.storyHeading.textContent = scene.title;
  refs.storyCopy.textContent = scene.copy;
  refs.storyPoints.innerHTML = scene.points.map((point) => `<span>${esc(point)}</span>`).join("");
  refs.storyVisual.innerHTML = renderStoryVisual(scene);
  stampStoryRevealSequence();
  refs.storyBackBtn.disabled = storyState.index === 0 || storyState.liveRunning;
  refs.storyNextBtn.disabled = storyState.liveRunning;
  refs.storyNextBtn.textContent = storyState.index === STORY_SCENES.length - 1 ? "Now Prove It Live" : "Next";
  refs.storyAutoplayBtn.textContent = storyState.autoplay ? "Pause" : "Auto-play";
  refs.storyAutoplayBtn.disabled = storyState.liveRunning;
  refs.storyRestartBtn.disabled = storyState.liveRunning;
  refs.storySkipLiveBtn.disabled = storyState.liveRunning;
  refs.storyProgress.innerHTML = STORY_SCENES.map((item, index) => `
    <button type="button" class="${index === storyState.index ? "active" : ""}" data-story-jump="${index}" ${storyState.liveRunning ? "disabled" : ""}>
      <span>${index + 1}</span>
      <small>${esc(item.short)}</small>
    </button>
  `).join("");

  if (storyState.autoplay) {
    scheduleStoryAutoplay(scene);
  }
}

function goToStoryScene(index, direction = "forward") {
  if (storyState.liveRunning) return;
  const nextIndex = Math.max(0, Math.min(STORY_SCENES.length - 1, index));
  if (nextIndex === storyState.index && storyState.open) {
    renderStoryScene({ direction });
    return;
  }
  pauseStoryAutoplay();
  storyState.index = nextIndex;
  renderStoryScene({ direction });
}

function stampStoryRevealSequence() {
  const fixedReveals = [
    [refs.storyStepLabel, 0, "meta"],
    [refs.storyHeading, 1, "headline"],
    [refs.storyCopy, 2, "copy"],
    [refs.storyVisual, 3, "panel"]
  ];

  fixedReveals.forEach(([element, order, type]) => setStoryReveal(element, order, type));
  refs.storyPoints.querySelectorAll("span").forEach((point, index) => {
    setStoryReveal(point, index + 4, "point");
  });

  refs.storyMode.classList.remove("is-sequencing");
  void refs.storyMode.offsetWidth;
  refs.storyMode.classList.add("is-sequencing");
}

function setStoryReveal(element, order, type = "item") {
  if (!element) return;
  element.dataset.reveal = type;
  element.style.setProperty("--reveal-delay", `${storyRevealDelay(order)}ms`);
}

function storyRevealDelay(order) {
  if (prefersReducedMotion()) return 0;
  return STORY_REVEAL_BASE_MS + order * STORY_REVEAL_STEP_MS;
}

function storyRevealAttr(order, type = "item", extraStyle = "") {
  const style = [`--reveal-delay:${storyRevealDelay(order)}ms`];
  if (extraStyle) style.push(extraStyle);
  return `data-reveal="${type}" style="${style.join(";")}"`;
}

function renderStoryVisual(scene) {
  const appId = shortAddress(APP_REGISTRY.code.appId);
  if (scene.id === "problem") {
    return `
      <div class="story-stage story-stage-problem">
        <div class="story-actor" ${storyRevealAttr(4, "actor-left")}>
          <img src="${STORY_ASSETS.builder}" alt="" />
          <strong>Builder / agent</strong>
          <span>Work complete</span>
        </div>
        <div class="story-payment-line" ${storyRevealAttr(5, "bridge")}>
          <span>Payment waits</span>
          <i></i>
          <small>proof required</small>
        </div>
        <div class="story-actor sponsor" ${storyRevealAttr(6, "actor-right")}>
          <img src="${STORY_ASSETS.sponsor}" alt="" />
          <strong>Sponsor</strong>
          <span>Needs acceptance proof</span>
        </div>
      </div>
    `;
  }

  if (scene.id === "submission") {
    return `
      <div class="story-stage story-stage-submission">
        <div class="story-actor compact" ${storyRevealAttr(4, "sender")}>
          <img src="${STORY_ASSETS.builder}" alt="" />
          <strong>Builder</strong>
        </div>
        <div class="story-work-package" ${storyRevealAttr(5, "package")}>
          <span ${storyRevealAttr(6, "package-item")}>Code diff</span>
          <span ${storyRevealAttr(7, "package-item")}>Task terms</span>
          <span ${storyRevealAttr(8, "package-item")}>Rubric</span>
          <span ${storyRevealAttr(9, "package-item")}>Submitter</span>
        </div>
        <div class="story-compute-card" ${storyRevealAttr(10, "receiver")}>
          <img src="${STORY_ASSETS.compute}" alt="" />
          <strong>ProofJudge</strong>
          <small>Input package accepted</small>
        </div>
      </div>
    `;
  }

  if (scene.id === "terms") {
    return `
      <div class="story-stage story-stage-terms">
        ${["State validation", "Token safety", "Unit tests", "Failure docs"].map((term, index) => `
          <div class="story-term-card" ${storyRevealAttr(index + 4, "lock-card", `--term-delay:${index * 110}ms`)}>
            <span>LOCKED</span>
            <strong>${term}</strong>
            <small>Acceptance term ${index + 1}</small>
          </div>
        `).join("")}
      </div>
    `;
  }

  if (scene.id === "compute") {
    return `
      <div class="story-stage story-stage-compute">
        <div class="story-compute-core" ${storyRevealAttr(4, "compute-core")}>
          <img src="${STORY_ASSETS.compute}" alt="" />
          <strong>EigenCompute Judge</strong>
          <span>App ID ${appId}</span>
        </div>
        <div class="story-app-facts" ${storyRevealAttr(5, "fact-stack")}>
          <span ${storyRevealAttr(6, "fact")}>Runtime identity</span>
          <span ${storyRevealAttr(7, "fact")}>Receipt signer</span>
          <span ${storyRevealAttr(8, "fact")}>Attestation mode</span>
        </div>
      </div>
    `;
  }

  if (scene.id === "receipt") {
    return `
      <div class="story-stage story-stage-receipt">
        <div class="story-receipt-card" ${storyRevealAttr(4, "receipt-shell")}>
          <img src="${STORY_ASSETS.receipt}" alt="" ${storyRevealAttr(5, "seal-icon")} />
          <span ${storyRevealAttr(6, "receipt-label")}>DecisionArtifact</span>
          <strong ${storyRevealAttr(7, "stamp")}>PASS</strong>
          <dl>
            <div ${storyRevealAttr(8, "receipt-row")}><dt>Score</dt><dd>92 / 100</dd></div>
            <div ${storyRevealAttr(9, "receipt-row")}><dt>Settlement</dt><dd>Release payment</dd></div>
            <div ${storyRevealAttr(10, "receipt-row")}><dt>App ID</dt><dd>${appId}</dd></div>
            <div ${storyRevealAttr(11, "receipt-row")}><dt>Hash</dt><dd>0x8f3a...c91e</dd></div>
            <div ${storyRevealAttr(12, "receipt-row")}><dt>Signature</dt><dd>HMAC-SHA256</dd></div>
          </dl>
        </div>
      </div>
    `;
  }

  if (scene.id === "verify") {
    return `
      <div class="story-stage story-stage-verify">
        <div class="story-verify-panel" ${storyRevealAttr(4, "verify-panel")}>
          <img src="${STORY_ASSETS.verifier}" alt="" ${storyRevealAttr(5, "seal-icon")} />
          <strong ${storyRevealAttr(6, "receipt-label")}>EigenVerify checks</strong>
          ${["Body integrity", "Artifact hash", "Signature", "App identity", "Timestamp"].map((check, index) => `
            <div class="story-check ok" ${storyRevealAttr(index + 7, "check")}><span>PASS</span><small>${check}</small></div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (scene.id === "tamper") {
    return `
      <div class="story-stage story-stage-tamper">
        <div class="story-tamper-card original" ${storyRevealAttr(4, "tamper-left")}>
          <img src="${STORY_ASSETS.receipt}" alt="" />
          <span>Original score</span>
          <strong>92</strong>
        </div>
        <div class="story-fracture" ${storyRevealAttr(5, "fracture")}>
          <img src="${STORY_ASSETS.tamper}" alt="" />
          <strong>FAIL</strong>
          <small>Hash mismatch</small>
        </div>
        <div class="story-tamper-card edited" ${storyRevealAttr(6, "tamper-right")}>
          <img src="${STORY_ASSETS.receipt}" alt="" />
          <span>Edited score</span>
          <strong>99</strong>
        </div>
      </div>
    `;
  }

  return `
    <div class="story-stage story-stage-live">
      <div class="story-live-console" ${storyRevealAttr(4, "console")}>
        <span ${storyRevealAttr(5, "console-label")}>Live console</span>
        <strong ${storyRevealAttr(6, "console-title")}>Code Bounty Settlement</strong>
        <ol>
          <li ${storyRevealAttr(7, "console-step")}>Load demo case</li>
          <li ${storyRevealAttr(8, "console-step")}>Generate signed receipt</li>
          <li ${storyRevealAttr(9, "console-step")}>Verify receipt</li>
          <li ${storyRevealAttr(10, "console-step")}>Tamper score and fail verification</li>
        </ol>
      </div>
    </div>
  `;
}

function nextStoryScene() {
  if (storyState.index >= STORY_SCENES.length - 1) {
    pauseStoryAutoplay();
    startLiveHandoff({ source: "next" });
    return;
  }
  goToStoryScene(storyState.index + 1, "forward");
}

function previousStoryScene() {
  goToStoryScene(storyState.index - 1, "back");
}

function restartStoryMode() {
  goToStoryScene(0, "back");
}

function toggleStoryAutoplay() {
  if (storyState.autoplay) {
    pauseStoryAutoplay();
    renderStoryScene({ direction: "forward" });
    return;
  }

  storyState.autoplay = true;
  renderStoryScene({ direction: "forward" });
}

function pauseStoryAutoplay() {
  storyState.autoplay = false;
  window.clearTimeout(storyState.timer);
}

function scheduleStoryAutoplay(scene) {
  window.clearTimeout(storyState.timer);
  storyState.timer = window.setTimeout(() => {
    if (!storyState.open || !storyState.autoplay) return;
    if (storyState.index >= STORY_SCENES.length - 1) {
      startLiveHandoff({ source: "autoplay" });
      return;
    }
    storyState.index += 1;
    renderStoryScene({ direction: "forward" });
  }, prefersReducedMotion() ? Math.min(scene.duration, 900) : scene.duration);
}

function handleStoryKeydown(event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    nextStoryScene();
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    previousStoryScene();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeStoryMode();
  }
}

async function startLiveHandoff(options = {}) {
  if (storyState.liveRunning) return;
  storyState.liveRunning = true;
  guidedRunning = true;
  pauseStoryAutoplay();
  renderStoryScene();
  showLiveHandoffBanner("Preparing live console", "Loading the Code Bounty scenario before the real judge call.");
  closeStoryMode({ silent: true });
  currentView = "evaluate";
  enterConsole({ push: false });

  try {
    await selectVariant("code", { push: true, loadDemo: true });
    await setView("evaluate", { push: true });
    await loadDemo("code", { transition: false });
    updateGuidedStatus(options.source === "skip" ? "Skipped to live console" : "Live handoff running");

    await wait(prefersReducedMotion() ? 30 : 1100);
    showLiveHandoffBanner("Live judge running", "Calling /api/judge to create the signed DecisionArtifact.");
    await generateReceipt({ guided: true });

    await wait(prefersReducedMotion() ? 30 : 1400);
    showLiveHandoffBanner("Signed receipt generated", "Opening verifier and calling /api/verify against the live artifact.");
    await verifyCurrentReceipt();

    await wait(prefersReducedMotion() ? 30 : 1500);
    showLiveHandoffBanner("Tamper test running", "Editing the score after sealing to prove verification fails.");
    await tamperCurrentReceipt({ guided: true });

    showLiveHandoffBanner("Live proof complete", "Judge, signed receipt, verification, and tamper failure all ran in the real console.", "done");
    updateGuidedStatus("Live proof complete");
  } catch (error) {
    showLiveHandoffBanner("Live handoff failed", error.message, "error");
    showToast(`Guided demo failed: ${error.message}`, "error");
    updateGuidedStatus("Failed");
  } finally {
    guidedRunning = false;
    storyState.liveRunning = false;
    clearSpotlights();
  }
}

function resetGuidedDemo() {
  guidedRunning = false;
  clearSpotlights();
  hideLiveHandoffBanner();
  resetReceipt();
  resetVerification();
  loadDemo(currentVariant, { transition: false });
  setView("evaluate", { push: true });
  updateGuidedStatus("Reset");
}

async function spotlightField(name, status) {
  updateGuidedStatus(status);
  clearSpotlights();
  const control = refs.form.elements[name];
  const field = control?.closest(".field");
  field?.classList.add("spotlight");
  control?.focus({ preventScroll: false });
  await wait(prefersReducedMotion() ? 20 : 520);
}

function clearSpotlights() {
  document.querySelectorAll(".spotlight").forEach((element) => element.classList.remove("spotlight"));
}

function showLiveHandoffBanner(title, copy, tone = "active") {
  refs.liveHandoffBanner.hidden = false;
  refs.liveHandoffBanner.className = `live-handoff-banner ${tone}`;
  refs.liveHandoffTitle.textContent = title;
  refs.liveHandoffCopy.textContent = copy;
}

function hideLiveHandoffBanner() {
  refs.liveHandoffBanner.hidden = true;
  refs.liveHandoffBanner.className = "live-handoff-banner";
}

function updateGuidedStatus(status) {
  refs.guidedStatus.textContent = status;
}

function transitionSurface(update, options = {}) {
  const scope = options.scope ?? refs.workbench ?? refs.consoleGrid ?? refs.appShell;
  const run = async () => {
    if (options.instant || prefersReducedMotion() || !scope) {
      await update();
      return;
    }

    refs.appShell.dataset.motion = "settling";
    await update();
    scope.classList.remove("motion-enter");
    scope.getBoundingClientRect();
    scope.classList.add("motion-enter");
    try {
      await wait(180);
    } finally {
      scope.classList.remove("motion-enter");
      delete refs.appShell.dataset.motion;
    }
  };

  transitionChain = transitionChain.catch(() => {}).then(run);
  return transitionChain;
}

function route(options = {}) {
  syncEntryLayerWithRoute();
  const match = window.location.pathname.match(/^\/agents\/(\w+)$/);
  const variant = match && META[match[1]] ? match[1] : "code";
  const hashView = window.location.hash.replace("#", "");
  const view = document.querySelector(`[data-view="${hashView}"]`) ? hashView : currentView;

  const update = async () => {
    await selectVariant(variant, {
      push: false,
      preserveArtifact: variant === currentVariant,
      transition: false
    });
    await setView(view, { push: false, transition: false });
  };

  return options.transition === false ? update() : transitionSurface(update);
}

function syncEntryLayerWithRoute() {
  if (window.location.pathname.startsWith("/agents/")) {
    sessionStorage.setItem("proofjudge.entry.dismissed", "true");
    refs.entryLayer.hidden = true;
    refs.entryLayer.classList.remove("leaving");
    return;
  }

  if (window.location.pathname === "/") {
    refs.entryLayer.hidden = false;
    refs.entryLayer.classList.remove("leaving");
  }
}

async function selectVariant(variant, options = {}) {
  if (!META[variant]) return;
  const changed = currentVariant !== variant;
  currentVariant = variant;
  updateEntryVariantSelection(variant);
  const meta = META[variant];
  const app = APP_REGISTRY[variant];
  let demoData = null;

  if ((options.loadDemo === true || changed) && !options.preserveArtifact) {
    try {
      demoData = await apiFetch(`/api/demo/${variant}`);
    } catch (error) {
      showToast(`Demo case failed to load: ${error.message}`, "error");
    }
  }

  const update = () => {
    if (currentVariant !== variant) return;

    document.documentElement.style.setProperty("--accent", meta.accent);
    document.querySelectorAll(".case-card").forEach((button) => {
      button.classList.toggle("active", button.dataset.variant === variant);
    });
    document.querySelectorAll(".queue-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.demoCard === variant);
    });

    refs.caseType.textContent = meta.caseType;
    refs.caseTitle.textContent = meta.title;
    refs.caseCopy.textContent = meta.copy;
    refs.labelBounty.textContent = meta.labels.bounty;
    refs.labelRubric.textContent = meta.labels.rubric;
    refs.labelArtifact.textContent = meta.labels.artifact;
    refs.configuredAppId.textContent = shortAddress(app.appId);
    refs.configuredVerifyLink.href = app.verifyUrl;
    refs.headerVerifyLink.href = app.verifyUrl;
    refs.railVerifyLink.href = app.verifyUrl;

    renderIdentityStrip();
    renderRegistry();

    if (changed && !options.preserveArtifact) {
      currentArtifact = null;
      refs.form.reset();
      resetReceipt();
      resetVerification();
    }

    if (demoData) {
      applyDemo(demoData);
    }
  };

  if (options.push) {
    history.pushState(null, "", `/agents/${variant}#${currentView}`);
  }

  return options.transition === false ? Promise.resolve(update()) : transitionSurface(update);
}

function setView(view, options = {}) {
  if (!document.querySelector(`[data-view="${view}"]`)) return;
  currentView = view;
  const update = () => {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === view);
    });
    document.querySelectorAll("[data-view-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.viewPanel === view);
    });
  };

  if (options.push) {
    history.replaceState(null, "", `/agents/${currentVariant}#${view}`);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  return options.transition === false ? Promise.resolve(update()) : transitionSurface(update);
}

async function loadDemo(variant, options = {}) {
  try {
    const data = await apiFetch(`/api/demo/${variant}`);
    return transitionSurface(() => applyDemo(data), { instant: options.transition === false });
  } catch (error) {
    showToast(`Demo case failed to load: ${error.message}`, "error");
  }
}

function applyDemo(data) {
  refs.form.elements.bountyDescription.value = data.bountyDescription ?? "";
  refs.form.elements.rubric.value = data.rubric ?? "";
  refs.form.elements.submittedArtifact.value = data.submittedArtifact ?? "";
  refs.form.elements.submitter.value = data.submitter ?? "";
}

async function pingRuntime() {
  try {
    const health = await apiFetch("/healthz");
    refs.runtimePill.textContent = health.ok ? "Runtime online" : "Runtime status unknown";
  } catch {
    refs.runtimePill.textContent = "Runtime offline";
  }
}

function setLoading(on) {
  refs.submitBtn.disabled = on;
  refs.submitBtn.classList.toggle("loading", on);
  refs.submitLabel.textContent = on ? "Sealing Receipt" : "Generate Signed Verdict";
}

async function runPipeline() {
  const delay = prefersReducedMotion() ? 20 : 180;
  resetPipeline();
  for (let index = 0; index < PIPELINE_STEPS.length; index += 1) {
    setPipelineState(index, "active");
    await wait(delay);
    setPipelineState(index, "done");
  }
}

function resetPipeline() {
  refs.proofStepper.querySelectorAll(".proof-step").forEach((step) => {
    step.classList.remove("active", "done");
  });
}

function setPipelineState(index, state) {
  const step = refs.proofStepper.querySelector(`[data-step="${index}"]`);
  if (!step) return;
  step.classList.remove("active", "done");
  step.classList.add(state);
}

function renderArtifact(artifact, options = {}) {
  currentArtifact = artifact;
  const settlement = artifact.settlementRecommendation;
  const settlementLabel = SETTLEMENT_LABELS[settlement.action] ?? settlement.action;
  const appId = artifact.deploymentIdentity?.appId || APP_REGISTRY[currentVariant].appId;
  const verifyUrl = eigenVerifyUrl(appId, currentVariant);

  refs.receiptState.textContent = "Sealed";
  refs.receiptState.className = "sealed";
  refs.appShell.dataset.receipt = "sealed";
  refs.receiptRail.dataset.state = "sealed";
  refs.receiptSettlement.className = `receipt-settlement ${artifact.decision}`;
  refs.receiptSettlement.innerHTML = `
    <span>Settlement Action</span>
    <strong>${esc(settlementLabel)}</strong>
    <small>${esc(settlement.note)}</small>
  `;
  refs.receiptDecision.textContent = artifact.decision.toUpperCase();
  refs.receiptDecision.className = `decision-text ${artifact.decision}`;
  refs.receiptScore.textContent = `${artifact.score} / 100 (${artifact.confidence}% confidence)`;
  refs.receiptModel.textContent = `${artifact.modelMetadata.mode} / ${artifact.modelMetadata.provider}`;
  refs.receiptAppId.textContent = shortAddress(appId);
  refs.receiptInputHash.textContent = shortHash(artifact.submittedArtifactHash);
  refs.receiptArtifactHash.textContent = shortHash(artifact.decisionArtifactHash);
  refs.receiptSignature.textContent = `${artifact.signature.algorithm} ${shortHash(artifact.signature.value)}`;
  refs.railVerifyBtn.disabled = false;
  refs.railVerifyLink.href = verifyUrl;
  refs.verifyCurrentBtn.disabled = false;
  refs.tamperBtn.disabled = false;
  refs.copyJsonBtn.disabled = false;

  refs.settlementGate.className = `settlement-gate ${artifact.decision}`;
  refs.settlementGate.innerHTML = `
    <span class="gate-label">Decision Receipt</span>
    <strong>Verdict sealed</strong>
    <small>Settlement: ${esc(settlementLabel)}. ${esc(settlement.note)}</small>
    <div class="gate-checks">
      <span>Hash match</span>
      <span>Signature valid</span>
      <span>Judge identity confirmed</span>
    </div>
  `;

  refs.evidenceCount.textContent = `${artifact.evidenceChecked.length} checks`;
  refs.evidenceGrid.innerHTML = artifact.evidenceChecked.map((item, index) => `
    <div class="evidence-row" style="--row-delay:${index * 35}ms">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${esc(normalizeEvidenceLabel(item))}</strong>
      <small>Checked</small>
    </div>
  `).join("");

  refs.reasoningList.innerHTML = artifact.reasoning.map((item) => `<li>${esc(item)}</li>`).join("");
  refs.artifactPre.textContent = JSON.stringify(artifact, null, 2);
  refs.verifyJson.value = JSON.stringify(artifact, null, 2);
  refs.tamperDiff.hidden = true;
  renderIdentityStrip(artifact);

  if (options.save) {
    saveArchive(artifact);
  }
  renderArchive();
}

function resetReceipt() {
  currentArtifact = null;
  refs.appShell.dataset.receipt = "pending";
  refs.receiptRail.dataset.state = "pending";
  refs.receiptState.textContent = "Pending";
  refs.receiptState.className = "";
  refs.receiptSettlement.className = "receipt-settlement";
  refs.receiptSettlement.innerHTML = `
    <span>Settlement Action</span>
    <strong>Awaiting verdict</strong>
    <small>No receipt generated.</small>
  `;
  refs.receiptDecision.textContent = "-";
  refs.receiptDecision.className = "";
  refs.receiptScore.textContent = "-";
  refs.receiptModel.textContent = "-";
  refs.receiptAppId.textContent = "-";
  refs.receiptInputHash.textContent = "-";
  refs.receiptArtifactHash.textContent = "-";
  refs.receiptSignature.textContent = "-";
  refs.railVerifyBtn.disabled = true;
  refs.verifyCurrentBtn.disabled = true;
  refs.tamperBtn.disabled = true;
  refs.copyJsonBtn.disabled = true;
  refs.artifactPre.textContent = "{}";
  refs.verifyJson.value = "";
  refs.evidenceCount.textContent = "No receipt yet";
  refs.evidenceGrid.innerHTML = `<div class="empty-state">Evidence rows appear after the judge evaluates task terms, rubric, and submitted work.</div>`;
  refs.reasoningList.innerHTML = "<li>Generate a verdict to inspect the signed reasoning trace.</li>";
  refs.settlementGate.className = "settlement-gate";
  refs.settlementGate.innerHTML = `
    <span class="gate-label">Decision Receipt</span>
    <strong>Awaiting verdict</strong>
    <small>Input hash, evidence check, signature, and settlement action are pending.</small>
    <div class="gate-checks pending">
      <span>Input hash pending</span>
      <span>Evidence review pending</span>
      <span>Signature pending</span>
    </div>
  `;
  resetPipeline();
}

async function verifyCurrentReceipt() {
  if (!currentArtifact) return;
  await verifyArtifact(currentArtifact, { source: "current" });
  await setView("verify", { push: true });
}

async function verifyArtifact(artifact, options = {}) {
  refs.verificationChecklist.innerHTML = `<div class="empty-state">Checking receipt...</div>`;
  const data = await apiFetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artifact })
  });
  renderVerification(data.verification, artifact);
  if (options.source === "current") {
    showToast(data.verification.ok ? "Receipt verified." : "Receipt failed verification.", data.verification.ok ? "ok" : "error");
  }
  return data.verification;
}

function renderVerification(verification, artifact) {
  const timestampOk = Boolean(artifact?.timestamp && !Number.isNaN(Date.parse(artifact.timestamp)));
  const rows = [
    ...verification.checks,
    {
      label: "Timestamp",
      ok: timestampOk,
      detail: timestampOk ? `Present: ${artifact.timestamp}` : "Timestamp is missing or invalid."
    }
  ];
  refs.verificationChecklist.innerHTML = `
    <div class="verification-summary ${verification.ok ? "ok" : "fail"}">
      <strong>${verification.ok ? "Verified" : "Verification failed"}</strong>
      <span>${esc(verification.message)}</span>
    </div>
    ${rows.map((check, index) => {
      const state = verificationRowState(check);
      return `
      <div class="verify-row ${state}" style="--row-delay:${index * 45}ms">
        <span>${state === "ok" ? "PASS" : state === "warn" ? "WARN" : "FAIL"}</span>
        <strong>${esc(check.label)}</strong>
        <small>${esc(check.detail)}</small>
      </div>
    `;
    }).join("")}
  `;
}

function verificationRowState(check) {
  if (check.ok) return "ok";
  return check.label === "Attestation status" ? "warn" : "fail";
}

async function tamperCurrentReceipt() {
  if (!currentArtifact) return;
  const tampered = JSON.parse(JSON.stringify(currentArtifact));
  const originalScore = tampered.score;
  tampered.score = originalScore < 100 ? originalScore + 1 : 0;

  try {
    const data = await apiFetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artifact: tampered })
    });
    renderVerification(data.verification, tampered);
    renderTamperDiff(currentArtifact, tampered, data.verification);
    showToast("Tamper detected. Receipt no longer verifies.", "error");
    await setView("verify", { push: true });
    return data.verification;
  } catch (error) {
    refs.tamperDiff.hidden = false;
    refs.tamperDiff.innerHTML = failRow("Tamper test", error.message);
    throw error;
  }
}

function renderTamperDiff(original, tampered, verification) {
  const hashCheck = verification.checks.find((check) => check.label === "Decision artifact hash");
  const signatureCheck = verification.checks.find((check) => check.label === "Signature");
  refs.tamperDiff.hidden = false;
  refs.tamperDiff.innerHTML = `
    <div class="section-title">
      <span>Tamper Detected</span>
      <small>Score changed after sealing</small>
    </div>
    <div class="diff-grid">
      <div>
        <span>Original score</span>
        <strong>${original.score} / 100</strong>
      </div>
      <div>
        <span>Tampered score</span>
        <strong>${tampered.score} / 100</strong>
      </div>
      <div>
        <span>Embedded hash</span>
        <strong>${shortHash(original.decisionArtifactHash)}</strong>
      </div>
      <div>
        <span>Recomputed hash</span>
        <strong>${shortHash(verification.recomputedDecisionArtifactHash)}</strong>
      </div>
      <div>
        <span>Hash check</span>
        <strong>${hashCheck?.ok ? "MATCH" : "MISMATCH"}</strong>
      </div>
      <div>
        <span>Signature</span>
        <strong>${signatureCheck?.ok ? "VALID" : "INVALID"}</strong>
      </div>
    </div>
  `;
}

function resetVerification() {
  refs.verificationChecklist.innerHTML = `<div class="empty-state">Verification checks appear here.</div>`;
  refs.tamperDiff.hidden = true;
  refs.tamperDiff.innerHTML = "";
}

function renderIdentityStrip(artifact = currentArtifact) {
  const app = APP_REGISTRY[currentVariant];
  const runtimeAppId = artifact?.deploymentIdentity?.appId;
  const attestation = artifact?.deploymentIdentity?.attestation?.mode || "not-yet-generated";
  refs.identityStrip.innerHTML = `
    <div>
      <span>Runtime</span>
      <strong>EigenCompute Mainnet Alpha</strong>
    </div>
    <div>
      <span>Configured App ID</span>
      <strong>${shortAddress(app.appId)}</strong>
    </div>
    <div>
      <span>Receipt Signer</span>
      <strong>${runtimeAppId ? shortAddress(runtimeAppId) : "Awaiting receipt"}</strong>
    </div>
    <div>
      <span>Attestation Mode</span>
      <strong>${attestation}</strong>
    </div>
  `;
}

function renderRegistry() {
  refs.registryGrid.innerHTML = Object.entries(APP_REGISTRY).map(([variant, app]) => `
    <article class="registry-card ${variant === currentVariant ? "active" : ""}">
      <span>${esc(app.label)}</span>
      <strong>${shortAddress(app.appId)}</strong>
      <small>${esc(app.ip)}</small>
      <a href="${app.verifyUrl}" target="_blank" rel="noopener">Open EigenVerify</a>
    </article>
  `).join("");
}

function renderArchive() {
  const archive = readArchive();
  if (archive.length === 0) {
    refs.archiveTable.innerHTML = `<div class="empty-state">No receipts generated in this browser yet.</div>`;
    return;
  }
  refs.archiveTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Case</th>
          <th>Decision</th>
          <th>Settlement</th>
          <th>Hash</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${archive.map((record, index) => {
          const artifact = record.artifact;
          const action = SETTLEMENT_LABELS[artifact.settlementRecommendation.action] ?? artifact.settlementRecommendation.action;
          return `
            <tr>
              <td>${esc(formatTime(artifact.timestamp))}</td>
              <td>${esc(APP_REGISTRY[artifact.agent.variant]?.label ?? artifact.agent.variant)}</td>
              <td><span class="table-decision ${artifact.decision}">${artifact.decision}</span></td>
              <td>${esc(action)}</td>
              <td>${shortHash(artifact.decisionArtifactHash)}</td>
              <td><button class="quiet-button" type="button" data-load-receipt="${index}">Load</button></td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

function saveArchive(artifact) {
  const archive = readArchive().filter((record) => record.artifact.taskId !== artifact.taskId);
  archive.unshift({ artifact });
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive.slice(0, 12)));
}

function readArchive() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeEvidenceLabel(item) {
  return item.replace(/^positive signal:\s*/i, "").replace(/^risk signal:\s*/i, "Risk signal: ");
}

function eigenVerifyUrl(appId, variant) {
  if (appId && appId.startsWith("0x")) return `https://verify.eigencloud.xyz/app/${appId}`;
  return APP_REGISTRY[variant].verifyUrl;
}

async function apiFetch(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new Error(body || `HTTP ${response.status}`);
  }
  return response.json();
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortHash(value) {
  const text = String(value || "-");
  return text.length > 18 ? `${text.slice(0, 10)}...${text.slice(-8)}` : text;
}

function shortAddress(value) {
  const text = String(value || "-");
  return text.startsWith("0x") && text.length > 14 ? `${text.slice(0, 8)}...${text.slice(-6)}` : text;
}

function formatTime(value) {
  if (!value) return "-";
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

function failRow(label, detail) {
  return `
    <div class="verify-row fail">
      <span>FAIL</span>
      <strong>${esc(label)}</strong>
      <small>${esc(detail)}</small>
    </div>
  `;
}

function showToast(message, tone = "ok") {
  refs.toast.textContent = message;
  refs.toast.className = `toast ${tone}`;
  refs.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    refs.toast.hidden = true;
  }, 3200);
}

function clearToast() {
  window.clearTimeout(showToast.timer);
  refs.toast.hidden = true;
}

init();
