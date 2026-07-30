const { createHmac } = require("crypto");
const { HostedDomainError, assertDomain } = require("./domain/errors.js");
const { ACTIONS, isValidUsageUnits } = require("./domain/policy.js");

const JSON_BODY_LIMIT = 16 * 1024;
const GENERATION_BODY_LIMIT = 3 * 1024 * 1024;
const WEBHOOK_BODY_LIMIT = 1024 * 1024;
const WEBHOOK_PATH = "/v1/billing/webhook";
const CORS_ALLOWED_METHODS = "GET, POST, OPTIONS";
const CORS_ALLOWED_HEADERS = "authorization, content-type, idempotency-key";
const CORS_MAX_AGE_SECONDS = 600;
const MAX_GENERATION_ITEMS = 4;
const ALLOWED_USAGE_ACTIONS = new Set(Object.values(ACTIONS));

function createHostedApi(options) {
  assertDomain(typeof options?.authenticate === "function", "AUTHENTICATOR_REQUIRED", "A hosted authenticator is required.", 500);
  assertDomain(options?.store, "STORE_REQUIRED", "A hosted account store is required.", 500);
  assertDomain(options?.usageService, "USAGE_SERVICE_REQUIRED", "A hosted usage service is required.", 500);
  const allowedOrigins = normalizeAllowedOrigins(options.allowedOrigins);
  const requestFingerprintKey = normalizeRequestFingerprintKey(options);

  return async function handleHostedRequest(request) {
    let cors = { enabled: false, origin: "" };
    try {
      assertDomain(request && typeof request.url === "string", "REQUEST_INVALID", "A web Request is required.", 500);
      const url = new URL(request.url);
      if (url.pathname === WEBHOOK_PATH) {
        // Stripe calls the webhook server-to-server, so it never receives CORS headers.
        assertDomain(request.method === "POST", "NOT_FOUND", "The hosted endpoint was not found.", 404);
        return await handleWebhook(request, options);
      }

      cors = resolveCors(request, allowedOrigins);
      if (request.method === "OPTIONS") return preflightResponse(cors);
      return withCors(
        await routeBrowserRequest(request, url, options, allowedOrigins, requestFingerprintKey),
        cors
      );
    } catch (error) {
      return withCors(errorResponse(error), cors);
    }
  };
}

async function routeBrowserRequest(request, url, options, allowedOrigins, requestFingerprintKey) {
  enforceOrigin(request, allowedOrigins);
  const auth = await options.authenticate(request);
  assertDomain(auth?.accountId, "AUTHENTICATION_REQUIRED", "Sign in to continue.", 401);
  const account = await options.store.getAccount(auth.accountId);
  assertDomain(account?.state === "active", "ACCOUNT_UNAVAILABLE", "The account is not active.", 403);

  if (request.method === "GET" && url.pathname === "/v1/me") {
    return jsonResponse(200, {
      account: {
        id: account.id,
        email: account.email,
        emailVerified: account.emailVerified,
        locale: account.locale,
        state: account.state
      }
    });
  }
  if (request.method === "GET" && url.pathname === "/v1/entitlements") {
    return jsonResponse(200, {
      entitlement: await options.usageService.getEntitlement(account.id)
    });
  }
  if (request.method === "GET" && url.pathname === "/v1/usage") {
    return jsonResponse(200, await options.usageService.getUsage(account.id));
  }
  if (request.method === "POST" && url.pathname === "/v1/generate") {
    return await handleGeneration(request, options, account, requestFingerprintKey);
  }
  if (request.method === "POST" && url.pathname === "/v1/billing/checkout") {
    requireBilling(options);
    const entitlement = await options.usageService.getEntitlement(account.id);
    assertDomain(
      entitlement.plan !== "student_pro",
      "SUBSCRIPTION_ALREADY_ACTIVE",
      "This account already has Student Pro. Use Manage billing instead.",
      409
    );
    const body = await readBoundedJson(request, JSON_BODY_LIMIT);
    assertDomain(
      typeof options.checkoutService?.createSession === "function",
      "CHECKOUT_SERVICE_REQUIRED",
      "The hosted Checkout coordinator is not configured.",
      503
    );
    const session = await options.checkoutService.createSession({
      account,
      interval: body.interval,
      idempotencyKey: request.headers.get("idempotency-key")
    });
    return jsonResponse(201, { checkout: session });
  }
  if (request.method === "POST" && url.pathname === "/v1/billing/portal") {
    requireBilling(options);
    await readBoundedJson(request, JSON_BODY_LIMIT, { allowEmpty: true });
    const session = await options.billingAdapter.createPortalSession({
      account,
      idempotencyKey: request.headers.get("idempotency-key")
    });
    return jsonResponse(201, { portal: session });
  }

  return jsonResponse(404, {
    error: { code: "NOT_FOUND", message: "The hosted endpoint was not found." }
  });
}

async function handleGeneration(request, options, account, requestFingerprintKey) {
  assertDomain(
    typeof options.generationGateway?.execute === "function" &&
      typeof options.prepareGenerationRequest === "function" &&
      typeof options.validateGenerationResult === "function" &&
      typeof options.runGeneration === "function",
    "GENERATION_NOT_CONFIGURED",
    "Hosted generation is not configured.",
    503
  );
  const body = await readBoundedJson(request, GENERATION_BODY_LIMIT);
  const prepared = normalizePreparedGenerationRequest(
    await options.prepareGenerationRequest({ account, body })
  );
  const { items, operation } = prepared;
  const outcome = await options.generationGateway.execute({
    accountId: account.id,
    idempotencyKey: request.headers.get("idempotency-key"),
    items,
    // Derived here from the authenticated account and the exact request body: a
    // client-supplied fingerprint would let a caller forge or dodge idempotency.
    requestFingerprint: fingerprintGenerationRequest(
      account.id,
      items,
      body,
      requestFingerprintKey
    ),
    // Provider dispatch receives only the server-prepared operation/input. The
    // untrusted browser body is never an alternate way to select cheaper metering.
    run: () => options.runGeneration({
      account,
      input: prepared.input,
      items,
      operation
    }),
    validateResult: (result) => options.validateGenerationResult({
      account,
      input: prepared.input,
      items,
      operation,
      result
    }),
    loadCommittedResult: typeof options.loadGenerationResult === "function"
      ? (resultReference, reservation) => options.loadGenerationResult({
          account,
          items,
          operation,
          reservationId: reservation?.id || resultReference,
          resultReference
        })
      : undefined
  });
  return jsonResponse(200, {
    result: outcome.result,
    usage: outcome.usage,
    reservation: outcome.reservation,
    idempotentReplay: outcome.idempotentReplay === true
  });
}

function normalizePreparedGenerationRequest(value) {
  assertDomain(
    value && typeof value === "object" && !Array.isArray(value),
    "GENERATION_PREPARATION_INVALID",
    "The hosted generation adapter did not prepare a valid request.",
    500
  );
  const operation = String(value.operation || "").trim().toLowerCase();
  assertDomain(
    /^[a-z][a-z0-9_]{2,59}$/.test(operation),
    "GENERATION_PREPARATION_INVALID",
    "The hosted generation adapter did not identify a valid operation.",
    500
  );
  const source = value.items;
  assertDomain(
    Array.isArray(source) && source.length >= 1 && source.length <= MAX_GENERATION_ITEMS,
    "GENERATION_PREPARATION_INVALID",
    "The hosted generation adapter did not map one to four usage items.",
    500
  );
  const seenActions = new Set();
  const items = source.map((item) => {
    const action = String(item?.action || "").trim().toLowerCase();
    const units = item?.units === undefined || item?.units === null ? 1 : Number(item.units);
    assertDomain(
      ALLOWED_USAGE_ACTIONS.has(action) &&
        isValidUsageUnits(action, units) &&
        !seenActions.has(action),
      "GENERATION_PREPARATION_INVALID",
      "The hosted generation adapter produced an invalid usage item.",
      500
    );
    seenActions.add(action);
    return Object.freeze({ action, units });
  });
  return Object.freeze({
    input: value.input,
    items: Object.freeze(items),
    operation
  });
}

function fingerprintGenerationRequest(accountId, items, body, requestFingerprintKey) {
  return createHmac("sha256", requestFingerprintKey)
    .update(canonicalJson({ accountId, body, items }))
    .digest("hex");
}

function normalizeRequestFingerprintKey(options) {
  const generationConfigured =
    typeof options?.generationGateway?.execute === "function" &&
    typeof options?.runGeneration === "function";
  if (!generationConfigured) return null;
  assertDomain(
    typeof options.prepareGenerationRequest === "function",
    "GENERATION_PREPARER_REQUIRED",
    "Hosted generation requires a trusted server-side request preparer.",
    500
  );
  assertDomain(
    typeof options.validateGenerationResult === "function",
    "GENERATION_RESULT_VALIDATOR_REQUIRED",
    "Hosted generation requires a trusted server-side result validator.",
    500
  );
  const source = Buffer.isBuffer(options.requestFingerprintKey)
    ? options.requestFingerprintKey
    : Buffer.from(String(options.requestFingerprintKey || "").trim(), "utf8");
  assertDomain(
    source.byteLength >= 32,
    "REQUEST_FINGERPRINT_KEY_REQUIRED",
    "Hosted generation requires a server-only request HMAC key of at least 32 bytes.",
    500
  );
  return Buffer.from(source);
}

function canonicalJson(value) {
  // Key order in the incoming JSON must not change the fingerprint.
  return JSON.stringify(value, (key, entry) => (
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? Object.fromEntries(Object.keys(entry).sort().map((name) => [name, entry[name]]))
      : entry
  ));
}

async function handleWebhook(request, options) {
  requireBilling(options);
  assertDomain(options.billingService, "BILLING_SERVICE_REQUIRED", "The billing event service is not configured.", 503);
  const rawBody = await readBoundedBody(request, WEBHOOK_BODY_LIMIT, "The webhook body is too large.");
  const event = options.billingAdapter.constructWebhookEvent(
    rawBody,
    request.headers.get("stripe-signature")
  );
  const result = await options.billingService.processVerifiedEvent(event);
  return jsonResponse(200, { received: true, duplicate: result.duplicate });
}

function requireBilling(options) {
  assertDomain(
    options.config?.billingEnabled &&
      options.billingAdapter,
    "BILLING_NOT_CONFIGURED",
    "Hosted billing is not configured.",
    503
  );
}

function normalizeAllowedOrigins(values) {
  assertDomain(Array.isArray(values) && values.length > 0, "ORIGIN_ALLOWLIST_REQUIRED", "A hosted origin allowlist is required.", 500);
  const normalized = new Set();
  for (const value of values) {
    const origin = String(value || "").trim();
    assertDomain(isSecureAllowedOrigin(origin), "ORIGIN_ALLOWLIST_INVALID", "A hosted origin allowlist entry is invalid.", 500);
    normalized.add(origin);
  }
  return normalized;
}

function isSecureAllowedOrigin(origin) {
  if (/^chrome-extension:\/\/[a-p]{32}$/.test(origin)) return true;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === "https:" && parsed.origin === origin;
  } catch {
    return false;
  }
}

function resolveCors(request, allowedOrigins) {
  const origin = String(request.headers.get("origin") || "");
  return { enabled: true, origin: allowedOrigins.has(origin) ? origin : "" };
}

function withCors(response, cors) {
  if (!cors.enabled) return response;
  response.headers.set("vary", "Origin");
  if (cors.origin) response.headers.set("access-control-allow-origin", cors.origin);
  return response;
}

function preflightResponse(cors) {
  if (!cors.origin) {
    return withCors(
      errorResponse(new HostedDomainError("ORIGIN_NOT_ALLOWED", "This client origin is not allowed.", 403)),
      cors
    );
  }
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": cors.origin,
      "access-control-allow-methods": CORS_ALLOWED_METHODS,
      "access-control-allow-headers": CORS_ALLOWED_HEADERS,
      "access-control-max-age": String(CORS_MAX_AGE_SECONDS),
      vary: "Origin"
    }
  });
}

function enforceOrigin(request, allowedOrigins) {
  const origin = String(request.headers.get("origin") || "");
  assertDomain(
    allowedOrigins.has(origin),
    "ORIGIN_NOT_ALLOWED",
    "This client origin is not allowed.",
    403
  );
}

async function readBoundedJson(request, limit, options = {}) {
  const bytes = await readBoundedBody(request, limit, "The request body is too large.");
  if (bytes.byteLength === 0 && options.allowEmpty) return {};
  try {
    const value = JSON.parse(bytes.toString("utf8"));
    assertDomain(value && typeof value === "object" && !Array.isArray(value), "INVALID_JSON", "The request body must be a JSON object.");
    return value;
  } catch (error) {
    if (error instanceof HostedDomainError) throw error;
    throw new HostedDomainError("INVALID_JSON", "The request body contains invalid JSON.", 400);
  }
}

async function readBoundedBody(request, limit, message) {
  const declaredLength = Number(request.headers.get("content-length"));
  assertDomain(
    !Number.isFinite(declaredLength) || declaredLength <= limit,
    "BODY_TOO_LARGE",
    message,
    413
  );
  if (!request.body) return Buffer.alloc(0);
  assertDomain(
    typeof request.body.getReader === "function",
    "REQUEST_INVALID",
    "The request body stream is unavailable.",
    500
  );
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = Buffer.from(value);
      total += chunk.byteLength;
      if (total > limit) {
        await reader.cancel("body limit exceeded").catch(() => {});
        throw new HostedDomainError("BODY_TOO_LARGE", message, 413);
      }
      chunks.push(chunk);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total);
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function errorResponse(error) {
  if (error instanceof HostedDomainError) {
    const payload = {
      error: {
        code: error.code,
        message: error.message
      }
    };
    if (error.details !== undefined) payload.error.details = error.details;
    return jsonResponse(error.statusCode || 400, payload);
  }
  return jsonResponse(500, {
    error: {
      code: "INTERNAL_ERROR",
      message: "The hosted service could not complete the request."
    }
  });
}

module.exports = {
  GENERATION_BODY_LIMIT,
  JSON_BODY_LIMIT,
  WEBHOOK_BODY_LIMIT,
  createHostedApi,
  isSecureAllowedOrigin
};
