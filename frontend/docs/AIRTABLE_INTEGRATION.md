# Airtable Integration

## Overview

Airtable is the legacy data source. All historical playlist data (from 2021 onwards) lives in an Airtable base. The app reads from Airtable and syncs records into NocoDB as a migration path.

## Airtable Details

- **Base ID**: `appapOlGrcy5YNJ7A`
- **Table**: `videos`
- **View**: `FM Playlist`
- **API**: Airtable REST API with personal access token
- **Access**: Read-only from the app's perspective

## How It Works

### Data Fetching

1. Server calls Airtable's List Records API with pagination (100 records per page)
2. Response includes `offset` for pagination — continues until no offset is returned
3. Rate limits (5 req/sec) are handled with automatic retry after 1 second
4. Results are cached for 5 minutes via Next.js `fetch` with `next.revalidate`

### Unified Data Layer

The `getAllSongs()` function in `src/lib/songs.ts`:

1. Fetches Airtable records and NocoDB records in parallel
2. Normalizes both into the common `Song` interface
3. Deduplicates by matching Airtable records to NocoDB records via `airtable_record_id`
4. NocoDB data takes priority when a record exists in both
5. Includes app-only records (those in NocoDB with `source: "app"`)

### Background Sync

After serving the response, the server triggers a background sync:

1. For each Airtable record not yet in NocoDB, calls `bulkCreateNocoDBSongs()` via `syncAirtableToNocoDB()`
2. This creates a copy in NocoDB with `source: "airtable"` and the original record ID
3. Sync is non-blocking — errors are logged but don't affect the user
4. An in-memory lock (`acquireSyncLock`) prevents concurrent syncs from creating duplicates

### Migration Path

Once all Airtable records are synced to NocoDB:

1. Verify NocoDB has all records (compare counts)
2. Stop the team from adding to Airtable (switch to the app)
3. Optionally remove the `AIRTABLE_API_TOKEN` env var
4. When no Airtable token is configured, the app reads from NocoDB only
5. The Airtable code paths gracefully return empty results when unconfigured

## API Endpoints Used

### List Records

```
GET https://api.airtable.com/v0/{baseId}/{tableName}
Authorization: Bearer {token}
```

Query parameters:
- `view`: `FM Playlist`
- `pageSize`: `100`
- `offset`: (from previous response, for pagination)

### Response Shape

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
        "submittedDate": "2025-02-18",
        "Month": 2
      }
    }
  ],
  "offset": "itr..."
}
```
