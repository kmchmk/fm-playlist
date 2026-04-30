# Database Schema

FM Playlist stores songs in one Postgres table. Rows come from two sources:
Airtable legacy sync and new app submissions. Postgres is the source of truth.

The schema is auto-provisioned on first `docker compose up` by
[../db/init/001_schema.sql](../db/init/001_schema.sql) and guarded at runtime by
`ensureSchema()` in [../src/lib/db.ts](../src/lib/db.ts).

## `songs` Table

| Column | Type | Null | Description |
|---|---|---|---|
| `id` | `SERIAL PK` | No | Auto-increment primary key |
| `source` | `TEXT` | No | `airtable` for synced rows, `app` for new submissions |
| `airtable_record_id` | `TEXT UNIQUE` | Yes | Original Airtable record ID for sync idempotency |
| `submitter_name` | `TEXT` | No | Airtable submitter or Clerk display name |
| `submitter_email` | `TEXT` | Yes | Populated only for app submissions |
| `artist_name` | `TEXT` | Yes | Airtable artist field |
| `song_title` | `TEXT` | Yes | Airtable title field |
| `description` | `TEXT` | Yes | Airtable description or app-provided note |
| `youtube_url` | `TEXT` | No | Full submitted YouTube URL |
| `youtube_video_id` | `TEXT` | No | Extracted 11-character YouTube video ID |
| `submitted_date` | `DATE` | No | Submission date as `YYYY-MM-DD` |
| `month` | `SMALLINT` | No | 1-12, derived from `submitted_date` |
| `year` | `INTEGER` | No | Derived from `submitted_date` |
| `created_at` | `TIMESTAMPTZ` | No | Auto-populated |
| `updated_at` | `TIMESTAMPTZ` | No | Auto-updated by trigger |

Indexes:

- `songs_submitted_date_idx` on `submitted_date DESC`
- `songs_year_month_idx` on `(year, month)`
- `songs_youtube_video_id_idx` on `youtube_video_id`

Constraints:

- `source` must be `airtable` or `app`.
- `youtube_video_id` must match `^[A-Za-z0-9_-]{11}$`.
- `month` must be between 1 and 12.
- `year` must be between 2000 and 2100.

Existing volumes receive these checks through `ensureSchema()` with `NOT VALID`
constraints. That avoids rejecting old rows during startup while enforcing new
writes. Fresh databases get the same constraints at table creation time.

## Data Flow

### Airtable To Postgres

1. Authenticated page/API reads call `getAllSongs()`.
2. The server fetches Airtable records and Postgres records in parallel.
3. Postgres failures throw; Airtable failures degrade to Postgres-only data.
4. Missing Airtable rows are inserted into Postgres with
   `ON CONFLICT (airtable_record_id) DO NOTHING`.
5. Results are sorted newest first by normalized date.

### New App Submissions

1. User submits a YouTube URL and optional description.
2. `/api/songs` validates JSON with Zod and requires an allowed Clerk user.
3. YouTube video ID is extracted from supported YouTube URL shapes only.
4. Submitter name/email come from Clerk.
5. Record is inserted into Postgres with `source: "app"`.

Descriptions are limited to 500 characters. Dates are normalized to
`YYYY-MM-DD`, and `month` and `year` are derived from that same value.

## Airtable Fields

The app reads these fields from the Airtable `videos` table:

| Field | Type | Example |
|---|---|---|
| `submitterName` | String | `Chanaka Karunarathne` |
| `artistName` | String | `Sunidhi, Labh Janjua` |
| `songTitle` | String | `Dance Pe Chance` |
| `songDescription` | String | `This is a song from one of my favorite movies.` |
| `youtubeLink` | URL | `https://www.youtube.com/watch?v=rap8SoUIPaw` |
| `submittedDate` | Date | `2025-02-18` |