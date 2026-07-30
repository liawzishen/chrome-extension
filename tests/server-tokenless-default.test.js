const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

test("tokenless loopback extension access is disabled unless explicitly enabled", () => {
  const script = String.raw`
    process.env.BACKEND_ACCESS_TOKEN = "test-token-that-is-long-enough-123456";
    process.env.ALLOWED_EXTENSION_ORIGINS = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";
    delete process.env.ALLOW_TOKENLESS_EXTENSION;
    const { assertAuthorizedRequest, isTrustedLoopbackExtensionRequest } = require("./server.js");
    const request = {
      headers: { origin: "chrome-extension://abcdefghijklmnopabcdefghijklmnop" },
      socket: { localAddress: "127.0.0.1" }
    };
    if (isTrustedLoopbackExtensionRequest(request)) process.exit(2);
    try {
      assertAuthorizedRequest(request);
      process.exit(3);
    } catch (error) {
      if (error?.code !== "BACKEND_TOKEN_REQUIRED") process.exit(4);
    }
  `;
  const result = spawnSync(process.execPath, ["-e", script], {
    cwd: projectRoot,
    encoding: "utf8"
  });
  assert.equal(result.status, 0, `child failed:\n${result.stdout}${result.stderr}`);
});

test("invalid tokenless-auth configuration fails closed at startup", () => {
  const result = spawnSync(process.execPath, ["-e", "require('./server.js')"], {
    cwd: projectRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      BACKEND_ACCESS_TOKEN: "test-token-that-is-long-enough-123456",
      ALLOW_TOKENLESS_EXTENSION: "sometimes"
    }
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ALLOW_TOKENLESS_EXTENSION must be true or false/);
});
