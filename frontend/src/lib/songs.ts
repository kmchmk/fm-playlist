import "server-only";

import type { Song, CreateSongInput } from "@/types/song";
import { fetchAllAirtableRecords } from "./airtable";
import { fetchAllNocoDBSongs, createNocoDBSong, upsertAirtableSong } from "./nocodb";
import { extractYouTubeId } from "./youtube";

export async function getAllSongs(): Promise<Song[]> {
  const [airtableSongs, nocodbSongs] = await Promise.all([
    fetchAllAirtableRecords().catch((err) => {
      console.error("Airtable fetch failed:", err);
      return [] as Song[];
    }),
    fetchAllNocoDBSongs().catch((err) => {
      console.error("NocoDB fetch failed:", err);
      return [] as Song[];
    }),
  ]);

  // Build a set of Airtable record IDs already in NocoDB
  const syncedAirtableIds = new Set(
    nocodbSongs
      .filter((s) => s.airtableRecordId)
      .map((s) => s.airtableRecordId!)
  );

  // Merged list: all NocoDB songs + Airtable songs not yet in NocoDB
  const merged: Song[] = [...nocodbSongs];
  const unsyncedAirtableSongs: Song[] = [];

  for (const song of airtableSongs) {
    if (!song.airtableRecordId || !syncedAirtableIds.has(song.airtableRecordId)) {
      merged.push(song);
      unsyncedAirtableSongs.push(song);
    }
  }

  // Background sync: upsert unsynced Airtable records into NocoDB
  if (unsyncedAirtableSongs.length > 0) {
    syncAirtableToNocoDB(unsyncedAirtableSongs).catch((err) =>
      console.error("Background Airtable→NocoDB sync failed:", err)
    );
  }

  // Sort by submitted date descending
  merged.sort((a, b) => {
    const dateA = new Date(a.submittedDate).getTime();
    const dateB = new Date(b.submittedDate).getTime();
    return dateB - dateA;
  });

  return merged;
}

async function syncAirtableToNocoDB(songs: Song[]): Promise<void> {
  for (const song of songs) {
    try {
      await upsertAirtableSong({
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
      });
    } catch (err) {
      console.error(`Failed to sync Airtable record ${song.airtableRecordId}:`, err);
    }
  }
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

  return createNocoDBSong({
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
