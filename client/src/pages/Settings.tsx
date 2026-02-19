import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { UserCircle, Mail, Briefcase, LogOut } from "lucide-react";

export default function Settings() {
  const { profile, loading: profileLoading } = useProfile();
  const { user } = useAuth();
  const { signOut } = useClerk();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setIsSendingEmail(true);
      const res = await api.post("/dev/run-monthly-email");
      if (res.data.success) {
        toast.success("Test email sent successfully! Check your inbox.");
      }
    } catch (error: any) {
      console.error("Failed to send test email:", error);
      toast.error(error.response?.data?.message || "Failed to send test email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full dark:border-gray-700 dark:border-t-white"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-display mb-2">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="space-y-6">
        <div className="text-section">Profile Information</div>

        <div className="border border-border/50 rounded-lg p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <UserCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xl font-medium">{profile.fullName}</div>
              <div className="text-sm text-muted-foreground">{profile.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-label text-muted-foreground">FULL NAME</Label>
              <Input value={profile.fullName} readOnly className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label className="text-label text-muted-foreground">USERNAME</Label>
              <Input value={profile.username || "N/A"} readOnly className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label className="text-label text-muted-foreground">EMAIL</Label>
              <Input value={profile.email} readOnly className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label className="text-label text-muted-foreground">USER TYPE</Label>
              <Input value={profile.userType.toUpperCase()} readOnly className="bg-muted/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="space-y-6">
        <div className="text-section">Financial Settings</div>

        <div className="border border-border/50 rounded-lg p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-label text-muted-foreground">MONTHLY INCOME</Label>
              <div className="text-2xl font-light">
                ₹{profile.monthlyIncome?.toFixed(0) || "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-label text-muted-foreground">MONTHLY BUDGET</Label>
              <div className="text-2xl font-light">
                ₹{profile.monthlyBudget?.toFixed(0) || "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-label text-muted-foreground">SAVING TARGET</Label>
              <div className="text-2xl font-light">
                ₹{profile.savingTarget?.toFixed(0) || "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-label text-muted-foreground">TRACKING MODE</Label>
            <Input
              value={profile.incomeTrackingMode === "fixedIncome" ? "Fixed Income" : "Expenses Only"}
              readOnly
              className="bg-muted/30"
            />
          </div>
        </div>
      </div>

      {/* Clerk User Info */}
      {user && (
        <div className="space-y-6">
          <div className="text-section">Account Info</div>

          <div className="border border-border/50 rounded-lg p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Primary Email:</span>
              <span>{user.primaryEmailAddress?.emailAddress}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Account Created:</span>
              <span>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Account Actions */}
      <div className="space-y-6">
        <div className="text-section">Account Actions</div>

        <div className="border border-border/50 rounded-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="font-medium">Sign Out</div>
              <div className="text-sm text-muted-foreground">
                Log out of your account
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="gap-2 w-full md:w-auto"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Developer Tools */}
      <div className="space-y-6">
        <div className="text-section">Developer Tools</div>

        <div className="border border-border/50 rounded-lg p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Test Monthly Email</div>
              <div className="text-sm text-muted-foreground">
                Send a test monthly expense summary email to your registered email
              </div>
            </div>
            <Button
              onClick={handleSendTestEmail}
              disabled={isSendingEmail}
              variant="outline"
            >
              {isSendingEmail ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
