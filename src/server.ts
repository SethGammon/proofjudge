import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ZodError } from "zod";
import { createDecisionArtifact, judgeRequestSchema, verifyDecisionArtifact } from "./judge.js";
import { variantList, variants } from "./variants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(process.cwd(), "src/public");

export const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "proofjudge" });
});

app.get("/api/variants", (_req, res) => {
  res.json({ variants: variantList });
});

app.post("/api/judge", async (req, res) => {
  try {
    const request = judgeRequestSchema.parse(req.body);
    res.json({ artifact: await createDecisionArtifact(request) });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Invalid judge request", details: error.issues });
      return;
    }
    throw error;
  }
});

app.post("/api/verify", (req, res) => {
  res.json({ verification: verifyDecisionArtifact(req.body.artifact ?? req.body) });
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

const port = Number(process.env.PORT || 3000);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`ProofJudge listening on http://0.0.0.0:${port}`);
  });
}
