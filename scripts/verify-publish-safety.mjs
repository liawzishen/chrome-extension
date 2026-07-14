import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const excludedDirectories = new Set([
  ".git", ".codex", ".playwright-cli", "node_modules", "output", "release", "tmp", "temp", "coverage", ".nyc_output"
]);
const excludedFiles = new Set([".env", ".exam-cram-backend-token"]);
const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".txt", ".yaml", ".yml"]);
const requiredIgnoreEntries = [
  ".env", ".env.*", ".exam-cram-backend-token", ".codex/", ".playwright-cli/", "node_modules/", "output/", "release/", "tmp/", "coverage/", "*.pem", "*.key", "*.crx"
];

const candidates = [];
await collect(projectRoot);

const localSecrets = await loadLocalSecrets();
const findings = [];
for (const filename of candidates) {
  const content = await readFile(filename, "utf8");
  const displayName = relative(projectRoot, filename).replaceAll("\\", "/");
  const checks = [
    ["private key material", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ["Google API credential", /AIza[0-9A-Za-z_-]{35}/],
    ["OpenAI credential", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
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
    if (!entry.isFile() || excludedFiles.has(entry.name)) continue;
    if (textExtensions.has(extname(entry.name).toLowerCase()) || [".gitignore", ".env.example"].includes(entry.name)) {
      candidates.push(fullPath);
    }
  }
}

async function loadLocalSecrets() {
  const secrets = [];
  const env = await readFile(resolve(projectRoot, ".env"), "utf8").catch(() => "");
  env.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    const value = String(match?.[2] || "").replace(/^['"]|['"]$/g, "");
    const sensitiveName = /(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|ALLOWED_EXTENSION_ORIGINS)/.test(match?.[1] || "");
    if (match && sensitiveName && value.length >= 12 && !/^(?:replace-|your-)/i.test(value)) {
      secrets.push({ name: match[1], value });
    }
  });
  const backendToken = (await readFile(resolve(projectRoot, ".exam-cram-backend-token"), "utf8").catch(() => "")).trim();
  if (backendToken.length >= 12) secrets.push({ name: "BACKEND_ACCESS_TOKEN_FILE", value: backendToken });
  return secrets;
}
