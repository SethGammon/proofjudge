const deployments = [
  { variant: "code", baseUrl: "http://34.12.29.220:3000" },
  { variant: "research", baseUrl: "http://35.204.155.165:3000" },
  { variant: "negotiation", baseUrl: "http://34.58.112.209:3000" },
  { variant: "governance", baseUrl: "http://34.87.56.225:3000" }
];

const deep = process.argv.includes("--deep");
const json = process.argv.includes("--json");
const timeoutMs = Number(process.env.PROOFJUDGE_LIVE_TIMEOUT_MS || (deep ? 90_000 : 12_000));

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      accept: "application/json",
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function inspectDeployment(deployment) {
  const startedAt = Date.now();
  const result = {
    variant: deployment.variant,
    url: deployment.baseUrl,
    mode: deep ? "deep" : "readiness",
    ok: false,
    health: false,
    variants: false,
    demo: false,
    judge: deep ? false : null,
    verify: deep ? false : null,
    elapsedMs: 0,
    error: null
  };

  try {
    const health = await request(`${deployment.baseUrl}/healthz`);
    result.health = health.ok === true && health.service === "proofjudge";

    const variantResponse = await request(`${deployment.baseUrl}/api/variants`);
    result.variants = Array.isArray(variantResponse.variants)
      && variantResponse.variants.some((variant) => variant.id === deployment.variant);

    const demo = await request(`${deployment.baseUrl}/api/demo/${deployment.variant}`);
    result.demo = demo.variant === deployment.variant
      && typeof demo.bountyDescription === "string"
      && typeof demo.rubric === "string"
      && typeof demo.submittedArtifact === "string";

    if (deep) {
      const judged = await request(`${deployment.baseUrl}/api/judge`, {
        method: "POST",
        body: JSON.stringify(demo)
      });
      const artifact = judged.artifact;
      result.judge = artifact?.schemaVersion === "proofjudge.decision.v1"
        && artifact?.agent?.variant === deployment.variant
        && typeof artifact?.signature?.value === "string";

      const verified = await request(`${deployment.baseUrl}/api/verify`, {
        method: "POST",
        body: JSON.stringify({ artifact })
      });
      result.verify = verified.verification?.ok === true;
    }

    result.ok = result.health
      && result.variants
      && result.demo
      && (!deep || (result.judge && result.verify));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause && typeof error.cause === "object"
      ? error.cause.code || error.cause.message
      : null;
    result.error = cause ? `${message} (${cause})` : message;
  }

  result.elapsedMs = Date.now() - startedAt;
  return result;
}

const results = await Promise.all(deployments.map(inspectDeployment));

if (json) {
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), deep, results }, null, 2));
} else {
  console.table(results.map((result) => ({
    judge: result.variant,
    ready: result.ok ? "yes" : "no",
    health: result.health ? "pass" : "fail",
    demo: result.demo ? "pass" : "fail",
    receipt: result.judge === null ? "not run" : result.judge ? "pass" : "fail",
    verify: result.verify === null ? "not run" : result.verify ? "pass" : "fail",
    elapsed: `${result.elapsedMs}ms`,
    error: result.error || ""
  })));
}

if (results.some((result) => !result.ok)) {
  process.exitCode = 1;
}
