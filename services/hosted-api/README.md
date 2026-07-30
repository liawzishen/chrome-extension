# NeatMind hosted API foundation

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
  and USD $39.99 annual catalog entries before Checkout;
- an account-scoped Checkout-attempt coordinator that prevents concurrent subscription
  sessions and recovers ambiguous retries with a deterministic provider key;
- signature-verified billing-event projection behavior;
- a bounded Fetch `Request`/`Response` API boundary with exact-origin and injected
  authentication checks;
- **an HTTP listener** that binds that boundary to a real socket, bridging
  `node:http` onto the fetch-style handler without buffering request bodies;
- **server-side Google sign-in** and a rotating hosted session, so the extension
  never holds an OAuth client secret and the API validates a token it minted;
- **durable persistence** through `node:sqlite`, so accounts, subscriptions,
  entitlements, sessions, and usage survive a restart;
- **first-party billing pages** at `/pricing`, `/billing/success`,
  `/billing/canceled`, and `/account`;
- **a reservation sweeper** that releases abandoned reservations on a timer;
- **dispute handling** for `charge.dispute.created` and `charge.dispute.closed`;
- **a subscription reconciler** that re-reads live Stripe subscriptions on a timer,
  so a webhook that was never delivered still converges;
- an in-memory adapter for deterministic tests;
- the normalized PostgreSQL contract in `migrations/001_initial.sql`.

Not implemented yet:

- the PostgreSQL repository adapter and migration runner (needed only to run more
  than one replica; see the persistence note below);
- a durable webhook queue with dead-letter and operator replay tooling — the
  reconciler covers undelivered subscription state, but not a permanently failing
  event that needs human inspection;
- the private hosted generation adapter;
- edge abuse controls, monitoring, deletion/export automation, and incident tooling.

**Single-process by design.** The domain reads and writes synchronous Maps inside
one transaction callback. `SqliteHostedStore` keeps that authoritative copy in
memory and writes every committed change through to disk while the store's
serialization lock is still held. That is durable and correct for exactly one
process; two replicas would each hold their own authoritative memory and silently
diverge on allowance enforcement. Running more than one instance requires making
the store contract async and moving to PostgreSQL row locking — not a second copy
of the SQLite adapter behind a load balancer.

## Repository layout

```text
services/hosted-api/
  bin/serve.js                   process entrypoint (npm run hosted:serve)
  migrations/001_initial.sql     PostgreSQL metadata and usage-ledger contract
  src/config.js                  fail-closed hosted billing configuration
  src/http-api.js                bounded authenticated HTTP/API contract
  src/index.js                   dependency-injected service assembly
  src/domain/                    policy, billing, checkout, usage, session, account
  src/adapters/                  memory, SQLite, Stripe, and Google OAuth adapters
  src/runtime/                   listener, router, billing pages, runtime config
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

2. Run the repository checks before connecting any external system:

   ```powershell
   npm test
   npm run check
   npm run security:secrets
   ```

3. Choose the fixed first-party HTTPS origin and set `PUBLIC_APP_ORIGIN`. Checkout
   success, cancel, portal return, OAuth redirect, and session audience are all
   derived from this one value; a client must never supply an arbitrary return URL
   or Stripe Price ID. For local verification, run an HTTPS tunnel (for example
   `cloudflared tunnel --url http://127.0.0.1:8790`) and use the HTTPS URL it
   prints. `http://localhost` is rejected: the origin must be HTTPS.

4. Create a Google OAuth client. Google Cloud console -> APIs & Services ->
   Credentials -> Create OAuth client ID -> **Web application**, with the authorized
   redirect URI `<PUBLIC_APP_ORIGIN>/auth/callback`. Put the ID and secret in
   `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`. The secret stays on
   the server; the extension never receives it.

5. Generate the session signing key and set the storage path:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

   Put it in `HOSTED_SESSION_SIGNING_KEY`, and set `HOSTED_SQLITE_PATH`. That
   database holds real subscription state: back it up, and never commit it.

6. Set `HOSTED_ALLOWED_EXTENSION_ORIGINS` to the exact `chrome-extension://<id>`
   origin. Load the unpacked extension once to read its ID from `chrome://extensions`.
   An origin allowlist is an additional boundary, not a replacement for
   authentication.

   When wiring the private hosted generation adapter, also inject a randomly
   generated `USAGE_REQUEST_HMAC_KEY` of at least 32 bytes. Service assembly refuses
   to enable hosted generation without it.

7. Complete Stripe **test-mode** setup:

   - create one product with two recurring USD Prices: $4.99 monthly and $39.99
     annual, both `interval_count` 1;
   - configure the Customer Portal for cancellation and payment-method updates;
   - set `sk_test_...` and both `price_...` values in secret management;
   - explicitly decide automatic-tax, refund-revocation, and grace-period behavior.
     `STRIPE_AUTOMATIC_TAX` must be `false` unless every Price carries an explicit
     `tax_behavior` and Stripe Tax is configured;
   - leave `ALLOW_LIVE_BILLING=false`.

   The installed `stripe@22.3.2` SDK is aligned to `2026-06-24.dahlia`, which is why
   the template pins that API version. Upgrade the SDK, request version, webhook
   endpoint version, fixtures, and lifecycle tests together; do not change only one.

   Then set `STRIPE_PRODUCT_ID` and run the read-only preflight instead of copying
   Price IDs by hand:

   ```powershell
   npm run hosted:verify-stripe
   ```

   It checks the product, both amounts, currency, interval, `interval_count`,
   duplicate prices, tax-behavior consistency, and the Customer Portal, then prints
   the exact `STRIPE_PRICE_PRO_MONTHLY=` and `STRIPE_PRICE_PRO_ANNUAL=` lines to
   paste. It creates and modifies nothing. A product id from one mode does not
   resolve in the other, and the preflight says so explicitly when that happens.

8. Forward webhooks to the running service and take the signing secret it prints:

   ```powershell
   stripe listen --forward-to http://127.0.0.1:8790/v1/billing/webhook
   ```

   Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`. When you later create
   a real dashboard endpoint, register only the seven events the projector handles.

9. Set `BILLING_ENABLED=true` and start the service:

   ```powershell
   npm run hosted:serve
   ```

   The configuration fails closed if any required secret, Price ID, fixed HTTPS
   origin, or policy decision is absent, and the process reports which one.

10. Point the extension at the service: in `popup.js`, set `HOSTED_ACCOUNT_CONFIG`
    `apiOrigin` to `PUBLIC_APP_ORIGIN`, repeat it in `allowedApiOrigins`, and set
    `enabled: true`. Reload the extension, open the settings panel, and use **Sign
    in**. All three must agree or hosted mode stays closed.

11. Test purchase, renewal, failed renewal, grace expiry, cancellation, refund,
    expiry, duplicate delivery, out-of-order delivery, and resubscription. Use Stripe
    test clocks for monthly and annual transitions, and card `4242 4242 4242 4242`
    for a successful payment.

12. Complete the security, privacy, finance, tax, support, and Chrome Web Store policy
    reviews. Only then copy separately created **live** secrets into the deployment
    secret manager and deliberately set `ALLOW_LIVE_BILLING=true`.

The `pk_live_...` publishable key is not required for the selected Stripe-hosted
Checkout flow. The service creates Checkout and Portal sessions server-side and returns
their hosted URLs. Do not add a publishable key merely because one is available, and
never place `sk_...` or `whsec_...` values in source, extension storage, logs, or chat.
A key that has been pasted into any of those is compromised: roll it in the Stripe
dashboard rather than hoping it was not read.

## Persistence invariants

**What runs today.** `SqliteHostedStore` extends the in-memory store rather than
replacing it. The undo journal already records which collections and keys each
transaction touched, so on commit the store compares each touched key against its
pre-image and writes only genuine changes, inside one `BEGIN IMMEDIATE`
transaction, before the serialization lock is released. `usageTotals`,
`activeReservations`, and `finalizedReservations` are deliberately not persisted:
they are derived indexes rebuilt from `reservations` at load, and storing them
would create a second thing to keep correct. A write failure latches the store
closed with `STORE_PERSISTENCE_FAILED` rather than letting memory keep answering
for a disk it has outrun.

**What a multi-replica deployment would need instead.** The PostgreSQL adapter must
perform allowance reservation in one database transaction:

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
The detailed in-memory reservation record may be pruned, but a compact committed
idempotency tombstone and opaque result reference must survive so a delayed retry
remains authoritative.

The private generation adapter must also provide `prepareGenerationRequest` and
`validateGenerationResult`. Those trusted server functions validate the operation
schema, create the bounded provider input, map the operation to its usage items, and
schema-check the result before usage can commit. The browser's `action`, `items`, and
`units` fields are never authoritative and are not passed to provider dispatch.

For a combined study session, both `study_build` and `quiz_build` are reserved and
committed atomically. Video usage is stored as exact integer milliseconds. Duplicate
tab-audio chunks must reuse a stable chunk idempotency key so they cannot consume time
twice. Every non-video action or batch is exactly one unit; only `video_processing`
accepts variable units.

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
| Multi-source hosted lesson | One lifetime preview | Included within the 30 study builds |

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
- `charge.refunded`;
- `charge.dispute.created`;
- `charge.dispute.closed`.

A dispute revokes access as soon as it opens, and unlike a refund this is not gated
behind `REFUND_REVOKES_ACCESS`: the funds have already been withdrawn, so continuing
to serve the charge is a straight loss. Winning the dispute restores only the
revocation that dispute caused; a subscription that was separately canceled or
refunded stays in its own terminal state.

A full-refund event revokes access only when its signed/enriched data can be tied to
the account's current subscription. A bare Charge normally requires an invoice lookup;
the Stripe adapter performs that lookup before the event is acknowledged. If the link
cannot be verified, webhook processing returns a retryable error and leaves the event
unprocessed rather than revoking an unrelated newer subscription or silently accepting
an unenforced refund policy.

Because provider events can arrive out of order, or not at all, the reconciler in
`src/runtime/reconciler.js` periodically re-reads every non-terminal subscription
from Stripe and re-projects the live object. That is what closes the "learner paid
but the webhook never landed" gap: an undelivered event cannot be replayed, so
convergence has to come from reading current state rather than from event history.
A reconciliation pass is deliberately not recorded in `processedBillingEvents`,
since it is not a delivery and must not make a later real event look like a
duplicate.

Still missing before a public paid launch: a durable webhook queue with a
dead-letter path and operator replay tooling, for events that fail permanently and
need human inspection.

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
