# FM Playlist

A monthly YouTube playlist sharing app for the Favorite Medium team. Built with Next.js 15, Auth0 authentication, and dual data sources (Airtable legacy + NocoDB).

## Features

- **Google sign-in** via Auth0 (restricted to `@favoritemedium.com`)
- **Monthly playlists** — browse by year and month
- **Add tracks** — paste a YouTube URL with an optional description
- **Search** — filter by submitter name, song title, artist, or description
- **Dual data sources** — reads from both Airtable (legacy) and NocoDB (new)
- **Background sync** — Airtable records are automatically backed up to NocoDB
- **Responsive** — works on mobile, tablet, and desktop

## Prerequisites

- Node.js 20+
- npm
- Auth0 account ([setup guide](docs/AUTH0_SETUP.md))
- NocoDB instance ([setup guide](docs/NOCODB_SETUP.md))
- Airtable API access (existing)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `AUTH0_SECRET` | Random 32+ char hex string (`openssl rand -hex 32`) |
| `AUTH0_DOMAIN` | Auth0 tenant domain (e.g. `your-tenant.auth0.com`) |
| `AUTH0_CLIENT_ID` | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret |
| `APP_BASE_URL` | App URL (`http://localhost:3000` for dev) |
| `AIRTABLE_API_TOKEN` | Airtable personal access token |
| `AIRTABLE_BASE_ID` | Airtable base ID (default: `appapOlGrcy5YNJ7A`) |
| `NOCODB_BASE_URL` | NocoDB instance URL |
| `NOCODB_API_TOKEN` | NocoDB API token |
| `NOCODB_TABLE_ID` | NocoDB songs table ID |
| `ALLOWED_EMAIL_DOMAIN` | Allowed email domain (default: `favoritemedium.com`) |

## Scripts

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Coolify deployment instructions.

### Docker

```bash
# Build
docker build -t fm-playlist .

# Run
docker run -p 3000:3000 --env-file .env fm-playlist
```

### Docker Compose (local dev with NocoDB)

```bash
docker compose up
```

This starts the app on port 3000, NocoDB on port 8080, and PostgreSQL.

## Project Structure

```
src/
  app/
    layout.tsx              # Root layout (fonts, metadata)
    page.tsx                # Home page (server component)
    loading.tsx             # Loading state
    error.tsx               # Error boundary
    globals.css             # Tailwind + theme CSS
    api/songs/route.ts      # Songs API (GET all, POST new)
  components/
    ui/                     # shadcn/ui components
    playlist/               # Playlist feature components
      PlaylistView.tsx      # Main client component
      VideoPlayer.tsx       # YouTube embed player
      ThumbnailGrid.tsx     # Song grid
      SongCard.tsx          # Single song thumbnail
      AddTrackDialog.tsx    # Add track form dialog
      MonthYearFilter.tsx   # Year/month dropdowns
      SearchBar.tsx         # Search input
    layout/                 # Layout components
      Header.tsx            # App header with user menu
      Footer.tsx            # Track count
    auth/                   # Auth components
      LoginButton.tsx       # Google sign-in button
      UserMenu.tsx          # User avatar + logout
  lib/
    auth.ts                 # Auth0 client config
    airtable.ts             # Airtable API (server-only)
    nocodb.ts               # NocoDB API (server-only)
    songs.ts                # Unified data layer
    youtube.ts              # YouTube URL utilities
    constants.ts            # Shared constants
  types/
    song.ts                 # TypeScript interfaces
  middleware.ts             # Auth0 middleware
```

## Documentation

- [Auth0 Setup](docs/AUTH0_SETUP.md)
- [NocoDB Setup](docs/NOCODB_SETUP.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Airtable Integration](docs/AIRTABLE_INTEGRATION.md) artist, or description
- **Dual data sources** — reads from both Airtable (legacy) and NocoDB (new)
- **Background sync** — Airtable records are automatically backed up to NocoDB
- **Responsive** — works on mobile, tablet, and desktop

## Prerequisites

- Node.js 20+
- npm
- Auth0 account ([setup guide](docs/AUTH0_SETUP.md))
- NocoDB instance ([setup guide](docs/NOCODB_SETUP.md))
- Airtable API access (existing)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `AUTH0_SECRET` | Random 32+ char hex string (`openssl rand -hex 32`) |
| `AUTH0_DOMAIN` | Auth0 tenant domain (e.g. `your-tenant.auth0.com`) |
| `AUTH0_CLIENT_ID` | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret |
| `APP_BASE_URL` | App URL (`http://localhost:3000` for dev) |
| `AIRTABLE_API_TOKEN` | Airtable personal access token |
| `AIRTABLE_BASE_ID` | Airtable base ID (default: `appapOlGrcy5YNJ7A`) |
| `NOCODB_BASE_URL` | NocoDB instance URL |
| `NOCODB_API_TOKEN` | NocoDB API token |
| `NOCODB_TABLE_ID` | NocoDB songs table ID |
| `ALLOWED_EMAIL_DOMAIN` | Allowed email domain (default: `favoritemedium.com`) |

## Scripts

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Coolify deployment instructions.

### Docker

```bash
# Build
docker build -t fm-playlist .

# Run
docker run -p 3000:3000 --env-file .env fm-playlist
```

### Docker Compose (local dev with NocoDB)

```bash
docker compose up
```

This starts the app on port 3000, NocoDB on port 8080, and PostgreSQL.

## Project Structure

```
src/
  app/
    layout.tsx              # Root layout (fonts, metadata)
    page.tsx                # Home page (server component)
    loading.tsx             # Loading state
    error.tsx               # Error boundary
    globals.css             # Tailwind + theme CSS
    api/songs/route.ts      # Songs API (GET all, POST new)
  components/
    ui/                     # shadcn/ui components
    playlist/               # Playlist feature components
      PlaylistView.tsx      # Main client component
      VideoPlayer.tsx       # YouTube embed player
      ThumbnailGrid.tsx     # Song grid
      SongCard.tsx          # Single song thumbnail
      AddTrackDialog.tsx    # Add track form dialog
      MonthYearFilter.tsx   # Year/month dropdowns
      SearchBar.tsx         # Search input
    layout/                 # Layout components
      Header.tsx            # App header with user menu
      Footer.tsx            # Track count
    auth/                   # Auth components
      LoginButton.tsx       # Google sign-in button
      UserMenu.tsx          # User avatar + logout
  lib/
    auth.ts                 # Auth0 client config
    airtable.ts             # Airtable API (server-only)
    nocodb.ts               # NocoDB API (server-only)
    songs.ts                # Unified data layer
    youtube.ts              # YouTube URL utilities
    constants.ts            # Shared constants
  types/
    song.ts                 # TypeScript interfaces
  middleware.ts             # Auth0 middleware
```

## Documentation

- [Auth0 Setup](docs/AUTH0_SETUP.md)
- [NocoDB Setup](docs/NOCODB_SETUP.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Airtable Integration](docs/AIRTABLE_INTEGRATION.md)
  