-- Schema for the fm-playlist `songs` table.
-- Automatically executed by the Postgres container on an empty data volume
-- (via /docker-entrypoint-initdb.d). The app also runs the equivalent
-- CREATE ... IF NOT EXISTS statements at startup (see src/lib/db.ts) so
-- pre-existing volumes are brought up to date.

CREATE TABLE IF NOT EXISTS songs (
  id                   SERIAL PRIMARY KEY,
  source               TEXT        NOT NULL CONSTRAINT songs_source_check CHECK (source IN ('airtable', 'app')),
  airtable_record_id   TEXT        UNIQUE,
  submitter_name       TEXT        NOT NULL,
  submitter_email      TEXT,
  artist_name          TEXT,
  song_title           TEXT,
  description          TEXT,
  youtube_url          TEXT        NOT NULL,
  youtube_video_id     TEXT        NOT NULL CONSTRAINT songs_youtube_video_id_check CHECK (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  submitted_date       DATE        NOT NULL,
  month                SMALLINT    NOT NULL CONSTRAINT songs_month_check CHECK (month BETWEEN 1 AND 12),
  year                 INTEGER     NOT NULL CONSTRAINT songs_year_check CHECK (year BETWEEN 2000 AND 2100),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'songs_source_check') THEN
    ALTER TABLE songs ADD CONSTRAINT songs_source_check CHECK (source IN ('airtable', 'app')) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'songs_youtube_video_id_check') THEN
    ALTER TABLE songs ADD CONSTRAINT songs_youtube_video_id_check CHECK (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$') NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'songs_month_check') THEN
    ALTER TABLE songs ADD CONSTRAINT songs_month_check CHECK (month BETWEEN 1 AND 12) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'songs_year_check') THEN
    ALTER TABLE songs ADD CONSTRAINT songs_year_check CHECK (year BETWEEN 2000 AND 2100) NOT VALID;
  END IF;
END $$;

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
