const { HostedDomainError, assertDomain } = require("./errors.js");

class HostedGenerationGateway {
  constructor(options) {
    assertDomain(options?.usageService, "USAGE_SERVICE_REQUIRED", "A hosted usage service is required.", 500);
    this.usageService = options.usageService;
  }

  async execute(input) {
    assertDomain(
      typeof input?.run === "function",
      "GENERATION_HANDLER_REQUIRED",
      "A hosted generation handler is required.",
      500
    );
    assertDomain(
      typeof input?.validateResult === "function",
      "GENERATION_RESULT_VALIDATOR_REQUIRED",
      "A hosted generation result validator is required.",
      500
    );
    const reservation = await this.usageService.reserve({
      accountId: input.accountId,
      idempotencyKey: input.idempotencyKey,
      items: input.items,
      requestFingerprint: input.requestFingerprint
    });

    if (reservation.idempotentReplay) {
      return this.replayExisting(input, reservation);
    }

    try {
      const result = await input.validateResult(await input.run());
      // The reservation ID is the default opaque artifact/result-store key. A
      // durable adapter may supply another bounded reference when committing.
      const committed = await this.usageService.commit(
        reservation.id,
        "OK",
        input.resultReference || reservation.id
      );
      const usage = await this.usageService.getUsage(input.accountId);
      return {
        result,
        usage,
        reservation: summarizeReservation(committed)
      };
    } catch (error) {
      await this.usageService.release(
        reservation.id,
        normalizeFailureCode(error)
      ).catch(() => {});
      throw error;
    }
  }

  async replayExisting(input, reservation) {
    if (reservation.state === "committed" && typeof input.loadCommittedResult === "function") {
      const loaded = await input.loadCommittedResult(
        reservation.resultReference || reservation.id,
        reservation
      );
      assertDomain(
        loaded !== undefined,
        "IDEMPOTENT_RESULT_UNAVAILABLE",
        "The completed hosted result is not available for replay.",
        409
      );
      const result = await input.validateResult(loaded);
      return {
        result,
        usage: await this.usageService.getUsage(input.accountId),
        reservation: summarizeReservation(reservation),
        idempotentReplay: true
      };
    }
    const inProgress = reservation.state === "reserved";
    const code = inProgress
      ? "IDEMPOTENT_OPERATION_IN_PROGRESS"
      : "IDEMPOTENT_RESULT_UNAVAILABLE";
    const message = inProgress
      ? "An identical hosted request is already in progress."
      : "This hosted request was already finalized; replay its stored result instead of running provider work again.";
    throw new HostedDomainError(code, message, 409);
  }
}

function summarizeReservation(reservation) {
  return {
    id: reservation.id,
    state: reservation.state,
    plan: reservation.plan,
    policyVersion: reservation.policyVersion,
    items: reservation.items.map((item) => ({
      action: item.action,
      unit: item.unit,
      units: item.units
    }))
  };
}

function normalizeFailureCode(error) {
  const value = String(error?.code || error?.name || "GENERATION_FAILED");
  return value.toUpperCase().replace(/[^A-Z0-9_]/g, "_").slice(0, 80);
}

module.exports = { HostedGenerationGateway, summarizeReservation };
