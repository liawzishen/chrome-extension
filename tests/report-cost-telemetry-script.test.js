const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { mkdtempSync, rmSync, writeFileSync } = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const script = path.resolve(__dirname, "..", "scripts", "report-cost-telemetry.mjs");

test("telemetry report reads COST_TELEMETRY_PATH from .env", () => {
  const root = makeSandbox({
    ".env": "# local config\nCOST_TELEMETRY_PATH=\"custom/from-env.jsonl\"\n",
    "custom/from-env.jsonl": telemetryLine("env_action")
  });
  try {
    const result = runReport(root);
    assert.equal(result.status, 0, `expected a successful report, got:\n${result.stdout}${result.stderr}`);
    assert.equal(readReport(result).actions[0].action, "env_action");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("telemetry report prefers an explicit argv path over .env", () => {
  const root = makeSandbox({
    ".env": "COST_TELEMETRY_PATH=custom/from-env.jsonl\n",
    "custom/from-env.jsonl": telemetryLine("env_action"),
    "custom/from-argv.jsonl": telemetryLine("argv_action")
  });
  try {
    const result = runReport(root, ["custom/from-argv.jsonl"]);
    assert.equal(result.status, 0, `expected a successful report, got:\n${result.stdout}${result.stderr}`);
    assert.equal(readReport(result).actions[0].action, "argv_action");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("telemetry report prefers a real environment variable over .env", () => {
  const root = makeSandbox({
    ".env": "COST_TELEMETRY_PATH=custom/from-env.jsonl\n",
    "custom/from-env.jsonl": telemetryLine("env_action"),
    "custom/from-process.jsonl": telemetryLine("process_action")
  });
  try {
    const result = runReport(root, [], { COST_TELEMETRY_PATH: "custom/from-process.jsonl" });
    assert.equal(result.status, 0, `expected a successful report, got:\n${result.stdout}${result.stderr}`);
    assert.equal(readReport(result).actions[0].action, "process_action");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("telemetry report falls back to the default path when .env sets nothing", () => {
  const root = makeSandbox({
    ".env": "OPENAI_MODEL=gpt-test\n",
    ".exam-cram-cost-telemetry.jsonl": telemetryLine("default_action")
  });
  try {
    const result = runReport(root);
    assert.equal(result.status, 0, `expected a successful report, got:\n${result.stdout}${result.stderr}`);
    assert.equal(readReport(result).actions[0].action, "default_action");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

function makeSandbox(files) {
  const root = mkdtempSync(path.join(os.tmpdir(), "exam-cram-telemetry-cli-"));
  Object.entries(files).forEach(([name, content]) => {
    const target = path.join(root, name);
    require("node:fs").mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content, "utf8");
  });
  return root;
}

function runReport(root, args = [], extraEnv = {}) {
  const env = { ...process.env, ...extraEnv };
  if (!Object.hasOwn(extraEnv, "COST_TELEMETRY_PATH")) delete env.COST_TELEMETRY_PATH;
  return spawnSync(process.execPath, [script, ...args], { cwd: root, env, encoding: "utf8" });
}

function readReport(result) {
  return JSON.parse(result.stdout);
}

function telemetryLine(action) {
  return `${JSON.stringify({
    schemaVersion: 1,
    action,
    outcome: "succeeded",
    latencyMs: 10,
    providerCalls: 1,
    inputTokens: 10,
    outputTokens: 5
  })}\n`;
}
