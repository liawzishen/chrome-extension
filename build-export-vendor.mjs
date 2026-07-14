import { build } from "esbuild";
import { readFile } from "node:fs/promises";

const unsafeStringCallback = '"function" != typeof e && (e = new Function("" + e));';
const safeStringCallback = '"function" != typeof e && (() => { throw new TypeError("setImmediate callback must be a function"); })();';

await build({
  entryPoints: ["export-vendor-entry.js"],
  outfile: "export-vendor.bundle.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome116"],
  minify: true,
  legalComments: "none",
  sourcemap: false,
  logLevel: "info",
  plugins: [{
    name: "extension-safe-docx",
    setup(context) {
      context.onLoad({ filter: /node_modules[\\/]docx[\\/]dist[\\/]index\.mjs$/ }, async ({ path }) => {
        const original = await readFile(path, "utf8");
        if (!original.includes(unsafeStringCallback)) {
          throw new Error("The docx scheduler changed; review it before shipping extension code.");
        }
        return { contents: original.replace(unsafeStringCallback, safeStringCallback), loader: "js" };
      });
    }
  }]
});
