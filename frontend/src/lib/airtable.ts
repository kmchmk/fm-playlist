import "server-only";

import type { AirtableResponse, Song } from "@/types/song";
import { extractYouTubeId } from "./youtube";

const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/videos`;

export async function fetchAllAirtableRecords(): Promise<Song[]> {
  if (!AIRTABLE_API_TOKEN || !AIRTABLE_BASE_ID) {
    console.warn("Airtable credentials not configured, skipping Airtable fetch");
    return [];
  }

  const allSongs: Song[] = [];
  let offset: string | undefined;
  let rateLimitRetries = 0;
  const MAX_RATE_LIMIT_RETRIES = 3;

  do {
    const url = new URL(AIRTABLE_API_URL);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("sort[0][field]", "submittedDate");
    url.searchParams.set("sort[0][direction]", "desc");
    url.searchParams.set("view", "FM Playlist");
    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      if (response.status === 429) {
        rateLimitRetries++;
        if (rateLimitRetries > MAX_RATE_LIMIT_RETRIES) {
          console.error("Airtable rate limit: max retries exceeded");
          break;
        }
        // Rate limited — wait and retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      console.error(`Airtable API error: ${response.status} ${response.statusText}`);
      break;
    }

    rateLimitRetries = 0; // Reset on success

    const data: AirtableResponse = await response.json();

    for (const record of data.records) {
      const { fields } = record;
      const videoId = extractYouTubeId(fields.youtubeLink || "");
      if (!videoId) continue;

      const submittedDate = fields.submittedDate || record.createdTime.split("T")[0];
      const date = new Date(submittedDate);

      allSongs.push({
        id: `at_${record.id}`,
        source: "airtable",
        airtableRecordId: record.id,
        submitterName: fields.submitterName || "Anonymous",
        submitterEmail: null,
        artistName: fields.artistName || null,
        songTitle: fields.songTitle || null,
        description: fields.songDescription || null,
        youtubeUrl: fields.youtubeLink,
        youtubeVideoId: videoId,
        submittedDate,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      });
    }

    offset = data.offset;
  } while (offset);

  return allSongs;
}
