import "server-only";

import type { Song } from "@/types/song";
import { ensureSchema, getPool } from "./db";

export interface SongRow {
  id: number;
  source: string;
  airtable_record_id: string | null;
  submitter_name: string;
  submitter_email: string | null;
  artist_name: string | null;
  song_title: string | null;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  submitted_date: string | Date;
  month: number;
  year: number;
}

export type SongInsert = Omit<SongRow, "id">;

function toDateString(d: string | Date): string {
  if (typeof d === "string") return d.split("T")[0];
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function rowToSong(row: SongRow): Song {
  return {
    id: `db_${row.id}`,
    source: row.source as "airtable" | "app",
    airtableRecordId: row.airtable_record_id,
    submitterName: row.submitter_name,
    submitterEmail: row.submitter_email,
    artistName: row.artist_name,
    songTitle: row.song_title,
    description: row.description,
    youtubeUrl: row.youtube_url,
    youtubeVideoId: row.youtube_video_id,
    submittedDate: toDateString(row.submitted_date),
    month: Number(row.month),
    year: Number(row.year),
  };
}

const SELECT_COLS = `
  id, source, airtable_record_id, submitter_name, submitter_email,
  artist_name, song_title, description, youtube_url, youtube_video_id,
  submitted_date, month, year
`;

export async function fetchAllSongs(): Promise<Song[]> {
  await ensureSchema();
  const result = await getPool().query<SongRow>(
    `SELECT ${SELECT_COLS} FROM songs ORDER BY submitted_date DESC, id DESC`
  );
  return result.rows.map(rowToSong);
}

export async function createSongRow(row: SongInsert): Promise<Song> {
  await ensureSchema();
  const result = await getPool().query<SongRow>(
    `INSERT INTO songs (
       source, airtable_record_id, submitter_name, submitter_email,
       artist_name, song_title, description, youtube_url, youtube_video_id,
       submitted_date, month, year
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING ${SELECT_COLS}`,
    [
      row.source,
      row.airtable_record_id,
      row.submitter_name,
      row.submitter_email,
      row.artist_name,
      row.song_title,
      row.description,
      row.youtube_url,
      row.youtube_video_id,
      row.submitted_date,
      row.month,
      row.year,
    ]
  );
  return rowToSong(result.rows[0]);
}

/**
 * Bulk insert. Uses ON CONFLICT (airtable_record_id) DO NOTHING so Airtable
 * sync is idempotent even if the in-memory dedup misses a row.
 */
export async function bulkCreateSongRows(rows: SongInsert[]): Promise<void> {
  if (rows.length === 0) return;
  await ensureSchema();

  const BATCH_SIZE = 500;
  const pool = getPool();

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const values: unknown[] = [];
    const placeholders: string[] = [];

    batch.forEach((r, idx) => {
      const base = idx * 12;
      placeholders.push(
        `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${
          base + 6
        },$${base + 7},$${base + 8},$${base + 9},$${base + 10},$${
          base + 11
        },$${base + 12})`
      );
      values.push(
        r.source,
        r.airtable_record_id,
        r.submitter_name,
        r.submitter_email,
        r.artist_name,
        r.song_title,
        r.description,
        r.youtube_url,
        r.youtube_video_id,
        r.submitted_date,
        r.month,
        r.year
      );
    });

    await pool.query(
      `INSERT INTO songs (
         source, airtable_record_id, submitter_name, submitter_email,
         artist_name, song_title, description, youtube_url, youtube_video_id,
         submitted_date, month, year
       ) VALUES ${placeholders.join(",")}
       ON CONFLICT (airtable_record_id) DO NOTHING`,
      values
    );
  }
}
