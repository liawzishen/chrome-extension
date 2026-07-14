const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const backgroundSource = fs.readFileSync(path.join(root, "background.js"), "utf8");

test("manifest exposes a Chrome 116 global side panel instead of a temporary action popup", () => {
  assert.equal(manifest.version, "0.6.0");
  assert.ok(Number.parseInt(manifest.minimum_chrome_version, 10) >= 116);
  assert.equal(manifest.side_panel?.default_path, "popup.html");
  assert.ok(manifest.permissions.includes("sidePanel"));
  assert.equal(Object.hasOwn(manifest.action || {}, "default_popup"), false);
  assert.equal(manifest.commands?._execute_action?.suggested_key?.default, "Ctrl+Shift+Y");
});

test("manifest declares the exact optional all-sites superset used by Focus", () => {
  assert.ok(manifest.optional_host_permissions.includes("*://*/*"));
  assert.ok(manifest.optional_host_permissions.includes("file:///*"));
});

test("manifest explicitly locks extension pages to locally bundled scripts", () => {
  assert.equal(
    manifest.content_security_policy?.extension_pages,
    "script-src 'self'; object-src 'none'; base-uri 'none'"
  );
  assert.equal(Object.hasOwn(manifest, "externally_connectable"), false);
  assert.equal(Object.hasOwn(manifest, "web_accessible_resources"), false);
});

test("worker opens the global panel from a real action event so Chrome grants activeTab", () => {
  assert.match(
    backgroundSource,
    /chrome\.sidePanel\.setPanelBehavior\(\{ openPanelOnActionClick: false \}\)/
  );
  const actionHandler = backgroundSource.match(/chrome\.action\.onClicked\.addListener\(\(tab\) => \{([\s\S]*?)\n\}\);/)?.[1] || "";
  const openIndex = actionHandler.indexOf("chrome.sidePanel.open({ windowId })");
  const awaitIndex = actionHandler.indexOf("await ");
  assert.ok(openIndex >= 0, "the action event must open the global side panel");
  assert.ok(awaitIndex < 0 || openIndex < awaitIndex, "sidePanel.open must keep the action's user gesture");
  assert.match(actionHandler, /authorizeArmedVideoCaptureFromAction\(tab\)/);
  assert.match(backgroundSource, /configureGlobalSidePanel\("extension install"\)/);
  assert.match(backgroundSource, /configureGlobalSidePanel\("browser startup"\)/);
  assert.match(backgroundSource, /configureGlobalSidePanel\("worker start"\)/);
});

test("worker validates the loaded permission manifest before checking or installing Focus rules", () => {
  const validateIndex = backgroundSource.indexOf("Focus.validateFocusPermissionManifest(chrome.runtime.getManifest())");
  const containsIndex = backgroundSource.indexOf("const missingOrigins = await findMissingHostOrigins(rules)");
  const dnrIndex = backgroundSource.indexOf("await replaceManagedSessionRules(Focus.buildSessionDnrRules(next.rules))");
  assert.ok(validateIndex > -1);
  assert.ok(containsIndex > validateIndex);
  assert.ok(dnrIndex > containsIndex);
  assert.match(backgroundSource, /chrome\.permissions\.contains\(\{ origins: \[origin\] \}\)/);
});
