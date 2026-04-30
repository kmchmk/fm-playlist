# Architecture

FM Playlist is a small Next.js App Router application with a server-rendered
home page, a client-side playlist experience, Clerk authentication, Postgres as
the source of truth, and optional Airtable legacy sync.

## Request Flow

1. `src/middleware.ts` installs Clerk middleware and keeps `/api/health` public.
2. `src/app/layout.tsx` wraps the app with `ClerkProvider`.
3. `src/app/page.tsx` calls `getCurrentAppAuth()` on the server.
4. Unauthenticated users see a sign-in screen. Forbidden-domain users see a
   switch-account message.
5. Authenticated users trigger `getAllSongs()` and receive the playlist UI.

## Data Flow

```text
Airtable API (optional) ----\
                            -> getAllSongs() -> PlaylistView
Postgres (required) --------/

AddTrackDialog -> POST /api/songs -> createSong() -> Postgres
```

Postgres failures are fatal because Postgres is the source of truth. Airtable
failures are non-fatal and degrade to Postgres-only results.

## Server Components And Client Components

- `src/app/page.tsx` is a server component. It handles auth and initial data.
- `src/components/playlist/PlaylistView.tsx` is a client component. It owns the
  local song list, selected month/year, search query, and active video.
- `src/components/playlist/usePlaylistFiltering.ts` derives searchable and
  filterable song sets from local state.
- `src/components/auth/RefreshOnSignIn.tsx` refreshes the server-rendered
  payload after Clerk reports a successful client-side sign-in.

## API Routes

- `GET /api/health` is public and used only for health checks.
- `GET /api/songs` returns songs for authenticated users from the allowed
  domain.
- `POST /api/songs` validates the request body, extracts the YouTube video ID,
  and inserts a new app-sourced row.

API errors use `{ error, code, details? }` JSON bodies.

## Shared Utilities

- `src/lib/auth.ts` maps Clerk users and enforces the allowed domain.
- `src/lib/validation.ts` validates song submissions with Zod.
- `src/lib/youtube.ts` parses supported YouTube URL shapes with `URL` parsing.
- `src/lib/dates.ts` normalizes date-only values and avoids timezone drift.
- `src/lib/songs.ts` merges Postgres and optional Airtable data.
- `src/lib/songs-db.ts` contains Postgres queries.
- `src/lib/airtable.ts` contains Airtable pagination, retry, and mapping logic.

## Styling And UI

The app uses Tailwind CSS 4, a small set of shadcn-style local UI components,
Radix primitives for dialog/select behavior, lucide icons, and `motion` for
light entrance animations.

## Quality Gates

Local and CI verification run ESLint, TypeScript, Vitest, and a production
Next.js build. See [TESTING.md](TESTING.md).
