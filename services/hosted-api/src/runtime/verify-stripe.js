const { DEFAULT_PRICE_AMOUNTS } = require("../config.js");

// Read-only preflight. It never creates, updates, or deletes anything in the
// Stripe account: the point is to answer "is this account shaped the way the
// service already demands?" before billing is switched on, not to change it.
//
// The service validates the same catalog again at Checkout time
// (stripe-billing.js retrieveAndValidatePrice). This exists so a mismatch is a
// clear message on a terminal now, instead of a 503 in front of a paying user.
const EXPECTED = Object.freeze([
  { key: "month", interval: "month", amount: DEFAULT_PRICE_AMOUNTS.month, envVar: "STRIPE_PRICE_PRO_MONTHLY" },
  { key: "year", interval: "year", amount: DEFAULT_PRICE_AMOUNTS.year, envVar: "STRIPE_PRICE_PRO_ANNUAL" }
]);

function formatUsd(cents) {
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

async function verifyStripeSetup(options) {
  const stripe = options?.stripe;
  const secretKey = String(options?.secretKey || "");
  const productId = String(options?.productId || "").trim();
  const automaticTax = options?.automaticTax;
  const findings = [];
  const envLines = [];
  let livemode = null;

  const add = (level, message, detail) => findings.push({ level, message, detail });

  if (!/^sk_(?:test|live)_[A-Za-z0-9]+$/.test(secretKey)) {
    add("fail", "STRIPE_SECRET_KEY is missing or malformed.", "Expected sk_test_... or sk_live_...");
    return { ok: false, livemode, findings, envLines };
  }
  livemode = secretKey.startsWith("sk_live_");
  if (livemode) {
    add(
      "warn",
      "This is a LIVE secret key. Every checkout you test will move real money.",
      "Verify with a sk_test_ key first; switch to live only after the reviews are done."
    );
  } else {
    add("pass", "Using a test-mode secret key.", "No real money can move.");
  }

  if (!productId) {
    add("fail", "No product id supplied.", "Set STRIPE_PRODUCT_ID in .env.hosted (used only by this preflight).");
    return { ok: false, livemode, findings, envLines };
  }

  let product;
  try {
    product = await stripe.products.retrieve(productId);
  } catch (error) {
    add("fail", `Product ${productId} could not be read.`, describeStripeError(error, livemode));
    return { ok: false, livemode, findings, envLines };
  }
  if (product?.active === false) {
    add("fail", `Product ${productId} is archived.`, "Reactivate it, or point STRIPE_PRODUCT_ID at the live one.");
  } else {
    add("pass", `Product ${productId} found: "${product?.name || "unnamed"}".`);
  }

  let prices = [];
  try {
    const listed = await stripe.prices.list({ product: productId, active: true, limit: 100 });
    prices = Array.isArray(listed?.data) ? listed.data : [];
  } catch (error) {
    add("fail", "The product's prices could not be listed.", describeStripeError(error, livemode));
    return { ok: false, livemode, findings, envLines };
  }

  for (const expected of EXPECTED) {
    const matches = prices.filter((price) => (
      price?.type === "recurring" &&
      price?.recurring?.interval === expected.interval &&
      Number(price?.recurring?.interval_count) === 1 &&
      price?.currency === "usd" &&
      price?.unit_amount === expected.amount
    ));

    if (matches.length === 1) {
      add(
        "pass",
        `${expected.interval}ly price found at ${formatUsd(expected.amount)}: ${matches[0].id}`
      );
      envLines.push(`${expected.envVar}=${matches[0].id}`);
      if (automaticTax === true && !hasExplicitTaxBehavior(matches[0])) {
        add(
          "fail",
          `${matches[0].id} has tax_behavior "unspecified" but STRIPE_AUTOMATIC_TAX is true.`,
          "Stripe Tax rejects prices without an explicit inclusive/exclusive tax behavior. Set STRIPE_AUTOMATIC_TAX=false, or set the price's tax behavior."
        );
      }
      continue;
    }

    if (matches.length > 1) {
      add(
        "fail",
        `${matches.length} active ${expected.interval}ly prices at ${formatUsd(expected.amount)} on this product.`,
        `Archive the duplicates so one is unambiguous: ${matches.map((price) => price.id).join(", ")}`
      );
      continue;
    }

    const nearMiss = prices.find((price) => price?.recurring?.interval === expected.interval);
    add(
      "fail",
      `No active ${expected.interval}ly price at ${formatUsd(expected.amount)} USD on this product.`,
      nearMiss
        ? `Closest match ${nearMiss.id} is ${formatUsd(nearMiss.unit_amount)} ${String(nearMiss.currency).toUpperCase()}`
          + ` every ${nearMiss.recurring?.interval_count || 1} ${nearMiss.recurring?.interval}.`
          + ` The service requires exactly ${formatUsd(expected.amount)} USD, interval_count 1.`
        : `Create a recurring USD price of ${formatUsd(expected.amount)} per ${expected.interval} on this product.`
    );
  }

  const strays = prices.filter((price) => (
    price?.type === "recurring" &&
    !EXPECTED.some((expected) => (
      price.recurring?.interval === expected.interval &&
      price.unit_amount === expected.amount &&
      price.currency === "usd"
    ))
  ));
  if (strays.length > 0) {
    add(
      "warn",
      `${strays.length} other active recurring price(s) on this product.`,
      `The service will refuse any of them at Checkout: ${strays.map((price) => `${price.id} (${formatUsd(price.unit_amount)} ${String(price.currency).toUpperCase()}/${price.recurring?.interval})`).join(", ")}`
    );
  }

  try {
    const configurations = await stripe.billingPortal.configurations.list({ limit: 10 });
    const active = (configurations?.data || []).filter((entry) => entry?.active !== false);
    if (active.length === 0) {
      add(
        "fail",
        "No active Customer Portal configuration.",
        "Manage billing will fail. Configure it at Stripe -> Settings -> Billing -> Customer portal, enabling cancellation and payment-method updates."
      );
    } else {
      const cancellation = active.some((entry) => entry?.features?.subscription_cancel?.enabled === true);
      add(
        cancellation ? "pass" : "warn",
        cancellation
          ? "Customer Portal is configured and allows cancellation."
          : "Customer Portal exists but does not expose subscription cancellation.",
        cancellation
          ? undefined
          : "Self-service cancellation is a launch requirement; enable it in the portal settings."
      );
    }
  } catch (error) {
    add("warn", "The Customer Portal configuration could not be read.", describeStripeError(error, livemode));
  }

  const ok = !findings.some((finding) => finding.level === "fail");
  return { ok, livemode, findings, envLines };
}

function hasExplicitTaxBehavior(price) {
  const behavior = String(price?.tax_behavior || "unspecified");
  return behavior === "inclusive" || behavior === "exclusive";
}

function describeStripeError(error, livemode) {
  const type = error?.type || error?.raw?.type || "";
  const message = error?.message || String(error);
  if (type === "StripeAuthenticationError") return "The secret key was rejected by Stripe.";
  if (String(error?.code || error?.raw?.code) === "resource_missing") {
    return `Not found in ${livemode ? "live" : "test"} mode. Objects created in one mode do not exist in the other.`;
  }
  return message;
}

function formatReport(result) {
  const symbols = { pass: "  OK  ", warn: " WARN ", fail: " FAIL " };
  const lines = result.findings.map((finding) => {
    const head = `[${symbols[finding.level] || "      "}] ${finding.message}`;
    return finding.detail ? `${head}\n           ${finding.detail}` : head;
  });
  lines.push("");
  if (result.envLines.length > 0) {
    lines.push("Paste these into .env.hosted:");
    lines.push(...result.envLines.map((line) => `  ${line}`));
    lines.push("");
  }
  lines.push(
    result.ok
      ? "Stripe setup matches the approved catalog."
      : "Stripe setup is NOT ready. Fix the FAIL items above and run this again."
  );
  return lines.join("\n");
}

module.exports = { EXPECTED, formatReport, verifyStripeSetup };
