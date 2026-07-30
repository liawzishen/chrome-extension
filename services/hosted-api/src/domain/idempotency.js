function idempotencyIndex(accountId, idempotencyKey) {
  return `${String(accountId || "")}:${String(idempotencyKey || "")}`;
}

// Detailed finalized reservations may be pruned from the in-memory reference
// adapter, but this compact authority must survive. It contains only metering
// metadata plus an opaque result reference—never source text or generated output.
function createCommittedTombstone(reservation) {
  return {
    id: reservation.id,
    accountId: reservation.accountId,
    idempotencyKey: reservation.idempotencyKey,
    requestDigest: reservation.requestDigest,
    state: "committed",
    plan: reservation.plan,
    policyVersion: reservation.policyVersion,
    items: (Array.isArray(reservation.items) ? reservation.items : []).map((item) => ({
      action: item.action,
      bucketAction: item.bucketAction || item.action,
      unit: item.unit,
      units: item.units
    })),
    committedAt: reservation.committedAt || null,
    resultCode: reservation.resultCode || "OK",
    resultReference: reservation.resultReference || reservation.id,
    tombstone: true
  };
}

module.exports = {
  createCommittedTombstone,
  idempotencyIndex
};
