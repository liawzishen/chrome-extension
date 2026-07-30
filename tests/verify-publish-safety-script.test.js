const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const scriptSource = path.join(projectRoot, "scripts", "verify-publish-safety.mjs");
const sampleToken = "sandbox-placeholder-not-a-real-credential";

test("publish safety scan flags the canonical backend token filename", () => {
  const root = makeSandbox({ ".exam-cram-backend-token": sampleToken });
  try {
    const result = runScan(root);
    assert.equal(result.status, 1, `expected a failing scan, got:\n${result.stdout}${result.stderr}`);
    assert.match(result.stderr, /\.exam-cram-backend-token: credential file is present/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publish safety scan flags a renamed backend token file", () => {
  const root = makeSandbox({ "staging-backend-token": sampleToken });
  try {
    const result = runScan(root);
    assert.equal(result.status, 1, `expected a failing scan, got:\n${result.stdout}${result.stderr}`);
    assert.match(result.stderr, /staging-backend-token: credential file is present/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publish safety scan passes on the same tree without a credential file", () => {
  const root = makeSandbox({});
  try {
    const result = runScan(root);
    assert.equal(result.status, 0, `expected a passing scan, got:\n${result.stdout}${result.stderr}`);
    assert.match(result.stdout, /Publish safety verification passed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publish safety scan rejects nested environment files that would otherwise evade extension checks", () => {
  const root = makeSandbox({ "staging/.env.hosted": `STRIPE_SECRET_KEY=${sampleToken}` });
  try {
    const result = runScan(root);
    assert.equal(result.status, 1, `expected a failing scan, got:\n${result.stdout}${result.stderr}`);
    assert.match(result.stderr, /staging\/\.env\.hosted: environment file is present/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publish safety scan rejects raw NUL bytes in first-party source", () => {
  const root = makeSandbox({ "usage-service.js": "const key = `action\0period`;\n" });
  try {
    const result = runScan(root);
    assert.equal(result.status, 1, `expected a failing scan, got:\n${result.stdout}${result.stderr}`);
    assert.match(result.stderr, /usage-service\.js: raw NUL byte/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publish safety scan excludes ignored agent worktrees from the publishable source set", () => {
  const root = makeSandbox({ ".claude/worktrees/review/.exam-cram-backend-token": sampleToken });
  try {
    const result = runScan(root);
    assert.equal(result.status, 0, `expected a passing scan, got:\n${result.stdout}${result.stderr}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// The script derives its project root from its own location, so scanning a sandbox
// means copying the real script into one. Everything else it reads is data we author here.
function makeSandbox(files) {
  const root = mkdtempSync(path.join(os.tmpdir(), "exam-cram-publish-safety-"));
  mkdirSync(path.join(root, "scripts"), { recursive: true });
  copyFileSync(scriptSource, path.join(root, "scripts", "verify-publish-safety.mjs"));
  copyFileSync(path.join(projectRoot, ".gitignore"), path.join(root, ".gitignore"));
  Object.entries(files).forEach(([name, content]) => {
    const target = path.join(root, name);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content, "utf8");
  });
  return root;
}

function runScan(root) {
  return spawnSync(process.execPath, [path.join(root, "scripts", "verify-publish-safety.mjs")], {
    cwd: root,
    encoding: "utf8"
  });
}
