"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Server-rendered pages don't refetch when Clerk transitions the session
 * client-side (e.g. after an OAuth callback navigates back via router.push).
 * Mounting this on the unauthenticated landing page forces a refresh of the
 * RSC payload as soon as Clerk reports the user as signed in.
 */
export function RefreshOnSignIn() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.refresh();
    }
  }, [isLoaded, isSignedIn, router]);

  return null;
}
