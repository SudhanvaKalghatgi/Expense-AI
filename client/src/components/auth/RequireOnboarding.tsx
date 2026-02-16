import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { api, setUserId } from "@/lib/api";

export default function RequireOnboarding() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Set userId for axios interceptor whenever it changes
  useEffect(() => {
    if (userId) {
      setUserId(userId);
    } else {
      setUserId(null);
    }
  }, [userId]);

  useEffect(() => {
    const checkProfile = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        // We only check if we are NOT already on the onboarding page
        // But actually, if we ARE onboarded, we shouldn't be on /onboarding either?
        // Let's just check status first.
        
        const res = await api.get("/profile/me");
        
        if (res.data.success) {
           // User IS onboarded.
           // If they are trying to go to /onboarding, redirect them to /
           if (location.pathname === "/onboarding") {
             navigate("/");
           }
           setIsChecking(false);
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // User is NOT onboarded.
          // If they are NOT on /onboarding, send them there.
          if (location.pathname !== "/onboarding") {
            navigate("/onboarding");
          }
           setIsChecking(false);
        } else {
          console.error("Profile check failed", error);
          // If error is not 404, maybe let them pass or show error?
          // For now, let's assume if it fails, we shouldn't block extensively unless it's auth related.
          setIsChecking(false);
        }
      }
    };

    if (isLoaded && isSignedIn) {
       checkProfile();
    } else if (isLoaded && !isSignedIn) {
      // Redirect to sign-in if not authenticated
      navigate("/sign-in");
    }
  }, [isLoaded, isSignedIn, navigate, location.pathname]);

  // If not loaded yet, show loading
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
         <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full dark:border-gray-700 dark:border-t-white"></div>
      </div>
    );
  }

  // If not signed in, don't render anything (redirect is happening)
  if (!isSignedIn) {
    return null;
  }

  if (isChecking) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
         <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full dark:border-gray-700 dark:border-t-white"></div>
      </div>
    );
  }

  return <Outlet />;
}
