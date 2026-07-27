const { HostedDomainError, assertDomain } = require("./domain/errors.js");

const JSON_BODY_LIMIT = 16 * 1024;
const WEBHOOK_BODY_LIMIT = 1024 * 1024;

function createHostedApi(options) {
  assertDomain(typeof options?.authenticate === "function", "AUTHENTICATOR_REQUIRED", "A hosted authenticator is required.", 500);
  assertDomain(options?.store, "STORE_REQUIRED", "A hosted account store is required.", 500);
  assertDomain(options?.usageService, "USAGE_SERVICE_REQUIRED", "A hosted usage service is required.", 500);
  const allowedOrigins = normalizeAllowedOrigins(options.allowedOrigins);

  return async function handleHostedRequest(request) {
    try {
      assertDomain(request && typeof request.url === "string", "REQUEST_INVALID", "A web Request is required.", 500);
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/v1/billing/webhook") {
        return await handleWebhook(request, options);
      }

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
        const session = await options.billingAdapter.createCheckoutSession({
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
    } catch (error) {
      return errorResponse(error);
    }
  };
}

async function handleWebhook(request, options) {
  requireBilling(options);
  assertDomain(options.billingService, "BILLING_SERVICE_REQUIRED", "The billing event service is not configured.", 503);
  const rawBody = Buffer.from(await request.arrayBuffer());
  assertDomain(rawBody.byteLength <= WEBHOOK_BODY_LIMIT, "BODY_TOO_LARGE", "The webhook body is too large.", 413);
  const event = options.billingAdapter.constructWebhookEvent(
    rawBody,
    request.headers.get("stripe-signature")
  );
  if (typeof options.billingAdapter.validatePriceCatalog === "function") {
    await options.billingAdapter.validatePriceCatalog();
  }
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
  const declaredLength = Number(request.headers.get("content-length"));
  assertDomain(
    !Number.isFinite(declaredLength) || declaredLength <= limit,
    "BODY_TOO_LARGE",
    "The request body is too large.",
    413
  );
  const bytes = Buffer.from(await request.arrayBuffer());
  assertDomain(bytes.byteLength <= limit, "BODY_TOO_LARGE", "The request body is too large.", 413);
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
  JSON_BODY_LIMIT,
  WEBHOOK_BODY_LIMIT,
  createHostedApi,
  isSecureAllowedOrigin
};
