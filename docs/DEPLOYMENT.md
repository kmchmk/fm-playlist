# Deployment Guide

The app ships as a two-service Docker Compose stack: **`app`** (Next.js) and
**`db`** (Postgres 16). The schema is auto-provisioned on first startup —
there is no manual table creation, API token setup, or data modeling step.

## Local / Self-hosted (one-shot)

```bash
cp .env.example .env
# Edit .env — set AUTH0_* variables and POSTGRES_PASSWORD at minimum.
docker compose up -d --build
```

The app is served at http://localhost:3000. Postgres is reachable inside
the compose network at `db:5432` (not published to the host by default).

To reset state (wipe the DB volume):

```bash
docker compose down -v
```

## Required environment variables

See [.env.example](../.env.example) for the full list.

- **Auth0 (required):** `AUTH0_SECRET`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`,
  `AUTH0_CLIENT_SECRET`, `APP_BASE_URL`. See [AUTH0_SETUP.md](AUTH0_SETUP.md).
- **Postgres (required):** `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  — these are consumed by both services; `DATABASE_URL` is derived from them
  in `docker-compose.yml`.
- **Airtable (optional):** `AIRTABLE_API_TOKEN`, `AIRTABLE_BASE_ID`. Omit to
  disable the Airtable → Postgres sync; the app still runs.
- **Auth domain allowlist (optional):** `ALLOWED_EMAIL_DOMAIN`, defaults to
  `favoritemedium.com`.

## Coolify / managed hosts

You have two reasonable options:

### A. Deploy the compose file as-is

1. Create a new **Docker Compose** resource in Coolify pointing at this repo
   (build context `.`).
2. Set environment variables via Coolify's UI (same names as `.env.example`).
3. Assign a domain to the `app` service and enable SSL.

### B. App container + managed Postgres

1. Create a Postgres resource in Coolify. Copy the connection string.
2. Create a Docker Build resource using the repo's root `Dockerfile` (build
   context `.`). Set `DATABASE_URL` to the managed Postgres connection
   string. The app runs `ensureSchema()` on first request, which creates
   the `songs` table and indexes automatically.
3. Assign a domain, enable SSL, deploy.

## Auth0 callback URLs

After deploying, update your Auth0 application:

- **Allowed Callback URLs:** `https://<your-domain>/auth/callback`
- **Allowed Logout URLs:** `https://<your-domain>`
- **Allowed Web Origins:** `https://<your-domain>`

## Health check

The `app` service exposes an unauthenticated `GET /api/health` endpoint that
returns `{"ok": true}`. Compose uses it as the container health check.

## Troubleshooting

- **`DATABASE_URL is not set`** — the `app` service requires Postgres. In
  compose this is wired automatically; on managed hosts make sure you set it.
- **App starts before DB is ready** — compose uses `depends_on: service_healthy`,
  but if you're running the app outside compose, retry logic is in the pg pool
  itself; first requests may fail until Postgres accepts connections.
- **Auth0 callback mismatch** — the `APP_BASE_URL` must exactly match the base
  URL registered in Auth0 (scheme, host, port).
- **Airtable 401/403** — token expired or scoped incorrectly. Either fix the
  token or unset `AIRTABLE_API_TOKEN` to skip sync entirely.
