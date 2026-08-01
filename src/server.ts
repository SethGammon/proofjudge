import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ZodError } from "zod";
import {
  createDecisionArtifact,
  decisionArtifactSchema,
  judgeRequestSchema,
  verifyDecisionArtifact
} from "./judge.js";
import { variantList, variants } from "./variants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(process.cwd(), "src/public");

export const app = express();

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      upgradeInsecureRequests: null
    }
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

const judgeLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Judge request limit reached. Try again shortly." }
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Verification request limit reached. Try again shortly." }
});

const publicDeployments = [
  { variant: "code", label: "Code", baseUrl: "http://34.12.29.220:3000" },
  { variant: "research", label: "Research", baseUrl: "http://35.204.155.165:3000" },
  { variant: "negotiation", label: "Negotiation", baseUrl: "http://34.58.112.209:3000" },
  { variant: "governance", label: "Governance", baseUrl: "http://34.87.56.225:3000" }
] as const;

let deploymentStatusCache: { expiresAt: number; value: unknown } | undefined;

async function inspectPublicDeployment(deployment: typeof publicDeployments[number]) {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(`${deployment.baseUrl}/healthz`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(2_500)
    });
    const body = response.ok ? await response.json() as { ok?: boolean; service?: string } : undefined;
    return {
      variant: deployment.variant,
      label: deployment.label,
      reachable: response.ok && body?.ok === true && body.service === "proofjudge",
      checkedAt
    };
  } catch {
    return { variant: deployment.variant, label: deployment.label, reachable: false, checkedAt };
  }
}

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "proofjudge" });
});

app.get("/api/variants", (_req, res) => {
  res.json({ variants: variantList });
});

app.get("/api/deployments", async (_req, res, next) => {
  try {
    if (deploymentStatusCache && deploymentStatusCache.expiresAt > Date.now()) {
      res.set("Cache-Control", "public, max-age=20").json(deploymentStatusCache.value);
      return;
    }
    const deployments = await Promise.all(publicDeployments.map(inspectPublicDeployment));
    const value = {
      measuredAt: new Date().toISOString(),
      reachable: deployments.filter((deployment) => deployment.reachable).length,
      total: deployments.length,
      deployments
    };
    deploymentStatusCache = { expiresAt: Date.now() + 30_000, value };
    res.set("Cache-Control", "public, max-age=20").json(value);
  } catch (error) {
    next(error);
  }
});

app.post("/api/judge", judgeLimiter, async (req, res, next) => {
  try {
    const request = judgeRequestSchema.parse(req.body);
    res.json({ artifact: await createDecisionArtifact(request) });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Invalid judge request", details: error.issues });
      return;
    }
    next(error);
  }
});

app.post("/api/verify", verifyLimiter, (req, res) => {
  try {
    const artifact = decisionArtifactSchema.parse(req.body?.artifact ?? req.body);
    res.json({ verification: verifyDecisionArtifact(artifact) });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Invalid decision artifact", details: error.issues });
      return;
    }
    throw error;
  }
});

app.get("/api/demo/:variant", (req, res) => {
  const variant = variants[req.params.variant as keyof typeof variants];
  if (!variant) {
    res.status(404).json({ error: "Unknown variant" });
    return;
  }

  res.json({
    variant: variant.id,
    bountyDescription: variant.sampleBounty,
    rubric: variant.sampleRubric,
    submittedArtifact: variant.sampleArtifact,
    submitter: "demo-builder"
  });
});

app.get("/agents/:variant", (req, res) => {
  const variant = variants[req.params.variant as keyof typeof variants];
  if (!variant) {
    res.status(404).send("Unknown ProofJudge agent.");
    return;
  }

  res.sendFile(path.join(publicDir, "index.html"));
});

app.get(["/console", "/agents"], (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Unknown API route" });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status?: unknown }).status)
    : 500;
  if (status >= 400 && status < 500) {
    res.status(status).json({ error: "Invalid request" });
    return;
  }
  console.error("Unhandled ProofJudge request error", error);
  res.status(500).json({ error: "ProofJudge could not complete this request." });
});

const port = Number(process.env.PORT || 3000);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`ProofJudge listening on http://0.0.0.0:${port}`);
  });
}
