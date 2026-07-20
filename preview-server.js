const http = require("http");
const { createReadStream } = require("fs");
const { extname, join } = require("path");

const PORT = Number(process.env.PREVIEW_PORT || 8788);
const ROOT = __dirname;
const FILES = new Map([
  ["/", "popup.html"],
  ["/popup.html", "popup.html"],
  ["/popup.css", "popup.css"],
  ["/popup-design-system.css", "popup-design-system.css"],
  ["/vintage-planner.css", "vintage-planner.css"],
  ["/popup.js", "popup.js"],
  ["/assets/page-actions/from-page.png", "assets/page-actions/from-page.png"],
  ["/assets/page-actions/from-video.png", "assets/page-actions/from-video.png"],
  ["/assets/page-actions/import-files.png", "assets/page-actions/import-files.png"],
  ["/assets/page-actions/paste-notes.png", "assets/page-actions/paste-notes.png"],
  ["/assets/page-actions/save-source.png", "assets/page-actions/save-source.png"],
  ["/assets/journey/hourglass-progress-cropped.png", "assets/journey/hourglass-progress-cropped.png"],
  ["/assets/journey/hourglass-average-cropped.png", "assets/journey/hourglass-average-cropped.png"],
  ["/assets/journey/hourglass-focus-cropped.png", "assets/journey/hourglass-focus-cropped.png"],
  ["/assets/journey/hourglass-focus-clean-v2.png", "assets/journey/hourglass-focus-clean-v2.png"],
  ["/assets/journey/hourglass-progress-glass-shell.png", "assets/journey/hourglass-progress-glass-shell.png"],
  ["/assets/journey/hourglass-progress-source-mask.png", "assets/journey/hourglass-progress-source-mask.png"],
  ["/assets/journey/hourglass-progress-destination-mask.png", "assets/journey/hourglass-progress-destination-mask.png"],
  ["/assets/journey/hourglass-progress-sand-texture.png", "assets/journey/hourglass-progress-sand-texture.png"],
  ["/assets/journey/hourglass-progress-sand-grains-v2.png", "assets/journey/hourglass-progress-sand-grains-v2.png"],
  ["/assets/journey/hourglass-average-vertical-glass-shell.png", "assets/journey/hourglass-average-vertical-glass-shell.png"],
  ["/assets/journey/hourglass-average-top-mask.png", "assets/journey/hourglass-average-top-mask.png"],
  ["/assets/journey/hourglass-average-bottom-mask.png", "assets/journey/hourglass-average-bottom-mask.png"],
  ["/assets/journey/hourglass-average-sand-texture.png", "assets/journey/hourglass-average-sand-texture.png"],
  ["/assets/journey/hourglass-average-sand-grains-v2.png", "assets/journey/hourglass-average-sand-grains-v2.png"],
  ["/focus-utils.js", "focus-utils.js"],
  ["/study-time-utils.js", "study-time-utils.js"],
  ["/journey-utils.js", "journey-utils.js"],
  ["/journey-worker-utils.js", "journey-worker-utils.js"],
  ["/journey-tree-utils.js", "journey-tree-utils.js"],
  ["/journey-tree.bundle.js", "journey-tree.bundle.js"],
  ["/video-utils.js", "video-utils.js"],
  ["/cheat-sheet-utils.js", "cheat-sheet-utils.js"],
  ["/document-reader-utils.js", "document-reader-utils.js"],
  ["/document-frame-reader.js", "document-frame-reader.js"],
  ["/document-reader-vendor.bundle.js", "document-reader-vendor.bundle.js"],
  ["/pdf-worker.bundle.mjs", "pdf-worker.bundle.mjs"],
  ["/tests/fixtures/document-frame-shell.html", "tests/fixtures/document-frame-shell.html"],
  ["/tests/fixtures/document-frame-child.html", "tests/fixtures/document-frame-child.html"],
  ["/tests/fixtures/tab-capture-harness.html", "tests/fixtures/tab-capture-harness.html"],
  ["/journey.html", "journey.html"],
  ["/journey.css", "journey.css"],
  ["/journey-page.js", "journey-page.js"],
  ["/export.html", "export.html"],
  ["/export.css", "export.css"],
  ["/export.js", "export.js"],
  ["/export-utils.js", "export-utils.js"],
  ["/export-vendor.bundle.js", "export-vendor.bundle.js"]
]);
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png"
};

const server = http.createServer((request, response) => {
  setPreviewSecurityHeaders(response);
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD");
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }
  let pathname;
  try {
    pathname = new URL(request.url, "http://127.0.0.1").pathname;
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }
  const filename = FILES.get(pathname);
  if (!filename) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": CONTENT_TYPES[extname(filename)] || "application/octet-stream"
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  const stream = createReadStream(join(ROOT, filename));
  stream.on("error", () => {
    if (!response.headersSent) response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Preview file unavailable");
  });
  stream.pipe(response);
});

server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;
server.maxHeadersCount = 48;
server.maxRequestsPerSocket = 100;

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Popup preview running at http://127.0.0.1:${PORT}`);
});

function setPreviewSecurityHeaders(response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self' http://127.0.0.1:* http://localhost:* https:; worker-src 'self' blob:; frame-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'"
  );
}
