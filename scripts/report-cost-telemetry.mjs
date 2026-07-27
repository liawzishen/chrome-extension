import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import reportModule from "../cost-telemetry-report.js";

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
