const test = require("node:test");
const assert = require("node:assert/strict");

const Branding = require("../branding-utils.js");

function createStorage(initial) {
  const values = { ...initial };
  return {
    values,
    async get() {
      return { ...values };
    },
    async set(updates) {
      Object.assign(values, updates);
    },
    async remove(keys) {
      keys.forEach((key) => delete values[key]);
    }
  };
}

test("maps legacy storage keys into the NeatMind namespace", () => {
  assert.equal(Branding.toCurrentStorageKey("examCramSettings"), "neatMindSettings");
  assert.equal(Branding.toCurrentStorageKey("neatMindSettings"), "neatMindSettings");
  assert.equal(Branding.isLegacyStorageKey("examCramLearningJourney"), true);
  assert.equal(Branding.isLegacyStorageKey("neatMindLearningJourney"), false);
});

test("migrates legacy storage data without overwriting a newer NeatMind value", async () => {
  const storage = createStorage({
    examCramSettings: { apiEndpoint: "http://127.0.0.1:8787/api/study-session" },
    examCramSessions: [{ id: "legacy" }],
    neatMindSessions: [{ id: "current" }]
  });

  const result = await Branding.migrateStorageArea(storage);

  assert.equal(result.migrated, 2);
  assert.deepEqual(storage.values.neatMindSettings, { apiEndpoint: "http://127.0.0.1:8787/api/study-session" });
  assert.deepEqual(storage.values.neatMindSessions, [{ id: "current" }]);
  assert.equal("examCramSettings" in storage.values, false);
  assert.equal("examCramSessions" in storage.values, false);
});
