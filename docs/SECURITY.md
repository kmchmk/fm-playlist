# Security

## Authentication And Authorization

Clerk handles authentication. The app enforces authorization in server code:

- `src/lib/auth.ts` checks the primary Clerk email address against
  `ALLOWED_EMAIL_DOMAIN`.
- `src/app/page.tsx` blocks the playlist UI for unauthenticated or forbidden
  users.
- `src/app/api/songs/route.ts` protects both `GET` and `POST`.
- `GET /api/health` is intentionally public for orchestrators.

Keep Clerk dashboard restrictions aligned with `ALLOWED_EMAIL_DOMAIN`.

## Secrets

Required secrets and private values:

- `CLERK_SECRET_KEY`
- `POSTGRES_PASSWORD` or `DATABASE_URL`
- `AIRTABLE_API_TOKEN`, when Airtable sync is enabled

Local `.env` files are ignored by Git and Docker build context rules. Leave
`.env.example` as placeholders only.

CI treats values copied from local env files as secrets too. Configure
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` as GitHub Actions
secrets; do not hardcode Clerk keys in workflow YAML.

Rotate provider tokens when they are committed, copied into a shared channel,
attached to a ticket, or discovered in a build artifact. Rotation happens in
Clerk, Airtable, and the deployment host, not in code.

## Input Validation

- Song submissions are validated with Zod before insertion.
- YouTube URLs are parsed with `URL` and accepted only for supported YouTube
  hosts and paths.
- Descriptions are trimmed and limited to 500 characters.
- DB constraints enforce source, month, year, and YouTube video ID validity for
  new writes.

## Transport And Headers

`next.config.ts` disables the powered-by header and adds baseline browser
headers:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

Use HTTPS in production through the deployment host.

## Dependency And Container Checks

Run before releases:

```bash
npm audit --audit-level=high
npm run lint
npm run typecheck
npm run test
npm run build
```

Also run the deployment platform's container scanner against the built image.
