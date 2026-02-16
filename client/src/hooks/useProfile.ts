import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface Profile {
  fullName: string;
  email: string;
  username?: string;
  userType: "student" | "professional" | "business";
  incomeTrackingMode: "fixedIncome" | "expensesOnly";
  monthlyIncome: number | null;
  monthlyBudget: number | null;
  savingTarget: number | null;
}

/**
 * Custom hook to fetch and cache user profile
 * Returns profile data, loading state, and error
 */
export function useProfile() {
  const { isReady, userId } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isReady || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get("/profile/me");
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isReady, userId]);

  return { profile, loading, error, refetch: () => {} };
}
