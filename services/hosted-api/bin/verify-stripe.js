#!/usr/bin/env node
const { resolve } = require("node:path");
const Stripe = require("stripe");
const { loadEnvFile } = require("../src/runtime/env.js");
const { SUPPORTED_STRIPE_API_VERSION } = require("../src/config.js");
const { formatReport, verifyStripeSetup } = require("../src/runtime/verify-stripe.js");

const envPath = process.env.HOSTED_ENV_FILE || resolve(process.cwd(), ".env.hosted");
loadEnvFile(envPath);

const secretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
const productId = String(process.env.STRIPE_PRODUCT_ID || "").trim();
const automaticTax = String(process.env.STRIPE_AUTOMATIC_TAX || "").trim().toLowerCase() === "true";

const stripe = /^sk_/.test(secretKey)
  ? new Stripe(secretKey, { apiVersion: SUPPORTED_STRIPE_API_VERSION, maxNetworkRetries: 2, timeout: 20_000 })
  : null;

verifyStripeSetup({ stripe, secretKey, productId, automaticTax })
  .then((result) => {
    console.log(formatReport(result));
    process.exit(result.ok ? 0 : 1);
  })
  .catch((error) => {
    console.error(`Stripe preflight could not run: ${error?.message || error}`);
    process.exit(1);
  });
