// First-party billing pages. These are the origins Stripe redirects back to and
// the portal returns to, so they must exist on the fixed PUBLIC_APP_ORIGIN.
//
// They are deliberately unauthenticated and informational. The extension already
// holds the hosted session, so it creates Checkout and Portal sessions through
// the API and opens Stripe's hosted URL directly; that keeps card entry on
// Stripe's domain and spares these pages a second sign-in surface to defend.
const PRODUCT_NAME = "NeatMind";

function formatUsd(cents) {
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

function layout({ title, heading, body, accent = "#5b8def" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)} · ${PRODUCT_NAME}</title>
<style>
  :root { color-scheme: light dark; --bg:#f6f7fb; --card:#fff; --ink:#171a21; --muted:#5b6270; --line:#e3e6ee; --accent:${accent}; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#101319; --card:#171b23; --ink:#eef1f7; --muted:#9aa3b4; --line:#262c38; }
  }
  * { box-sizing: border-box; }
  body { margin:0; padding:2.5rem 1.25rem; background:var(--bg); color:var(--ink);
         font:16px/1.6 -apple-system, "Segoe UI", Roboto, system-ui, sans-serif; }
  main { max-width: 46rem; margin: 0 auto; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:1.75rem; margin-bottom:1.25rem; }
  h1 { font-size:1.6rem; margin:0 0 .5rem; letter-spacing:-.01em; }
  h2 { font-size:1.05rem; margin:1.5rem 0 .5rem; }
  p { margin:.6rem 0; }
  .muted { color:var(--muted); }
  .brand { font-weight:700; letter-spacing:-.02em; color:var(--accent); margin-bottom:1.25rem; display:block; }
  .price { font-size:1.9rem; font-weight:700; letter-spacing:-.02em; }
  .row { display:flex; flex-wrap:wrap; gap:1rem; }
  .row > .card { flex:1 1 16rem; margin-bottom:0; }
  ul { padding-left:1.15rem; margin:.5rem 0; }
  li { margin:.3rem 0; }
  .note { border-left:3px solid var(--accent); padding-left:.9rem; }
  code { background:var(--bg); padding:.1rem .35rem; border-radius:4px; font-size:.9em; }
</style>
</head>
<body>
<main>
  <span class="brand">${PRODUCT_NAME}</span>
  <div class="card">
    <h1>${escapeHtml(heading)}</h1>
    ${body}
  </div>
  <p class="muted" style="font-size:.85rem">
    Questions about a charge? Reply to your Stripe receipt email, which reaches ${PRODUCT_NAME} billing support.
  </p>
</main>
</body>
</html>`;
}

function pricingPage(priceAmounts) {
  const monthly = formatUsd(priceAmounts.month);
  const annual = formatUsd(priceAmounts.year);
  const perMonth = formatUsd(Math.round(priceAmounts.year / 12));
  const savings = formatUsd(priceAmounts.month * 12 - priceAmounts.year);
  return layout({
    title: "Plans",
    heading: "Student Pro",
    body: `
    <p class="muted">Source-grounded exam preparation, without configuring an AI provider or giving up access to your work.</p>
    <div class="row" style="margin-top:1.25rem">
      <div class="card">
        <h2 style="margin-top:0">Monthly</h2>
        <div class="price">${monthly}</div>
        <p class="muted">${monthly} per month. Renews every month until canceled.</p>
      </div>
      <div class="card">
        <h2 style="margin-top:0">Annual</h2>
        <div class="price">${annual}</div>
        <p class="muted">${annual} billed once per year (about ${perMonth}/month). Renews every year until canceled. Saves ${savings} against paying monthly.</p>
      </div>
    </div>
    <h2>What Student Pro includes</h2>
    <ul>
      <li>Hosted AI with no provider setup or API key</li>
      <li>Higher monthly allowances for visual notes, quizzes, Visual Tutor follow-ups, and Journey summaries</li>
      <li>Multi-source chapter lessons built from every saved source</li>
      <li>Bounded captionless-video processing, with the minutes shown before processing starts</li>
    </ul>
    <p class="muted">Every hosted allowance is a stated number, shown in the extension before you start an action. Allowances do not roll over.</p>
    <h2>What stays free, always</h2>
    <ul>
      <li>Opening, searching, and exporting work you already created</li>
      <li>Evidence, citations, PDF pages, and video timestamps</li>
      <li>Journey history, mastery, and due-review state</li>
      <li>The local deterministic fallback and your own self-hosted backend</li>
    </ul>
    <div class="note" style="margin-top:1.5rem">
      <p><strong>Canceling never removes your work.</strong> It stops future renewals. Your notes, quizzes, evidence, exports, and Journey history stay readable, and future hosted actions simply use the Free allowances again.</p>
    </div>
    <p class="muted" style="margin-top:1.25rem">Start checkout from inside the ${PRODUCT_NAME} extension, where your remaining allowance and account are already signed in.</p>`
  });
}

function checkoutSuccessPage() {
  return layout({
    title: "Payment received",
    accent: "#2e9e6b",
    heading: "Payment received",
    body: `
    <p>Thank you. Your Student Pro subscription is being activated.</p>
    <p class="muted">Activation is confirmed by Stripe rather than by this page, so it can take a few seconds. Reopen the ${PRODUCT_NAME} extension and use <strong>Refresh account</strong> if your plan still shows as Free.</p>
    <p class="muted">Stripe has emailed your receipt, which shows the exact amount charged and the renewal date.</p>
    <p style="margin-top:1.5rem">You can close this tab.</p>`
  });
}

function checkoutCanceledPage() {
  return layout({
    title: "Checkout canceled",
    accent: "#b8863b",
    heading: "Checkout canceled",
    body: `
    <p>No payment was taken and nothing changed on your account.</p>
    <p class="muted">You can start checkout again from the ${PRODUCT_NAME} extension whenever you want. The Free plan keeps working in the meantime, and your existing work is untouched.</p>
    <p style="margin-top:1.5rem">You can close this tab.</p>`
  });
}

function accountPage() {
  return layout({
    title: "Account",
    heading: "Manage your subscription",
    body: `
    <p>Billing is managed through Stripe's secure customer portal, opened from inside the extension.</p>
    <h2>To change or cancel your plan</h2>
    <ul>
      <li>Open the ${PRODUCT_NAME} extension</li>
      <li>Choose <strong>Manage billing</strong> in the account section</li>
      <li>Stripe's portal opens, where you can update your payment method or cancel</li>
    </ul>
    <p class="muted">Cancelling takes effect at the end of the period you have already paid for, and the portal shows that exact end date before you confirm.</p>
    <div class="note" style="margin-top:1.5rem">
      <p>Cancelling stops future renewals only. Your saved notes, quizzes, evidence, exports, and Journey history remain available on the Free plan.</p>
    </div>`
  });
}

function errorPage(code, message) {
  return layout({
    title: "Something went wrong",
    accent: "#c0523f",
    heading: "Something went wrong",
    body: `
    <p>${escapeHtml(message || "The request could not be completed.")}</p>
    <p class="muted">Nothing was charged and your account was not changed. Try again from the ${PRODUCT_NAME} extension.</p>
    <p class="muted" style="font-size:.85rem">Reference: <code>${escapeHtml(code || "HOSTED_ERROR")}</code></p>`
  });
}

function notFoundPage() {
  return layout({
    title: "Not found",
    heading: "Page not found",
    body: `<p class="muted">This address does not exist on the ${PRODUCT_NAME} billing site.</p>`
  });
}

function signedInPage() {
  return layout({
    title: "Signed in",
    accent: "#2e9e6b",
    heading: "You are signed in",
    body: `
    <p>Return to the ${PRODUCT_NAME} extension to continue.</p>
    <p class="muted">You can close this tab.</p>`
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

module.exports = {
  PRODUCT_NAME,
  accountPage,
  checkoutCanceledPage,
  checkoutSuccessPage,
  errorPage,
  notFoundPage,
  pricingPage,
  signedInPage
};
