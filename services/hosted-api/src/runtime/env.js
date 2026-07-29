const { readFileSync, existsSync } = require("node:fs");

// A deliberately small .env reader. The hosted service takes its secrets from a
// deployment secret manager in production; this exists so local sandbox testing
// does not require exporting a dozen variables by hand. Values already present
// in the environment always win, so a real secret manager is never overridden.
function loadEnvFile(path, env = process.env) {
  if (!path || !existsSync(path)) return { loaded: false, keys: [] };
  const keys = [];
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    if (Object.hasOwn(env, key) && String(env[key]).trim() !== "") continue;
    env[key] = stripQuotes(line.slice(separator + 1).trim());
    keys.push(key);
  }
  return { loaded: true, keys };
}

function stripQuotes(value) {
  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1);
  }
  return value;
}

module.exports = { loadEnvFile };
