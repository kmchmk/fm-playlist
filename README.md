# FM Playlist

Monthly YouTube playlist sharing app for the Favorite Medium team.
Next.js 15 + Clerk + Postgres, deployable with Docker Compose or a managed
Postgres host.

## Features

- **Google sign-in** via Clerk (restricted to `@favoritemedium.com`)
- **Monthly playlists** — browse by year and month
- **Add tracks** — paste a YouTube URL with an optional description
- **Search** — filter by submitter, title, artist, or description
- **Airtable -> Postgres sync** — optional legacy import, runs on page load
- **Responsive** — works on mobile, tablet, and desktop
- **Quality gates** — ESLint, TypeScript, Vitest, and GitHub Actions CI

## Quick start (Docker)

Requires Docker and Docker Compose.

```bash
cp .env.example .env
# Edit .env - set Clerk keys and POSTGRES_PASSWORD at minimum.
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000).

The schema is auto-provisioned on first startup (see
[docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)) — no manual DB setup.

## Quick start (local Node)

Requires Node 20+ and a running Postgres. Set `DATABASE_URL` in `.env.local`.

```bash
npm install
cp .env.example .env.local
# Edit .env.local (including DATABASE_URL)
npm run dev
```

## Environment variables

See [.env.example](.env.example) for the full list.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✔ | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✔ | Clerk secret key |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | ✔ (compose) | Postgres credentials. `DATABASE_URL` is derived in `docker-compose.yml` |
| `DATABASE_URL` | ✔ (non-compose) | Full Postgres connection string |
| `AIRTABLE_API_TOKEN` / `AIRTABLE_BASE_ID` | — | Enable Airtable sync |
| `ALLOWED_EMAIL_DOMAIN` | — | Server-side fallback allowlist. Defaults to `favoritemedium.com` |

Never commit real environment files. `.env`, `.env.local`, and `.env.*.local`
are ignored, and Docker builds also exclude env files from the build context.

## Scripts

```bash
npm run dev     # Start dev server (port 3000)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
npm run typecheck # Run TypeScript without emitting files
npm run test    # Run unit tests
```

## Runtime behavior

- `GET /api/health` is public and returns `{"ok": true}` for orchestration.
- `GET /api/songs` and `POST /api/songs` require an authenticated Clerk user
  from the allowed email domain.
- Postgres is required and is the source of truth. If Postgres is unavailable,
  the app surfaces an error instead of pretending the playlist is empty.
- Airtable is optional. If Airtable credentials are absent or Airtable fails,
  the app serves Postgres data only and logs the sync issue.
- New submissions accept YouTube `watch`, `youtu.be`, `embed`, and `shorts`
  URLs only. Descriptions are limited to 500 characters.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Project structure

```
src/
  app/
    page.tsx                # Home (server component)
    api/songs/route.ts      # Songs API (GET all, POST new)
    api/health/route.ts     # Unauthenticated health check
  components/               # UI, playlist, layout, auth
  lib/
    auth.ts                 # Clerk user mapping and domain checks
    airtable.ts             # Airtable API (server-only)
    db.ts                   # pg.Pool + ensureSchema()
    songs-db.ts             # Postgres queries for songs
    songs.ts                # Unified data layer (Airtable + DB)
    youtube.ts              # YouTube URL utilities
    constants.ts            # Shared constants
  types/song.ts             # TypeScript interfaces
  middleware.ts             # Clerk middleware
db/
  init/001_schema.sql       # Auto-provisioned on first DB startup
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Clerk Setup](docs/CLERK_SETUP.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Airtable Integration](docs/AIRTABLE_INTEGRATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security](docs/SECURITY.md)
- [Testing](docs/TESTING.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
