# Database Schema

## NocoDB — `songs` Table

Single unified table for songs from both Airtable (legacy) and the new app.

| Column | Type | Required | Description |
|---|---|---|---|
| `Id` | Auto-increment | Auto | Primary key (NocoDB auto-generated) |
| `source` | SingleLineText | Yes | `"airtable"` for synced records, `"app"` for new submissions |
| `airtable_record_id` | SingleLineText | No | Original Airtable record ID (e.g. `recJ4hrkxsr2AV8ch`). Used for deduplication during sync. Should be unique when present. |
| `submitter_name` | SingleLineText | Yes | For Airtable records: `fields.submitterName`. For app records: Google account display name. |
| `submitter_email` | SingleLineText | No | Only populated for app submissions (from Auth0 session). |
| `artist_name` | SingleLineText | No | From Airtable `fields.artistName`. Not captured in new app form. |
| `song_title` | SingleLineText | No | From Airtable `fields.songTitle`. Not captured in new app form. |
| `description` | LongText | No | From Airtable `fields.songDescription` or user input in new app. |
| `youtube_url` | SingleLineText | Yes | Full YouTube URL as submitted. |
| `youtube_video_id` | SingleLineText | Yes | Extracted YouTube video ID (e.g. `rap8SoUIPaw`). |
| `submitted_date` | Date | Yes | `YYYY-MM-DD` format. From Airtable `fields.submittedDate` or current date for app submissions. |
| `month` | Number | Yes | Month extracted from `submitted_date` (1-12). |
| `year` | Number | Yes | Year extracted from `submitted_date` (e.g. 2025). |
| `CreatedAt` | DateTime | Auto | NocoDB auto-generated. |
| `UpdatedAt` | DateTime | Auto | NocoDB auto-generated. |

## Data Flow

### Airtable → NocoDB Sync

1. On every page load, the server fetches all records from both Airtable and NocoDB in parallel
2. Records are merged by matching `airtable_record_id`
3. Any Airtable records not yet in NocoDB are upserted in the background
4. This ensures NocoDB has a copy of all data even if Airtable is later removed

### New App Submissions

1. User submits YouTube URL + optional description via the app
2. Server extracts video ID, sets submitter from Auth0 session
3. Record is inserted into NocoDB with `source: "app"`

## Airtable Schema (Read-Only, Legacy)

The existing Airtable table `videos` in base `appapOlGrcy5YNJ7A`:

| Field | Type | Example |
|---|---|---|
| `submitterName` | String | `"Chanaka Karunarathne"` |
| `artistName` | String | `"Sunidhi, Labh Janjua"` |
| `songTitle` | String | `"Dance Pe Chance"` |
| `songDescription` | String | `"This is a song from one of my favorite movies."` |
| `youtubeLink` | URL | `"https://www.youtube.com/watch?v=rap8SoUIPaw"` |
| `submittedDate` | Date | `"2025-02-18"` |
| `Month` | Number | `2` |
