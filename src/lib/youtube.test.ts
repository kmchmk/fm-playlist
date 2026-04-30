import { describe, expect, it } from "vitest";
import { extractYouTubeId, isValidYouTubeUrl } from "./youtube";

const videoId = "dQw4w9WgXcQ";

describe("YouTube URL parsing", () => {
  it.each([
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://youtube.com/watch?v=${videoId}&t=42`,
    `https://m.youtube.com/watch?v=${videoId}`,
    `https://music.youtube.com/watch?v=${videoId}`,
    `https://youtu.be/${videoId}`,
    `https://www.youtube.com/embed/${videoId}`,
    `https://www.youtube.com/shorts/${videoId}`,
    `www.youtube.com/watch?v=${videoId}`,
  ])("extracts supported YouTube URL %s", (url) => {
    expect(extractYouTubeId(url)).toBe(videoId);
    expect(isValidYouTubeUrl(url)).toBe(true);
  });

  it.each([
    "",
    "not a url",
    `https://example.com/watch?v=${videoId}`,
    `https://example.com/youtube.com/watch?v=${videoId}`,
    `https://youtube.com.evil.test/watch?v=${videoId}`,
    "ftp://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=too-short",
    "https://www.youtube.com/channel/dQw4w9WgXcQ",
  ])("rejects unsupported URL %s", (url) => {
    expect(extractYouTubeId(url)).toBeNull();
    expect(isValidYouTubeUrl(url)).toBe(false);
  });
});
