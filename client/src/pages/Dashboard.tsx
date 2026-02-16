import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, TrendingUp, TrendingDown, LogOut } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface Expense {
  _id: string;
  amount: number;
  category: string;
  date: string;
  paymentMode: "upi" | "cash" | "card" | "bank";
  essentialType: "need" | "want";
  note?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { signOut } = useClerk();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  // Fetch recent expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/expenses", {
          params: { page: 1, limit: 10 }
        });
        if (res.data.success) {
          setExpenses(res.data.data.data || []);
        }
      } catch (error: any) {
        console.error("Failed to fetch expenses:", error);
        toast.error("Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [location.pathname]);

  // Calculate this month's spending
  const thisMonthSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = (profile?.monthlyBudget || 0) - thisMonthSpending;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get recent expenses (last 5)
  const recentExpenses = expenses.slice(0, 5);

  if (profileLoading || loading) {
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
    <div className="space-y-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display mb-2">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {profile.fullName.split(" ")[0]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/expenses")}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full h-10 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hero Stats Canvas - No Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-border/50 divide-x divide-border/50"
      >
        {/* Monthly Income */}
        <div className="p-12 space-y-3">
          <div className="text-label text-muted-foreground">MONTHLY INCOME</div>
          <div className="text-hero">{formatCurrency(profile.monthlyIncome || 0)}</div>
          <div className="text-xs text-muted-foreground">Per month</div>
        </div>

        {/* This Month's Spending */}
        <div className="p-12 space-y-3">
          <div className="text-label text-muted-foreground">THIS MONTH</div>
          <div className="text-hero">{formatCurrency(thisMonthSpending)}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className={remainingBudget >= 0 ? "text-accent" : "text-destructive"}>
              {formatCurrency(Math.abs(remainingBudget))} {remainingBudget >= 0 ? "remaining" : "over"}
            </span>
          </div>
        </div>

        {/* Saving Target */}
        <div className="p-12 space-y-3">
          <div className="text-label text-muted-foreground">SAVING TARGET</div>
          <div className="text-hero">{formatCurrency(profile.savingTarget || 0)}</div>
          <div className="text-xs text-muted-foreground">Target amount</div>
        </div>
      </motion.div>

      {/* Budget-Scaled Chart with Savings Line */}
      <div className="space-y-6">
        <div className="text-section">Spending Overview</div>
        <div className="border border-border/50 rounded-lg p-8">
          {(() => {
            // Calculate daily spending for last 7 days
            const today = new Date();
            const dailySpending = Array(7).fill(0);
            const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            
            // Group expenses by day
            expenses.forEach(expense => {
              const expenseDate = new Date(expense.date);
              const daysAgo = Math.floor((today.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
              if (daysAgo >= 0 && daysAgo < 7) {
                dailySpending[6 - daysAgo] += expense.amount;
              }
            });

            // Financial context from profile
            const monthlyBudget = profile?.monthlyBudget || 10000;
            const savingsTarget = profile?.savingTarget || 0;
            
            // Use monthly budget as Y-axis scale
            const yAxisMax = monthlyBudget;
            
            // Calculate line positions (as percentage of monthly budget)
            const savingsLineHeight = savingsTarget > 0 ? (savingsTarget / yAxisMax) * 100 : 0;
            
            // Get today's day index
            const todayIndex = today.getDay();
            
            // Create ordered labels
            const orderedLabels: string[] = [];
            for (let i = 6; i >= 0; i--) {
              const dayIndex = (todayIndex - i + 7) % 7;
              orderedLabels.push(dayLabels[dayIndex]);
            }

            const totalWeekSpending = dailySpending.reduce((a, b) => a + b, 0);

            return (
              <>
                <div className="flex gap-4">
                  {/* Y-Axis Labels */}
                  <div className="flex flex-col justify-between h-[200px] text-xs text-muted-foreground w-16 text-right pr-2">
                    <div>₹{(yAxisMax).toFixed(0)}</div>
                    <div>₹{(yAxisMax * 0.75).toFixed(0)}</div>
                    <div>₹{(yAxisMax * 0.5).toFixed(0)}</div>
                    <div>₹{(yAxisMax * 0.25).toFixed(0)}</div>
                    <div>₹0</div>
                  </div>

                  {/* Chart Area */}
                  <div className="flex-1 relative">
                    {/* Savings Target Line */}
                    {savingsTarget > 0 && (
                      <div 
                        className="absolute left-0 right-0 border-t-2 border-dashed border-green-500 z-10"
                        style={{ bottom: `${savingsLineHeight}%` }}
                        title={`Savings Target: ₹${savingsTarget.toFixed(0)}`}
                      >
                        <span className="absolute -top-3 right-0 text-xs text-green-600 bg-white px-1">
                          Savings: ₹{savingsTarget.toFixed(0)}
                        </span>
                      </div>
                    )}

                    {/* Bars */}
                    <div className="grid grid-cols-7 gap-2 h-[200px] items-end">
                      {dailySpending.map((amount, i) => {
                        // Height relative to monthly budget (Y-axis max)
                        const height = yAxisMax > 0 ? (amount / yAxisMax) * 100 : 0;
                        const hasData = amount > 0;
                        
                        // Color: green for spending, gray for no data
                        const barColor = hasData 
                          ? 'bg-green-500 border-green-600'
                          : 'bg-gray-200 border-gray-300';
                        
                        return (
                          <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                            <div
                              className={`w-full rounded-t border ${barColor}`}
                              style={{ height: `${Math.max(height, hasData ? 2 : 0)}%` }}
                              title={hasData 
                                ? `₹${amount.toFixed(0)} | ${((amount/yAxisMax)*100).toFixed(1)}% of monthly budget`
                                : 'No spending'
                              }
                            />
                            <div className="text-xs text-muted-foreground">
                              {orderedLabels[i]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-6 space-y-2">
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 bg-muted/20 rounded">
                      <div className="text-muted-foreground">Week Total</div>
                      <div className="font-semibold">{formatCurrency(totalWeekSpending)}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/20 rounded">
                      <div className="text-muted-foreground">Monthly Budget</div>
                      <div className="font-semibold">{formatCurrency(monthlyBudget)}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/20 rounded">
                      <div className="text-muted-foreground">Savings Goal</div>
                      <div className="font-semibold">{formatCurrency(savingsTarget)}</div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    {savingsTarget > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-dashed border-green-500"></div>
                        <span>Savings Target</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Recent Transactions - Clean List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-section">Recent Activity</div>
          <button
            onClick={() => navigate("/expenses")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            View all →
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No expenses yet. Add your first expense to get started!
          </div>
        ) : (
          <div className="space-y-0">
            {recentExpenses.map((expense) => (
              <div
                key={expense._id}
                className="py-4 border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => navigate("/expenses")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{expense.category}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {expense.paymentMode}
                      </span>
                    </div>
                    {expense.note && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {expense.note}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-medium">
                      ₹{expense.amount.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border/50 rounded-lg p-6 space-y-2">
          <div className="text-label text-muted-foreground">AVG DAILY SPEND</div>
          <div className="text-3xl font-light">
            {formatCurrency(thisMonthSpending / 30)}
          </div>
          <div className="flex items-center gap-1 text-xs text-accent">
            <TrendingDown className="h-3 w-3" />
            <span>Based on current month</span>
          </div>
        </div>

        <div className="border border-border/50 rounded-lg p-6 space-y-2">
          <div className="text-label text-muted-foreground">BUDGET USED</div>
          <div className="text-3xl font-light">
            {profile.monthlyBudget 
              ? `${Math.round((thisMonthSpending / profile.monthlyBudget) * 100)}%`
              : "N/A"
            }
          </div>
          <div className="flex items-center gap-1 text-xs text-accent">
            <TrendingUp className="h-3 w-3" />
            <span>
              {remainingBudget >= 0 ? "On track" : "Over budget"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
