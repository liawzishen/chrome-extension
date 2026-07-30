const test = require("node:test");
const assert = require("node:assert/strict");
const { MemoryHostedStore } = require("../services/hosted-api/src/adapters/memory-store.js");
const {
  WEBHOOK_BODY_LIMIT,
  createHostedApi
} = require("../services/hosted-api/src/http-api.js");
const { HostedGenerationGateway } = require("../services/hosted-api/src/domain/generation-gateway.js");
const { UsageService } = require("../services/hosted-api/src/domain/usage-service.js");

const EXTENSION_ORIGIN = "chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const REQUEST_FINGERPRINT_KEY = "test-only-hosted-request-hmac-key-0001";

function prepareTestGenerationRequest({ body }) {
  const operation = String(body.operation || "");
  const itemsByOperation = {
    notes: [{ action: "study_build", units: 1 }],
    study_session: [
      { action: "study_build", units: 1 },
      { action: "quiz_build", units: 1 }
    ],
    quiz: [{ action: "quiz_build", units: 1 }]
  };
  const items = itemsByOperation[operation];
  if (!items) throw new Error("unsupported test operation");
  return {
    operation,
    items,
    input: body.input
  };
}

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
  const generationRuns = [];
  const api = createHostedApi({
    allowedOrigins: [EXTENSION_ORIGIN],
    authenticate: async (request) => (
      request.headers.get("authorization") === "Bearer valid-test-token"
        ? { accountId: account.id }
        : null
    ),
    config: { billingEnabled: false },
    generationGateway: new HostedGenerationGateway({ usageService }),
    prepareGenerationRequest: prepareTestGenerationRequest,
    requestFingerprintKey: REQUEST_FINGERPRINT_KEY,
    runGeneration: async (input) => {
      generationRuns.push(input);
      return { artifactId: `artifact_${generationRuns.length}` };
    },
    store,
    usageService,
    validateGenerationResult: ({ result }) => result,
    ...overrides
  });
  return { account, api, generationRuns, store, usageService };
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

test("checkout creation is routed through the account-scoped coordinator", async () => {
  const seen = [];
  const fixture = await createApiFixture({
    config: { billingEnabled: true },
    billingAdapter: {},
    checkoutService: {
      async createSession(input) {
        seen.push(input);
        return {
          id: "cs_test_coordinated",
          url: "https://checkout.stripe.com/c/pay/cs_test_coordinated",
          status: "open",
          expiresAt: "2026-07-29T12:00:00.000Z",
          idempotentReplay: false
        };
      }
    }
  });
  const response = await fixture.api(extensionRequest("/v1/billing/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": "checkout-http-key-0001"
    },
    body: JSON.stringify({
      interval: "month",
      priceId: "price_attacker_supplied"
    })
  }));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).checkout.id, "cs_test_coordinated");
  assert.equal(seen.length, 1);
  assert.equal(seen[0].account.id, fixture.account.id);
  assert.equal(seen[0].interval, "month");
  assert.equal(seen[0].idempotencyKey, "checkout-http-key-0001");
  assert.equal(Object.hasOwn(seen[0], "priceId"), false);
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

test("verified webhooks do not depend on a live Stripe Price lookup", async () => {
  let processed = false;
  const { api } = await createApiFixture({
    config: { billingEnabled: true },
    billingAdapter: {
      constructWebhookEvent() {
        return {
          id: "evt_offline_catalog",
          type: "unhandled.example",
          created: 1_785_240_000,
          data: { object: {} }
        };
      },
      async validatePriceCatalog() {
        throw new Error("Stripe catalog is temporarily unavailable");
      }
    },
    billingService: {
      async processVerifiedEvent() {
        processed = true;
        return { duplicate: false, outcome: "ignored" };
      }
    }
  });
  const response = await api(new Request("https://api.example.test/v1/billing/webhook", {
    method: "POST",
    headers: { "stripe-signature": "test-signature" },
    body: "{}"
  }));
  assert.equal(response.status, 200);
  assert.equal(processed, true);
});

test("an unauthenticated chunked webhook is stopped while streaming at the hard body limit", async () => {
  let signatureChecked = false;
  const { api } = await createApiFixture({
    config: { billingEnabled: true },
    billingAdapter: {
      constructWebhookEvent() {
        signatureChecked = true;
        return {};
      }
    },
    billingService: {
      async processVerifiedEvent() {
        throw new Error("must not process an oversized webhook");
      }
    }
  });
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(WEBHOOK_BODY_LIMIT));
      controller.enqueue(new Uint8Array(1));
      controller.close();
    }
  });
  const response = await api(new Request("https://api.example.test/v1/billing/webhook", {
    method: "POST",
    headers: { "stripe-signature": "test-signature" },
    body,
    duplex: "half"
  }));
  assert.equal(response.status, 413);
  assert.equal((await response.json()).error.code, "BODY_TOO_LARGE");
  assert.equal(signatureChecked, false);
});

test("hosted generation enforces the free study-build allowance on the server", async () => {
  const fixture = await createApiFixture();
  const statuses = [];
  let lastResponse = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    lastResponse = await fixture.api(extensionRequest("/v1/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": `study-build-attempt-${attempt}`
      },
      body: JSON.stringify({
        operation: "notes",
        input: { sourceId: `source-${attempt}` }
      })
    }));
    statuses.push(lastResponse.status);
  }

  assert.deepEqual(statuses, [200, 200, 200, 402]);
  const refused = await lastResponse.json();
  assert.equal(refused.error.code, "ALLOWANCE_EXHAUSTED");
  assert.equal(refused.error.details.action, "study_build");
  assert.equal(fixture.generationRuns.length, 3);
  assert.equal(fixture.generationRuns[0].operation, "notes");
  assert.deepEqual(fixture.generationRuns[0].input, { sourceId: "source-1" });
  assert.equal(Object.hasOwn(fixture.generationRuns[0], "body"), false);

  const usage = await (await fixture.api(extensionRequest("/v1/usage"))).json();
  const study = usage.allowances.find((item) => item.action === "study_build");
  assert.equal(study.committed, 3);
  assert.equal(study.remaining, 0);
});

test("hosted generation derives the request fingerprint on the server", async () => {
  const seen = [];
  const fixture = await createApiFixture({
    generationGateway: {
      async execute(input) {
        seen.push(input);
        return {
          result: await input.run(),
          usage: { plan: "free", allowances: [] },
          reservation: { id: "reservation_stub", state: "committed", plan: "free", items: [] }
        };
      }
    }
  });
  const clientClaim = "a".repeat(64);
  const generate = (sourceId, key) => fixture.api(extensionRequest("/v1/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": key },
    body: JSON.stringify({
      operation: "notes",
      action: "classification_batch",
      items: [{ action: "multi_source_preview", units: 1 }],
      units: 0,
      requestFingerprint: clientClaim,
      input: { sourceId }
    })
  }));

  assert.equal((await generate("source-a", "fingerprint-key-alpha")).status, 200);
  assert.equal((await generate("source-b", "fingerprint-key-bravo")).status, 200);
  assert.equal((await generate("source-a", "fingerprint-key-charlie")).status, 200);

  assert.equal(seen.length, 3);
  assert.equal(seen[0].idempotencyKey, "fingerprint-key-alpha");
  assert.match(seen[0].requestFingerprint, /^[a-f0-9]{64}$/);
  assert.notEqual(seen[0].requestFingerprint, clientClaim);
  assert.notEqual(seen[0].requestFingerprint, seen[1].requestFingerprint);
  assert.equal(seen[0].requestFingerprint, seen[2].requestFingerprint);
  assert.deepEqual(seen[0].items, [{ action: "study_build", units: 1 }]);
});

test("hosted generation fingerprints are keyed and fail closed without a strong server secret", async () => {
  const seen = [];
  const execute = async (input) => {
    seen.push(input.requestFingerprint);
    return {
      result: await input.run(),
      usage: { plan: "free", allowances: [] },
      reservation: { id: "reservation_stub", state: "committed", plan: "free", items: [] }
    };
  };
  const first = await createApiFixture({ generationGateway: { execute } });
  const second = await createApiFixture({
    generationGateway: { execute },
    requestFingerprintKey: "different-test-hosted-request-hmac-key-0002"
  });
  const body = JSON.stringify({
    operation: "notes",
    input: { sourceId: "same-source" }
  });

  assert.equal((await first.api(extensionRequest("/v1/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": "keyed-alpha" },
    body
  }))).status, 200);
  assert.equal((await second.api(extensionRequest("/v1/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": "keyed-bravo" },
    body
  }))).status, 200);
  assert.notEqual(seen[0], seen[1]);

  await assert.rejects(
    createApiFixture({ requestFingerprintKey: "too-short" }),
    (error) => error?.code === "REQUEST_FINGERPRINT_KEY_REQUIRED"
  );
  await assert.rejects(
    createApiFixture({ requestFingerprintKey: " ".repeat(40) }),
    (error) => error?.code === "REQUEST_FINGERPRINT_KEY_REQUIRED"
  );
  await assert.rejects(
    createApiFixture({ prepareGenerationRequest: undefined }),
    (error) => error?.code === "GENERATION_PREPARER_REQUIRED"
  );
  await assert.rejects(
    createApiFixture({ validateGenerationResult: undefined }),
    (error) => error?.code === "GENERATION_RESULT_VALIDATOR_REQUIRED"
  );
});

test("hosted generation accepts bounded study payloads larger than billing JSON", async () => {
  const fixture = await createApiFixture();
  const response = await fixture.api(extensionRequest("/v1/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": "larger-study-payload"
    },
    body: JSON.stringify({
      operation: "notes",
      input: { sourceText: "evidence ".repeat(3_000) }
    })
  }));
  assert.equal(response.status, 200);
  assert.equal(fixture.generationRuns.length, 1);
});

test("hosted generation refuses an unusable Idempotency-Key before provider work", async () => {
  const fixture = await createApiFixture();
  const response = await fixture.api(extensionRequest("/v1/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ operation: "notes", input: { sourceId: "source-a" } })
  }));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "IDEMPOTENCY_REQUIRED");
  assert.equal(fixture.generationRuns.length, 0);
});

test("hosted request preparation permits variable units only for video processing", async () => {
  const invalid = await createApiFixture({
    prepareGenerationRequest: () => ({
      operation: "notes",
      input: {},
      items: [{ action: "study_build", units: 2 }]
    })
  });
  const invalidResponse = await invalid.api(extensionRequest("/v1/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": "invalid-action-units"
    },
    body: JSON.stringify({ operation: "notes", input: {} })
  }));
  assert.equal(invalidResponse.status, 500);
  assert.equal(
    (await invalidResponse.json()).error.code,
    "GENERATION_PREPARATION_INVALID"
  );
  assert.equal(invalid.generationRuns.length, 0);

  const video = await createApiFixture({
    prepareGenerationRequest: () => ({
      operation: "video_transcript",
      input: { mediaId: "media-1" },
      items: [{ action: "video_processing", units: 1_234 }]
    })
  });
  const videoResponse = await video.api(extensionRequest("/v1/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": "valid-video-units"
    },
    body: JSON.stringify({ operation: "video_transcript", input: { mediaId: "media-1" } })
  }));
  assert.equal(videoResponse.status, 200);
  const payload = await videoResponse.json();
  assert.equal(
    payload.usage.allowances.find((item) => item.action === "video_processing").committed,
    1_234
  );
});

test("CORS preflight succeeds for allowlisted origins and is denied for unlisted ones", async () => {
  const { api } = await createApiFixture();
  const allowed = await api(new Request("https://api.example.test/v1/generate", {
    method: "OPTIONS",
    headers: {
      origin: EXTENSION_ORIGIN,
      "access-control-request-method": "POST",
      "access-control-request-headers": "authorization, content-type, idempotency-key"
    }
  }));
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get("access-control-allow-origin"), EXTENSION_ORIGIN);
  const allowedHeaders = String(allowed.headers.get("access-control-allow-headers") || "").toLowerCase();
  for (const header of ["authorization", "content-type", "idempotency-key"]) {
    assert.ok(allowedHeaders.includes(header), `preflight must allow ${header}`);
  }
  assert.ok(String(allowed.headers.get("access-control-allow-methods") || "").includes("POST"));
  assert.ok(Number(allowed.headers.get("access-control-max-age")) > 0);
  assert.match(String(allowed.headers.get("vary") || ""), /Origin/i);

  const unlisted = await api(new Request("https://api.example.test/v1/generate", {
    method: "OPTIONS",
    headers: { origin: "https://not-allowed.example", "access-control-request-method": "POST" }
  }));
  assert.equal(unlisted.headers.get("access-control-allow-origin"), null);
});

test("browser responses echo only the allowlisted origin and the webhook stays CORS-free", async () => {
  const { api } = await createApiFixture();
  const me = await api(extensionRequest("/v1/me"));
  assert.equal(me.status, 200);
  assert.equal(me.headers.get("access-control-allow-origin"), EXTENSION_ORIGIN);
  assert.match(String(me.headers.get("vary") || ""), /Origin/i);

  const rejected = await api(new Request("https://api.example.test/v1/me", {
    headers: { origin: "https://not-allowed.example", authorization: "Bearer valid-test-token" }
  }));
  assert.equal(rejected.status, 403);
  assert.equal(rejected.headers.get("access-control-allow-origin"), null);

  const webhookFixture = await createApiFixture({
    config: { billingEnabled: true },
    billingAdapter: {
      constructWebhookEvent() {
        return { id: "evt_cors", type: "unhandled.example", created: 1_785_240_000, data: { object: {} } };
      }
    },
    billingService: {
      async processVerifiedEvent() {
        return { duplicate: false, outcome: "ignored" };
      }
    }
  });
  const webhook = await webhookFixture.api(new Request("https://api.example.test/v1/billing/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": "test-signature",
      origin: EXTENSION_ORIGIN
    },
    body: "{}"
  }));
  assert.equal(webhook.status, 200);
  assert.equal(webhook.headers.get("access-control-allow-origin"), null);
});

test("unknown hosted routes return a stable no-store JSON error", async () => {
  const { api } = await createApiFixture();
  const response = await api(extensionRequest("/v1/not-real"));
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).error.code, "NOT_FOUND");
});
