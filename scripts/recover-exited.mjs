import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const cli = "@layr-labs/ecloud-cli@1.0.0";
const inputFile = process.argv.find((arg) => arg.endsWith(".json")) || "live-readiness.json";
const apply = process.argv.includes("--apply");
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const apps = {
  code: "0xd3647631C4706be744BE813cD0226e4f149e5aC0",
  research: "0x898E1d5603070C7452Ee7F8CF288639A63a217cc",
  negotiation: "0x2f751FcEC35D8afA6fbb2d3486443efcc6CC5322",
  governance: "0x07fB5013B8625af5059Dc1564a964dfBa80Fbd94"
};

function ecloud(args) {
  return spawnSync(npx, ["--yes", cli, ...args, "--environment", "mainnet-alpha", "--non-interactive"], {
    encoding: "utf8",
    env: process.env,
    timeout: 8 * 60 * 1_000
  });
}

const readiness = JSON.parse(readFileSync(inputFile, "utf8").replace(/^\uFEFF/, ""));
const failed = readiness.results.filter((result) => !result.ok);
const report = { checkedAt: new Date().toISOString(), apply, actions: [] };

for (const result of failed) {
  const appId = apps[result.variant];
  if (!appId) continue;

  const info = ecloud(["compute", "app", "info", appId]);
  const transcript = `${info.stdout || ""}\n${info.stderr || ""}`;
  const status = transcript.match(/^\s*Status:\s*(Running|Exited|Failed)\s*$/im)?.[1] || "Unknown";
  const action = { variant: result.variant, appId, status, operation: "none", ok: info.status === 0 };

  if (status === "Exited" && apply) {
    const started = ecloud(["compute", "app", "start", appId, "--force"]);
    action.operation = "start";
    action.ok = started.status === 0;
  } else if (status === "Failed") {
    action.operation = "manual-review-required";
  } else if (status === "Unknown") {
    action.operation = "status-query-failed";
    action.ok = false;
  }

  report.actions.push(action);
  console.log(`${result.variant}: status=${status}, operation=${action.operation}, ok=${action.ok}`);
}

writeFileSync(process.env.PROOFJUDGE_RECOVERY_REPORT_PATH || "recovery-report.json", JSON.stringify(report, null, 2));
if (report.actions.some((action) => !action.ok)) process.exitCode = 1;
