import { getCurrentAppAuth } from "@/lib/auth";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";
import { getAllSongs } from "@/lib/songs";
import { PlaylistView } from "@/components/playlist/PlaylistView";
import { LoginButton } from "@/components/auth/LoginButton";

export default async function HomePage() {
  const appAuth = await getCurrentAppAuth();

  if (appAuth.status !== "authenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-8 max-w-lg px-4">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-primary">
            FM Playlist
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Share your favorite tracks, discover what&apos;s moving the FM crew
          </p>
          <LoginButton />
          <p className="text-sm text-muted-foreground">
            {appAuth.status === "forbidden"
              ? `Access is restricted to @${ALLOWED_EMAIL_DOMAIN} Google accounts. Sign out and choose an approved account.`
              : `Sign in with your @${ALLOWED_EMAIL_DOMAIN} Google account`}
          </p>
        </div>
      </div>
    );
  }

  const songs = await getAllSongs();

  return (
    <PlaylistView
      initialSongs={songs}
      user={appAuth.user}
    />
  );
}
