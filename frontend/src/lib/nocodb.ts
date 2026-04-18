import "server-only";

import type { Song, NocoDBRow } from "@/types/song";

const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL;
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const NOCODB_TABLE_ID = process.env.NOCODB_TABLE_ID;

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
    month: row.month,
    year: row.year,
  };
}

export async function fetchAllNocoDBSongs(): Promise<Song[]> {
  if (!NOCODB_BASE_URL || !NOCODB_API_TOKEN || !NOCODB_TABLE_ID) {
    console.warn("NocoDB credentials not configured, skipping NocoDB fetch");
    return [];
  }

  const allSongs: Song[] = [];
  let offset = 0;
  const limit = 200;

  do {
    const url = new URL(getApiUrl());
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("offset", offset.toString());
    url.searchParams.set("sort", "-submitted_date");

    const response = await fetch(url.toString(), {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`NocoDB API error: ${response.status} ${response.statusText}`);
      break;
    }

    const data = await response.json();
    const rows: NocoDBRow[] = data.list || [];

    for (const row of rows) {
      allSongs.push(rowToSong(row));
    }

    if (rows.length < limit) break;
    offset += limit;
  } while (true);

  return allSongs;
}

export async function createNocoDBSong(song: Omit<NocoDBRow, "Id" | "CreatedAt" | "UpdatedAt">): Promise<Song> {
  const response = await fetch(getApiUrl(), {
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

export async function findByAirtableRecordId(recordId: string): Promise<NocoDBRow | null> {
  const url = new URL(getApiUrl());
  url.searchParams.set("where", `(airtable_record_id,eq,${recordId})`);
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = await response.json();
  const rows: NocoDBRow[] = data.list || [];
  return rows[0] || null;
}

export async function upsertAirtableSong(song: Omit<NocoDBRow, "Id" | "CreatedAt" | "UpdatedAt">): Promise<void> {
  if (!song.airtable_record_id) return;

  const existing = await findByAirtableRecordId(song.airtable_record_id);
  if (existing) return; // Already synced

  await createNocoDBSong(song);
}
