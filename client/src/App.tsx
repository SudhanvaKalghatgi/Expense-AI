import { ClerkProvider, SignIn, SignUp } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import RequireAuth from "./components/auth/RequireAuth";
import RequireOnboarding from "./components/auth/RequireOnboarding";
import { 
  Dashboard, 
  Expenses, 
  Recurring, 
  Reports, 
  AIInsights, 
  Settings, 
  Onboarding,
  Landing
} from "./pages";
import { Toaster } from "sonner";
import "./App.css";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Toaster position="bottom-right" richColors />
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Public auth routes */}
          <Route 
            path="/sign-in/*" 
            element={
              <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
                <SignIn routing="path" path="/sign-in" forceRedirectUrl="/dashboard" />
              </div>
            } 
          />
          <Route 
            path="/sign-up/*" 
            element={
              <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
                <SignUp routing="path" path="/sign-up" forceRedirectUrl="/dashboard" />
              </div>
            } 
          />

          {/* Onboarding route - requires auth but NOT onboarding check */}
          <Route element={<RequireAuth />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* Protected app routes - require auth AND onboarding */}
          <Route element={<RequireOnboarding />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="recurring" element={<Recurring />} />
              <Route path="reports" element={<Reports />} />
              <Route path="ai" element={<AIInsights />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;