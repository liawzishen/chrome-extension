class HostedDomainError extends Error {
  constructor(code, message, statusCode = 400, details = undefined) {
    super(message);
    this.name = "HostedDomainError";
    this.code = String(code || "HOSTED_ERROR");
    this.statusCode = statusCode;
    if (details !== undefined) this.details = details;
  }
}

function assertDomain(condition, code, message, statusCode = 400, details) {
  if (!condition) throw new HostedDomainError(code, message, statusCode, details);
}

module.exports = { HostedDomainError, assertDomain };
