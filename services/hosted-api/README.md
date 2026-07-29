# Exam-Cram hosted API foundation

This directory contains the provider-neutral account, billing, entitlement, and usage
foundation described in `handoff.md`. It is deliberately separate from the bundled
loopback backend.

The current repository is **not a public paid service**. The existing root `server.js`
remains a learner-controlled loopback/BYOB backend. Do not bind it to a public address
or treat its local bearer token as an account session.

## Current boundary

Implemented here:

- immutable Free and Student Pro policy definitions;
- subscription-to-entitlement projection rules;
- idempotent usage reservation, commit, release, and expiry behavior;
- a metered generation gateway that commits only schema-validated success;
- a fail-closed Stripe configuration and adapter boundary;
- server-side validation that configured recurring Prices are active USD $4.99 monthly
  and USD $49.99 annual catalog entries before Checkout;
- an account-scoped Checkout-attempt coordinator that prevents concurrent subscription
  sessions and recovers ambiguous retries with a deterministic provider key;
- signature-verified billing-event projection behavior;
- a bounded Fetch `Request`/`Response` API boundary with exact-origin and injected
  authentication checks;
- an in-memory adapter for deterministic tests;
- the normalized PostgreSQL contract in `migrations/001_initial.sql`.

Not implemented yet:

- a production HTTP listener/runtime deployment and edge abuse controls;
- production OIDC authentication and session lifecycle;
- the PostgreSQL repository adapter and migration runner;
- a durable webhook queue/reconciliation worker;
- the private hosted generation adapter;
- the reservation-expiry worker;
- a hosted billing/account webpage;
- production deployment, monitoring, deletion/export automation, or incident tooling.

The in-memory store is not a production database. It serializes work only inside one
Node.js process and must never be used to enforce a real allowance across replicas.

## Repository layout

```text
services/hosted-api/
  migrations/001_initial.sql     PostgreSQL metadata and usage-ledger contract
  src/config.js                  fail-closed hosted billing configuration
  src/http-api.js                bounded authenticated HTTP/API contract
  src/index.js                   dependency-injected service assembly
  src/domain/                    policy, billing, and usage rules
  src/adapters/                  in-memory test and Stripe provider adapters
```

The PostgreSQL schema is `hosted`. It contains account and operational metadata only.
Raw page text, notes, prompts, quiz answers, generated artifacts, full URLs, audio,
provider response bodies, credentials, and payment-card data are prohibited.

## Safe setup sequence

1. Keep the local backend configuration in `.env`. Copy the separate hosted template:

   ```powershell
   Copy-Item .env.hosted.example .env.hosted
   ```

   `.env.hosted` is ignored by Git. Do not combine local provider secrets and hosted
   production secrets into a committed file.

2. Provision a dedicated PostgreSQL database with encrypted connections, backups,
   point-in-time recovery, and separate migration/runtime roles.

3. Apply the initial migration with the migration role:

   ```powershell
   psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f services/hosted-api/migrations/001_initial.sql
   ```

   The migration enables `pgcrypto` for UUID generation and creates the `hosted`
   schema. On a managed service, the migration role therefore needs permission to
   create that extension and schema.

4. Grant the future runtime role only the table/sequence/function permissions its
   repository adapter requires. Do not give the browser extension or billing webpage
   direct database credentials. Keep schema migration permission out of the runtime
   role.

5. Run the repository checks before connecting any external system:

   ```powershell
   npm test
   npm run check
   npm run security:secrets
   ```

6. Select and configure a production OIDC identity provider. Hosted API tokens must be
   short lived and validated for signature, issuer, audience, expiry, and account
   state. An exact Chrome extension origin allowlist is an additional boundary, not a
   replacement for authentication.

7. Configure a first-party HTTPS account/billing origin. Checkout success, cancel, and
   portal return URLs are derived from this fixed origin; a client must never supply
   an arbitrary return URL or Stripe Price ID.

   When wiring the private hosted generation adapter, also inject a randomly generated
   `USAGE_REQUEST_HMAC_KEY` of at least 32 bytes. Service assembly refuses to enable
   hosted generation without it.

8. Complete Stripe **sandbox** setup:

   - create one $4.99 USD monthly recurring Price;
   - create one $49.99 USD annual recurring Price;
   - configure the Customer Portal for cancellation and payment-method updates;
   - register only the webhook events handled by the service;
   - set sandbox `sk_test_...`, `whsec_...`, and `price_...` values in secret
     management;
   - explicitly decide automatic-tax, refund-revocation, and grace-period behavior;
   - leave `ALLOW_LIVE_BILLING=false`.

   The installed `stripe@22.3.2` SDK is aligned to `2026-06-24.dahlia`, which is why
   the template pins that API version. Upgrade the SDK, request version, webhook
   endpoint version, fixtures, and lifecycle tests together; do not change only one.

9. Set `BILLING_ENABLED=true` only in the sandbox environment. The configuration fails
   closed if any required secret, Price ID, fixed HTTPS origin, or policy decision is
   absent.

10. Test purchase, renewal, failed renewal, grace expiry, cancellation, refund,
    expiry, duplicate delivery, out-of-order delivery, and resubscription. Use Stripe
    test clocks for monthly and annual transitions.

11. Complete the security, privacy, finance, tax, support, and Chrome Web Store policy
    reviews. Only then copy separately created **live** secrets into the deployment
    secret manager and deliberately set `ALLOW_LIVE_BILLING=true`.

The `pk_live_...` publishable key is not required for the selected Stripe-hosted
Checkout flow. The service creates Checkout and Portal sessions server-side and returns
their hosted URLs. Do not add a publishable key merely because one is available, and
never place `sk_...` or `whsec_...` values in source, extension storage, logs, or chat.

## Persistence invariants

The production PostgreSQL adapter must perform allowance reservation in one database
transaction:

1. load or create each `usage_allowance_periods` row;
2. lock every affected period in deterministic action order with `FOR UPDATE`;
3. find the newest `(account_id, idempotency_key)` operation and verify that every
   retained attempt for that key has the same request digest;
4. compare a server-keyed HMAC of the canonical route and bounded request, and reject
   a reused key whose request digest differs;
5. verify `reserved_units + committed_units + requested_units <= allowance_limit`;
6. create the operation/items and increment reserved counters;
7. append the `reserved` transition event;
8. commit the transaction before provider work begins.

Successful, schema-validated provider work moves reserved units to committed units in
one transaction. Failure moves them out of reserved units and marks the operation
released. The expiry worker does the same for abandoned reservations. Repeating the
same transition is an idempotent read; it must not update counters twice. A retry after
`released` or `expired` creates a new attempt with the same digest. The database permits
that history while its partial unique index still allows only one `reserved` or
`committed` operation for the account/key pair.

The API boundary must produce the request fingerprint with a server-only HMAC key.
Never put raw source text into the usage store, and do not use an unsalted content hash
as an analytics identifier. A duplicate committed operation must replay its stored
artifact/result; it must never execute provider work a second time.

The private generation adapter must also provide `prepareGenerationRequest` and
`validateGenerationResult`. Those trusted server functions validate the operation
schema, create the bounded provider input, map the operation to its usage items, and
schema-check the result before usage can commit. The browser's `action`, `items`, and
`units` fields are never authoritative and are not passed to provider dispatch.

For a combined study session, both `study_build` and `quiz_build` are reserved and
committed atomically. Video usage is stored as exact integer milliseconds. Duplicate
tab-audio chunks must reuse a stable chunk idempotency key so they cannot consume time
twice.

`webhook_receipts` is inserted only after signature verification. Its primary key
deduplicates deliveries. Because provider events can arrive out of order, the durable
worker must reconcile the current Stripe customer/subscription object rather than
granting access solely from event arrival order. The table intentionally has no raw
payload column.

Checkout creation must persist its `creating` attempt before calling Stripe. The
database partial unique index permits only one `creating` or `open` attempt per account.
The same client idempotency key derives the same provider key, so a lost response can be
recovered without creating a second subscription session.

## Policy currently encoded

The current domain policies are provisional launch defaults from the handoff:

| Allowance | Free (`free.v1`) | Student Pro (`student-pro.v1`) |
| --- | ---: | ---: |
| Study builds | 3 per UTC calendar month | 30 per subscription month |
| Quiz builds | 5 per UTC calendar month | 60 per subscription month |
| Visual Tutor follow-ups | 5 per UTC calendar month | 60 per subscription month |
| Journey summaries | 1 per UTC calendar month | 10 per subscription month |
| Classification batches | 1 per UTC calendar month | 10 per subscription month |
| Captionless processing | One lifetime 15-minute preview | 120 minutes per subscription month |
| Multi-source hosted lesson | One lifetime preview | Included |

Free periods reset at 00:00 UTC on the first day of each calendar month. Pro periods
are monthly windows anchored to subscription start, including annual subscriptions.
Unused allowance does not roll over. Failed, rejected, timed-out, canceled, or expired
reservations do not consume committed allowance. Opening or exporting existing work is
never metered.

A policy version is an audit contract. Do not mutate an existing version after users
have activity under it. Add a new version and define its effective-date/migration
behavior.

## Explicit decisions still required

Billing remains disabled until an accountable owner records all of these:

- `STRIPE_AUTOMATIC_TAX`: whether Stripe automatic tax is enabled;
- `REFUND_REVOKES_ACCESS`: whether a full refund ends Pro immediately;
- `BILLING_GRACE_DAYS`: exact failed-renewal grace period, from 0 through 30 days;
- whether the optional $39.99 founding annual offer is enabled;
- refund window, renewal reminder, dispute, and statutory-rights procedures;
- which regions can buy and whether displayed prices include tax;
- treatment of partial refunds and disputes;
- support owner and billing escalation path.

The current billing projector handles:

- `checkout.session.completed`;
- `customer.subscription.created`;
- `customer.subscription.updated`;
- `customer.subscription.deleted`;
- `invoice.paid`;
- `invoice.payment_failed`;
- `charge.refunded`.

A full-refund event revokes access only when its signed/enriched data can be tied to
the account's current subscription. A bare Charge normally requires an invoice lookup;
the Stripe adapter performs that lookup before the event is acknowledged. If the link
cannot be verified, webhook processing returns a retryable error and leaves the event
unprocessed rather than revoking an unrelated newer subscription or silently accepting
an unenforced refund policy.

Dispute events and a reconciliation worker are not yet implemented. A public paid
launch is blocked until dispute behavior, event recovery, and operator replay tooling
are defined and tested.

## Open deployment dependencies

Before a private hosted beta, supply or select:

- hosted API and first-party billing domains with managed TLS;
- stable production Chrome extension ID and exact allowed origin;
- OIDC issuer, audience, JWKS endpoint, login flow, and account-recovery policy;
- managed PostgreSQL location, connection pool, backups, restore test, and retention;
- secrets manager and rotation owners for OIDC, Stripe, database, and AI provider keys;
- private generation-service connection and per-account/global provider budgets;
- a rotated server-only HMAC key for content-free idempotency fingerprints;
- durable webhook queue, dead-letter/replay workflow, and reservation sweeper;
- log, metric, alert, and sanitized audit destinations;
- transient hosted input/output retention boundary and deletion enforcement;
- account deletion and hosted-data export workflows;
- privacy policy, terms, subprocessors, refund/renewal copy, and billing support contact;
- regional tax/consumer-law review and Chrome Web Store payment-policy review;
- incident response and provider-key rotation exercises;
- a production security review.

Until these dependencies are closed, keep `BILLING_ENABLED=false` and do not expose the
hosted foundation as a public subscription backend.
