import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import reportModule from "../cost-telemetry-report.js";

await loadEnv();

const configuredPath = String(
  process.argv[2] || process.env.COST_TELEMETRY_PATH || ".exam-cram-cost-telemetry.jsonl"
).trim();
const telemetryPath = isAbsolute(configuredPath) ? configuredPath : resolve(process.cwd(), configuredPath);
let content;
try {
  content = await readFile(telemetryPath, "utf8");
} catch (error) {
  if (error?.code === "ENOENT") {
    console.error(`No cost telemetry file was found at ${telemetryPath}. Enable COST_TELEMETRY_PATH and complete a backend action first.`);
    process.exitCode = 1;
    process.exit();
  }
  throw error;
}
const { events, invalidLineCount } = reportModule.parseCostTelemetryJsonl(content);
const report = reportModule.summarizeCostTelemetry(events);

console.log(JSON.stringify({ ...report, invalidLineCount }, null, 2));

// Mirrors server.js loadEnv() so the COST_TELEMETRY_PATH the README tells users to set in
// .env is honoured here too. Values already present in the environment are left alone, so
// precedence stays argv > environment > .env > default.
async function loadEnv() {
  const contents = await readFile(resolve(process.cwd(), ".env"), "utf8").catch(() => "");
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  });
}
