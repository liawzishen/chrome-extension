const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const TRUSTED_ORIGIN = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";
const TOKEN = "test-token-that-is-long-enough-123456";

process.env.BACKEND_ACCESS_TOKEN = TOKEN;
process.env.ALLOWED_EXTENSION_ORIGINS = TRUSTED_ORIGIN;
process.env.ALLOWED_PREVIEW_ORIGINS = "http://127.0.0.1:8788";
process.env.GEMINI_API_KEY = "test-gemini-key";

const { server } = require("../server.js");

let endpoint;
let baseEndpoint;

before(async () => {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  baseEndpoint = `http://127.0.0.1:${server.address().port}`;
  endpoint = `${baseEndpoint}/api/transcript-preflight`;
});

after(async () => {
  if (!server.listening) return;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function post(origin, authorization) {
  const headers = { "Content-Type": "application/json" };
  if (origin !== undefined) headers.Origin = origin;
  if (authorization !== undefined) headers.Authorization = authorization;
  const response = await fetch(endpoint, { method: "POST", headers, body: "{}" });
  return { response, body: await response.json() };
}

test("trusted extension origin can preflight over loopback without a manual token", async () => {
  const { response, body } = await post(TRUSTED_ORIGIN);
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
});

test("missing, malformed, and unconfigured origins remain rejected", async () => {
  const missing = await post(undefined);
  assert.equal(missing.response.status, 403);
  assert.equal(missing.body.code, "ORIGIN_NOT_ALLOWED");

  const wrong = await post("chrome-extension://bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
  assert.equal(wrong.response.status, 403);
  assert.equal(wrong.body.code, "ORIGIN_NOT_ALLOWED");

  const nonExact = await post(`${TRUSTED_ORIGIN}/`);
  assert.equal(nonExact.response.status, 403);
  assert.equal(nonExact.body.code, "ORIGIN_NOT_ALLOWED");
});

test("a supplied wrong bearer token is rejected even for the trusted extension", async () => {
  const { response, body } = await post(TRUSTED_ORIGIN, "Bearer wrong");
  assert.equal(response.status, 403);
  assert.equal(body.code, "BACKEND_TOKEN_INVALID");
  assert.match(body.error, /invalid/i);
});

test("non-extension allowed origins still require a valid bearer token", async () => {
  const missing = await post("http://127.0.0.1:8788");
  assert.equal(missing.response.status, 403);
  assert.equal(missing.body.code, "BACKEND_TOKEN_REQUIRED");

  const valid = await post("http://127.0.0.1:8788", `Bearer ${TOKEN}`);
  assert.equal(valid.response.status, 200);
  assert.equal(valid.body.ok, true);
});

test("API posts require JSON while accepting registered JSON suffix media types", async () => {
  const rejected = await fetch(endpoint, {
    method: "POST",
    headers: {
      Origin: TRUSTED_ORIGIN,
      "Content-Type": "text/plain"
    },
    body: "{}"
  });
  const rejectedBody = await rejected.json();
  assert.equal(rejected.status, 415);
  assert.equal(rejectedBody.code, "UNSUPPORTED_MEDIA_TYPE");

  const accepted = await fetch(endpoint, {
    method: "POST",
    headers: {
      Origin: TRUSTED_ORIGIN,
      "Content-Type": "application/problem+json; charset=utf-8"
    },
    body: "{}"
  });
  assert.equal(accepted.status, 200);
});

test("health is minimal and every response carries defensive no-store headers", async () => {
  const response = await fetch(`${baseEndpoint}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true, service: "neatmind-backend" });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("pragma"), "no-cache");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.match(response.headers.get("content-security-policy") || "", /default-src 'none'/);
  assert.match(response.headers.get("content-security-policy") || "", /frame-ancestors 'none'/);
  assert.equal(response.headers.get("permissions-policy"), "camera=(), geolocation=(), microphone=()");
  assert.equal(Object.hasOwn(body, "provider"), false);
  assert.equal(Object.hasOwn(body, "model"), false);
  assert.equal(Object.hasOwn(body, "hasApiKey"), false);
});
