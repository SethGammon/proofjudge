import { existsSync, readFileSync, writeFileSync } from "node:fs";

const readinessFile = process.argv[2] || "final-readiness.json";
const recoveryFile = process.argv[3] || "recovery-report.json";
const readiness = JSON.parse(readFileSync(readinessFile, "utf8").replace(/^\uFEFF/, ""));
const recovery = existsSync(recoveryFile)
  ? JSON.parse(readFileSync(recoveryFile, "utf8").replace(/^\uFEFF/, ""))
  : { actions: [] };

const rows = readiness.results.map((result) =>
  `| ${result.variant} | ${result.ok ? "ready" : "failed"} | ${result.health ? "pass" : "fail"} | ${result.demo ? "pass" : "fail"} | ${result.error || ""} |`
);
const recoveryRows = recovery.actions.length
  ? recovery.actions.map((action) => `- ${action.variant}: cloud status ${action.status}; action ${action.operation}; ${action.ok ? "completed" : "not completed"}`)
  : ["- No restart was attempted. Only apps confirmed as Exited are eligible for automatic restart."];

const body = [
  "ProofJudge's scheduled public readiness check failed.",
  "",
  `Observed: ${readiness.checkedAt}`,
  "",
  "| Judge | Result | Health | Demo | Error |",
  "| --- | --- | --- | --- | --- |",
  ...rows,
  "",
  "## Bounded recovery",
  "",
  ...recoveryRows,
  "",
  "Automatic recovery starts an app only when EigenCloud reports the exact state `Exited`. `Failed`, `Running`, and unknown states require review.",
  "",
  `[Workflow run](${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})`
].join("\n");

writeFileSync("readiness-issue.md", body, "utf8");
