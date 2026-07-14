import { build } from "esbuild";

await build({
  entryPoints: ["journey-tree-entry.js"],
  outfile: "journey-tree.bundle.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome116"],
  minify: true,
  legalComments: "none",
  sourcemap: false,
  logLevel: "info"
});
