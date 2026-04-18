# Auth0 Setup Guide

## 1. Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications → Create Application**
3. Choose **Regular Web Application**
4. Name it "FM Playlist"

## 2. Configure Application Settings

In the application settings:

- **Allowed Callback URLs**:
  ```
  http://localhost:3000/auth/callback, https://YOUR_DOMAIN/auth/callback
  ```
- **Allowed Logout URLs**:
  ```
  http://localhost:3000, https://YOUR_DOMAIN
  ```
- **Allowed Web Origins**:
  ```
  http://localhost:3000, https://YOUR_DOMAIN
  ```

## 3. Enable Google Social Connection

1. Go to **Authentication → Social**
2. Enable **Google / Gmail**
3. Configure with your Google OAuth credentials (or use Auth0's dev keys for testing)
4. Ensure it's enabled for your application under the connection's **Applications** tab

## 4. Restrict to Company Domain

Create a **Post-Login Action** to restrict sign-ins to `@favoritemedium.com`:

1. Go to **Actions → Flows → Login**
2. Click **Add Action → Build from Scratch**
3. Name: "Restrict Email Domain"
4. Add this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const allowedDomain = "favoritemedium.com";
  const email = event.user.email || "";

  if (!email.endsWith(`@${allowedDomain}`)) {
    api.access.deny(`Access restricted to @${allowedDomain} email addresses.`);
  }
};
```

5. Click **Deploy**, then drag the action into the Login flow

## 5. Get Credentials

From the application's **Settings** tab, copy:

- **Domain** → `AUTH0_DOMAIN`
- **Client ID** → `AUTH0_CLIENT_ID`
- **Client Secret** → `AUTH0_CLIENT_SECRET`

Generate a secret for cookie encryption:

```bash
openssl rand -hex 32
```

Use that value for `AUTH0_SECRET`.

## 6. Environment Variables

Add to `.env.local`:

```env
AUTH0_SECRET=<generated hex string>
AUTH0_DOMAIN=<your-tenant>.auth0.com
AUTH0_CLIENT_ID=<client id>
AUTH0_CLIENT_SECRET=<client secret>
APP_BASE_URL=http://localhost:3000
ALLOWED_EMAIL_DOMAIN=favoritemedium.com
```
