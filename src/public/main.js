const state = {
  variant: "code",
  variants: []
};

const variantsEl = document.querySelector("#variants");
const form = document.querySelector("#judge-form");
const output = document.querySelector("#artifact-output");
const title = document.querySelector("#decision-title");
const pill = document.querySelector("#decision-pill");
const auditGrid = document.querySelector("#audit-grid");
const verifyButton = document.querySelector("#verify-button");
const verificationSummary = document.querySelector("#verification-summary");
const verificationEl = document.querySelector("#verification");

let currentArtifact = null;

async function json(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

function renderVariants() {
  variantsEl.innerHTML = "";
  for (const variant of state.variants) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "variant";
    button.setAttribute("aria-pressed", String(variant.id === state.variant));
    button.innerHTML = `<strong>${variant.name}</strong><span>${variant.tagline}</span>`;
    button.addEventListener("click", () => selectVariant(variant.id));
    variantsEl.append(button);
  }
}

async function selectVariant(variant) {
  state.variant = variant;
  history.replaceState(null, "", `/agents/${variant}`);
  renderVariants();
  const demo = await json(`/api/demo/${variant}`);
  for (const [key, value] of Object.entries(demo)) {
    if (form.elements[key]) {
      form.elements[key].value = value;
    }
  }
}

function shortHash(value) {
  if (!value || value === "-") return "-";
  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}

function renderAuditSummary(artifact) {
  const items = artifact
    ? [
        ["Decision ID", artifact.taskId],
        ["Agent", artifact.agent.name],
        ["Input Hash", shortHash(artifact.submittedArtifactHash)],
        ["Decision Hash", shortHash(artifact.decisionArtifactHash)],
        ["Timestamp", artifact.timestamp],
        ["Model", artifact.modelMetadata.model],
        ["Deployment", artifact.deploymentIdentity.appId],
        ["Attestation", artifact.deploymentIdentity.attestation.mode],
        ["Signature", artifact.signature.mode],
        ["Settlement", artifact.settlementRecommendation.action]
      ]
    : [
        ["Decision ID", "-"],
        ["Input Hash", "-"],
        ["Decision Hash", "-"],
        ["Attestation", "-"]
      ];

  auditGrid.innerHTML = items
    .map(([label, value]) => `<div><span>${label}</span><strong title="${value}">${value}</strong></div>`)
    .join("");
}

function renderVerificationSummary(verification) {
  const isOk = verification.status === "verified";
  verificationSummary.hidden = false;
  verificationSummary.className = `verification-summary ${isOk ? "" : "failed"}`;
  verificationSummary.innerHTML = `
    <h3>${isOk ? "Decision Verified" : "Verification Failed"}</h3>
    <p>${verification.message}</p>
    <div class="verification-facts">
      <div><span>Status</span><strong>${verification.status}</strong></div>
      <div><span>Decision hash match</span><strong>${verification.decisionArtifactHashMatch}</strong></div>
      <div><span>Signature valid</span><strong>${verification.signatureValid}</strong></div>
      <div><span>Verified at</span><strong>${verification.verifiedAt}</strong></div>
    </div>
  `;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  pill.textContent = "judging";
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.variant = state.variant;

  try {
    const { artifact } = await json("/api/judge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    currentArtifact = artifact;
    title.textContent = `${artifact.agent.name}: ${artifact.decision.toUpperCase()} (${artifact.score}/100)`;
    pill.textContent = artifact.signature.mode;
    verifyButton.disabled = false;
    verificationSummary.hidden = true;
    verificationEl.innerHTML = "";
    renderAuditSummary(artifact);
    output.textContent = JSON.stringify(artifact, null, 2);
  } catch (error) {
    currentArtifact = null;
    title.textContent = "Judgment failed";
    pill.textContent = "error";
    verifyButton.disabled = true;
    output.textContent = error.message;
  }
});

verifyButton.addEventListener("click", async () => {
  if (!currentArtifact) return;
  verifyButton.textContent = "Verifying...";
  try {
    const { verification } = await json("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artifact: currentArtifact })
    });
    pill.textContent = verification.ok ? "verified" : "verify failed";
    renderVerificationSummary(verification);
    verificationEl.innerHTML = verification.checks
      .map(
        (check) => `
          <div class="verification-row">
            <div>${check.ok ? "OK" : "!!"}</div>
            <div><b>${check.label}</b><p>${check.detail}</p></div>
          </div>
        `
      )
      .join("");
  } catch (error) {
    pill.textContent = "verify error";
    verificationEl.textContent = error.message;
  } finally {
    verifyButton.textContent = "Verify Decision";
  }
});

async function init() {
  const data = await json("/api/variants");
  state.variants = data.variants;
  renderVariants();
  const routeVariant = location.pathname.match(/^\/agents\/(code|research|negotiation)$/)?.[1] || "code";
  await selectVariant(routeVariant);
  renderAuditSummary(null);
}

init();
