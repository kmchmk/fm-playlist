export interface Song {
  id: string;
  source: "airtable" | "app";
  airtableRecordId: string | null;
  submitterName: string;
  submitterEmail: string | null;
  artistName: string | null;
  songTitle: string | null;
  description: string | null;
  youtubeUrl: string;
  youtubeVideoId: string;
  submittedDate: string;
  month: number;
  year: number;
}

export interface CreateSongInput {
  youtubeUrl: string;
  description?: string;
}

export interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: {
    submitterName: string;
    artistName?: string;
    songTitle?: string;
    songDescription?: string;
    youtubeLink: string;
    submittedDate: string;
    Month?: number;
  };
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export interface NocoDBRow {
  Id: number;
  source: string;
  airtable_record_id: string | null;
  submitter_name: string;
  submitter_email: string | null;
  artist_name: string | null;
  song_title: string | null;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  submitted_date: string;
  month: number;
  year: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}
