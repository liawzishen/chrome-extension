const test = require("node:test");
const assert = require("node:assert/strict");
const { MemoryHostedStore } = require("../services/hosted-api/src/adapters/memory-store.js");
const { createHostedApi } = require("../services/hosted-api/src/http-api.js");
const { UsageService } = require("../services/hosted-api/src/domain/usage-service.js");

const EXTENSION_ORIGIN = "chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

async function createApiFixture(overrides = {}) {
  const store = new MemoryHostedStore();
  const account = await store.createAccount({
    id: "account_http",
    email: "verified@example.test",
    emailVerified: true,
    createdAt: "2026-07-28T12:00:00.000Z"
  });
  const usageService = new UsageService({
    store,
    now: () => Date.parse("2026-07-28T12:00:00.000Z")
  });
  const api = createHostedApi({
    allowedOrigins: [EXTENSION_ORIGIN],
    authenticate: async (request) => (
      request.headers.get("authorization") === "Bearer valid-test-token"
        ? { accountId: account.id }
        : null
    ),
    config: { billingEnabled: false },
    store,
    usageService,
    ...overrides
  });
  return { account, api, store, usageService };
}

function extensionRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("origin", EXTENSION_ORIGIN);
  headers.set("authorization", "Bearer valid-test-token");
  return new Request(`https://api.example.test${path}`, {
    ...options,
    headers
  });
}

test("hosted API rejects missing origins and missing authentication", async () => {
  const { api } = await createApiFixture();
  const missingOrigin = await api(new Request("https://api.example.test/v1/me", {
    headers: { authorization: "Bearer valid-test-token" }
  }));
  assert.equal(missingOrigin.status, 403);
  assert.equal((await missingOrigin.json()).error.code, "ORIGIN_NOT_ALLOWED");

  const missingAuth = await api(new Request("https://api.example.test/v1/me", {
    headers: { origin: EXTENSION_ORIGIN }
  }));
  assert.equal(missingAuth.status, 401);
  assert.equal((await missingAuth.json()).error.code, "AUTHENTICATION_REQUIRED");
});

test("account and allowance reads expose only the bounded public projection", async () => {
  const { api } = await createApiFixture();
  const meResponse = await api(extensionRequest("/v1/me"));
  const me = await meResponse.json();
  assert.equal(meResponse.status, 200);
  assert.equal(me.account.id, "account_http");
  assert.equal(me.account.emailVerified, true);
  assert.equal(Object.hasOwn(me.account, "stripeCustomerId"), false);

  const usageResponse = await api(extensionRequest("/v1/usage"));
  const usage = await usageResponse.json();
  assert.equal(usageResponse.status, 200);
  assert.equal(usage.plan, "free");
  assert.equal(usage.allowances.length, 7);
});

test("billing endpoints stay closed when server billing is disabled", async () => {
  const { api } = await createApiFixture();
  const response = await api(extensionRequest("/v1/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ interval: "month" })
  }));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, "BILLING_NOT_CONFIGURED");
});

test("checkout cannot create a second subscription for an already entitled account", async () => {
  let checkoutCalled = false;
  const fixture = await createApiFixture({
    config: { billingEnabled: true },
    billingAdapter: {
      async createCheckoutSession() {
        checkoutCalled = true;
        return { id: "cs_test", url: "https://checkout.stripe.com/example" };
      }
    }
  });
  await fixture.store.transaction((state) => {
    state.subscriptions.set(fixture.account.id, {
      status: "active",
      createdAt: "2026-07-01T00:00:00.000Z",
      allowanceAnchorAt: "2026-07-01T00:00:00.000Z",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z"
    });
  });
  const response = await fixture.api(extensionRequest("/v1/billing/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": "checkout-duplicate-test"
    },
    body: JSON.stringify({ interval: "month" })
  }));
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error.code, "SUBSCRIPTION_ALREADY_ACTIVE");
  assert.equal(checkoutCalled, false);
});

test("Stripe webhook handling preserves the exact raw body and does not require browser auth", async () => {
  const seen = {};
  const { api } = await createApiFixture({
    config: { billingEnabled: true },
    billingAdapter: {
      constructWebhookEvent(rawBody, signature) {
        seen.rawBody = rawBody;
        seen.signature = signature;
        return {
          id: "evt_raw_body",
          type: "unhandled.example",
          created: 1_785_240_000,
          data: { object: {} }
        };
      }
    },
    billingService: {
      async processVerifiedEvent(event) {
        seen.event = event;
        return { duplicate: false, outcome: "ignored" };
      }
    }
  });
  const raw = "{\"spacing\":  true,\n\"value\":\"untouched\"}";
  const response = await api(new Request("https://api.example.test/v1/billing/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": "test-signature"
    },
    body: raw
  }));
  assert.equal(response.status, 200);
  assert.equal(seen.rawBody.toString("utf8"), raw);
  assert.equal(seen.signature, "test-signature");
  assert.equal(seen.event.id, "evt_raw_body");
});

test("unknown hosted routes return a stable no-store JSON error", async () => {
  const { api } = await createApiFixture();
  const response = await api(extensionRequest("/v1/not-real"));
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).error.code, "NOT_FOUND");
});
