const { randomUUID } = require("crypto");
const { assertDomain } = require("../domain/errors.js");

class MemoryHostedStore {
  constructor(seed = {}) {
    this.state = {
      accounts: new Map(seed.accounts || []),
      subscriptions: new Map(seed.subscriptions || []),
      entitlements: new Map(seed.entitlements || []),
      reservations: new Map(seed.reservations || []),
      idempotency: new Map(seed.idempotency || []),
      processedBillingEvents: new Set(seed.processedBillingEvents || []),
      billingReceipts: new Map(seed.billingReceipts || []),
      customerAccounts: new Map(seed.customerAccounts || []),
      subscriptionAccounts: new Map(seed.subscriptionAccounts || [])
    };
    this.lock = Promise.resolve();
  }

  async transaction(operation) {
    let release;
    const previous = this.lock;
    this.lock = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    const snapshot = structuredClone(this.state);
    try {
      return await operation(this.state);
    } catch (error) {
      this.state = snapshot;
      throw error;
    } finally {
      release();
    }
  }

  async createAccount(input = {}) {
    return this.transaction((state) => {
      const id = normalizeId(input.id || randomUUID(), "account");
      assertDomain(!state.accounts.has(id), "ACCOUNT_EXISTS", "The account already exists.", 409);
      const now = new Date(input.createdAt || Date.now()).toISOString();
      const account = {
        id,
        state: "active",
        email: String(input.email || "").trim().toLowerCase().slice(0, 320),
        emailVerified: input.emailVerified === true,
        locale: String(input.locale || "en").slice(0, 20),
        billingRegion: String(input.billingRegion || "").slice(0, 8),
        stripeCustomerId: null,
        createdAt: now,
        updatedAt: now
      };
      state.accounts.set(id, account);
      return structuredClone(account);
    });
  }

  async getAccount(accountId) {
    return structuredClone(this.state.accounts.get(String(accountId)) || null);
  }
}

function normalizeId(value, label) {
  const id = String(value || "").trim();
  assertDomain(/^[a-zA-Z0-9_-]{3,100}$/.test(id), "INVALID_ID", `The ${label} identifier is invalid.`, 400);
  return id;
}

module.exports = { MemoryHostedStore };
