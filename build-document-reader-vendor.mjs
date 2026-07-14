import { build } from "esbuild";

const shared = {
  bundle: true,
  platform: "browser",
  target: ["chrome116"],
  minify: true,
  legalComments: "none",
  sourcemap: false,
  logLevel: "info"
};

await Promise.all([
  build({
    ...shared,
    entryPoints: ["document-reader-vendor-entry.js"],
    outfile: "document-reader-vendor.bundle.js",
    format: "iife"
  }),
  build({
    ...shared,
    entryPoints: ["pdf-worker-entry.js"],
    outfile: "pdf-worker.bundle.mjs",
    format: "esm"
  })
]);
