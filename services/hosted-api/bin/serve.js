#!/usr/bin/env node
const { resolve } = require("node:path");
const { loadEnvFile } = require("../src/runtime/env.js");
const { describeStartupFailure, startHostedServer } = require("../src/runtime/serve.js");

const envPath = process.env.HOSTED_ENV_FILE || resolve(process.cwd(), ".env.hosted");
loadEnvFile(envPath);

startHostedServer()
  .then((runtime) => {
    const shutdown = (signal) => {
      console.log(`[NeatMind Hosted] ${signal} received, shutting down.`);
      runtime.close().then(
        () => process.exit(0),
        () => process.exit(1)
      );
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  })
  .catch((error) => {
    console.error(describeStartupFailure(error));
    process.exit(1);
  });
