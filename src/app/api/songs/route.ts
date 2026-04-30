import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentAppAuth } from "@/lib/auth";
import type { AppAuthResult } from "@/lib/auth";
import { getAllSongs, createSong } from "@/lib/songs";
import { getAuthError, makeApiError } from "@/lib/api";
import { createSongInputSchema } from "@/lib/validation";

type AuthenticatedAppAuth = Extract<
  AppAuthResult,
  { status: "authenticated" }
>;

type AuthorizedSongsRequest =
  | { appAuth: AuthenticatedAppAuth; response: null }
  | { appAuth: null; response: NextResponse };

async function authorizeSongsRequest(): Promise<AuthorizedSongsRequest> {
  const appAuth = await getCurrentAppAuth();
  const authError = getAuthError(appAuth);

  if (authError) {
    return {
      appAuth: null,
      response: NextResponse.json(authError.body, { status: authError.status }),
    };
  }

  if (appAuth.status !== "authenticated") {
    throw new Error("Unexpected auth state");
  }

  return { appAuth, response: null };
}

export async function GET() {
  try {
    const { response } = await authorizeSongsRequest();
    if (response) return response;

    const songs = await getAllSongs();
    return NextResponse.json(songs);
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return NextResponse.json(
      makeApiError("Failed to fetch songs", "FETCH_SONGS_FAILED"),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { appAuth, response } = await authorizeSongsRequest();
    if (response) return response;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        makeApiError("Invalid JSON body", "INVALID_JSON"),
        { status: 400 }
      );
    }

    const parsed = createSongInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        makeApiError(
          "Invalid song submission",
          "INVALID_SONG_INPUT",
          parsed.error.issues.map((issue) => issue.message)
        ),
        { status: 400 }
      );
    }

    const user = {
      name: appAuth.user.name,
      email: appAuth.user.email,
    };

    const song = await createSong(parsed.data, user);
    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error("Failed to create song:", error);
    return NextResponse.json(
      makeApiError("Failed to create song", "CREATE_SONG_FAILED"),
      { status: 500 }
    );
  }
}
