"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md px-4">
        <h1 className="text-4xl font-black text-primary">Something went wrong</h1>
        <p className="text-muted-foreground font-medium">
          The playlist could not be loaded. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
