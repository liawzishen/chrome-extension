const http = require("node:http");
const https = require("node:https");
const { readFileSync } = require("node:fs");
const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");

const REQUEST_TIMEOUT_MS = 30_000;
const BODYLESS_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Bridges Node's http server onto the fetch-style handler the hosted API is
// written against. The request body is passed through as a stream rather than
// buffered here, so the per-route limits in http-api.js stay authoritative and
// the webhook still sees the exact bytes Stripe signed.
function createHostedHttpServer(options) {
  const handler = options?.handler;
  if (typeof handler !== "function") throw new Error("A fetch-style request handler is required.");
  const fallbackOrigin = String(options.publicAppOrigin || "https://localhost").replace(/\/+$/, "");

  const listener = (incoming, serverResponse) => {
    respond(incoming, serverResponse, handler, fallbackOrigin).catch(() => {
      if (!serverResponse.headersSent) serverResponse.writeHead(500, { "content-type": "application/json" });
      serverResponse.end(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Request failed." } }));
    });
  };

  const server = options.tls?.key && options.tls?.cert
    ? https.createServer({ key: options.tls.key, cert: options.tls.cert }, listener)
    : http.createServer(listener);
  server.requestTimeout = REQUEST_TIMEOUT_MS;
  server.headersTimeout = REQUEST_TIMEOUT_MS;

  return {
    server,
    secure: Boolean(options.tls?.key && options.tls?.cert),
    listen(port, host) {
      return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, host, () => {
          server.removeListener("error", reject);
          resolve(server.address());
        });
      });
    },
    close() {
      return new Promise((resolve) => server.close(() => resolve()));
    }
  };
}

async function respond(incoming, serverResponse, handler, fallbackOrigin) {
  const request = toFetchRequest(incoming, fallbackOrigin);
  const response = await handler(request);
  const headers = {};
  for (const [name, value] of response.headers) headers[name] = value;
  serverResponse.writeHead(response.status, headers);
  if (!response.body) {
    serverResponse.end();
    return;
  }
  await pipeline(Readable.fromWeb(response.body), serverResponse);
}

function toFetchRequest(incoming, fallbackOrigin) {
  const headers = new Headers();
  for (let index = 0; index < incoming.rawHeaders.length; index += 2) {
    const name = incoming.rawHeaders[index];
    const value = incoming.rawHeaders[index + 1];
    // Repeated headers must accumulate, not overwrite; dropping one silently is
    // how a second Stripe-Signature scheme would go missing.
    try {
      headers.append(name, value);
    } catch {
      // Ignore header names Node accepted but the Headers class rejects.
    }
  }
  const method = String(incoming.method || "GET").toUpperCase();
  const init = { method, headers };
  if (!BODYLESS_METHODS.has(method)) {
    init.body = Readable.toWeb(incoming);
    init.duplex = "half";
  }
  return new Request(buildUrl(incoming, fallbackOrigin), init);
}

function buildUrl(incoming, fallbackOrigin) {
  const path = String(incoming.url || "/");
  const host = String(incoming.headers?.host || "");
  const scheme = incoming.socket?.encrypted ? "https" : "http";
  // A malformed Host header must not be able to steer URL parsing.
  if (/^[a-z0-9.\-]+(:\d{1,5})?$/i.test(host)) {
    try {
      return new URL(path, `${scheme}://${host}`).href;
    } catch {
      // fall through to the configured origin
    }
  }
  return new URL(path, `${fallbackOrigin}/`).href;
}

function readTlsMaterial(certPath, keyPath) {
  if (!certPath || !keyPath) return null;
  return { cert: readFileSync(certPath), key: readFileSync(keyPath) };
}

module.exports = { createHostedHttpServer, readTlsMaterial };
