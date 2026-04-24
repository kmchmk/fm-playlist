# FM Playlist

Monthly YouTube playlist sharing app for the Favorite Medium team.
Next.js 15 + Auth0 + Postgres, deployable as a single `docker compose up`.

## Features

- **Google sign-in** via Auth0 (restricted to `@favoritemedium.com`)
- **Monthly playlists** — browse by year and month
- **Add tracks** — paste a YouTube URL with an optional description
- **Search** — filter by submitter, title, artist, or description
- **Airtable → Postgres sync** — opt-in, runs on each page load when configured
- **Responsive** — works on mobile, tablet, and desktop

## Quick start (Docker)

```bash
cp .env.example .env
# Edit .env — set AUTH0_* and POSTGRES_PASSWORD at minimum.
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000).

The schema is auto-provisioned on first startup (see
[docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)) — no manual DB setup.

## Quick start (local Node)

Requires a running Postgres. Set `DATABASE_URL` in `.env.local`.

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
| `AUTH0_SECRET` | ✔ | Random 32+ char hex string (`openssl rand -hex 32`) |
| `AUTH0_DOMAIN` | ✔ | Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | ✔ | Auth0 app client ID |
| `AUTH0_CLIENT_SECRET` | ✔ | Auth0 app client secret |
| `APP_BASE_URL` | ✔ | Public URL of the app |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | ✔ (compose) | Postgres credentials. `DATABASE_URL` is derived in `docker-compose.yml` |
| `DATABASE_URL` | ✔ (non-compose) | Full Postgres connection string |
| `AIRTABLE_API_TOKEN` / `AIRTABLE_BASE_ID` | — | Enable Airtable sync |
| `ALLOWED_EMAIL_DOMAIN` | — | Defaults to `favoritemedium.com` |

## Scripts

```bash
npm run dev     # Start dev server (port 3000)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

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
    auth.ts                 # Auth0 client config
    airtable.ts             # Airtable API (server-only)
    db.ts                   # pg.Pool + ensureSchema()
    songs-db.ts             # Postgres queries for songs
    songs.ts                # Unified data layer (Airtable + DB)
    youtube.ts              # YouTube URL utilities
    constants.ts            # Shared constants
  types/song.ts             # TypeScript interfaces
  middleware.ts             # Auth0 middleware
db/
  init/001_schema.sql       # Auto-provisioned on first DB startup
```

## Documentation

- [Auth0 Setup](docs/AUTH0_SETUP.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Airtable Integration](docs/AIRTABLE_INTEGRATION.md)
