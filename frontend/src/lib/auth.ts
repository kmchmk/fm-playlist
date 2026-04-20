import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: "openid profile email",
  },
  async beforeSessionSaved(session) {
    // Validate email domain during session creation
    const email: string | undefined = session.user?.email;
    const domain = email?.split("@")[1];

    if (!email || domain !== ALLOWED_EMAIL_DOMAIN) {
      throw new Error(
        `Access denied. Only @${ALLOWED_EMAIL_DOMAIN} emails are allowed.`
      );
    }

    return session;
  },
});
