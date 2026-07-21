(function initNeatMindBranding(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NeatMindBranding = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createNeatMindBranding() {
  const CURRENT_STORAGE_PREFIX = "neatMind";
  const LEGACY_STORAGE_PREFIX = "examCram";

  function toCurrentStorageKey(key) {
    const value = String(key || "");
    return value.startsWith(LEGACY_STORAGE_PREFIX)
      ? `${CURRENT_STORAGE_PREFIX}${value.slice(LEGACY_STORAGE_PREFIX.length)}`
      : value;
  }

  function isLegacyStorageKey(key) {
    return String(key || "").startsWith(LEGACY_STORAGE_PREFIX);
  }

  async function migrateStorageArea(storageArea) {
    if (!storageArea?.get || !storageArea?.set || !storageArea?.remove) return { migrated: 0 };
    const items = await storageArea.get(null);
    const updates = {};
    const obsoleteKeys = [];

    for (const [key, value] of Object.entries(items || {})) {
      if (!isLegacyStorageKey(key)) continue;
      const currentKey = toCurrentStorageKey(key);
      if (!Object.prototype.hasOwnProperty.call(items, currentKey)) updates[currentKey] = value;
      obsoleteKeys.push(key);
    }

    if (Object.keys(updates).length) await storageArea.set(updates);
    if (obsoleteKeys.length) await storageArea.remove(obsoleteKeys);
    return { migrated: obsoleteKeys.length };
  }

  function migrateLocalStorage(storage) {
    if (!storage?.length || typeof storage.key !== "function") return { migrated: 0 };
    const obsoleteKeys = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!isLegacyStorageKey(key)) continue;
      const currentKey = toCurrentStorageKey(key);
      if (storage.getItem(currentKey) === null) storage.setItem(currentKey, storage.getItem(key));
      obsoleteKeys.push(key);
    }

    obsoleteKeys.forEach((key) => storage.removeItem(key));
    return { migrated: obsoleteKeys.length };
  }

  return Object.freeze({
    CURRENT_STORAGE_PREFIX,
    LEGACY_STORAGE_PREFIX,
    toCurrentStorageKey,
    isLegacyStorageKey,
    migrateStorageArea,
    migrateLocalStorage
  });
});
