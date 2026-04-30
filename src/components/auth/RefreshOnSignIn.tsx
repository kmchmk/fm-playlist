"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

/**
 * Server-rendered pages don't refetch when Clerk transitions the session
 * client-side (e.g. after an OAuth callback navigates back via router.push).
 * Mounting this on the unauthenticated landing page forces a refresh of the
 * RSC payload as soon as Clerk reports the user as signed in.
 */
export function RefreshOnSignIn() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const hasRefreshed = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && !hasRefreshed.current) {
      hasRefreshed.current = true;
      setIsRefreshing(true);
      router.refresh();
    }
  }, [isLoaded, isSignedIn, router]);

  return isRefreshing ? <LoadingScreen overlay /> : null;
}
