# Airtable Integration

## Overview

Airtable is the optional legacy data source. Historical playlist data can be
read from Airtable and copied into Postgres. Postgres is the source of truth for
the app, and Airtable can be disabled after historical rows have been imported.

## Airtable Details

- **Base ID:** `AIRTABLE_BASE_ID` environment variable
- **Table:** `videos`
- **View:** `FM Playlist`
- **API:** Airtable REST API with a personal access token
- **Access:** Read-only from the app's perspective

## Data Fetching

`fetchAllAirtableRecords()` in `src/lib/airtable.ts`:

1. Calls Airtable's List Records API with `pageSize=100`.
2. Uses Airtable's `offset` value until pagination is complete.
3. Retries HTTP 429 responses with exponential backoff up to 4 times.
4. Uses Next.js `fetch` revalidation for a 5 minute cache window.
5. Stops after 200 pages as a guard against unexpected API behavior.

Rows are skipped when they have no YouTube URL, an unsupported YouTube URL, or
an invalid date. Skip counts are logged with a `[SYNC]` prefix.

## Unified Data Layer

`getAllSongs()` in `src/lib/songs.ts`:

1. Fetches Airtable records and Postgres records in parallel.
2. Treats Postgres as required. If Postgres fails, the app/API surfaces an
   error instead of returning an empty playlist.
3. Treats Airtable as optional. If Airtable fails or is unconfigured, Postgres
   data is still served.
4. Deduplicates with both `airtable_record_id` and a composite fallback of
   submitter name, submitted date, and YouTube URL.
5. Includes app-only records with `source: "app"`.

## Sync-On-Read

When Airtable returns records that are not yet in Postgres:

1. `getAllSongs()` builds `SongInsert` rows for the missing Airtable records.
2. `bulkCreateSongRows()` inserts them with `source: "airtable"`.
3. `ON CONFLICT (airtable_record_id) DO NOTHING` keeps sync idempotent.
4. The current response includes the newly fetched Airtable rows, even before a
   later request reads them back from Postgres.
5. Sync insert failures are logged and the request still returns merged data.

This is not a background worker. Sync happens during authenticated reads of the
playlist.

## Migration Path

Once all Airtable records are synced to Postgres:

1. Compare counts by source in Postgres and Airtable.
2. Stop adding new records to Airtable.
3. Remove `AIRTABLE_API_TOKEN` and `AIRTABLE_BASE_ID` from the deployment.
4. The app will read from Postgres only.

## API Endpoint Used

```text
GET https://api.airtable.com/v0/{baseId}/videos
Authorization: Bearer {token}
```

Query parameters:

- `view`: `FM Playlist`
- `pageSize`: `100`
- `sort[0][field]`: `submittedDate`
- `sort[0][direction]`: `desc`
- `offset`: returned by the previous response, when present

## Expected Record Shape

```json
{
  "records": [
    {
      "id": "recJ4hrkxsr2AV8ch",
      "createdTime": "2025-01-13T16:14:55.000Z",
      "fields": {
        "submitterName": "John Doe",
        "artistName": "Artist Name",
        "songTitle": "Song Title",
        "songDescription": "Description",
        "youtubeLink": "https://www.youtube.com/watch?v=xxxxx",
        "submittedDate": "2025-02-18"
      }
    }
  ],
  "offset": "itr..."
}
```