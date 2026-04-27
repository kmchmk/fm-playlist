# Deployment Guide

The app ships as a two-service Docker Compose stack: **`app`** (Next.js) and
**`db`** (Postgres 16). The schema is auto-provisioned on first startup —
there is no manual table creation, API token setup, or data modeling step.

## Local / Self-hosted (one-shot)

```bash
cp .env.example .env
# Edit .env - set Clerk keys and POSTGRES_PASSWORD at minimum.
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

- **Clerk (required):** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
  `CLERK_SECRET_KEY`. See [CLERK_SETUP.md](CLERK_SETUP.md).
  Note: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is inlined into the client bundle
  at **build time** and must be passed as a Docker build arg (already wired
  in `docker-compose.yml`; for Coolify or other managed builds, set it as a
  build-time variable in addition to a runtime variable).
- **Postgres (required):** `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  — these are consumed by both services; `DATABASE_URL` is derived from them
  in `docker-compose.yml`.
- **Airtable (optional):** `AIRTABLE_API_TOKEN`, `AIRTABLE_BASE_ID`. Omit to
  disable the Airtable → Postgres sync; the app still runs.
- **Auth domain allowlist (optional):** `ALLOWED_EMAIL_DOMAIN`, defaults to
  `favoritemedium.com`. Configure the same restriction in Clerk as the primary
  access control.

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

## Clerk production setup

After deploying, update your Clerk application:

- Add `https://<your-domain>` as an allowed production domain.
- Enable Google sign-in for the production instance.
- Restrict sign-ups/sign-ins to `@favoritemedium.com` in Clerk's restrictions
  or allowlist settings.
- Set production values for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and
  `CLERK_SECRET_KEY` in your host.
- Existing Auth0 sessions do not migrate; users will sign in again with Clerk.

## Health check

The `app` service exposes an unauthenticated `GET /api/health` endpoint that
returns `{"ok": true}`. Compose uses it as the container health check.

## Troubleshooting

- **`DATABASE_URL is not set`** — the `app` service requires Postgres. In
  compose this is wired automatically; on managed hosts make sure you set it.
- **App starts before DB is ready** — compose uses `depends_on: service_healthy`,
  but if you're running the app outside compose, retry logic is in the pg pool
  itself; first requests may fail until Postgres accepts connections.
- **Clerk keys missing or mixed** — use matching publishable and secret keys
  from the same Clerk development or production instance.
- **Unexpected account can sign in** — check Clerk's sign-up restrictions and
  confirm `ALLOWED_EMAIL_DOMAIN` matches the intended domain.
- **Airtable 401/403** — token expired or scoped incorrectly. Either fix the
  token or unset `AIRTABLE_API_TOKEN` to skip sync entirely.
