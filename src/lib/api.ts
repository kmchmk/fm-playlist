import type { AppAuthResult } from "@/lib/auth";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";

export interface ApiErrorBody {
  error: string;
  code: string;
  details?: string[];
}

export interface ApiErrorResult {
  status: number;
  body: ApiErrorBody;
}

export function getAuthError(appAuth: AppAuthResult): ApiErrorResult | null {
  if (appAuth.status === "unauthenticated") {
    return {
      status: 401,
      body: {
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      },
    };
  }

  if (appAuth.status === "forbidden") {
    return {
      status: 403,
      body: {
        error: `Access restricted to @${ALLOWED_EMAIL_DOMAIN} email addresses`,
        code: "FORBIDDEN_DOMAIN",
      },
    };
  }

  return null;
}

export function makeApiError(
  error: string,
  code: string,
  details?: string[]
): ApiErrorBody {
  return details && details.length > 0
    ? { error, code, details }
    : { error, code };
}
