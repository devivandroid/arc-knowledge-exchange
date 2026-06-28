import { Pool, type QueryResultRow } from "pg";

const globalForPostgres = globalThis as typeof globalThis & {
  knowledgeExchangePgPool?: Pool;
  knowledgeExchangePgSchemaReady?: Promise<void>;
};

export function isPostgresEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalForPostgres.knowledgeExchangePgPool) {
    globalForPostgres.knowledgeExchangePgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_URL.includes("localhost") ||
        process.env.DATABASE_URL.includes("127.0.0.1")
          ? undefined
          : { rejectUnauthorized: false }
    });
  }

  return globalForPostgres.knowledgeExchangePgPool;
}

export async function ensurePostgresSchema(): Promise<void> {
  if (!isPostgresEnabled()) return;

  if (!globalForPostgres.knowledgeExchangePgSchemaReady) {
    globalForPostgres.knowledgeExchangePgSchemaReady = (async () => {
      const pool = getPool();
      await pool.query(`
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
          participant_type TEXT,
          participant_name TEXT,
          operator_address TEXT,
          data JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS resource_ratings (
          resource_id TEXT NOT NULL,
          wallet_address TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ,
          PRIMARY KEY (resource_id, wallet_address)
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
        CREATE INDEX IF NOT EXISTS arc_network_snapshots_updated_idx ON arc_network_snapshots (updated_at DESC);
      `);
    })();
  }

  await globalForPostgres.knowledgeExchangePgSchemaReady;
}

export async function pgQuery<T extends QueryResultRow>(
  text: string,
  values: unknown[] = []
): Promise<T[]> {
  await ensurePostgresSchema();
  const result = await getPool().query<T>(text, values);
  return result.rows;
}

export async function upsertParticipant(input: {
  walletAddress?: string | null;
  participantType?: string | null;
  participantName?: string | null;
  operatorAddress?: string | null;
  data?: Record<string, unknown>;
}): Promise<void> {
  if (!isPostgresEnabled() || !input.walletAddress) return;

  await pgQuery(
    `
      INSERT INTO participants (
        wallet_address,
        participant_type,
        participant_name,
        operator_address,
        data,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
      ON CONFLICT (wallet_address) DO UPDATE SET
        participant_type = COALESCE(EXCLUDED.participant_type, participants.participant_type),
        participant_name = COALESCE(EXCLUDED.participant_name, participants.participant_name),
        operator_address = COALESCE(EXCLUDED.operator_address, participants.operator_address),
        data = participants.data || EXCLUDED.data,
        updated_at = NOW()
    `,
    [
      input.walletAddress,
      input.participantType ?? null,
      input.participantName ?? null,
      input.operatorAddress ?? null,
      JSON.stringify(input.data ?? {})
    ]
  );
}
