import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth";
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
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateSongInput = await request.json();

    if (!body.youtubeUrl || !isValidYouTubeUrl(body.youtubeUrl)) {
      return NextResponse.json(
        { error: "A valid YouTube URL is required" },
        { status: 400 }
      );
    }

    const user = {
      name: session.user.name || session.user.email || "Anonymous",
      email: session.user.email || "",
    };

    const song = await createSong(body, user);
    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error("Failed to create song:", error);
    return NextResponse.json(
      { error: "Failed to create song" },
      { status: 500 }
    );
  }
}
