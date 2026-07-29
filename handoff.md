# NeatMind Business Model Handoff

**Status:** Approved direction; Phase 0 instrumentation and a disabled Phase 1
foundation are implemented, but no hosted beta or live billing is deployed

**Decision date:** 28 July 2026

**Audience:** Product, design, engineering, growth, finance, support, privacy, and security

**Product:** NeatMind

### Implementation update — 28 July 2026

The repository now includes:

- privacy-preserving local provider-cost telemetry and reporting;
- an isolated `services/hosted-api` account, entitlement, usage-reservation, and
  Stripe boundary;
- versioned Free and Student Pro allowance policies with atomic reserve/commit/release
  reference behavior;
- server-owned Stripe Price mapping, hosted Checkout and Customer Portal sessions,
  account-scoped pending-Checkout coordination, raw-body webhook signature
  verification, replay protection, and billing-state projection tests;
- server-keyed request HMACs plus trusted server-side generation preparation and
  result-validation hooks, so browsers cannot choose cheaper metering;
- a normalized PostgreSQL persistence contract;
- a dormant, fail-closed extension account/allowance prototype that preserves the
  local, self-hosted, and BYOB paths;
- release packaging and secret scanning that reject Stripe credentials from the
  extension bundle.

This is not a public paid service. Billing remains disabled, the supplied publishable
Stripe key is intentionally not embedded, and private beta remains blocked on the
identity provider, production PostgreSQL adapter, hosted generation deployment,
durable webhook reconciliation, policy/legal decisions, operational ownership, and
security review listed below.

## 1. Purpose

This document turns the business-model discussion into an implementation-ready handoff.
It defines:

- who the product serves;
- what remains free;
- what the subscription sells;
- the approved launch prices;
- provisional usage allowances;
- billing and downgrade rules;
- upgrade moments and customer messaging;
- unit-economics guardrails;
- the hosted-service architecture required for billing;
- analytics, rollout, risks, and acceptance criteria.

This is a business and product specification, not authorization to expose the current
loopback backend to the public internet. At the decision point, no payment, account,
entitlement, hosted quota, or cloud-sync system existed; the implementation update
above records the disabled foundation added since then, not a deployable paid service.

### Quick index

- [Executive decision](#2-executive-decision)
- [Customer segments](#4-customer-segments-and-monetization-role)
- [Plans and prices](#5-plan-and-price-architecture)
- [Free and Pro entitlements](#7-launch-entitlement-matrix)
- [Upgrade and paywall behavior](#9-upgrade-moments-and-paywall-behavior)
- [Unit economics](#11-unit-economics)
- [Billing policy](#12-billing-and-account-policy)
- [Hosted-service architecture](#13-hosted-service-architecture)
- [Privacy and trust](#14-privacy-and-trust-commitments)
- [Analytics](#15-analytics-and-measurement)
- [Rollout](#16-rollout-plan)
- [Risks](#19-risks-and-mitigations)
- [Acceptance criteria](#21-launch-acceptance-criteria)
- [Decision log](#22-decision-log)

## 2. Executive decision

NeatMind will use an **open-core freemium subscription model**:

1. The extension's trustworthy local study loop remains useful for free.
2. A free user can save and organize learning material, inspect evidence, complete a
   limited hosted-AI study loop, and keep previously created work.
3. **NeatMind Student Pro costs USD $4.99 per month or USD $49.99 per year.**
4. Pro sells hosted convenience, repeated AI transformation, multi-source synthesis,
   advanced practice, and bounded captionless-video processing.
5. Local deterministic behavior and the optional self-hosted/bring-your-own-backend path
   remain available. Pro is the easiest hosted path, not a ransom on a learner's data.
6. Previously generated notes, quizzes, citations, Journey records, and exports never
   become unreadable because a subscription expires.
7. Expensive hosted actions use clear allowances. The interface shows remaining usage
   before an action begins.
8. There will be no advertising, sale of learner data, or lifetime hosted-AI plan.
9. Launch with only **Free** and **Student Pro**. Do not launch Max, Family, Teacher, or
   Institution plans until usage and customer evidence justify them.

The commercial promise is:

> Turn the material you already study into evidence-backed lessons, practice, and a
> clear plan for what to review next.

The paid promise is:

> Serious, source-grounded exam preparation for $4.99 per month, without configuring
> an AI provider or giving up access to your work.

## 3. Why this model fits NeatMind

NeatMind is not positioned as a generic chatbot or the largest collection of AI
features. Its defensible product loop is:

```text
chosen source
  -> evidence-linked visual lesson
  -> active-recall practice
  -> demonstrated strengths and weak concepts
  -> next study action in Journey
```

Charging only for summaries would place the product in direct competition with large,
subsidized AI suites. Charging for the repeated evidence-to-mastery loop creates a more
specific reason to subscribe.

The model also matches the product's trust principles:

- source capture requires an explicit learner action;
- generated claims retain evidence;
- backend quiz answers receive lexical and semantic grounding checks;
- chapters and progress use stable identities;
- source access and Focus permissions remain least-privilege;
- local/self-hosted use reduces lock-in and provider cost;
- saved work remains the learner's work.

## 4. Customer segments and monetization role

| Segment | Primary job | Recommended offer | Commercial role |
| --- | --- | --- | --- |
| Curious or casual learner | Try a study workflow on occasional material | Free | Acquisition, trust, word of mouth |
| Active student | Turn weekly course material into lessons and quizzes | Student Pro monthly, $4.99 | Core recurring revenue |
| Exam crammer | Prepare intensively for one upcoming assessment | One month of Student Pro, $4.99 | Seasonal conversion without a punitive weekly price |
| Year-round student | Maintain several subjects and a continuing Journey | Student Pro annual, $49.99 | Lower churn and upfront cash |
| Privacy-conscious or technical learner | Keep provider choice and local control | Free self-hosted/BYOB path | Trust, community adoption, lower service cost |
| Heavy hosted-AI user | Process unusually large volumes | Pro allowance plus BYOB overflow | Prevents one user from consuming the plan's margin |
| Teacher or tutor | Prepare and share learning material | Not a launch segment | Research only until educator controls exist |
| School or institution | Administer seats, privacy, and reporting | Not a launch segment | Future B2B opportunity after governance work |

### Segment priority

The first paid audience is the individual active student. Product and marketing should
not broaden into classroom administration before the individual loop demonstrates:

- reliable activation;
- repeat weekly use;
- paid conversion;
- acceptable provider cost;
- defensible learning quality;
- low support and refund burden.

## 5. Plan and price architecture

### 5.1 Launch plans

| Plan | Price | Billing | Entitlement |
| --- | ---: | --- | --- |
| Free | $0 | None | Permanent core access plus limited hosted AI |
| Student Pro Monthly | $4.99 USD | Every month | Full Pro entitlement for one billing month |
| Student Pro Annual | $49.99 USD | Every year | Same Pro entitlement, with allowances resetting monthly |

Twelve monthly payments would cost $59.88. The annual plan saves $9.89, or approximately
16.5%, and is approximately the cost of ten monthly payments. It must be displayed as:

> $49.99 billed once per year (about $4.17/month)

Never show only the effective monthly number. The total charge and renewal interval must
be adjacent to the purchase action.

### 5.2 Optional founding offer

A limited founding-student offer may be tested:

- **$39.99 for the first annual term only**;
- renewal at the regular $49.99 annual price;
- the regular renewal price and date shown before purchase;
- a reminder before the first full-price renewal;
- eligibility controlled server-side;
- no permanent promise unless deliberately approved later.

This offer is provisional. It should not become the default annual price without
retention and cost data.

### 5.3 Plans explicitly excluded from launch

Do not launch:

- a lifetime hosted-AI license;
- an ad-supported plan;
- per-answer micropayments;
- opaque token packs;
- a $9.99 Power/Max tier;
- family sharing;
- teacher or institution seats.

A higher hosted-usage tier may be considered later only if all of these are true:

1. a meaningful share of paid users repeatedly reaches the Pro allowance;
2. those users decline the self-hosted/BYOB overflow option;
3. their willingness to pay is measured;
4. the higher tier can retain a healthy contribution margin;
5. the extra tier does not materially reduce conversion through choice overload.

## 6. Entitlement principles

### 6.1 Free means permanently useful

Free is not a temporary file viewer. A free learner must be able to:

- create and select chapters;
- save supported sources explicitly;
- read manual notes and saved source metadata;
- inspect evidence, citations, PDF pages, and video timestamps;
- open previously generated visual notes and quizzes;
- submit an already-generated quiz and record its result;
- view Journey history, mastery, weak concepts, and due-review state;
- use the current bounded Focus timer;
- create standard local DOCX and PDF exports;
- use captioned-video study;
- use the local deterministic fallback;
- configure an optional self-hosted or bring-your-own backend.

Repository safety limits, such as the current eight saved sources per chapter, remain
technical integrity limits rather than subscription punishments.

### 6.2 Pro sells recurring outcomes

Pro should sell capabilities that either:

- incur recurring hosted cost;
- save substantial preparation time;
- improve the learner's next study decision;
- automate a repeated workflow;
- require cloud infrastructure;
- provide materially deeper practice.

The strongest Pro value bundle is:

```text
hosted AI without setup
  + multi-source chapter lessons
  + repeated grounded quizzes
  + weak-concept recovery
  + advanced answer evaluation
  + bounded captionless-video processing
  + automated revision and Focus controls
```

### 6.3 Cancellation never confiscates work

When Pro ends:

- the account becomes Free at the end of the paid period;
- future hosted actions use Free allowances;
- existing generated artifacts remain readable;
- citations and evidence navigation remain available;
- Journey and quiz history remain available;
- standard export remains available;
- no artifact is deleted merely because the plan changed;
- any separately disclosed cloud-retention policy must offer export before deletion.

## 7. Launch entitlement matrix

The limits below are **provisional safe launch defaults**. They must be controlled
server-side and remotely configurable so they can be adjusted for future billing cycles
after measuring real use. Current customers must receive clear notice of material
reductions.

| Capability | Free | Student Pro | Status |
| --- | --- | --- | --- |
| Create chapters | Included | Included | Exists |
| Save sources manually | Included within integrity limits | Included within integrity limits | Exists |
| Open saved work and citations | Included | Included | Exists |
| Basic Journey and adaptive intervals | Included | Included | Exists |
| Standard DOCX/PDF export | Included | Included | Exists |
| Basic timed Focus session | Included | Included | Exists |
| Local deterministic fallback | Included | Included | Exists |
| Self-hosted/BYOB backend | Included | Included | Exists |
| Hosted visual-note + cheat-sheet builds | 3 per free allowance period | 30 per subscription month | Exists, metering required |
| Hosted normal or recovery quiz builds | 5 per free allowance period | 60 per subscription month | Exists, metering required |
| Visual Tutor follow-up answers | 5 per free allowance period | 60 per subscription month | Exists, metering required |
| Journey AI summaries | 1 per free allowance period | 10 per subscription month | Exists, metering required |
| AI-assisted bulk source classification | 1 batch per free allowance period | 10 batches per subscription month | Exists, metering required |
| Multi-source hosted chapter lesson | One lifetime preview | Included within study-build allowance | Exists, entitlement required |
| Captioned-video study | Included | Included | Exists |
| Captionless public-video/tab-audio processing | One 15-minute lifetime preview | 120 minutes per subscription month | Exists, minute ledger required |
| Longer hosted source allowance | Standard safety envelope | Pro safety envelope, if validated | Requires measured implementation |
| Typed-answer AI evaluation | Not included | Included within quiz allowance | Roadmap |
| Explain-in-your-own-words practice | Not included | Included within quiz allowance | Roadmap |
| Learner-selected review reminders | Not included | Included | Roadmap |
| Scheduled/weekday Focus rules | Not included | Included | Roadmap |
| Optional strict Focus mode | Not included | Included | Roadmap |
| Cloud backup and cross-device sync | Not included | Included if built | Future; separate privacy design |
| Priority human support | Not promised | Not promised at launch | Avoid low-price support overload |

### 7.1 Allowance-period definitions

- A Free allowance period resets on a predictable published monthly date.
- A monthly subscriber's allowance resets at each monthly billing anniversary.
- An annual subscriber receives the same monthly allowance, resetting on each monthly
  anniversary of the annual subscription start date.
- Unused allowance does not roll over at launch.
- Failed, rejected, timed-out, or canceled generation does not consume allowance.
- Provider retries inside one user action count as one action only.
- A successful user-requested generation consumes one action even when an internal cache
  reduces provider cost, because the allowance controls both value and abuse.
- Opening, studying, exporting, or resubmitting an existing artifact never consumes an
  AI allowance.
- Preflight and health checks never consume allowance.
- Allowance state must be available before the user commits to an expensive action.

### 7.2 Endpoint-to-allowance mapping

The present route names are included to remove ambiguity. A production hosted service may
version or rename them, but must preserve equivalent accounting.

| Current route | Metered unit |
| --- | --- |
| `POST /api/notes` | One hosted study build after success |
| `POST /api/study-session` | One hosted study build plus one hosted quiz build after success |
| `POST /api/quiz` | One hosted quiz build after success |
| `POST /api/recovery-quiz` | One hosted quiz build after success |
| `POST /api/visual-followup` | One Visual Tutor follow-up after success |
| `POST /api/journey-summary` | One Journey summary after success |
| `POST /api/classify-sources` | One classification batch after success |
| `POST /api/video-transcript` | Successful processed media duration, rounded only as disclosed |
| `POST /api/transcript-chunk` | Successful captured-audio duration; idempotently aggregated |
| `POST /api/transcript-preflight` | Never metered |
| `GET /health` | Never metered |

If a route internally performs semantic verification, repair, or retries, those internal
calls do not create additional learner-visible debits.

## 8. What belongs behind the subscription

### 8.1 Existing capabilities that can support Pro at launch

The first paid release can use existing product value without pretending roadmap features
already exist:

1. **Hosted AI with no provider setup**
   The student signs in and uses a managed service instead of installing Node.js,
   creating API keys, or maintaining a backend.

2. **Higher hosted generation limits**
   Repeated visual notes, grounded cheat sheets, normal quizzes, recovery quizzes,
   Visual Tutor follow-ups, and Journey summaries.

3. **Multi-source hosted lesson building**
   Combine a chapter's deliberately saved sources into one evidence-linked visual note.

4. **Captionless-video processing**
   Managed public-video analysis or explicit tab-audio transcription, with a visible
   minute allowance.

5. **AI-assisted import organization**
   Bounded bulk source classification for students importing course material.

### 8.2 Subscription features worth building next

Build in this order:

1. typed recall and AI answer evaluation grounded in the saved source;
2. explain-in-your-own-words prompts with evidence-based feedback;
3. learner-selected review reminders built on the existing adaptive interval;
4. weekday/scheduled Focus rules and clearly escapable strict mode;
5. optional account backup and cross-device sync with explicit privacy controls.

The paid roadmap should deepen the evidence-to-mastery loop. Do not prioritize generic
chat, a model picker, social feeds, or broad productivity features merely to enlarge the
feature list.

### 8.3 Capabilities that must not become hard paywalls

Do not hard-paywall:

- opening or searching the learner's saved artifacts;
- supporting evidence and citation navigation;
- chapter identity and source ownership;
- submitted quiz history;
- local Journey progress;
- standard export of existing work;
- basic Focus sessions;
- deletion or portability of learner data;
- security, accessibility, or correctness improvements;
- corrections to an unsupported or defective generated artifact.

## 9. Upgrade moments and paywall behavior

### 9.1 Do not paywall before value

The learner should experience the complete core loop before the first strong upgrade
request:

1. create or select a chapter;
2. save or paste a source;
3. generate or open a visual lesson;
4. inspect its evidence;
5. complete at least one question;
6. see the Journey update.

A plan advertisement may be visible earlier, but it must not obstruct activation.

### 9.2 Recommended contextual upgrade moments

| Trigger | Message goal |
| --- | --- |
| Free study-build allowance nearly used | Show remaining builds and the value of continuing |
| User starts a multi-source chapter build | Sell synthesis of all selected evidence |
| User requests captionless-video processing | Show required minutes before processing |
| User reaches a weak concept repeatedly | Sell deeper adaptive/typed practice when available |
| User adds an exam date or study goal | Sell an automated revision path when available |
| User configures recurring Focus behavior | Sell schedules/strict mode when available |
| User hits a hosted allowance | Offer Pro or the self-hosted/BYOB continuation path |

### 9.3 Example upgrade copy

Quota:

> You have 1 of 3 free study builds remaining this month. Student Pro includes 30 builds
> each month for $4.99.

Multi-source:

> Build one evidence-backed lesson from all 6 saved sources with Student Pro.

Captionless video:

> This video needs automatic transcription. It will use about 18 of your 120 Pro video
> minutes. Your remaining allowance is shown before processing starts.

Cancellation:

> Canceling stops future Pro renewals. Your existing notes, quizzes, evidence, exports,
> and Journey history remain available.

Annual billing:

> $49.99 charged today for one year. Renews annually until canceled.

### 9.4 Paywall design rules

- One primary action and one clear dismissal.
- State the exact locked action, not a vague list of everything in Pro.
- Display monthly and annual totals unambiguously.
- Never preselect annual billing while visually emphasizing a monthly equivalent.
- Do not use a countdown unless the offer truly expires server-side.
- Do not claim "unlimited" when a fair-use, safety, or compute limit exists.
- Show the self-hosted/BYOB alternative when a hosted quota is exhausted.
- Never imply that canceling deletes saved work.
- Keep purchase, restore, manage, cancel, and billing-support paths easy to find.

## 10. Customer lifecycle

### 10.1 Acquisition

Primary acquisition routes:

- Chrome Web Store discovery;
- the no-key curated demonstration;
- student recommendations and study communities;
- content showing evidence-linked visual lessons and recovery quizzes;
- transparent comparisons with generic summarizers;
- later, a measured referral program.

The acquisition message should emphasize the differentiated loop, not "more AI":

> Study the page, PDF, notes, or video already in front of you. Check the evidence,
> practise it, and know what to review next.

### 10.2 Activation

Activation is not installation. A learner is activated after completing:

```text
source saved
  + evidence-linked lesson opened
  + evidence inspected
  + quiz submitted
  + Journey updated
```

The target product requirement remains completing the first useful loop in under five
minutes.

### 10.3 Conversion

Conversion should occur after:

- demonstrated value;
- a repeated need;
- a multi-source or captionless-video need;
- or a clearly explained allowance boundary.

Do not require a payment card for the permanent Free plan.

An optional seven-day, no-card Pro preview may be tested after activation. It must not
silently convert into a paid subscription. A card-based auto-renew trial is not part of
the launch decision.

### 10.4 Retention

Retention comes from recurring learning state, not artificial lock-in:

- weak concepts returning at useful intervals;
- a dated Journey;
- next-step recommendations;
- growing source-backed chapters;
- exam goals and reminders;
- reliable Focus sessions;
- continued confidence in evidence.

### 10.5 Referral

After retention is demonstrated, test:

> Give one month, get one month.

Guardrails:

- reward only after the referred learner makes a non-refunded payment;
- cap earned months;
- prevent self-referral and payment abuse;
- disclose expiration and eligibility;
- compare acquisition cost with paid channels.

## 11. Unit economics

### 11.1 Revenue

Gross prices:

- Monthly gross revenue per payer: **$4.99**
- Annual gross cash collected: **$49.99**
- Annual normalized monthly revenue: **$4.17**

Illustrative gross monthly revenue:

| Monthly active learners | Paid conversion | Paying learners | Gross MRR at $4.99 |
| ---: | ---: | ---: | ---: |
| 1,000 | 5% | 50 | $249.50 |
| 1,000 | 10% | 100 | $499.00 |
| 1,000 | 15% | 150 | $748.50 |
| 10,000 | 5% | 500 | $2,495.00 |
| 10,000 | 10% | 1,000 | $4,990.00 |
| 10,000 | 15% | 1,500 | $7,485.00 |

These figures exclude annual-plan normalization, taxes, refunds, chargebacks, payment
fees, app-store fees, provider cost, hosting, storage, support, and payroll.

### 11.2 Payment-channel sensitivity

Do not assume one fee rate until the checkout channel and merchant structure are selected.
Use this sensitivity table for planning:

| Gross charge | 10% deductions | 15% deductions | 30% deductions |
| ---: | ---: | ---: | ---: |
| $4.99 monthly | $4.49 net | $4.24 net | $3.49 net |
| $49.99 annual | $44.99 net | $42.49 net | $34.99 net |
| Annual net per month | $3.75 | $3.54 | $2.92 |

"Deductions" here is a planning placeholder for the combination of processor/store fees,
tax handling, refunds, and chargebacks. Finance must replace it with actual channel data.

### 11.3 Provider-cost reference

The current default configuration uses `gemini-3.1-flash-lite`. Google's published
standard pricing checked in July 2026 was:

- $0.25 per million text/image/video input tokens;
- $0.50 per million audio input tokens;
- $1.50 per million output tokens.

Reference: <https://ai.google.dev/gemini-api/docs/pricing>

At those rates, an illustrative action with 10,000 text input tokens and 4,000 output
tokens has a direct model cost of approximately:

```text
(10,000 / 1,000,000 × $0.25)
  + (4,000 / 1,000,000 × $1.50)
= $0.0085
```

This is not the final cost per action. Production cost must also include:

- grounding-verifier calls;
- retries and repair calls;
- audio/video processing;
- unused output caused by validation rejection;
- storage and egress;
- authentication and database operations;
- logging, monitoring, abuse, and support;
- future provider or model price changes.

The model is also a preview dependency at the time of this decision. Pricing, behavior,
and availability must not be hard-coded into the business promise.

### 11.4 Cost targets

Initial operating targets:

- median hosted AI and infrastructure cost below **$0.75 per paid user-month**;
- average hosted AI and infrastructure cost below **$1.00 per paid user-month**;
- 95th-percentile hosted AI and infrastructure cost below **$2.00 per paid user-month**;
- contribution margin after variable service and payment costs above **60%**;
- no unlimited captionless-video promise;
- cost measured per successful user action and per paid account.

If costs exceed the targets:

1. inspect retries, oversized inputs, model selection, and abuse first;
2. optimize prompts, schemas, caching, and batchable work;
3. route suitable work to a lower-cost validated model;
4. reduce future allowances with notice only when necessary;
5. offer BYOB overflow;
6. consider a higher usage tier only after willingness-to-pay research.

Do not solve a cost problem by hiding existing learner work.

### 11.5 Price comparison rule

A $4.99 plan needs approximately 80% more paying subscribers than an $8.99 plan to
produce equal gross monthly revenue. The lower price is successful when its improvement
in conversion, retention, referrals, or annual adoption exceeds that gap.

The launch price is fixed at $4.99. Test activation, messaging, allowance design, and
annual presentation before testing a different headline price.

## 12. Billing and account policy

### 12.1 Source of truth

- The billing provider's verified webhook state is the payment source of truth.
- The entitlement service is the product-access source of truth.
- Client-side flags are never trusted for paid access.
- Webhook processing, checkout creation, and usage commits must be idempotent.
- An entitlement contains the plan, status, effective dates, allowance policy version,
  and any promotional grant.

### 12.2 Subscription states

Support at least:

- `free`
- `trialing` if a future trial is approved
- `active`
- `past_due`
- `grace_period`
- `canceled_at_period_end`
- `expired`
- `refunded`
- `disputed`

The interface must explain the current state in plain language.

### 12.3 Cancellation and downgrade

- Cancel anytime through a self-service billing portal.
- Cancellation takes effect at the end of the paid period unless law or a refund requires
  an earlier end.
- Show the exact access-end date.
- Do not create unnecessary cancellation steps.
- Preserve saved work on downgrade.
- Restore the appropriate Free allowance after expiration.
- Allow resubscription without creating a second learner identity.

### 12.4 Failed payment and grace

Proposed behavior:

1. notify the learner of the failed renewal;
2. provide a short, clearly dated grace period;
3. preserve read access throughout;
4. pause new Pro hosted actions after grace expires;
5. never delete artifacts because a card failed;
6. restore Pro promptly after verified payment.

The final grace duration depends on the payment provider and support capacity.

### 12.5 Refunds and renewals

Before launch, publish:

- a plain-language refund policy;
- cancellation instructions;
- renewal terms;
- regional statutory-rights handling;
- annual renewal reminders where required or beneficial;
- a billing-support contact.

A first-purchase goodwill refund window may be offered, but its exact duration and usage
conditions require legal and fraud review. Do not advertise a refund promise before the
operational workflow exists.

### 12.6 Regional pricing

The launch source price is USD $4.99. Regional purchasing-power pricing is a future
experiment, not a launch requirement.

If added:

- use stable storefront regions rather than self-declared location alone;
- avoid VPN-based price games;
- communicate tax-inclusive versus tax-exclusive prices;
- preserve equal product entitlements;
- measure conversion, net revenue, refund rate, and abuse by region.

## 13. Hosted-service architecture

### 13.1 Critical constraint

The current `server.js` is a loopback service designed around:

- `127.0.0.1`;
- exact extension-origin validation;
- local bearer-token behavior;
- local environment provider keys;
- no account database;
- no payment state;
- no multi-tenant usage ledger.

**Do not deploy the current loopback server unchanged as a public subscription backend.**

A public service needs a separate production threat model, account system, entitlement
service, quota ledger, TLS termination, managed secrets, monitoring, abuse controls,
data-retention policy, and incident response.

### 13.2 Recommended service boundaries

```text
Chrome extension
  -> account/session service
  -> hosted API gateway
       -> entitlement service
       -> usage reservation and ledger
       -> generation service
            -> provider adapter
       -> sanitized cost/operations telemetry

secure billing webpage
  -> billing provider checkout/portal
  -> verified billing webhook
  -> subscription state
  -> entitlement service
```

Keep local and hosted modes distinct:

```text
Local/self-hosted mode:
extension -> learner-controlled loopback backend -> learner-controlled provider key

Hosted Pro mode:
extension -> authenticated hosted gateway -> managed provider
```

### 13.3 Hosted request accounting

Every hosted generation should follow:

1. authenticate the account;
2. validate request origin and client version;
3. check entitlement and allowance;
4. create an idempotent usage reservation;
5. enforce bounded input, rate, and concurrency limits;
6. execute and validate provider work;
7. commit one learner-visible unit only after success;
8. release the reservation on failure;
9. record sanitized cost and latency metadata;
10. return updated remaining allowance.

Two retries for one click are not two learner charges. Two deliberate successful clicks
may be two actions.

### 13.4 Suggested domain records

**Account**

- stable account ID;
- verified sign-in identity;
- created/updated timestamps;
- locale and billing region;
- privacy/terms version acceptance;
- account state.

**Subscription**

- account ID;
- billing-customer and subscription references;
- plan and price IDs;
- status;
- current period start/end;
- cancel-at-period-end;
- promotion;
- last verified webhook timestamp.

**Entitlement**

- account ID;
- plan;
- entitlement-policy version;
- effective start/end;
- grants and exceptions;
- source event.

**Usage event**

- stable event ID;
- idempotency key;
- account ID;
- action category;
- reserved/committed/released state;
- units or media duration;
- billing/allowance period;
- provider and model identifiers;
- retry count;
- input/output size buckets;
- estimated direct cost;
- result code;
- timestamp.

Do not store raw source text, raw prompts, raw audio, generated answers, or full URLs in
the billing usage ledger.

### 13.5 Suggested hosted account APIs

Exact paths are implementation choices, but the product needs equivalents of:

- `GET /v1/me`
- `GET /v1/entitlements`
- `GET /v1/usage`
- `POST /v1/billing/checkout`
- `POST /v1/billing/portal`
- `POST /v1/billing/webhook`
- authenticated hosted generation routes compatible with existing artifact contracts.

The extension should open checkout and the billing portal in a secure first-party web
page. Payment-card data must never pass through extension code.

### 13.6 Security requirements

- Short-lived hosted access tokens and secure refresh behavior.
- Tokens bound to the intended hosted origin/audience.
- Server-side entitlement and quota enforcement.
- Webhook signature verification and replay protection.
- Idempotent checkout and webhook handling.
- Per-account, per-origin, and per-address abuse controls.
- Bounded bodies, timeouts, concurrency, and provider budgets.
- Redacted logs and no raw source content in operational telemetry.
- Managed secrets and key rotation.
- Dependency, secret, and release scanning.
- A separate security review before public hosting.
- A tested incident and provider-key rotation procedure.

## 14. Privacy and trust commitments

The business model must not weaken the product's learning or privacy contract.

Commitments:

- no sale of learner data;
- no behavioral advertising;
- no use of private source content for model training without explicit, separate opt-in;
- no silent reading of tabs or browsing history;
- no raw audio persistence;
- no raw source content in billing analytics;
- least-privilege permissions remain available to Free and Pro alike;
- AI-estimated video timestamps remain labeled;
- evidence and unsupported-claim reporting are not paid trust features;
- deletion and export are available regardless of plan;
- hosted retention is documented before cloud storage launches.

Before accounts or cloud sync launch, complete:

- updated privacy policy;
- terms of service;
- data inventory and retention schedule;
- subprocessors list;
- account deletion workflow;
- hosted-data export workflow;
- age/minor handling review;
- regional privacy and consumer-billing review.

## 15. Analytics and measurement

### 15.1 Event principles

Analytics should answer product and cost questions without collecting study content.

Allowed examples:

- plan and entitlement state;
- action category;
- source type;
- bounded size bucket;
- success/failure code;
- latency;
- retry count;
- allowance before/after;
- estimated provider cost;
- paywall trigger;
- checkout and subscription lifecycle.

Do not include raw:

- page text;
- note text;
- quiz prompts or answers;
- source quotes;
- audio;
- full private URLs;
- provider keys or tokens.

### 15.2 Core funnel events

- `extension_activated`
- `chapter_created`
- `source_saved`
- `study_build_started`
- `study_build_succeeded`
- `evidence_opened`
- `quiz_started`
- `quiz_submitted`
- `journey_updated`
- `focus_started`
- `allowance_viewed`
- `allowance_near_limit`
- `allowance_exhausted`
- `paywall_viewed`
- `checkout_started`
- `checkout_completed`
- `subscription_activated`
- `subscription_renewed`
- `subscription_cancel_scheduled`
- `subscription_expired`
- `refund_recorded`
- `byob_selected`
- `generation_cost_recorded`

### 15.3 North-star and guardrail metrics

Primary product metric:

> Weekly learners who complete at least one evidence-linked study-and-practice loop.

Commercial metrics:

- activated-Free-to-paid conversion within 30 days;
- monthly and annual paid mix;
- gross and net MRR;
- renewal and cancellation rates;
- monthly paid retention;
- annual renewal;
- average revenue per paid account;
- refund and dispute rate;
- referral acquisition cost.

Cost metrics:

- provider cost per successful action;
- hosted variable cost per active Free account;
- hosted variable cost per paid account;
- cost by source type and endpoint;
- retry and validation-rejection cost;
- 50th/90th/95th-percentile paid-account cost;
- gross and contribution margin.

Trust and product guardrails:

- first-loop completion time;
- evidence-open rate;
- quiz validation rejection rate;
- unsupported-claim report rate;
- artifact-generation failure rate;
- captionless-transcription failure rate;
- permission denial and abandonment;
- saved-work access after downgrade;
- accessibility and narrow-panel regressions.

### 15.4 Initial hypotheses, not promises

Use these as early diagnostic targets:

- at least 35% of qualified new users complete the activation loop;
- at least 5% of activated Free learners convert within 30 days;
- average hosted AI/infrastructure cost stays below $1.00 per paid user-month;
- contribution margin stays above 60%;
- refund/dispute rate stays below 5%;
- most conversions occur after demonstrated value, not an install-time wall.

Targets should be revised from cohort evidence, not used to conceal product-quality
problems.

## 16. Rollout plan

### Phase 0: Cost telemetry without billing

- Add sanitized per-action token, retry, latency, and estimated-cost measurement.
- Measure normal, collection, quiz, verifier, follow-up, classification, and video paths.
- Confirm that telemetry stores no raw study content.
- Establish cost percentiles and abuse patterns.
- Keep all current behavior unchanged.

**Exit:** At least several weeks of representative cost data and a reviewed cost model.

### Phase 1: Entitlement foundation

- Create provider-neutral account, subscription, entitlement, and usage domains.
- Add hosted authentication.
- Add idempotent quota reservations and commits.
- Add Free and Pro policy versions behind feature flags.
- Build allowance UI and failed-action refund behavior.
- Preserve local/self-hosted mode.
- Add downgrade and artifact-access contract tests.

**Exit:** Test accounts can change plan state without losing local work, and quota
enforcement cannot be bypassed by client flags.

### Phase 2: Private paid beta

- Invite a bounded cohort of activated learners.
- Offer $4.99 monthly and optionally the disclosed $39.99 founding annual term.
- Provide self-service billing management.
- Monitor cost, conversion, generation reliability, cancellation reasons, and support.
- Interview both converters and non-converters.

**Exit:** Healthy unit-cost evidence, reliable billing state, low data-access risk, and no
systemic cancellation/refund confusion.

### Phase 3: Public Free + Pro launch

- Publish $4.99 monthly and $49.99 annual.
- Enable contextual upgrade moments.
- Publish privacy, terms, refund, cancellation, and billing-support information.
- Keep remaining allowance visible.
- Keep all saved work accessible after downgrade.
- Monitor cohort behavior daily during the initial release.

### Phase 4: Improve paid outcome

- Ship typed recall and source-grounded answer evaluation.
- Add review reminders.
- Add scheduled/strict Focus only with clear escape behavior.
- Evaluate cloud sync after a dedicated privacy design.
- Test referral rewards.

### Phase 5: Expansion decisions

Only after individual economics work:

- evaluate a higher hosted-usage tier;
- research family demand;
- research teachers;
- pursue institutions only after educator controls, privacy documentation, and
  reliability benchmarks are mature.

## 17. Experiments

The launch price itself is not the first experiment. Keep $4.99 stable and test:

1. paywall timing after the first loop versus after the second build;
2. outcome-led copy versus allowance-led copy;
3. one lifetime multi-source preview versus one per month;
4. 3 versus 5 Free monthly study builds, while monitoring conversion and retention;
5. monthly-first versus annual-first presentation without obscuring the total charge;
6. a $39.99 founding annual offer versus the regular $49.99 annual offer;
7. an optional seven-day no-card Pro preview after activation;
8. give-one-month/get-one-month referrals after retention is proven.

For every experiment, define:

- primary metric;
- trust and refund guardrails;
- minimum cohort and duration;
- segmentation by new versus returning user;
- cost impact;
- stopping rule.

Do not optimize checkout conversion by creating accidental annual purchases, unclear
renewals, or fear that saved work will disappear.

## 18. Competitive context

Pricing checked in July 2026:

| Product | Observed business pattern | Lesson |
| --- | --- | --- |
| Laxu AI | One free upload; Pro advertised at $4.99/month | Direct low-price precedent |
| Cramberry | Five free AI generations; $4.99/week or $14.99/month | Exam urgency supports short subscriptions, but NeatMind can be fairer |
| Cardlet | Free AI credits and study-set cap; Pro $8/month | Habit-forming Free plus usage expansion |
| RemNote | Durable notes/flashcards free; separate Pro and higher AI plan | Preserve the knowledge system; meter hosted AI |
| Glasp | Explicit free and paid limits for summaries, PDF chat, and transcription | Publish expensive-action allowances |
| Knowt | High monthly price and discounted annual commitment | Annual billing reduces seasonal churn |
| NotebookLM / Google AI | Generous subsidized Free usage and broader AI bundles | Do not compete on raw quota or generic chat |
| Freedom | Basic blocker free; scheduling and locked modes paid | Monetize automation, not the basic timer |

References:

- <https://laxuai.com/ai-study-app>
- <https://www.cramberry.study/>
- <https://www.cardlet.app/>
- <https://www.remnote.com/pricing>
- <https://glasp.co/pricing>
- <https://knowt.com/plans>
- <https://support.google.com/notebooklm/answer/16269187>
- <https://one.google.com/about/plans>
- <https://support.freedom.to/en/articles/13764747-what-s-included-in-free-and-premium-plans>

Competitor pricing changes frequently. The product decision does not depend on any single
competitor remaining at its observed price.

## 19. Risks and mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| $4.99 is too low | Heavy use or fees can erase margin | Meter costly actions, keep BYOB overflow, measure cost percentiles |
| Free is too generous | Users receive all recurring value without subscribing | Limit hosted repetition while preserving ownership and local utility |
| Free is too restrictive | Users never experience the loop | Guarantee at least one complete evidence-to-Journey success |
| Google or another bundle offers more AI free | Raw generation becomes a commodity | Sell browser workflow, evidence, adaptive practice, and the next action |
| Student use is seasonal | Monthly churn rises after exams | Annual value, continuing Journey, reminders, multiple subjects |
| Self-hosting cannibalizes Pro | Technical users avoid hosted payment | Treat self-hosting as trust/acquisition; Pro sells convenience |
| Provider prices or models change | Unit economics and output quality shift | Provider abstraction, policy versioning, cost telemetry, fallback evaluation |
| Captionless video is abused | Long media can dominate spend | Minute ledger, preflight estimate, duration bounds, per-account rate limits |
| Shared accounts or automation abuse | One subscription serves excessive volume | Account/session controls, idempotency, rate limits, anomaly review |
| Billing surprise damages trust | Students are highly price-sensitive | Clear totals, renewal dates, cancellation, annual reminders, accessible support |
| Paywall weakens evidence access | Undermines the core trust promise | Evidence and existing work remain free |
| Hosted accounts expand privacy risk | Source material may be sensitive | Minimize stored content, publish retention, separate usage metadata, security review |
| Low price creates high support burden | Human support can exceed revenue | Strong diagnostics, self-service billing, documentation, no priority-support promise |
| Classroom expansion happens too early | Requires privacy, roles, reporting, and reliability | Keep teachers and institutions out of launch scope |

## 20. Explicit non-goals

This model does not authorize:

- turning NeatMind into a universal AI chatbot;
- crawling unrelated tabs or browsing history;
- selling or advertising against learner content;
- locking evidence or previously generated artifacts;
- silently uploading local source libraries;
- deploying the loopback server directly to the internet;
- promising unlimited provider usage;
- building school administration before individual product-market evidence;
- reducing validation or security for paid throughput;
- making unsupported grade-improvement claims.

## 21. Launch acceptance criteria

Business and UX:

- [ ] Free users can complete the full source-to-Journey loop.
- [ ] Monthly checkout states `$4.99 per month`.
- [ ] Annual checkout states `$49.99 billed once per year`.
- [ ] The renewal date and total are visible before purchase.
- [ ] Remaining allowance is visible before a metered action.
- [ ] Failed actions do not consume allowance.
- [ ] Cancellation is self-service and shows the access-end date.
- [ ] Downgraded users can open all existing artifacts and evidence.
- [ ] Standard export remains available after downgrade.
- [ ] BYOB/self-hosted continuation remains available.
- [ ] No screen claims an unimplemented Pro feature is currently available.

Engineering and security:

- [ ] Hosted entitlement checks are server-side.
- [ ] Billing webhooks are signed, verified, replay-safe, and idempotent.
- [ ] Usage reservations commit only after success.
- [ ] Client retries cannot create duplicate charges or duplicate usage.
- [ ] The usage ledger contains no raw study content or credentials.
- [ ] Hosted tokens are scoped to the intended service.
- [ ] Local and hosted backend modes remain clearly separated.
- [ ] Account deletion, billing support, and incident procedures exist.
- [ ] Tests cover purchase, renewal, failed renewal, cancellation, refund, expiry,
      allowance reset, quota exhaustion, and downgrade.
- [ ] A production security review is complete.

Finance and operations:

- [ ] Actual payment-channel deductions replace planning placeholders.
- [ ] Model and infrastructure cost is measured per successful action.
- [ ] Average and 95th-percentile account costs meet approved thresholds.
- [ ] Refund and renewal policies are published.
- [ ] Tax and regional consumer obligations are assigned.
- [ ] A support owner and escalation path exist.

## 22. Decision log

### Approved

- Free plus one Student Pro plan at launch.
- Student Pro monthly price: **$4.99 USD**.
- Student Pro annual price: **$49.99 USD**.
- Open-core/local/self-hosted path remains.
- Hosted usage is transparent and bounded.
- Existing learner work and evidence remain accessible after cancellation.
- Basic Focus remains free; advanced automation may be Pro.
- No ads, learner-data sales, or lifetime hosted-AI plan.
- No Teacher, Institution, Family, or Max plan at launch.

### Provisional and requiring validation

- Exact Free and Pro allowances.
- Whether the founding annual offer ships.
- Whether a no-card Pro preview improves conversion.
- Billing provider and merchant-of-record structure.
- Refund window and grace-period duration.
- Regional pricing.
- Hosted retention and cloud-sync architecture.
- Whether heavy-user demand justifies a future higher tier.

### Required next decisions before implementation

1. Select the hosted identity approach.
2. Select the billing/merchant channel after fee, tax, geography, and extension-policy
   review.
3. Instrument real provider cost before finalizing allowances.
4. Decide whether private beta includes the founding annual offer.
5. Define the first hosted deployment's data-retention boundary.
6. Assign owners for billing support, privacy, security, and finance operations.

## 23. Immediate next work

The safest next sequence is:

1. add privacy-preserving cost telemetry to current backend actions;
2. collect representative usage data;
3. design the account/entitlement/usage service separately from the loopback server;
4. prototype allowance UI with no real payment;
5. test the Free-to-Pro explanation with students;
6. implement a private hosted beta only after the security and billing boundaries are
   reviewed.

Until those steps are complete, the repository's existing statement remains true:
payment and quota systems are proposed, not shipped.
