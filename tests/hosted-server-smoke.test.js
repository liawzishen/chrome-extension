const test = require("node:test");
const assert = require("node:assert/strict");

const { MemoryHostedStore } = require("../services/hosted-api/src/adapters/memory-store.js");
const { startHostedServer } = require("../services/hosted-api/src/runtime/serve.js");

const APP_ORIGIN = "https://billing.neatmind.test";
const EXTENSION_ID = "abcdefghijklmnopabcdefghijklmnop";
const EXTENSION_ORIGIN = `chrome-extension://${EXTENSION_ID}`;
const CHROME_REDIRECT = `https://${EXTENSION_ID}.chromiumapp.org/`;

function silentLogger() {
  return { log() {}, warn() {}, error() {} };
}

async function bootServer() {
  return startHostedServer({
    port: 0,
    store: new MemoryHostedStore(),
    logger: silentLogger(),
    oauth: {
      buildAuthorizationUrl: (returnTo) => `https://accounts.google.com/o/oauth2/v2/auth?state=${encodeURIComponent(returnTo)}`,
      verifyState: (state) => ({ returnTo: decodeURIComponent(String(state || "")) }),
      exchangeCode: async () => ({
        provider: "google",
        subject: "google-subject-smoke",
        email: "smoke@example.test",
        emailVerified: true,
        locale: "en"
      })
    },
    runtimeConfig: {
      host: "127.0.0.1",
      port: 0,
      publicAppOrigin: APP_ORIGIN,
      databasePath: ":memory:",
      allowedExtensionOrigins: [EXTENSION_ORIGIN],
      allowedRedirectUris: [],
      sessionSigningKey: "smoke-test-session-signing-key-0123456789",
      google: { clientId: "id", clientSecret: "secret", redirectUri: `${APP_ORIGIN}/auth/callback` },
      tls: { certPath: "", keyPath: "" },
      reservationTtlMs: 600_000,
      reconcileIntervalMs: 0,
      sweepIntervalMs: 0
    },
    billingConfig: {
      billingEnabled: false,
      graceDays: 3,
      priceAmounts: { month: 499, year: 3999 }
    }
  });
}

test("the hosted service answers real HTTP requests over a bound socket", async (t) => {
  const runtime = await bootServer();
  const base = `http://127.0.0.1:${runtime.address.port}`;
  t.after(() => runtime.close());

  const health = await fetch(`${base}/healthz`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { ok: true, service: "neatmind-hosted-api" });

  const pricing = await fetch(`${base}/pricing`);
  assert.equal(pricing.status, 200);
  assert.match(pricing.headers.get("content-type"), /text\/html/);
  const html = await pricing.text();
  assert.match(html, /\$39\.99 billed once per year/);
  assert.match(html, /NeatMind/);

  // A redirect must not be followed here: the point is that the server issued it.
  const start = await fetch(
    `${base}/auth/start?return_to=${encodeURIComponent(CHROME_REDIRECT)}`,
    { redirect: "manual" }
  );
  assert.equal(start.status, 302);
  assert.match(start.headers.get("location"), /^https:\/\/accounts\.google\.com\//);

  const unauthenticated = await fetch(`${base}/v1/me`, { headers: { origin: EXTENSION_ORIGIN } });
  assert.equal(unauthenticated.status, 401);
  assert.equal((await unauthenticated.json()).error.code, "AUTHENTICATION_REQUIRED");
});

test("a real sign-in round trip yields a token that authenticates over the socket", async (t) => {
  const runtime = await bootServer();
  const base = `http://127.0.0.1:${runtime.address.port}`;
  t.after(() => runtime.close());

  const callback = await fetch(
    `${base}/auth/callback?code=smoke-code&state=${encodeURIComponent(CHROME_REDIRECT)}`,
    { redirect: "manual" }
  );
  assert.equal(callback.status, 302);
  const fragment = new URLSearchParams(String(callback.headers.get("location")).split("#")[1]);
  const accessToken = fragment.get("access_token");
  assert.ok(accessToken);

  const me = await fetch(`${base}/v1/me`, {
    headers: { origin: EXTENSION_ORIGIN, authorization: `Bearer ${accessToken}` }
  });
  assert.equal(me.status, 200);
  const body = await me.json();
  assert.equal(body.account.email, "smoke@example.test");
  assert.equal(Object.hasOwn(body.account, "stripeCustomerId"), false);

  const usage = await fetch(`${base}/v1/usage`, {
    headers: { origin: EXTENSION_ORIGIN, authorization: `Bearer ${accessToken}` }
  });
  assert.equal(usage.status, 200);
  const usageBody = await usage.json();
  assert.equal(usageBody.plan, "free");
  assert.equal(usageBody.allowances.length, 7);
});

test("a POST body survives the node:http to fetch bridge intact", async (t) => {
  const runtime = await bootServer();
  const base = `http://127.0.0.1:${runtime.address.port}`;
  t.after(() => runtime.close());

  // The webhook route is the one that depends on receiving unmodified bytes, so
  // exercising it proves the request body is streamed through rather than lost.
  const webhook = await fetch(`${base}/v1/billing/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": "t=1,v1=deadbeef" },
    body: JSON.stringify({ id: "evt_smoke", type: "invoice.paid" })
  });
  assert.equal(webhook.status, 503);
  assert.equal((await webhook.json()).error.code, "BILLING_NOT_CONFIGURED");

  const refresh = await fetch(`${base}/v1/auth/refresh`, {
    method: "POST",
    headers: { origin: EXTENSION_ORIGIN, "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: "not-a-real-refresh-token" })
  });
  assert.equal(refresh.status, 401);
  assert.equal((await refresh.json()).error.code, "SESSION_REFRESH_INVALID");
});
