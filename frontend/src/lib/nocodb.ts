import "server-only";

import type { Song, NocoDBRow } from "@/types/song";

const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL;
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const NOCODB_TABLE_ID = process.env.NOCODB_TABLE_ID;

// Rate-limited fetch wrapper with retry on 429
const MIN_REQUEST_INTERVAL_MS = 250; // max ~4 requests/sec
let lastRequestTime = 0;

async function rateLimitedFetch(
  input: string | URL,
  init?: RequestInit
): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();

  const response = await fetch(input, init);

  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
    console.warn(`NocoDB 429 — retrying after ${waitMs}ms`);
    await new Promise((r) => setTimeout(r, waitMs));
    lastRequestTime = Date.now();
    return fetch(input, init);
  }

  return response;
}

function getApiUrl(path: string = ""): string {
  return `${NOCODB_BASE_URL}/api/v2/tables/${NOCODB_TABLE_ID}/records${path}`;
}

function getHeaders(): HeadersInit {
  return {
    "xc-token": NOCODB_API_TOKEN || "",
    "Content-Type": "application/json",
  };
}

function rowToSong(row: NocoDBRow): Song {
  return {
    id: `nc_${row.Id}`,
    source: row.source as "airtable" | "app",
    airtableRecordId: row.airtable_record_id,
    submitterName: row.submitter_name,
    submitterEmail: row.submitter_email,
    artistName: row.artist_name,
    songTitle: row.song_title,
    description: row.description,
    youtubeUrl: row.youtube_url,
    youtubeVideoId: row.youtube_video_id,
    submittedDate: row.submitted_date,
    month: Number(row.month),
    year: Number(row.year),
  };
}

export async function fetchAllNocoDBSongs(): Promise<Song[]> {
  if (!NOCODB_BASE_URL || !NOCODB_API_TOKEN || !NOCODB_TABLE_ID) {
    console.warn("NocoDB credentials not configured, skipping NocoDB fetch");
    return [];
  }

  const allSongs: Song[] = [];
  let offset = 0;
  const limit = 100; // NocoDB caps at 100 per page

  do {
    const url = new URL(getApiUrl());
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("offset", offset.toString());
    url.searchParams.set("sort", "-submitted_date");

    const response = await rateLimitedFetch(url.toString(), {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`NocoDB API error: ${response.status} ${response.statusText}`);
      break;
    }

    const data = await response.json();
    const rows: NocoDBRow[] = data.list || [];
    const pageInfo = data.pageInfo as { isLastPage?: boolean } | undefined;

    for (const row of rows) {
      allSongs.push(rowToSong(row));
    }

    if (rows.length === 0 || pageInfo?.isLastPage) break;
    offset += rows.length;
  } while (true);

  console.log(`[SYNC] fetchAllNocoDBSongs: fetched ${allSongs.length} total rows`);
  return allSongs;
}

export async function createNocoDBSong(song: Omit<NocoDBRow, "Id" | "CreatedAt" | "UpdatedAt">): Promise<Song> {
  const response = await rateLimitedFetch(getApiUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(song),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NocoDB create error: ${response.status} ${text}`);
  }

  const row: NocoDBRow = await response.json();
  return rowToSong(row);
}

/**
 * Bulk insert records into NocoDB. Sends up to 100 records per request
 * (NocoDB's recommended batch size).
 */
export async function bulkCreateNocoDBSongs(
  songs: Omit<NocoDBRow, "Id" | "CreatedAt" | "UpdatedAt">[]
): Promise<void> {
  if (songs.length === 0) return;

  const BATCH_SIZE = 100;
  const errors: string[] = [];

  for (let i = 0; i < songs.length; i += BATCH_SIZE) {
    const batch = songs.slice(i, i + BATCH_SIZE);

    const response = await rateLimitedFetch(getApiUrl(), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const text = await response.text();
      errors.push(`Batch ${i / BATCH_SIZE + 1}: ${response.status} ${text}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`NocoDB bulk create failed: ${errors.join("; ")}`);
  }
}
