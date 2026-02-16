import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { setUserId } from "@/lib/api";

/**
 * Simple auth wrapper that only checks if user is signed in
 * Does NOT check for onboarding status
 * Use this for the onboarding page itself
 */
export default function RequireAuth() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const navigate = useNavigate();

  // Set userId for axios interceptor
  useEffect(() => {
    if (userId) {
      setUserId(userId);
    } else {
      setUserId(null);
    }
  }, [userId]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Show loading while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full dark:border-gray-700 dark:border-t-white"></div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isSignedIn) {
    return null;
  }

  return <Outlet />;
}
