// ── Constants ─────────────────────────────────────────────────────

const RING_C       = 326.73; // 2π × r=52
const FRAME_BUDGET = 33;     // ~30 fps

const META = {
  code: {
    icon: '{ }', accent: '#00ff9d',
    name: 'ProofJudge Code',
    tagline: 'Verifiable review for code bounties and PRs.',
    labels: { bounty: 'Bounty / Task Description', rubric: 'Acceptance Rubric', artifact: 'Submitted Code / Diff' },
  },
  research: {
    icon: '◎', accent: '#38bdf8',
    name: 'ProofJudge Research',
    tagline: 'Claims require sources. Sources require verification.',
    labels: { bounty: 'Research Objective', rubric: 'Evaluation Rubric', artifact: 'Research Document / Brief' },
  },
  negotiation: {
    icon: '⚖', accent: '#fbbf24',
    name: 'ProofJudge Negotiation',
    tagline: 'Neutral ground. Both parties can verify.',
    labels: { bounty: 'Contract / Deal Context', rubric: 'Required Terms Checklist', artifact: 'Submitted Proposal' },
  },
  governance: {
    icon: '⬡', accent: '#c084fc',
    name: 'ProofJudge Governance',
    tagline: 'Proposals verified before votes are cast.',
    labels: { bounty: 'DAO / Protocol Context', rubric: 'Evaluation Rubric', artifact: 'Full Proposal Text' },
  },
};

// ── State ─────────────────────────────────────────────────────────

let nodeAnim       = null;
let currentVariant = null;
let currentArtifact = null;
let variantConfigs  = {};

// ── Canvas animation ──────────────────────────────────────────────

class NodeCanvas {
  constructor(el) {
    this.el   = el;
    this.ctx  = el.getContext('2d');
    this.pts  = [];
    this.raf  = null;
    this.lastT = 0;
    this.acc  = 0;

    this._onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(this.raf); this.raf = null;
      } else {
        this.lastT = 0;
        this.raf = requestAnimationFrame(t => this._tick(t));
      }
    };
    this._onResize = () => { this._size(); };

    document.addEventListener('visibilitychange', this._onVis);
    window.addEventListener('resize', this._onResize);
    this._size();
  }

  _seed(s) {
    const x = Math.sin(s * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }

  _size() {
    const p = this.el.parentElement;
    this.el.width  = p.clientWidth;
    this.el.height = Math.max(p.clientHeight, window.innerHeight);
    this._initPts();
  }

  _initPts() {
    const W = this.el.width, H = this.el.height, n = 44;
    this.pts = Array.from({ length: n }, (_, i) => ({
      x:  this._seed(i * 3)     * W,
      y:  this._seed(i * 3 + 1) * H,
      vx: (this._seed(i * 3 + 2) - 0.5) * 0.22,
      vy: (this._seed(i * 3 + 3) - 0.5) * 0.22,
      r:  1 + this._seed(i * 5) * 1.4,
    }));
  }

  start() {
    if (this.raf) return;
    this.lastT = 0;
    this.raf = requestAnimationFrame(t => this._tick(t));
  }

  pause() {
    cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  _tick(now) {
    this.raf = requestAnimationFrame(t => this._tick(t));
    if (!this.lastT) { this.lastT = now; return; }
    this.acc += now - this.lastT;
    this.lastT = now;
    if (this.acc < FRAME_BUDGET) return;
    this.acc = 0;
    this._draw();
  }

  _draw() {
    const { ctx, el: { width: W, height: H }, pts } = this;
    ctx.clearRect(0, 0, W, H);

    for (const p of pts) {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
    }

    const D = 130;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d >= D) continue;
        const a = ((1 - d / D) * 0.2).toFixed(3);
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(0,255,157,${a})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }

    ctx.fillStyle = 'rgba(0,255,157,0.55)';
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0, p.r), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── DOM refs ──────────────────────────────────────────────────────

const hubEl          = document.getElementById('hub');
const agentViewEl    = document.getElementById('agent-view');
const heroCanvas     = document.getElementById('hero-canvas');
const agentIconEl    = document.getElementById('agent-icon-large');
const agentTitleEl   = document.getElementById('agent-title');
const agentTaglineEl = document.getElementById('agent-tagline-text');
const problemStripEl = document.getElementById('problem-strip');
const attestBadgeEl  = document.getElementById('attestation-badge');
const attestLabelEl  = document.getElementById('attest-label');
const navPills       = document.querySelectorAll('.nav-pill');
const btnDemo        = document.getElementById('btn-demo');
const btnLive        = document.getElementById('btn-live');
const labelBounty    = document.getElementById('label-bounty');
const labelRubric    = document.getElementById('label-rubric');
const labelArtifact  = document.getElementById('label-artifact');
const form           = document.getElementById('judge-form');
const submitBtn      = document.getElementById('submit-btn');
const btnText        = document.getElementById('btn-text');
const verdictIdle    = document.getElementById('verdict-idle');
const verdictContent = document.getElementById('verdict-content');
const ringFill       = document.getElementById('ring-fill');
const scoreNum       = document.getElementById('score-num');
const decisionBadge  = document.getElementById('decision-badge');
const confFill       = document.getElementById('conf-fill');
const confVal        = document.getElementById('conf-val');
const reasoningList  = document.getElementById('reasoning-list');
const auditBlock     = document.getElementById('audit-block');
const verifyBtn      = document.getElementById('verify-btn');
const verifyResult   = document.getElementById('verify-result');
const tamperSection  = document.getElementById('tamper-section');
const tamperBtn      = document.getElementById('tamper-btn');
const tamperResult   = document.getElementById('tamper-result');
const artifactPre    = document.getElementById('artifact-pre');

// ── SPA routing ───────────────────────────────────────────────────

function route() {
  const m = window.location.pathname.match(/^\/agents\/(\w+)$/);
  if (m && META[m[1]]) {
    showAgentView(m[1]);
  } else {
    showHub();
  }
}

function navigate(url) {
  history.pushState(null, '', url);
  route();
}

// intercept same-origin link clicks
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;
  e.preventDefault();
  navigate(href);
});

window.addEventListener('popstate', route);

// ── Hub view ──────────────────────────────────────────────────────

function showHub() {
  hubEl.hidden = false;
  agentViewEl.hidden = true;
  document.documentElement.style.removeProperty('--accent');

  if (!nodeAnim) {
    nodeAnim = new NodeCanvas(heroCanvas);
  }
  nodeAnim.start();
}

// ── Agent view ────────────────────────────────────────────────────

async function showAgentView(variant) {
  currentVariant  = variant;
  currentArtifact = null;

  nodeAnim?.pause();
  hubEl.hidden      = true;
  agentViewEl.hidden = false;

  const m = META[variant];
  document.documentElement.style.setProperty('--accent', m.accent);

  agentIconEl.textContent    = m.icon;
  agentTitleEl.textContent   = m.name;
  agentTaglineEl.textContent = m.tagline;
  labelBounty.textContent    = m.labels.bounty;
  labelRubric.textContent    = m.labels.rubric;
  labelArtifact.textContent  = m.labels.artifact;

  navPills.forEach(p => p.classList.toggle('active', p.dataset.variant === variant));

  const cfg = variantConfigs[variant];
  problemStripEl.textContent = cfg?.problemStatement ?? '';

  attestLabelEl.textContent = 'Checking…';
  attestBadgeEl.className   = 'attestation-badge';

  resetVerdict();

  if (btnDemo.classList.contains('active')) {
    await loadDemo(variant);
  }

  // ping server to confirm it's alive
  fetch('/healthz').then(r => {
    if (r.ok) attestLabelEl.textContent = 'Server Live';
  }).catch(() => { attestLabelEl.textContent = 'Offline'; });
}

function updateAttestationFromArtifact(artifact) {
  const mode = artifact.deploymentIdentity?.attestation?.mode;
  if (mode === 'eigencompute') {
    attestBadgeEl.className   = 'attestation-badge live';
    attestLabelEl.textContent = 'EigenCompute TEE';
  } else {
    attestBadgeEl.className   = 'attestation-badge demo';
    attestLabelEl.textContent = 'Demo Mode';
  }
}

// ── Mode toggle ───────────────────────────────────────────────────

btnDemo.addEventListener('click', async () => {
  if (btnDemo.classList.contains('active')) return;
  btnDemo.classList.add('active');
  btnLive.classList.remove('active');
  if (currentVariant) await loadDemo(currentVariant);
});

btnLive.addEventListener('click', () => {
  if (btnLive.classList.contains('active')) return;
  btnLive.classList.add('active');
  btnDemo.classList.remove('active');
  clearForm();
});

async function loadDemo(variant) {
  try {
    const data = await apiFetch(`/api/demo/${variant}`);
    form.elements.bountyDescription.value = data.bountyDescription ?? '';
    form.elements.rubric.value            = data.rubric ?? '';
    form.elements.submittedArtifact.value = data.submittedArtifact ?? '';
    form.elements.submitter.value         = data.submitter ?? '';
  } catch (e) {
    console.error('Demo load failed:', e);
  }
}

function clearForm() { form.reset(); }

// ── Form submission ────────────────────────────────────────────────

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const body = {
      variant:           currentVariant,
      bountyDescription: form.elements.bountyDescription.value,
      rubric:            form.elements.rubric.value,
      submittedArtifact: form.elements.submittedArtifact.value,
      submitter:         form.elements.submitter.value || undefined,
    };
    const data = await apiFetch('/api/judge', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    currentArtifact = data.artifact;
    renderVerdict(currentArtifact);
    updateAttestationFromArtifact(currentArtifact);
  } catch (err) {
    showError(`Judging failed: ${err.message}`);
  } finally {
    setLoading(false);
  }
});

function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.classList.toggle('loading', on);
  btnText.textContent = on ? 'Judging…' : 'Judge Submission';
}

// ── Verdict rendering ─────────────────────────────────────────────

function resetVerdict() {
  verdictIdle.hidden    = false;
  verdictContent.hidden = true;
  verifyBtn.disabled    = true;
  verifyResult.hidden   = true;
  tamperSection.hidden  = true;
  tamperResult.hidden   = true;
  tamperBtn.textContent = 'Run Tamper Test';
  tamperBtn.disabled    = false;
  artifactPre.textContent = '{}';
  ringFill.style.strokeDashoffset = String(RING_C);
  scoreNum.textContent = '--';
  decisionBadge.textContent = 'PENDING';
  decisionBadge.className   = 'decision-badge';
  confFill.style.width  = '0%';
  confVal.textContent   = '--';
  reasoningList.innerHTML = '';
  auditBlock.innerHTML    = '';
}

function renderVerdict(artifact) {
  const { score, decision, confidence, reasoning, evidenceChecked } = artifact;

  verdictIdle.hidden    = false; // keep visible briefly for transition
  verdictContent.hidden = true;

  // show both then swap after a tick so animation plays
  requestAnimationFrame(() => {
    verdictIdle.hidden    = true;
    verdictContent.hidden = false;

    // score ring (second RAF so element is painted at initial offset first)
    requestAnimationFrame(() => {
      ringFill.style.strokeDashoffset = String(RING_C * (1 - score / 100));
    });
  });

  scoreNum.textContent = String(score);

  decisionBadge.textContent = decision.toUpperCase();
  decisionBadge.className   = `decision-badge ${decision}`;

  confFill.style.width = `${confidence}%`;
  confVal.textContent  = `${confidence}%`;

  reasoningList.innerHTML = reasoning
    .map(r => `<li>${esc(r)}</li>`)
    .join('');

  auditBlock.innerHTML =
    `<div class="block-title">Evidence Checked</div>` +
    `<div style="padding:10px 14px;font-family:var(--font-mono);font-size:11.5px;color:var(--text-muted);line-height:1.9">` +
    evidenceChecked.map(e => `✓ ${esc(e)}`).join('<br>') +
    `</div>`;

  verifyBtn.disabled   = false;
  tamperSection.hidden = false;

  artifactPre.textContent = JSON.stringify(artifact, null, 2);
}

// ── Verify ────────────────────────────────────────────────────────

verifyBtn.addEventListener('click', async () => {
  if (!currentArtifact) return;
  verifyBtn.disabled    = true;
  verifyBtn.textContent = 'Verifying…';
  verifyResult.hidden   = true;

  try {
    const data = await apiFetch('/api/verify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ artifact: currentArtifact }),
    });
    verifyResult.innerHTML = renderChecks(data.verification.checks);
    verifyResult.hidden    = false;
  } catch (err) {
    verifyResult.innerHTML = failCheck(`Verification request failed: ${esc(err.message)}`);
    verifyResult.hidden    = false;
  } finally {
    verifyBtn.disabled    = false;
    verifyBtn.textContent = 'Verify This Decision';
  }
});

function renderChecks(checks) {
  return checks.map(c =>
    `<div class="verify-check ${c.ok ? 'ok' : 'fail'}">
       <span class="check-icon">${c.ok ? '✓' : '✗'}</span>
       <span class="check-label">${esc(c.label)}</span>
       <span class="check-detail">${esc(c.detail)}</span>
     </div>`
  ).join('');
}

function failCheck(msg) {
  return `<div class="verify-check fail"><span class="check-icon">✗</span><span class="check-detail">${msg}</span></div>`;
}

// ── Tamper demo ───────────────────────────────────────────────────

tamperBtn.addEventListener('click', async () => {
  if (!currentArtifact) return;
  tamperBtn.disabled    = true;
  tamperBtn.textContent = 'Running…';
  tamperResult.hidden   = true;

  // clone and modify score by +1 (wraps at 100 → 0)
  const tampered = JSON.parse(JSON.stringify(currentArtifact));
  const origScore = tampered.score;
  tampered.score  = origScore < 100 ? origScore + 1 : 0;

  try {
    const data = await apiFetch('/api/verify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ artifact: tampered }),
    });

    const v        = data.verification;
    const hashChk  = v.checks.find(c => c.label === 'Decision artifact hash');
    const sigChk   = v.checks.find(c => c.label === 'Signature');
    const hashOk   = hashChk?.ok ?? false;
    const sigOk    = sigChk?.ok  ?? false;

    tamperResult.innerHTML = `
      <div class="tamper-step">
        <span class="tamper-label">Original score</span>
        <span class="tamper-val">${origScore} / 100</span>
      </div>
      <div class="tamper-step">
        <span class="tamper-label">Tampered score</span>
        <span class="tamper-val warn">${tampered.score} / 100 ← modified</span>
      </div>
      <div class="tamper-step">
        <span class="tamper-label">Embedded hash</span>
        <span class="tamper-val">${esc(currentArtifact.decisionArtifactHash)}</span>
      </div>
      <div class="tamper-step">
        <span class="tamper-label">Recomputed hash</span>
        <span class="tamper-val bad">${esc(v.recomputedDecisionArtifactHash)} ← MISMATCH</span>
      </div>
      <div class="tamper-step">
        <span class="tamper-label">Hash check</span>
        <span class="tamper-val ${hashOk ? 'ok' : 'bad'}">${hashOk ? '✓ MATCH' : '✗ FAILED — hash does not match modified body'}</span>
      </div>
      <div class="tamper-step">
        <span class="tamper-label">Signature</span>
        <span class="tamper-val ${sigOk ? 'ok' : 'bad'}">${sigOk ? '✓ VALID' : '✗ INVALID — signature rejected'}</span>
      </div>
      <div class="tamper-step">
        <span class="tamper-label">Result</span>
        <span class="tamper-val bad">TAMPER DETECTED — modification is cryptographically provable</span>
      </div>
    `;
    tamperResult.hidden = false;
  } catch (err) {
    tamperResult.innerHTML =
      `<div class="tamper-step"><span class="tamper-val bad">Request failed: ${esc(err.message)}</span></div>`;
    tamperResult.hidden = false;
  } finally {
    tamperBtn.disabled    = false;
    tamperBtn.textContent = 'Run Tamper Test Again';
  }
});

// ── Utilities ─────────────────────────────────────────────────────

async function apiFetch(url, options) {
  const r = await fetch(url, options);
  if (!r.ok) {
    const msg = await r.text().catch(() => r.statusText);
    throw new Error(msg || `HTTP ${r.status}`);
  }
  return r.json();
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showError(msg) {
  // minimal inline error — don't pollute verdict panel
  const el = document.createElement('div');
  el.style.cssText =
    'position:fixed;bottom:24px;right:24px;background:#1a0808;border:1px solid #f87171;' +
    'color:#f87171;padding:12px 18px;border-radius:8px;font-size:13px;z-index:999;max-width:400px';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// ── Bootstrap ─────────────────────────────────────────────────────

async function init() {
  try {
    const data = await apiFetch('/api/variants');
    for (const v of data.variants) variantConfigs[v.id] = v;
  } catch {
    // non-fatal; problem strips will be empty
  }
  route();
}

init();
