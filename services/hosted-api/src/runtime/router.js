const { HostedDomainError, assertDomain } = require("../domain/errors.js");
const {
  accountPage,
  checkoutCanceledPage,
  checkoutSuccessPage,
  errorPage,
  notFoundPage,
  pricingPage,
  signedInPage
} = require("./pages.js");

const AUTH_BODY_LIMIT = 8 * 1024;
// Chrome hands launchWebAuthFlow this exact origin, derived from the extension
// ID. Anything else is a redirect an attacker chose, and the fragment we send
// back carries session tokens.
const CHROME_REDIRECT_PATTERN = /^https:\/\/[a-p]{32}\.chromiumapp\.org\/$/;

function createRuntimeRouter(options) {
  assertDomain(typeof options?.hostedApi === "function", "HOSTED_API_REQUIRED", "The hosted API handler is required.", 500);
  assertDomain(options?.sessionService, "SESSION_SERVICE_REQUIRED", "A hosted session service is required.", 500);
  const allowedOrigins = new Set(options.allowedOrigins || []);
  const extraRedirects = new Set(
    (options.allowedRedirectUris || []).map((value) => String(value || "").trim()).filter(Boolean)
  );
  const priceAmounts = options.priceAmounts || { month: 499, year: 3999 };

  return async function handleRuntimeRequest(request) {
    let url;
    try {
      url = new URL(request.url);
    } catch {
      return htmlResponse(400, notFoundPage());
    }
    const path = url.pathname.replace(/\/+$/, "") || "/";

    try {
      if (request.method === "GET" && (path === "/healthz" || path === "/")) {
        return jsonResponse(200, { ok: true, service: "neatmind-hosted-api" });
      }
      if (request.method === "GET" && path === "/pricing") return htmlResponse(200, pricingPage(priceAmounts));
      if (request.method === "GET" && path === "/billing/success") return htmlResponse(200, checkoutSuccessPage());
      if (request.method === "GET" && path === "/billing/canceled") return htmlResponse(200, checkoutCanceledPage());
      if (request.method === "GET" && path === "/account") return htmlResponse(200, accountPage());
      if (request.method === "GET" && path === "/auth/signed-in") return htmlResponse(200, signedInPage());

      if (path === "/auth/start" && request.method === "GET") {
        return startSignIn(url, options, extraRedirects);
      }
      if (path === "/auth/callback" && request.method === "GET") {
        // Awaited deliberately: returning the promise would let a rejection skip
        // this try block and surface as an unhandled failure instead of a page.
        return await completeSignIn(url, options);
      }
      if (path === "/v1/auth/refresh" || path === "/v1/auth/signout") {
        return await handleSessionRoute(request, path, options, allowedOrigins);
      }
    } catch (error) {
      return errorResponse(error, isHtmlRoute(path));
    }

    return options.hostedApi(request);
  };
}

function startSignIn(url, options, extraRedirects) {
  assertDomain(options.oauth, "OAUTH_NOT_CONFIGURED", "Hosted sign-in is not configured.", 503);
  const returnTo = String(url.searchParams.get("return_to") || "").trim();
  assertDomain(
    CHROME_REDIRECT_PATTERN.test(returnTo) || extraRedirects.has(returnTo),
    "OAUTH_REDIRECT_NOT_ALLOWED",
    "This sign-in redirect target is not allowed.",
    400
  );
  return redirectResponse(options.oauth.buildAuthorizationUrl(returnTo));
}

async function completeSignIn(url, options) {
  assertDomain(options.oauth, "OAUTH_NOT_CONFIGURED", "Hosted sign-in is not configured.", 503);
  const providerError = url.searchParams.get("error");
  const state = options.oauth.verifyState(url.searchParams.get("state"));
  if (providerError) {
    // Report the refusal on the redirect the user came from, never as a bare
    // server error page they cannot get out of.
    return redirectResponse(`${state.returnTo}#error=${encodeURIComponent(String(providerError).slice(0, 80))}`);
  }
  const code = String(url.searchParams.get("code") || "").trim();
  assertDomain(code, "OAUTH_CODE_REQUIRED", "The sign-in response carried no authorization code.", 400);

  const identity = await options.oauth.exchangeCode(code);
  const { account } = await options.accountService.findOrCreateByIdentity(identity);
  const session = await options.sessionService.startSession(account.id);

  // Tokens travel in the fragment so they never reach a server log, a Referer
  // header, or the browser's history query string.
  const fragment = new URLSearchParams({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires_at: session.expiresAt,
    refresh_expires_at: session.refreshExpiresAt
  });
  return redirectResponse(`${state.returnTo}#${fragment.toString()}`);
}

async function handleSessionRoute(request, path, options, allowedOrigins) {
  const origin = String(request.headers.get("origin") || "");
  const corsOrigin = allowedOrigins.has(origin) ? origin : "";
  if (request.method === "OPTIONS") {
    if (!corsOrigin) return errorResponse(new HostedDomainError("ORIGIN_NOT_ALLOWED", "This client origin is not allowed.", 403));
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": corsOrigin,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "authorization, content-type",
        "access-control-max-age": "600",
        vary: "Origin"
      }
    });
  }
  assertDomain(request.method === "POST", "NOT_FOUND", "The hosted endpoint was not found.", 404);
  assertDomain(corsOrigin, "ORIGIN_NOT_ALLOWED", "This client origin is not allowed.", 403);

  const body = await readBoundedJson(request, AUTH_BODY_LIMIT);
  const refreshToken = String(body.refreshToken || "");
  let response;
  if (path === "/v1/auth/signout") {
    await options.sessionService.revoke(refreshToken);
    response = jsonResponse(200, { signedOut: true });
  } else {
    const session = await options.sessionService.refresh(refreshToken);
    response = jsonResponse(200, {
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
      refreshToken: session.refreshToken,
      refreshExpiresAt: session.refreshExpiresAt
    });
  }
  response.headers.set("vary", "Origin");
  response.headers.set("access-control-allow-origin", corsOrigin);
  return response;
}

async function readBoundedJson(request, limit) {
  const declared = Number(request.headers.get("content-length"));
  assertDomain(!Number.isFinite(declared) || declared <= limit, "BODY_TOO_LARGE", "The request body is too large.", 413);
  const text = await request.text();
  assertDomain(Buffer.byteLength(text, "utf8") <= limit, "BODY_TOO_LARGE", "The request body is too large.", 413);
  if (!text.trim()) return {};
  try {
    const value = JSON.parse(text);
    assertDomain(value && typeof value === "object" && !Array.isArray(value), "INVALID_JSON", "The request body must be a JSON object.");
    return value;
  } catch (error) {
    if (error instanceof HostedDomainError) throw error;
    throw new HostedDomainError("INVALID_JSON", "The request body contains invalid JSON.", 400);
  }
}

function isHtmlRoute(path) {
  return path.startsWith("/auth/") || path.startsWith("/billing/") || path === "/pricing" || path === "/account";
}

function redirectResponse(location) {
  return new Response(null, {
    status: 302,
    headers: { location, "cache-control": "no-store", "referrer-policy": "no-referrer" }
  });
}

function htmlResponse(status, html) {
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"
    }
  });
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

function errorResponse(error, asHtml = false) {
  const domain = error instanceof HostedDomainError;
  const status = domain ? error.statusCode || 400 : 500;
  const code = domain ? error.code : "INTERNAL_ERROR";
  // Only a domain error carries a message that was written to be read by a
  // person; anything else could leak internals into the page or the response.
  const message = domain ? error.message : "The hosted service could not complete the request.";
  if (asHtml) {
    return htmlResponse(status, status === 404 ? notFoundPage() : errorPage(code, message));
  }
  return jsonResponse(status, { error: { code, message } });
}

module.exports = { CHROME_REDIRECT_PATTERN, createRuntimeRouter };
