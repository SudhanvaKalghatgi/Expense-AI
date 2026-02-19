// Auth disabled for UI development
// import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/expenses", label: "Expenses" },
    { href: "/recurring", label: "Recurring" },
    { href: "/reports", label: "Reports" },
    { href: "/ai", label: "Insights" },
    { href: "/settings", label: "Settings" }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - Minimalist Text Only */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[180px] border-r border-border/50">
        {/* Logo */}
        <div className="h-16 flex items-center px-6">
          <Link to="/dashboard" className="inline-flex">
            <div className="bg-foreground px-3 py-1.5 rounded-lg shadow-premium-sm hover:shadow-premium transition-shadow">
              <img
                src="/expenseAI.png"
                alt="ExpenseAI"
                className="h-5 w-auto"
              />
            </div>
          </Link>
        </div>

        {/* Navigation - Text Only, No Icons */}
        <nav className="flex-1 px-4 py-8 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "block px-2 py-1.5 text-sm transition-all duration-150",
                  isActive
                    ? "font-semibold translate-x-1"
                    : "font-normal text-muted-foreground hover:text-foreground hover:translate-x-0.5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info - Minimal */}
        <div className="p-4 border-t border-border/50">
          <div className="px-2 py-1">
            <div className="text-xs font-medium truncate">{user?.firstName}</div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-background z-50">
        <div className="flex items-center justify-between h-full px-4">
          <Link to="/dashboard" className="inline-flex">
            <div className="bg-foreground px-3 py-1.5 rounded-lg shadow-premium-sm">
              <img
                src="/expenseAI.png"
                alt="ExpenseAI"
                className="h-5 w-auto"
              />
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="absolute top-16 right-0 left-0 bg-background border-b border-border/50 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-2 text-sm rounded-md transition-all",
                    isActive
                      ? "font-semibold bg-muted"
                      : "font-normal text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-16">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-16 py-6 md:py-12 lg:py-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
