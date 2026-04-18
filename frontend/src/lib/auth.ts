import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: "openid profile email",
  },
  async beforeSessionSaved(session) {
    // Validate email domain during session creation
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "favoritemedium.com";
    const email: string | undefined = session.user?.email;

    if (!email || !email.endsWith(`@${allowedDomain}`)) {
      throw new Error(
        `Access denied. Only @${allowedDomain} emails are allowed.`
      );
    }

    return session;
  },
});
