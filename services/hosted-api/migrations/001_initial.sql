BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS hosted;

COMMENT ON SCHEMA hosted IS
  'Account, billing, entitlement, and usage metadata for the NeatMind hosted service. Raw study content does not belong in this schema.';

CREATE TABLE hosted.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE hosted.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state varchar(32) NOT NULL DEFAULT 'active',
  locale varchar(20) NOT NULL DEFAULT 'en',
  billing_region varchar(8),
  terms_version varchar(64),
  terms_accepted_at timestamptz,
  privacy_version varchar(64),
  privacy_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  deleted_at timestamptz,
  CONSTRAINT accounts_state_check
    CHECK (state IN ('active', 'suspended', 'deletion_pending', 'deleted')),
  CONSTRAINT accounts_billing_region_check
    CHECK (billing_region IS NULL OR billing_region ~ '^[A-Z0-9_-]{2,8}$'),
  CONSTRAINT accounts_terms_acceptance_check
    CHECK (
      (terms_version IS NULL AND terms_accepted_at IS NULL)
      OR (terms_version IS NOT NULL AND terms_accepted_at IS NOT NULL)
    ),
  CONSTRAINT accounts_privacy_acceptance_check
    CHECK (
      (privacy_version IS NULL AND privacy_accepted_at IS NULL)
      OR (privacy_version IS NOT NULL AND privacy_accepted_at IS NOT NULL)
    ),
  CONSTRAINT accounts_deleted_at_check
    CHECK (state <> 'deleted' OR deleted_at IS NOT NULL)
);

CREATE TABLE hosted.account_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES hosted.accounts(id) ON DELETE RESTRICT,
  issuer varchar(500) NOT NULL,
  subject varchar(500) NOT NULL,
  email varchar(320),
  email_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  last_authenticated_at timestamptz,
  CONSTRAINT account_identities_issuer_length_check
    CHECK (char_length(issuer) BETWEEN 1 AND 500),
  CONSTRAINT account_identities_subject_length_check
    CHECK (char_length(subject) BETWEEN 1 AND 500),
  CONSTRAINT account_identities_email_check
    CHECK (
      email IS NULL
      OR (
        char_length(email) BETWEEN 3 AND 320
        AND email !~ '[[:cntrl:]]'
      )
    ),
  CONSTRAINT account_identities_provider_subject_unique UNIQUE (issuer, subject)
);

CREATE INDEX account_identities_account_idx
  ON hosted.account_identities (account_id);

CREATE TABLE hosted.billing_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES hosted.accounts(id) ON DELETE RESTRICT,
  provider varchar(32) NOT NULL,
  provider_customer_id varchar(255) NOT NULL,
  livemode boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT billing_customers_provider_check
    CHECK (provider IN ('stripe')),
  CONSTRAINT billing_customers_provider_id_check
    CHECK (provider_customer_id ~ '^[A-Za-z0-9_:-]{3,255}$'),
  CONSTRAINT billing_customers_provider_id_unique
    UNIQUE (provider, livemode, provider_customer_id),
  CONSTRAINT billing_customers_account_provider_unique
    UNIQUE (account_id, provider, livemode)
);

CREATE TABLE hosted.billing_checkout_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES hosted.accounts(id) ON DELETE RESTRICT,
  billing_customer_id uuid REFERENCES hosted.billing_customers(id) ON DELETE RESTRICT,
  provider varchar(32) NOT NULL,
  livemode boolean NOT NULL,
  idempotency_key varchar(160) NOT NULL,
  request_digest char(64) NOT NULL,
  plan varchar(40) NOT NULL,
  billing_interval varchar(24) NOT NULL,
  provider_price_id varchar(255) NOT NULL,
  provider_checkout_session_id varchar(255),
  status varchar(24) NOT NULL DEFAULT 'creating',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT billing_checkout_attempts_provider_check
    CHECK (provider IN ('stripe')),
  CONSTRAINT billing_checkout_attempts_idempotency_key_check
    CHECK (idempotency_key ~ '^[A-Za-z0-9._:-]{16,160}$'),
  CONSTRAINT billing_checkout_attempts_request_digest_check
    CHECK (request_digest ~ '^[a-f0-9]{64}$'),
  CONSTRAINT billing_checkout_attempts_plan_check
    CHECK (plan = 'student_pro'),
  CONSTRAINT billing_checkout_attempts_interval_check
    CHECK (billing_interval IN ('month', 'year', 'founding_year')),
  CONSTRAINT billing_checkout_attempts_status_check
    CHECK (status IN ('creating', 'open', 'completed', 'expired', 'failed')),
  CONSTRAINT billing_checkout_attempts_account_idempotency_unique
    UNIQUE (account_id, idempotency_key),
  CONSTRAINT billing_checkout_attempts_provider_session_unique
    UNIQUE (provider, livemode, provider_checkout_session_id)
);

CREATE INDEX billing_checkout_attempts_account_created_idx
  ON hosted.billing_checkout_attempts (account_id, created_at DESC);

-- The runtime expires stale attempts before inserting a replacement. This unique
-- guard is the final database-level protection against two creating/open Checkout
-- sessions racing for the same account.
CREATE UNIQUE INDEX billing_checkout_attempts_one_pending_per_account_idx
  ON hosted.billing_checkout_attempts (account_id)
  WHERE status IN ('creating', 'open');

CREATE TABLE hosted.billing_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES hosted.accounts(id) ON DELETE RESTRICT,
  billing_customer_id uuid NOT NULL REFERENCES hosted.billing_customers(id) ON DELETE RESTRICT,
  provider varchar(32) NOT NULL,
  livemode boolean NOT NULL,
  provider_subscription_id varchar(255) NOT NULL,
  provider_price_id varchar(255) NOT NULL,
  plan varchar(40) NOT NULL,
  billing_interval varchar(24) NOT NULL,
  provider_status varchar(64) NOT NULL,
  product_status varchar(64) NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  allowance_anchor_at timestamptz NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  grace_ends_at timestamptz,
  promotion varchar(80),
  revoked_at timestamptz,
  effective_start_at timestamptz NOT NULL,
  effective_end_at timestamptz,
  last_provider_event_id varchar(255),
  last_provider_event_created_epoch bigint,
  last_verified_webhook_at timestamptz,
  is_current boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT billing_subscriptions_provider_check
    CHECK (provider IN ('stripe')),
  CONSTRAINT billing_subscriptions_provider_id_check
    CHECK (provider_subscription_id ~ '^[A-Za-z0-9_:-]{3,255}$'),
  CONSTRAINT billing_subscriptions_plan_check
    CHECK (plan = 'student_pro'),
  CONSTRAINT billing_subscriptions_interval_check
    CHECK (billing_interval IN ('month', 'year', 'founding_year')),
  CONSTRAINT billing_subscriptions_provider_status_check
    CHECK (provider_status ~ '^[a-z][a-z0-9_]{0,63}$'),
  CONSTRAINT billing_subscriptions_product_status_check
    CHECK (
      product_status IN (
        'trialing',
        'active',
        'past_due',
        'grace_period',
        'canceled_at_period_end',
        'canceled',
        'expired',
        'refunded',
        'disputed',
        'revoked',
        'incomplete',
        'incomplete_expired',
        'unpaid',
        'paused'
      )
    ),
  CONSTRAINT billing_subscriptions_period_check
    CHECK (
      current_period_start IS NULL
      OR current_period_end IS NULL
      OR current_period_end > current_period_start
    ),
  CONSTRAINT billing_subscriptions_effective_period_check
    CHECK (effective_end_at IS NULL OR effective_end_at >= effective_start_at),
  CONSTRAINT billing_subscriptions_grace_check
    CHECK (grace_ends_at IS NULL OR grace_ends_at > effective_start_at),
  CONSTRAINT billing_subscriptions_version_check
    CHECK (version > 0),
  CONSTRAINT billing_subscriptions_provider_id_unique
    UNIQUE (provider, livemode, provider_subscription_id)
);

CREATE UNIQUE INDEX billing_subscriptions_one_current_per_account_idx
  ON hosted.billing_subscriptions (account_id, provider, livemode)
  WHERE is_current;

CREATE INDEX billing_subscriptions_customer_idx
  ON hosted.billing_subscriptions (billing_customer_id);

CREATE INDEX billing_subscriptions_current_period_end_idx
  ON hosted.billing_subscriptions (current_period_end)
  WHERE is_current;

CREATE TABLE hosted.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES hosted.accounts(id) ON DELETE RESTRICT,
  billing_subscription_id uuid REFERENCES hosted.billing_subscriptions(id) ON DELETE RESTRICT,
  plan varchar(40) NOT NULL,
  status varchar(64) NOT NULL,
  policy_version varchar(80) NOT NULL,
  effective_start_at timestamptz NOT NULL,
  effective_end_at timestamptz,
  access_ends_at timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  source_kind varchar(32) NOT NULL,
  source_reference varchar(255),
  grant_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT entitlements_plan_check
    CHECK (plan IN ('free', 'student_pro')),
  CONSTRAINT entitlements_status_check
    CHECK (status ~ '^[a-z][a-z0-9_]{0,63}$'),
  CONSTRAINT entitlements_policy_version_check
    CHECK (policy_version ~ '^[A-Za-z0-9._-]{3,80}$'),
  CONSTRAINT entitlements_effective_period_check
    CHECK (effective_end_at IS NULL OR effective_end_at >= effective_start_at),
  CONSTRAINT entitlements_access_end_check
    CHECK (access_ends_at IS NULL OR access_ends_at >= effective_start_at),
  CONSTRAINT entitlements_source_kind_check
    CHECK (source_kind IN ('policy', 'subscription', 'promotion', 'manual')),
  CONSTRAINT entitlements_grant_overrides_check
    CHECK (jsonb_typeof(grant_overrides) = 'object')
);

CREATE UNIQUE INDEX entitlements_one_current_per_account_idx
  ON hosted.entitlements (account_id)
  WHERE is_current;

CREATE INDEX entitlements_account_history_idx
  ON hosted.entitlements (account_id, effective_start_at DESC);

CREATE TABLE hosted.usage_allowance_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES hosted.accounts(id) ON DELETE RESTRICT,
  entitlement_id uuid REFERENCES hosted.entitlements(id) ON DELETE RESTRICT,
  policy_version varchar(80) NOT NULL,
  action varchar(64) NOT NULL,
  unit varchar(24) NOT NULL,
  period_kind varchar(32) NOT NULL,
  period_key varchar(255) NOT NULL,
  period_start_at timestamptz NOT NULL,
  period_end_at timestamptz,
  allowance_limit bigint,
  reserved_units bigint NOT NULL DEFAULT 0,
  committed_units bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT usage_allowance_periods_policy_version_check
    CHECK (policy_version ~ '^[A-Za-z0-9._-]{3,80}$'),
  CONSTRAINT usage_allowance_periods_action_check
    CHECK (
      action IN (
        'study_build',
        'quiz_build',
        'visual_followup',
        'journey_summary',
        'classification_batch',
        'video_processing',
        'multi_source_preview'
      )
    ),
  CONSTRAINT usage_allowance_periods_unit_check
    CHECK (unit IN ('action', 'batch', 'millisecond')),
  CONSTRAINT usage_allowance_periods_action_unit_check
    CHECK (
      (action = 'classification_batch' AND unit = 'batch')
      OR (action = 'video_processing' AND unit = 'millisecond')
      OR (
        action IN (
          'study_build',
          'quiz_build',
          'visual_followup',
          'journey_summary',
          'multi_source_preview'
        )
        AND unit = 'action'
      )
    ),
  CONSTRAINT usage_allowance_periods_kind_check
    CHECK (period_kind IN ('free_calendar_month', 'subscription_month', 'lifetime')),
  CONSTRAINT usage_allowance_periods_window_check
    CHECK (
      (period_kind = 'lifetime' AND period_end_at IS NULL)
      OR (
        period_kind <> 'lifetime'
        AND period_end_at IS NOT NULL
        AND period_end_at > period_start_at
      )
    ),
  CONSTRAINT usage_allowance_periods_limit_check
    CHECK (allowance_limit IS NULL OR allowance_limit >= 0),
  CONSTRAINT usage_allowance_periods_counter_check
    CHECK (
      reserved_units >= 0
      AND committed_units >= 0
      AND (
        allowance_limit IS NULL
        OR reserved_units + committed_units <= allowance_limit
      )
    ),
  CONSTRAINT usage_allowance_periods_account_key_unique
    UNIQUE (account_id, policy_version, action, period_key)
);

CREATE INDEX usage_allowance_periods_account_action_idx
  ON hosted.usage_allowance_periods (account_id, action, period_start_at DESC);

CREATE TABLE hosted.usage_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES hosted.accounts(id) ON DELETE RESTRICT,
  idempotency_key varchar(160) NOT NULL,
  request_digest char(64) NOT NULL,
  route_name varchar(80) NOT NULL,
  state varchar(24) NOT NULL,
  plan_at_reservation varchar(40) NOT NULL,
  policy_version varchar(80) NOT NULL,
  source_type varchar(24),
  input_size_bucket varchar(24),
  result_code varchar(80),
  expires_at timestamptz NOT NULL,
  committed_at timestamptz,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT usage_operations_idempotency_key_check
    CHECK (idempotency_key ~ '^[A-Za-z0-9._:-]{16,160}$'),
  CONSTRAINT usage_operations_request_digest_check
    CHECK (request_digest ~ '^[a-f0-9]{64}$'),
  CONSTRAINT usage_operations_route_name_check
    CHECK (route_name ~ '^[a-z0-9/_-]{3,80}$'),
  CONSTRAINT usage_operations_state_check
    CHECK (state IN ('reserved', 'committed', 'released', 'expired')),
  CONSTRAINT usage_operations_plan_check
    CHECK (plan_at_reservation IN ('free', 'student_pro')),
  CONSTRAINT usage_operations_policy_version_check
    CHECK (policy_version ~ '^[A-Za-z0-9._-]{3,80}$'),
  CONSTRAINT usage_operations_source_type_check
    CHECK (
      source_type IS NULL
      OR source_type IN ('webpage', 'notes', 'video', 'collection', 'unknown')
    ),
  CONSTRAINT usage_operations_input_size_bucket_check
    CHECK (
      input_size_bucket IS NULL
      OR input_size_bucket IN ('none', 'xs', 'small', 'medium', 'large', 'xl')
    ),
  CONSTRAINT usage_operations_result_code_check
    CHECK (
      result_code IS NULL
      OR result_code ~ '^[A-Z][A-Z0-9_]{0,79}$'
    ),
  CONSTRAINT usage_operations_expiry_check
    CHECK (expires_at > created_at),
  CONSTRAINT usage_operations_transition_timestamps_check
    CHECK (
      (
        state = 'reserved'
        AND committed_at IS NULL
        AND released_at IS NULL
        AND result_code IS NULL
      )
      OR (
        state = 'committed'
        AND committed_at IS NOT NULL
        AND released_at IS NULL
        AND result_code IS NOT NULL
      )
      OR (
        state IN ('released', 'expired')
        AND committed_at IS NULL
        AND released_at IS NOT NULL
        AND result_code IS NOT NULL
      )
    )
);

CREATE INDEX usage_operations_reserved_expiry_idx
  ON hosted.usage_operations (expires_at)
  WHERE state = 'reserved';

CREATE INDEX usage_operations_account_idempotency_idx
  ON hosted.usage_operations (account_id, idempotency_key, created_at DESC);

-- Released/expired work may be retried with the same client key, but only one
-- live or committed operation for that key can exist at a time.
CREATE UNIQUE INDEX usage_operations_live_idempotency_unique_idx
  ON hosted.usage_operations (account_id, idempotency_key)
  WHERE state IN ('reserved', 'committed');

CREATE INDEX usage_operations_account_created_idx
  ON hosted.usage_operations (account_id, created_at DESC);

CREATE TABLE hosted.usage_operation_items (
  usage_operation_id uuid NOT NULL REFERENCES hosted.usage_operations(id) ON DELETE RESTRICT,
  ordinal smallint NOT NULL,
  allowance_period_id uuid NOT NULL REFERENCES hosted.usage_allowance_periods(id) ON DELETE RESTRICT,
  action varchar(64) NOT NULL,
  unit varchar(24) NOT NULL,
  units bigint NOT NULL,
  allowance_limit_at_reservation bigint,
  PRIMARY KEY (usage_operation_id, ordinal),
  CONSTRAINT usage_operation_items_ordinal_check
    CHECK (ordinal BETWEEN 1 AND 4),
  CONSTRAINT usage_operation_items_action_check
    CHECK (
      action IN (
        'study_build',
        'quiz_build',
        'visual_followup',
        'journey_summary',
        'classification_batch',
        'video_processing',
        'multi_source_preview'
      )
    ),
  CONSTRAINT usage_operation_items_unit_check
    CHECK (unit IN ('action', 'batch', 'millisecond')),
  CONSTRAINT usage_operation_items_action_unit_check
    CHECK (
      (action = 'classification_batch' AND unit = 'batch')
      OR (action = 'video_processing' AND unit = 'millisecond')
      OR (
        action IN (
          'study_build',
          'quiz_build',
          'visual_followup',
          'journey_summary',
          'multi_source_preview'
        )
        AND unit = 'action'
      )
    ),
  CONSTRAINT usage_operation_items_units_check
    CHECK (units BETWEEN 1 AND 43200000),
  CONSTRAINT usage_operation_items_limit_check
    CHECK (
      allowance_limit_at_reservation IS NULL
      OR allowance_limit_at_reservation >= 0
    ),
  CONSTRAINT usage_operation_items_operation_action_unique
    UNIQUE (usage_operation_id, action)
);

CREATE INDEX usage_operation_items_period_idx
  ON hosted.usage_operation_items (allowance_period_id);

CREATE TABLE hosted.usage_operation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_operation_id uuid NOT NULL REFERENCES hosted.usage_operations(id) ON DELETE RESTRICT,
  from_state varchar(24),
  to_state varchar(24) NOT NULL,
  result_code varchar(80),
  actor varchar(24) NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT usage_operation_events_from_state_check
    CHECK (
      from_state IS NULL
      OR from_state IN ('reserved', 'committed', 'released', 'expired')
    ),
  CONSTRAINT usage_operation_events_to_state_check
    CHECK (to_state IN ('reserved', 'committed', 'released', 'expired')),
  CONSTRAINT usage_operation_events_result_code_check
    CHECK (
      result_code IS NULL
      OR result_code ~ '^[A-Z][A-Z0-9_]{0,79}$'
    ),
  CONSTRAINT usage_operation_events_actor_check
    CHECK (actor IN ('api', 'worker', 'sweeper', 'operator')),
  CONSTRAINT usage_operation_events_operation_state_unique
    UNIQUE (usage_operation_id, to_state)
);

CREATE INDEX usage_operation_events_operation_time_idx
  ON hosted.usage_operation_events (usage_operation_id, occurred_at);

CREATE TABLE hosted.usage_operation_provider_metrics (
  usage_operation_id uuid NOT NULL REFERENCES hosted.usage_operations(id) ON DELETE RESTRICT,
  provider varchar(64) NOT NULL,
  model varchar(120) NOT NULL,
  operation varchar(80) NOT NULL,
  calls integer NOT NULL DEFAULT 0,
  retries integer NOT NULL DEFAULT 0,
  transport_failures integer NOT NULL DEFAULT 0,
  validation_rejections integer NOT NULL DEFAULT 0,
  input_tokens bigint NOT NULL DEFAULT 0,
  output_tokens bigint NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(18, 8) NOT NULL DEFAULT 0,
  unpriced_calls integer NOT NULL DEFAULT 0,
  PRIMARY KEY (usage_operation_id, provider, model, operation),
  CONSTRAINT usage_operation_provider_metrics_identifier_check
    CHECK (
      provider ~ '^[a-z0-9._-]{1,64}$'
      AND model ~ '^[a-z0-9._-]{1,120}$'
      AND operation ~ '^[a-z0-9._-]{1,80}$'
    ),
  CONSTRAINT usage_operation_provider_metrics_counts_check
    CHECK (
      calls >= 0
      AND retries >= 0
      AND retries <= calls
      AND transport_failures >= 0
      AND validation_rejections >= 0
      AND input_tokens >= 0
      AND output_tokens >= 0
      AND unpriced_calls >= 0
      AND unpriced_calls <= calls
      AND estimated_cost_usd >= 0
    )
);

CREATE TABLE hosted.webhook_receipts (
  provider varchar(32) NOT NULL,
  livemode boolean NOT NULL,
  provider_event_id varchar(255) NOT NULL,
  event_type varchar(120) NOT NULL,
  provider_object_id varchar(255),
  event_created_epoch bigint NOT NULL,
  signature_verified_at timestamptz NOT NULL,
  processing_state varchar(24) NOT NULL DEFAULT 'pending',
  outcome varchar(80),
  attempt_count integer NOT NULL DEFAULT 0,
  last_error_code varchar(80),
  received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  processed_at timestamptz,
  PRIMARY KEY (provider, livemode, provider_event_id),
  CONSTRAINT webhook_receipts_provider_check
    CHECK (provider IN ('stripe')),
  CONSTRAINT webhook_receipts_event_id_check
    CHECK (provider_event_id ~ '^[A-Za-z0-9_:-]{3,255}$'),
  CONSTRAINT webhook_receipts_event_type_check
    CHECK (event_type ~ '^[a-z0-9._-]{3,120}$'),
  CONSTRAINT webhook_receipts_event_created_check
    CHECK (event_created_epoch > 0),
  CONSTRAINT webhook_receipts_processing_state_check
    CHECK (processing_state IN ('pending', 'processing', 'processed', 'ignored', 'failed')),
  CONSTRAINT webhook_receipts_outcome_check
    CHECK (
      outcome IS NULL
      OR outcome ~ '^[a-z0-9_]{1,80}$'
    ),
  CONSTRAINT webhook_receipts_attempt_count_check
    CHECK (attempt_count >= 0),
  CONSTRAINT webhook_receipts_error_code_check
    CHECK (
      last_error_code IS NULL
      OR last_error_code ~ '^[A-Z][A-Z0-9_]{0,79}$'
    ),
  CONSTRAINT webhook_receipts_processed_at_check
    CHECK (
      (
        processing_state IN ('processed', 'ignored')
        AND processed_at IS NOT NULL
      )
      OR processing_state IN ('pending', 'processing', 'failed')
    )
);

CREATE INDEX webhook_receipts_pending_idx
  ON hosted.webhook_receipts (received_at)
  WHERE processing_state IN ('pending', 'failed');

CREATE INDEX webhook_receipts_object_idx
  ON hosted.webhook_receipts (provider, livemode, provider_object_id, event_created_epoch DESC)
  WHERE provider_object_id IS NOT NULL;

CREATE FUNCTION hosted.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;

CREATE TRIGGER accounts_set_updated_at
BEFORE UPDATE ON hosted.accounts
FOR EACH ROW EXECUTE FUNCTION hosted.set_updated_at();

CREATE TRIGGER account_identities_set_updated_at
BEFORE UPDATE ON hosted.account_identities
FOR EACH ROW EXECUTE FUNCTION hosted.set_updated_at();

CREATE TRIGGER billing_customers_set_updated_at
BEFORE UPDATE ON hosted.billing_customers
FOR EACH ROW EXECUTE FUNCTION hosted.set_updated_at();

CREATE TRIGGER billing_checkout_attempts_set_updated_at
BEFORE UPDATE ON hosted.billing_checkout_attempts
FOR EACH ROW EXECUTE FUNCTION hosted.set_updated_at();

CREATE TRIGGER billing_subscriptions_set_updated_at
BEFORE UPDATE ON hosted.billing_subscriptions
FOR EACH ROW EXECUTE FUNCTION hosted.set_updated_at();

CREATE TRIGGER entitlements_set_updated_at
BEFORE UPDATE ON hosted.entitlements
FOR EACH ROW EXECUTE FUNCTION hosted.set_updated_at();

CREATE TRIGGER usage_allowance_periods_set_updated_at
BEFORE UPDATE ON hosted.usage_allowance_periods
FOR EACH ROW EXECUTE FUNCTION hosted.set_updated_at();

CREATE TRIGGER usage_operations_set_updated_at
BEFORE UPDATE ON hosted.usage_operations
FOR EACH ROW EXECUTE FUNCTION hosted.set_updated_at();

COMMENT ON TABLE hosted.webhook_receipts IS
  'Signature-verified, content-free webhook deduplication and processing metadata. Never store the raw webhook payload here.';

COMMENT ON TABLE hosted.usage_operations IS
  'One idempotent learner-visible hosted action. Raw source text, prompts, generated artifacts, URLs, audio, and credentials are prohibited.';

COMMENT ON TABLE hosted.usage_operation_provider_metrics IS
  'Sanitized per-provider cost and reliability aggregates; never provider response bodies.';

INSERT INTO hosted.schema_migrations (version) VALUES ('001_initial');

COMMIT;
