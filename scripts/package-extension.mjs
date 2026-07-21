import { copyFile, mkdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { EXTENSION_FILES } from "./extension-files.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const releaseRoot = resolve(projectRoot, "release");
const target = resolve(releaseRoot, "neatmind-extension");
const localSecretValues = await loadLocalSecretValues();

if (!target.startsWith(`${releaseRoot}${sep}`)) {
  throw new Error("Refusing to package outside the local release directory.");
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

for (const relativePath of EXTENSION_FILES) {
  const source = resolve(projectRoot, relativePath);
  if (!source.startsWith(`${projectRoot}${sep}`)) throw new Error(`Unsafe extension path: ${relativePath}`);
  const metadata = await stat(source).catch(() => null);
  if (!metadata?.isFile()) throw new Error(`Required extension file is missing: ${relativePath}`);
  const content = await readFile(source, "utf8");
  const containsKnownSecret = localSecretValues.some((secret) => content.includes(secret));
  const containsCredentialPattern = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bAIza[0-9A-Za-z_-]{35}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b|\bgh[pousr]_[A-Za-z0-9]{20,}\b/.test(content);
  const containsLocalHomePath = /[A-Za-z]:\\Users\\[^\\\s"']+|\/Users\/[^/\s"']+/.test(content);
  if (containsKnownSecret || containsCredentialPattern || containsLocalHomePath) {
    throw new Error(`Refusing to package sensitive content from ${relativePath}.`);
  }
  const destination = resolve(target, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

const manifest = JSON.parse(await readFile(join(target, "manifest.json"), "utf8"));
const requiredEntrypoints = [
  manifest.background?.service_worker,
  manifest.side_panel?.default_path
].filter(Boolean);
for (const entrypoint of requiredEntrypoints) {
  if (!EXTENSION_FILES.includes(entrypoint)) throw new Error(`Manifest entrypoint is not in the package allowlist: ${entrypoint}`);
}

console.log(`Packaged ${EXTENSION_FILES.length} allowlisted extension files in ${relative(projectRoot, target)}.`);

async function loadLocalSecretValues() {
  const values = [];
  const env = await readFile(resolve(projectRoot, ".env"), "utf8").catch(() => "");
  env.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    const sensitiveName = /(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|ALLOWED_EXTENSION_ORIGINS)/.test(match?.[1] || "");
    const value = String(match?.[2] || "").replace(/^['"]|['"]$/g, "");
    if (sensitiveName && value.length >= 12 && !/^(?:replace-|your-)/i.test(value)) values.push(value);
  });
  const generatedToken = (await readFile(resolve(projectRoot, ".neatmind-backend-token"), "utf8").catch(() => "")).trim();
  if (generatedToken.length >= 12) values.push(generatedToken);
  return values;
}
