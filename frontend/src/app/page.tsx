import { auth0 } from "@/lib/auth";
import { getAllSongs } from "@/lib/songs";
import { PlaylistView } from "@/components/playlist/PlaylistView";
import { LoginButton } from "@/components/auth/LoginButton";

export default async function HomePage() {
  const session = await auth0.getSession();

  if (!session) {
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
            Sign in with your @favoritemedium.com Google account
          </p>
        </div>
      </div>
    );
  }

  const songs = await getAllSongs();

  return (
    <PlaylistView
      initialSongs={songs}
      user={{
        name: session.user.name,
        picture: session.user.picture,
        email: session.user.email,
      }}
    />
  );
}
