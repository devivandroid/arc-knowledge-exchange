CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_receipts (
  tx_hash TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  seller_address TEXT NOT NULL,
  amount_usdc TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_events (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  event_type TEXT NOT NULL,
  data JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participants (
  wallet_address TEXT PRIMARY KEY,
  user_type TEXT,
  entity_type TEXT,
  participant_type TEXT,
  participant_name TEXT,
  operator_address TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_type TEXT;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS entity_type TEXT;

CREATE TABLE IF NOT EXISTS resource_ratings (
  resource_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (resource_id, wallet_address)
);

CREATE TABLE IF NOT EXISTS resource_files (
  resource_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  checksum TEXT,
  storage_provider TEXT NOT NULL DEFAULT 'supabase',
  storage_key TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (resource_id, filename)
);

CREATE TABLE IF NOT EXISTS arc_network_snapshots (
  wallet_address TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  from_block BIGINT NOT NULL,
  to_block BIGINT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS resources_created_at_idx ON resources (created_at DESC);
CREATE INDEX IF NOT EXISTS requests_created_at_idx ON requests (created_at DESC);
CREATE INDEX IF NOT EXISTS risk_events_wallet_idx ON risk_events (LOWER(wallet_address));
CREATE INDEX IF NOT EXISTS risk_events_occurred_at_idx ON risk_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS resource_ratings_resource_idx ON resource_ratings (resource_id);
CREATE INDEX IF NOT EXISTS resource_files_resource_idx ON resource_files (resource_id);
CREATE INDEX IF NOT EXISTS arc_network_snapshots_updated_idx ON arc_network_snapshots (updated_at DESC);
