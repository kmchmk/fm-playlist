export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-primary animate-pulse">
          FM Playlist
        </h1>
        <p className="text-muted-foreground font-medium">Loading...</p>
      </div>
    </div>
  );
}
