// Webhook delivery is not guaranteed. Stripe retries, but a signing-secret
// rotation, a deploy window, or a bug that returns 200 for an event it failed to
// apply all leave the same footprint: the learner paid and the service never
// noticed. Replaying events cannot fix that, because an undelivered event does not
// exist to replay. Reconciliation instead reads the current subscription object
// from Stripe and re-projects it, which converges regardless of what arrived.
const RECONCILE_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
  "paused",
  "disputed"
]);

function createSubscriptionReconciler(options) {
  const { billingAdapter, billingService, store, logger = console } = options || {};
  if (typeof billingAdapter?.retrieveSubscription !== "function") {
    throw new Error("A billing adapter with retrieveSubscription is required.");
  }
  if (typeof billingService?.reconcileSubscription !== "function") {
    throw new Error("A billing service with reconcileSubscription is required.");
  }
  const maxPerPass = Number.isFinite(options.maxPerPass) ? Math.max(1, options.maxPerPass) : 50;

  async function collectCandidates() {
    return store.transaction((state) => {
      const candidates = [];
      for (const [accountId, subscription] of state.subscriptions) {
        const status = String(subscription?.status || "").toLowerCase();
        const subscriptionId = String(subscription?.stripeSubscriptionId || "");
        if (!subscriptionId || !RECONCILE_STATUSES.has(status)) continue;
        candidates.push({ accountId, subscriptionId });
        if (candidates.length >= maxPerPass) break;
      }
      return candidates;
    });
  }

  async function runOnce() {
    const candidates = await collectCandidates();
    const summary = { checked: 0, reconciled: 0, failed: 0, outcomes: [] };
    for (const candidate of candidates) {
      summary.checked += 1;
      try {
        const live = await billingAdapter.retrieveSubscription(candidate.subscriptionId);
        const result = await billingService.reconcileSubscription(live);
        summary.reconciled += 1;
        summary.outcomes.push({ subscriptionId: candidate.subscriptionId, outcome: result?.outcome });
      } catch (error) {
        // One unreadable subscription must not stop the pass: the next account
        // may be the one whose payment went unnoticed.
        summary.failed += 1;
        logger.error?.("[NeatMind Hosted] subscription reconciliation failed", {
          subscriptionId: candidate.subscriptionId,
          code: error?.code,
          message: error?.message
        });
      }
    }
    return summary;
  }

  return { runOnce };
}

module.exports = { RECONCILE_STATUSES, createSubscriptionReconciler };
