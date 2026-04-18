# NocoDB Setup Guide

## Option 1: Coolify Deployment (Production)

1. In Coolify dashboard, go to **New Resource → Docker Image**
2. Image: `nocodb/nocodb:latest`
3. Set environment variables:
   - `NC_DB`: `pg://db-host:5432?u=postgres&p=<password>&d=nocodb`
   (Or use SQLite by not setting NC_DB — simpler but less robust)
4. Expose port 8080
5. Deploy and wait for it to be healthy
6. Access NocoDB at the deployed URL

## Option 2: Docker Compose (Local Development)

```bash
docker compose up nocodb db
```

NocoDB will be available at `http://localhost:8080`.

## Create the Songs Table

1. Open NocoDB in your browser
2. Create a new base (or use the default)
3. Create a table named **songs** with these columns:

| Column | Type | Required | Notes |
|---|---|---|---|
| `source` | SingleLineText | Yes | `"airtable"` or `"app"` |
| `airtable_record_id` | SingleLineText | No | Unique. For deduplication during sync |
| `submitter_name` | SingleLineText | Yes | Person who submitted the song |
| `submitter_email` | SingleLineText | No | Only for app submissions |
| `artist_name` | SingleLineText | No | From Airtable records |
| `song_title` | SingleLineText | No | From Airtable records |
| `description` | LongText | No | User-provided description |
| `youtube_url` | SingleLineText | Yes | Full YouTube URL |
| `youtube_video_id` | SingleLineText | Yes | Extracted video ID |
| `submitted_date` | Date | Yes | When the song was submitted |
| `month` | Number | Yes | Month number (1-12) |
| `year` | Number | Yes | Year (e.g. 2025) |

The `Id`, `CreatedAt`, and `UpdatedAt` columns are created automatically by NocoDB.

## Generate API Token

1. Go to NocoDB **Settings** (top-right user menu)
2. Navigate to **API Tokens**
3. Create a new token with a descriptive name (e.g. "fm-playlist-server")
4. Copy the token — this is your `NOCODB_API_TOKEN`

## Get Table ID

1. Open the songs table
2. Look at the URL — the table ID is in the path (e.g. `tbl_xxxxx`)
3. Alternatively, use the NocoDB API: `GET /api/v2/meta/tables`
4. This value goes into `NOCODB_TABLE_ID`

## Environment Variables

```env
NOCODB_BASE_URL=http://localhost:8080   # or your Coolify NocoDB URL
NOCODB_API_TOKEN=<your-api-token>
NOCODB_TABLE_ID=<your-table-id>
```
