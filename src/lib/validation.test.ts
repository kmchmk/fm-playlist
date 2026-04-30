import { describe, expect, it } from "vitest";
import { SONG_DESCRIPTION_MAX_LENGTH } from "./song-limits";
import { createSongInputSchema } from "./validation";

describe("createSongInputSchema", () => {
  it("accepts and trims valid song submissions", () => {
    const result = createSongInputSchema.safeParse({
      youtubeUrl: " https://youtu.be/dQw4w9WgXcQ ",
      description: "  A classic  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
        description: "A classic",
      });
    }
  });

  it("normalizes blank descriptions to undefined", () => {
    const result = createSongInputSchema.safeParse({
      youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
      description: "   ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
    }
  });

  it("rejects invalid URLs and overlong descriptions", () => {
    const result = createSongInputSchema.safeParse({
      youtubeUrl: "https://example.com/youtube.com/watch?v=dQw4w9WgXcQ",
      description: "x".repeat(SONG_DESCRIPTION_MAX_LENGTH + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          "A valid YouTube URL is required",
          `Description must be ${SONG_DESCRIPTION_MAX_LENGTH} characters or fewer`,
        ])
      );
    }
  });

  it("rejects extra properties", () => {
    const result = createSongInputSchema.safeParse({
      youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
      unexpected: true,
    });

    expect(result.success).toBe(false);
  });
});
