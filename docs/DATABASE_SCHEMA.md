# Database Schema

Single Postgres table for songs from both Airtable (legacy) and the new app.
The schema is auto-provisioned on first `docker compose up` via
[../db/init/001_schema.sql](../db/init/001_schema.sql) and also guarded at
app startup by `ensureSchema()` in [../src/lib/db.ts](../src/lib/db.ts).

## `songs` Table

| Column               | Type          | Null | Description |
|---|---|---|---|
| `id`                 | `SERIAL PK`   | No  | Auto-increment primary key |
| `source`             | `TEXT`        | No  | `"airtable"` for synced records, `"app"` for new submissions |
| `airtable_record_id` | `TEXT UNIQUE` | Yes | Original Airtable record ID. Unique for dedup during sync |
| `submitter_name`     | `TEXT`        | No  | For Airtable: `fields.submitterName`. For app: Google display name |
| `submitter_email`    | `TEXT`        | Yes | Only populated for app submissions (from Clerk user) |
| `artist_name`        | `TEXT`        | Yes | From Airtable `fields.artistName` |
| `song_title`         | `TEXT`        | Yes | From Airtable `fields.songTitle` |
| `description`        | `TEXT`        | Yes | From Airtable `fields.songDescription` or user input |
| `youtube_url`        | `TEXT`        | No  | Full YouTube URL as submitted |
| `youtube_video_id`   | `TEXT`        | No  | Extracted YouTube video ID |
| `submitted_date`     | `DATE`        | No  | Submission date |
| `month`              | `SMALLINT`    | No  | 1-12, extracted from `submitted_date` |
| `year`               | `INTEGER`     | No  | e.g. 2025 |
| `created_at`         | `TIMESTAMPTZ` | No  | Auto-populated |
| `updated_at`         | `TIMESTAMPTZ` | No  | Auto-updated via trigger |

Indexes: `(submitted_date DESC)`, `(year, month)`, `(youtube_video_id)`.

## Data Flow

### Airtable → Postgres Sync

1. On every page load the server fetches records from both Airtable and Postgres in parallel.
2. New Airtable records (not yet in Postgres) are bulk-inserted with
   `ON CONFLICT (airtable_record_id) DO NOTHING` so sync is idempotent.
3. Once synced, Postgres is self-sufficient even if Airtable is later removed.

### New App Submissions

1. User submits a YouTube URL + optional description.
2. Server extracts the video ID and sets submitter from the Clerk user.
3. Record is inserted into Postgres with `source: "app"`.

## Airtable Schema (Read-Only, Legacy)

Airtable table `videos` in base `appapOlGrcy5YNJ7A`:

| Field             | Type   | Example |
|---|---|---|
| `submitterName`   | String | `"Chanaka Karunarathne"` |
| `artistName`      | String | `"Sunidhi, Labh Janjua"` |
| `songTitle`       | String | `"Dance Pe Chance"` |
| `songDescription` | String | `"This is a song from one of my favorite movies."` |
| `youtubeLink`     | URL    | `"https://www.youtube.com/watch?v=rap8SoUIPaw"` |
| `submittedDate`   | Date   | `"2025-02-18"` |
| `Month`           | Number | `2` |
