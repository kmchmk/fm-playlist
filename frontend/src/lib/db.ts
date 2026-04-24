import "server-only";

import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

// Reuse the pool across Next.js dev HMR reloads.
const globalForPg = globalThis as unknown as {
  __pgPool?: Pool;
  __pgSchemaReady?: Promise<void>;
};

function createPool(): Pool {
  if (!DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. The app requires a Postgres connection string."
    );
  }
  return new Pool({ connectionString: DATABASE_URL, max: 10 });
}

export function getPool(): Pool {
  if (!globalForPg.__pgPool) {
    globalForPg.__pgPool = createPool();
  }
  return globalForPg.__pgPool;
}

// Idempotent schema bootstrap. The Postgres container's
// /docker-entrypoint-initdb.d/ also creates this on a fresh volume; this
// runtime safety net covers pre-existing volumes.
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS songs (
  id                   SERIAL PRIMARY KEY,
  source               TEXT        NOT NULL,
  airtable_record_id   TEXT        UNIQUE,
  submitter_name       TEXT        NOT NULL,
  submitter_email      TEXT,
  artist_name          TEXT,
  song_title           TEXT,
  description          TEXT,
  youtube_url          TEXT        NOT NULL,
  youtube_video_id     TEXT        NOT NULL,
  submitted_date       DATE        NOT NULL,
  month                SMALLINT    NOT NULL,
  year                 INTEGER     NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS songs_submitted_date_idx
  ON songs (submitted_date DESC);
CREATE INDEX IF NOT EXISTS songs_year_month_idx
  ON songs (year, month);
CREATE INDEX IF NOT EXISTS songs_youtube_video_id_idx
  ON songs (youtube_video_id);

CREATE OR REPLACE FUNCTION songs_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS songs_set_updated_at ON songs;
CREATE TRIGGER songs_set_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION songs_set_updated_at();
`;

export function ensureSchema(): Promise<void> {
  if (!globalForPg.__pgSchemaReady) {
    globalForPg.__pgSchemaReady = getPool()
      .query(SCHEMA_SQL)
      .then(() => undefined)
      .catch((err) => {
        // Let the next call retry if this one fails.
        globalForPg.__pgSchemaReady = undefined;
        throw err;
      });
  }
  return globalForPg.__pgSchemaReady;
}
