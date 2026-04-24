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
  };
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}


