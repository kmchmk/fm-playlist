# Deployment Guide (Coolify)

## Prerequisites

- Coolify server running and accessible
- Domain name pointed to Coolify server
- Auth0 application configured ([Auth0 Setup](AUTH0_SETUP.md))
- NocoDB deployed on Coolify ([NocoDB Setup](NOCODB_SETUP.md))

## Step 1: Deploy NocoDB

1. In Coolify, create a new service from Docker image `nocodb/nocodb:latest`
2. Set up a PostgreSQL database service for NocoDB's backend
3. Configure `NC_DB` environment variable to point to the PostgreSQL instance
4. Assign a domain (e.g. `nocodb.yourserver.com`)
5. Enable SSL
6. Create the songs table as described in [NocoDB Setup](NOCODB_SETUP.md)

## Step 2: Deploy FM Playlist

1. In Coolify, create a new resource from **Git Repository**
2. Connect to `kmchmk/fm-playlist` repository
3. Set:
   - **Build Pack**: Dockerfile
   - **Dockerfile Location**: `frontend/Dockerfile`
   - **Build Context**: `frontend`
   - **Port**: 3000

4. Add environment variables:

```env
AUTH0_SECRET=<openssl rand -hex 32>
AUTH0_DOMAIN=<your-tenant>.auth0.com
AUTH0_CLIENT_ID=<from Auth0>
AUTH0_CLIENT_SECRET=<from Auth0>
APP_BASE_URL=https://playlist.yourdomain.com

AIRTABLE_API_TOKEN=<your Airtable token>
AIRTABLE_BASE_ID=appapOlGrcy5YNJ7A

NOCODB_BASE_URL=http://nocodb:8080  # internal Coolify network URL
NOCODB_API_TOKEN=<from NocoDB>
NOCODB_TABLE_ID=<from NocoDB>

ALLOWED_EMAIL_DOMAIN=favoritemedium.com
```

5. Assign domain (e.g. `playlist.yourdomain.com`)
6. Enable SSL
7. Deploy

## Step 3: Update Auth0 URLs

After deploying, update your Auth0 application settings:

- **Allowed Callback URLs**: Add `https://playlist.yourdomain.com/auth/callback`
- **Allowed Logout URLs**: Add `https://playlist.yourdomain.com`
- **Allowed Web Origins**: Add `https://playlist.yourdomain.com`

## Updating

Push to the `main` branch. Coolify will automatically rebuild and deploy (if auto-deploy is enabled), or trigger a manual deployment from the Coolify dashboard.

## Health Check

The app serves on port 3000. Note that `GET /` requires authentication and will redirect unauthenticated requests. For health checks, verify the container is listening on port 3000 (e.g. TCP check) rather than expecting HTTP 200 from `/`.

## Troubleshooting

- **Auth0 errors**: Check that all Auth0 env vars are set correctly and callback URLs match
- **NocoDB connection issues**: Verify `NOCODB_BASE_URL` uses the internal Coolify network hostname if both services are on the same server
- **Airtable errors**: Verify the API token hasn't expired and the base ID is correct
- **Build failures**: Run `npm run build` locally to check for TypeScript errors
