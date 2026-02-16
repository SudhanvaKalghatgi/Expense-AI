import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

/**
 * Custom hook that wraps Clerk's auth hooks
 * Ensures isLoaded && isSignedIn before returning user data
 */
export function useAuth() {
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const { user } = useUser();

  return {
    isLoaded,
    isSignedIn,
    userId,
    user,
    // Helper property for convenience
    isReady: isLoaded && isSignedIn,
  };
}
