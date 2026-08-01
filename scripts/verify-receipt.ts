import { readFile } from "node:fs/promises";
import { decisionArtifactSchema, verifyDecisionArtifact } from "../src/judge.js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npm run receipt:verify -- path/to/receipt.json");
  process.exit(2);
}

const parsed = JSON.parse(await readFile(file, "utf8"));
const artifact = decisionArtifactSchema.parse(parsed.artifact ?? parsed);
const verification = verifyDecisionArtifact(artifact);
console.log(JSON.stringify(verification, null, 2));
if (!verification.ok) process.exitCode = 1;
