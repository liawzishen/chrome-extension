import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const excludedDirectories = new Set([
  ".git", ".claude", ".codex", ".playwright-cli", "node_modules", "output", "release", "tmp", "temp", "coverage", ".nyc_output"
]);
// No .env entry here on purpose: collect() routes every .env* through
// environmentFilePattern instead, which both skips the root ones and fails a
// nested one. Naming them here would let a nested copy slip past that check.
const excludedFiles = new Set([".exam-cram-backend-token", ".exam-cram-cost-telemetry.jsonl"]);
const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".txt", ".yaml", ".yml"]);
// Credential files carry no useful extension, so extname-based scanning skips them entirely.
// Match them by name instead: a rename is what let a committed backend token pass this gate once.
const secretFilePattern = /(?:^|[.\-])backend-token$/;
const environmentFilePattern = /^\.env(?:\.|$)/;
const requiredIgnoreEntries = [
  ".env", ".env.*", "*-backend-token", ".exam-cram-backend-token", ".exam-cram-cost-telemetry.jsonl", ".claude/", ".codex/", ".playwright-cli/", "node_modules/", "output/", "release/", "tmp/", "coverage/", "*.pem", "*.key", "*.crx"
];

const findings = [];
const candidates = [];
await collect(projectRoot);

const localSecrets = await loadLocalSecrets();
for (const filename of candidates) {
  const content = await readFile(filename, "utf8");
  const displayName = relative(projectRoot, filename).replaceAll("\\", "/");
  const checks = [
    ["raw NUL byte", /\0/],
    ["private key material", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ["Google API credential", /AIza[0-9A-Za-z_-]{35}/],
    ["OpenAI credential", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
    ["Stripe credential", /\b(?:pk|sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/],
    ["Stripe webhook secret", /\bwhsec_[A-Za-z0-9]{16,}\b/],
    ["Google OAuth client secret", /\bGOCSPX-[A-Za-z0-9_-]{20,}\b/],
    ["GitHub credential", /\bgh[pousr]_[A-Za-z0-9]{20,}\b/],
    ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
    ["Slack credential", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
    ["absolute Windows home path", /[A-Za-z]:\\Users\\[^\\\s"']+/i],
    ["absolute macOS home path", /\/Users\/[^/\s"']+/]
  ];
  checks.forEach(([label, pattern]) => {
    if (pattern.test(content)) findings.push(`${displayName}: ${label}`);
  });
  const emails = content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  emails.filter((email) => !/(?:example\.(?:com|org|net|test)|\.test|\.invalid|users\.noreply\.github\.com)$/i.test(email))
    .forEach(() => findings.push(`${displayName}: possible personal email address`));
  localSecrets.forEach(({ name, value }) => {
    if (content.includes(value)) findings.push(`${displayName}: matches local secret ${name}`);
  });
}

const gitignore = await readFile(resolve(projectRoot, ".gitignore"), "utf8");
requiredIgnoreEntries.forEach((entry) => {
  if (!gitignore.split(/\r?\n/).includes(entry)) findings.push(`.gitignore: missing ${entry}`);
});

if (findings.length) {
  console.error("Publish safety verification failed:");
  [...new Set(findings)].forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log(`Publish safety verification passed for ${candidates.length} candidate text files.`);
}

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const fullPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await collect(fullPath);
      continue;
    }
    if (!entry.isFile()) continue;
    const displayName = relative(projectRoot, fullPath).replaceAll("\\", "/");
    const isEnvironmentTemplate =
      entry.name === ".env.example" ||
      (entry.name.startsWith(".env.") && entry.name.endsWith(".example"));
    if (environmentFilePattern.test(entry.name) && !isEnvironmentTemplate) {
      // Root environment files are the local secret source against which publishable
      // files are checked. A nested one is publishable-tree residue and must fail.
      if (dirname(fullPath) !== projectRoot) {
        findings.push(`${displayName}: environment file is present in a publishable tree`);
      }
      continue;
    }
    // The credential check runs before excludedFiles so the exclusion list, which names
    // .exam-cram-backend-token, cannot hide the very file this gate exists to catch.
    if (secretFilePattern.test(entry.name)) {
      findings.push(`${displayName}: credential file is present in a publishable tree`);
      continue;
    }
    if (excludedFiles.has(entry.name)) continue;
    if (textExtensions.has(extname(entry.name).toLowerCase()) || entry.name === ".gitignore" || isEnvironmentTemplate) {
      candidates.push(fullPath);
    }
  }
}

async function loadLocalSecrets() {
  const secrets = [];
  // Every root environment file is a secret source, enumerated rather than named,
  // so adding one does not silently go unchecked. This matters most for
  // .env.hosted, which holds the Stripe secret key, webhook signing secret, Google
  // OAuth client secret, and session signing key: a copy of one leaking into a
  // publishable file has to be caught by value, because a client secret or a
  // signing key has no recognisable format to pattern-match on.
  const rootEntries = await readdir(projectRoot, { withFileTypes: true });
  const environmentFiles = rootEntries
    .filter((entry) => (
      entry.isFile() &&
      environmentFilePattern.test(entry.name) &&
      entry.name !== ".env.example" &&
      !entry.name.endsWith(".example")
    ))
    .map((entry) => entry.name);
  for (const name of environmentFiles) {
    const env = await readFile(resolve(projectRoot, name), "utf8").catch(() => "");
    env.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
      const value = String(match?.[2] || "").replace(/^['"]|['"]$/g, "");
      const sensitiveName = /(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|ALLOWED_EXTENSION_ORIGINS)/.test(match?.[1] || "");
      // An OAuth client id stays out of this set for free: GOOGLE_OAUTH_CLIENT_ID
      // matches none of the sensitive-name substrings above, which is correct
      // because a client id is public by design and appears in client-side code.
      // verify-publish-safety-script.test.js pins that, so adding CLIENT or ID to
      // the pattern above would fail loudly rather than start crying wolf.
      if (match && sensitiveName && value.length >= 12 && !/^(?:replace-|your-)/i.test(value)) {
        secrets.push({ name: `${name}:${match[1]}`, value });
      }
    });
  }
  const backendToken = (await readFile(resolve(projectRoot, ".exam-cram-backend-token"), "utf8").catch(() => "")).trim();
  if (backendToken.length >= 12) secrets.push({ name: "BACKEND_ACCESS_TOKEN_FILE", value: backendToken });
  return secrets;
}
