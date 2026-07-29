const { randomUUID } = require("crypto");
const { assertDomain } = require("./errors.js");

class AccountService {
  constructor(options) {
    assertDomain(options?.store, "STORE_REQUIRED", "A hosted account store is required.", 500);
    this.store = options.store;
    this.now = typeof options.now === "function" ? options.now : Date.now;
  }

  // Keyed on the provider subject rather than the email address. A learner who
  // changes their Google address keeps the same account, and its subscription,
  // instead of silently becoming a second unpaid identity.
  async findOrCreateByIdentity(identity) {
    const provider = String(identity?.provider || "").trim().toLowerCase();
    const subject = String(identity?.subject || "").trim();
    assertDomain(provider && subject, "IDENTITY_REQUIRED", "A verified identity is required.", 401);
    const email = String(identity?.email || "").trim().toLowerCase().slice(0, 320);
    const locale = String(identity?.locale || "en").slice(0, 20);
    const identityKey = `${provider}:${subject}`;

    return this.store.transaction((state) => {
      assertDomain(
        state.identityAccounts instanceof Map,
        "IDENTITY_STORE_UNAVAILABLE",
        "The hosted identity store is not configured.",
        500
      );
      const nowIso = new Date(this.now()).toISOString();
      const existingId = state.identityAccounts.get(identityKey);
      const existing = existingId ? state.accounts.get(existingId) : null;
      if (existing) {
        assertDomain(existing.state === "active", "ACCOUNT_UNAVAILABLE", "The account is not active.", 403);
        if (email && existing.email !== email) {
          existing.email = email;
          existing.emailVerified = identity?.emailVerified === true;
          existing.updatedAt = nowIso;
        }
        return { account: structuredClone(existing), created: false };
      }

      const id = randomUUID();
      const account = {
        id,
        state: "active",
        email,
        emailVerified: identity?.emailVerified === true,
        locale,
        billingRegion: "",
        stripeCustomerId: null,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      state.accounts.set(id, account);
      state.identityAccounts.set(identityKey, id);
      return { account: structuredClone(account), created: true };
    });
  }
}

module.exports = { AccountService };
