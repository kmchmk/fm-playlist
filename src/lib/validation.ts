import { z } from "zod";
import {
  SONG_DESCRIPTION_MAX_LENGTH,
  YOUTUBE_URL_MAX_LENGTH,
} from "@/lib/song-limits";
import { isValidYouTubeUrl } from "@/lib/youtube";

export const createSongInputSchema = z
  .object({
    youtubeUrl: z
      .string({ error: "YouTube URL is required" })
      .trim()
      .min(1, "YouTube URL is required")
      .max(
        YOUTUBE_URL_MAX_LENGTH,
        `YouTube URL must be ${YOUTUBE_URL_MAX_LENGTH} characters or fewer`
      )
      .refine(isValidYouTubeUrl, "A valid YouTube URL is required"),
    description: z
      .string({ error: "Description must be text" })
      .trim()
      .max(
        SONG_DESCRIPTION_MAX_LENGTH,
        `Description must be ${SONG_DESCRIPTION_MAX_LENGTH} characters or fewer`
      )
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),
  })
  .strict();

export type ValidatedCreateSongInput = z.infer<typeof createSongInputSchema>;

export function validationMessages(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message);
}
