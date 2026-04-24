import "server-only";

import type { Song, CreateSongInput } from "@/types/song";
import { fetchAllAirtableRecords } from "./airtable";
import {
  fetchAllSongs,
  createSongRow,
  bulkCreateSongRows,
  type SongInsert,
} from "./songs-db";
import { extractYouTubeId } from "./youtube";

/** Normalize a composite key for dedup comparison. Trims whitespace,
 *  lowercases, and strips any time component from dates. */
function songKey(name: string, date: string, url: string): string {
  const normDate = String(date).split("T")[0];
  return `${String(name).trim().toLowerCase()}|${normDate}|${String(url).trim().toLowerCase()}`;
}

export async function getAllSongs(): Promise<Song[]> {
  // 1. Fetch both sources in parallel
  const [airtableSongs, dbSongs] = await Promise.all([
    fetchAllAirtableRecords().catch((err) => {
      console.error("Airtable fetch failed:", err);
      return [] as Song[];
    }),
    fetchAllSongs().catch((err) => {
      console.error("DB fetch failed:", err);
      return [] as Song[];
    }),
  ]);

  // 2. Build a set of composite keys from the DB rows we already fetched
  const existingKeys = new Set<string>();
  for (const s of dbSongs) {
    existingKeys.add(songKey(s.submitterName, s.submittedDate, s.youtubeUrl));
  }

  console.log(
    `[SYNC] Airtable: ${airtableSongs.length} rows, DB: ${dbSongs.length} rows, DB keys: ${existingKeys.size}`
  );

  // 3. Find Airtable records that don't exist in the DB
  const newAirtableSongs = airtableSongs.filter(
    (song) =>
      !existingKeys.has(
        songKey(song.submitterName, song.submittedDate, song.youtubeUrl)
      )
  );

  // 4. Insert new records into the DB (await so next reload sees them)
  if (newAirtableSongs.length > 0) {
    try {
      const rows: SongInsert[] = newAirtableSongs.map((song) => ({
        source: "airtable",
        airtable_record_id: song.airtableRecordId,
        submitter_name: song.submitterName,
        submitter_email: null,
        artist_name: song.artistName,
        song_title: song.songTitle,
        description: song.description,
        youtube_url: song.youtubeUrl,
        youtube_video_id: song.youtubeVideoId,
        submitted_date: song.submittedDate,
        month: song.month,
        year: song.year,
      }));
      await bulkCreateSongRows(rows);
    } catch (err) {
      console.error("Airtable→DB sync failed:", err);
    }
  }

  // 5. Merge: DB songs + only the new Airtable songs (to avoid duplicates)
  const merged: Song[] = [...dbSongs, ...newAirtableSongs];

  merged.sort((a, b) => {
    const dateA = new Date(a.submittedDate).getTime();
    const dateB = new Date(b.submittedDate).getTime();
    return dateB - dateA;
  });

  return merged;
}

export async function createSong(
  input: CreateSongInput,
  user: { name: string; email: string }
): Promise<Song> {
  const videoId = extractYouTubeId(input.youtubeUrl);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const now = new Date();
  const submittedDate = now.toISOString().split("T")[0];

  return createSongRow({
    source: "app",
    airtable_record_id: null,
    submitter_name: user.name,
    submitter_email: user.email,
    artist_name: null,
    song_title: null,
    description: input.description || null,
    youtube_url: input.youtubeUrl,
    youtube_video_id: videoId,
    submitted_date: submittedDate,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
}
