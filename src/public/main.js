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
    title: "Signed settlement receipts for code bounties.",
    copy: "Determine whether a bounty or PR submission satisfies the acceptance rubric enough to release payment, request revision, or reject settlement.",
    labels: {
      bounty: "Task Terms",
      rubric: "Acceptance Rubric",
      artifact: "Submitted Code / Diff"
    }
  },
  research: {
    accent: "#5bb8ff",
    caseType: "Research Deliverable",
    title: "Research acceptance receipts with claims, assumptions, and sources checked.",
    copy: "Determine whether a research deliverable meets the promised evidence standard, with claims, assumptions, sources, and caveats checked against the rubric.",
    labels: {
      bounty: "Research Objective",
      rubric: "Evidence Standard",
      artifact: "Submitted Brief"
    }
  },
  negotiation: {
    accent: "#f0b84a",
    caseType: "Deal Terms",
    title: "Deal-term compliance receipts for neutral proposal review.",
    copy: "Determine whether a proposal satisfies required business terms and identify exceptions that block acceptance.",
    labels: {
      bounty: "Deal Context",
      rubric: "Required Terms",
      artifact: "Submitted Proposal"
    }
  },
  governance: {
    accent: "#b692ff",
    caseType: "Governance Preflight",
    title: "Signed pre-vote receipts for governance risk.",
    copy: "Check proposal completeness, treasury exposure, execution controls, and obvious governance risk before a vote opens.",
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

let currentVariant = "code";
let currentView = "evaluate";
let currentArtifact = null;
let variantConfigs = {};
let guidedRunning = false;

const refs = {
  entryLayer: document.getElementById("entry-layer"),
  skipEntryBtn: document.getElementById("skip-entry-btn"),
  enterConsoleBtn: document.getElementById("enter-console-btn"),
  runGuidedBtn: document.getElementById("run-guided-btn"),
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
  button.addEventListener("click", () => selectVariant(button.dataset.variant, { push: true }));
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view, { push: true }));
});

document.querySelectorAll("[data-preview-demo]").forEach((button) => {
  button.addEventListener("click", async () => {
    enterConsole();
    selectVariant(button.dataset.previewDemo, { push: true });
    await loadDemo(button.dataset.previewDemo);
    setView("evaluate", { push: true });
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
  history.pushState(null, "", href);
  route();
});

window.addEventListener("popstate", route);

refs.skipEntryBtn.addEventListener("click", () => enterConsole());
refs.enterConsoleBtn.addEventListener("click", () => enterConsole());
refs.runGuidedBtn.addEventListener("click", () => runGuidedDemo("code"));
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

refs.tamperBtn.addEventListener("click", async () => {
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
    setView("verify", { push: true });
  } catch (error) {
    refs.tamperDiff.hidden = false;
    refs.tamperDiff.innerHTML = failRow("Tamper test", error.message);
  }
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

  route();
  loadDemo(currentVariant);
  pingRuntime();
  if (sessionStorage.getItem("proofjudge.entry.dismissed") === "true") {
    refs.entryLayer.hidden = true;
  }
}

function enterConsole() {
  if (refs.entryLayer.hidden) return;
  window.scrollTo({ top: 0, behavior: "auto" });
  refs.entryLayer.classList.add("leaving");
  sessionStorage.setItem("proofjudge.entry.dismissed", "true");
  window.setTimeout(() => {
    refs.entryLayer.hidden = true;
  }, prefersReducedMotion() ? 1 : 520);
}

async function runGuidedDemo(variant = "code") {
  if (!META[variant] || guidedRunning) return;
  guidedRunning = true;
  enterConsole();
  selectVariant(variant, { push: true });
  setView("demo", { push: true });
  updateGuidedStatus(`Loading ${APP_REGISTRY[variant].label}`);

  try {
    await loadDemo(variant);
    await wait(prefersReducedMotion() ? 20 : 260);
    setView("evaluate", { push: true });

    await spotlightField("bountyDescription", "Acceptance terms locked");
    await spotlightField("rubric", "Rubric checks ready");
    await spotlightField("submittedArtifact", "Submitted work staged");

    updateGuidedStatus("Calling /api/judge");
    await generateReceipt({ guided: true });
    await wait(prefersReducedMotion() ? 20 : 360);

    updateGuidedStatus("Calling /api/verify");
    await verifyCurrentReceipt();
    await wait(prefersReducedMotion() ? 20 : 360);

    updateGuidedStatus("Running tamper test");
    refs.tamperBtn.click();
    await wait(prefersReducedMotion() ? 20 : 360);

    updateGuidedStatus("Receipt, verifier, and tamper failure ready");
  } catch (error) {
    showToast(`Guided demo failed: ${error.message}`, "error");
    updateGuidedStatus("Failed");
  } finally {
    guidedRunning = false;
    clearSpotlights();
  }
}

function resetGuidedDemo() {
  guidedRunning = false;
  clearSpotlights();
  resetReceipt();
  resetVerification();
  loadDemo(currentVariant);
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

function updateGuidedStatus(status) {
  refs.guidedStatus.textContent = status;
}

function route() {
  const match = window.location.pathname.match(/^\/agents\/(\w+)$/);
  const variant = match && META[match[1]] ? match[1] : "code";
  const hashView = window.location.hash.replace("#", "");
  const view = document.querySelector(`[data-view="${hashView}"]`) ? hashView : currentView;

  selectVariant(variant, { push: false, preserveArtifact: variant === currentVariant });
  setView(view, { push: false });
}

function selectVariant(variant, options = {}) {
  if (!META[variant]) return;
  const changed = currentVariant !== variant;
  currentVariant = variant;
  const meta = META[variant];
  const app = APP_REGISTRY[variant];

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
    loadDemo(variant);
  }

  if (options.push) {
    history.pushState(null, "", `/agents/${variant}#${currentView}`);
  }
}

function setView(view, options = {}) {
  if (!document.querySelector(`[data-view="${view}"]`)) return;
  currentView = view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === view);
  });
  if (options.push) {
    history.replaceState(null, "", `/agents/${currentVariant}#${view}`);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
}

async function loadDemo(variant) {
  try {
    const data = await apiFetch(`/api/demo/${variant}`);
    refs.form.elements.bountyDescription.value = data.bountyDescription ?? "";
    refs.form.elements.rubric.value = data.rubric ?? "";
    refs.form.elements.submittedArtifact.value = data.submittedArtifact ?? "";
    refs.form.elements.submitter.value = data.submitter ?? "";
  } catch (error) {
    showToast(`Demo case failed to load: ${error.message}`, "error");
  }
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
    <span class="gate-label">Settlement Gate</span>
    <strong>${esc(settlementLabel)}</strong>
    <small>${esc(settlement.note)}</small>
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
    <span class="gate-label">Settlement Gate</span>
    <strong>Awaiting verdict</strong>
    <small>Generate a signed receipt to decide release, hold, reject, or appeal.</small>
  `;
  resetPipeline();
}

async function verifyCurrentReceipt() {
  if (!currentArtifact) return;
  await verifyArtifact(currentArtifact, { source: "current" });
  setView("verify", { push: true });
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
    ${rows.map((check, index) => `
      <div class="verify-row ${check.ok ? "ok" : "fail"}" style="--row-delay:${index * 45}ms">
        <span>${check.ok ? "PASS" : "FAIL"}</span>
        <strong>${esc(check.label)}</strong>
        <small>${esc(check.detail)}</small>
      </div>
    `).join("")}
  `;
}

function renderTamperDiff(original, tampered, verification) {
  const hashCheck = verification.checks.find((check) => check.label === "Decision artifact hash");
  const signatureCheck = verification.checks.find((check) => check.label === "Signature");
  refs.tamperDiff.hidden = false;
  refs.tamperDiff.innerHTML = `
    <div class="section-title">
      <span>Tamper Diff Panel</span>
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

init();
