import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentAppAuth } from "@/lib/auth";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";
import { getAllSongs, createSong } from "@/lib/songs";
import type { CreateSongInput } from "@/types/song";
import { isValidYouTubeUrl } from "@/lib/youtube";

export async function GET() {
  try {
    const songs = await getAllSongs();
    return NextResponse.json(songs);
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const appAuth = await getCurrentAppAuth();
    if (appAuth.status === "unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (appAuth.status === "forbidden") {
      return NextResponse.json(
        { error: `Access restricted to @${ALLOWED_EMAIL_DOMAIN} email addresses` },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { youtubeUrl, description } = body as Record<string, unknown>;

    if (
      typeof youtubeUrl !== "string" ||
      !isValidYouTubeUrl(youtubeUrl)
    ) {
      return NextResponse.json(
        { error: "A valid YouTube URL is required" },
        { status: 400 }
      );
    }

    const input: CreateSongInput = {
      youtubeUrl,
      description: typeof description === "string" ? description : undefined,
    };

    const user = {
      name: appAuth.user.name,
      email: appAuth.user.email,
    };

    const song = await createSong(input, user);
    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error("Failed to create song:", error);
    return NextResponse.json(
      { error: "Failed to create song" },
      { status: 500 }
    );
  }
}
