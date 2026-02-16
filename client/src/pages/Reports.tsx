import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TrendingDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface MonthlyReport {
  month: number;
  year: number;
  totalExpense: number;          // Backend uses totalExpense not totalExpenses
  totalTransactions: number;      // Backend uses totalTransactions not transactionCount
  categoryBreakdown: { [key: string]: number };   // Object not Array
  paymentModeBreakdown: { [key: string]: number };
  needVsWantBreakdown: { [key: string]: number }; // Object with 'need' and 'want' keys
}

export default function Reports() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      console.log("Fetching report for month:", month, "year:", year);
      const res = await api.get("/reports/monthly", {
        params: { month, year }
      });
      console.log("Report API response:", res.data);
      if (res.data.success) {
        // Backend returns { current, previous, comparison }
        // We need to use the "current" report
        const reportData = res.data.data.current;
        console.log("Current report data:", reportData);
        setReport(reportData);
      }
    } catch (error: any) {
      console.error("Failed to fetch report:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full dark:border-gray-700 dark:border-t-white"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No report data available</p>
      </div>
    );
  }

  const totalSpending = report.totalExpense || 0;
  const transactionCount = report.totalTransactions || 0;
  // Convert categoryBreakdown object to array for display
  const categoryData = Object.entries(report.categoryBreakdown || {})
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalSpending > 0 ? (total / totalSpending) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display mb-2">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of your spending
          </p>
        </div>

        {/* Month/Year Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Month:</Label>
            <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(2000, i).toLocaleString("default", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm">Year:</Label>
            <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-border/50 divide-x divide-border/50">
        <div className="p-12 space-y-3">
          <div className="text-label text-muted-foreground">TOTAL SPENT</div>
          <div className="text-hero">₹{totalSpending.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">This month</div>
        </div>

        <div className="p-12 space-y-3">
          <div className="text-label text-muted-foreground">AVG PER DAY</div>
          <div className="text-hero">₹{(totalSpending / 30).toFixed(0)}</div>
          <div className="flex items-center gap-1 text-xs text-accent">
            <TrendingDown className="h-3 w-3" />
            <span>Based on monthly total</span>
          </div>
        </div>

        <div className="p-12 space-y-3">
          <div className="text-label text-muted-foreground">TRANSACTIONS</div>
          <div className="text-hero">{transactionCount}</div>
          <div className="text-xs text-muted-foreground">This month</div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="space-y-6">
        <div className="text-section">Spending by Category</div>
        {categoryData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No expenses in this period
          </div>
        ) : (
          <div className="space-y-4">
            {categoryData.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-muted-foreground">{cat.percentage}%</span>
                  </div>
                  <span className="font-mono">₹{cat.total.toFixed(0)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="space-y-6">
        <div className="text-section">Payment Methods</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {report.paymentModeBreakdown && Object.entries(report.paymentModeBreakdown).map(([method, amount]) => (
            <div
              key={method}
              className="border border-border/50 rounded-lg p-6 space-y-2"
            >
              <div className="text-label text-muted-foreground">{method.toUpperCase()}</div>
              <div className="text-2xl font-light">₹{amount.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Total spent</div>
            </div>
          ))}
        </div>
      </div>

      {/* Needs vs Wants */}
      <div className="space-y-6">
        <div className="text-section">Essential vs Non-Essential</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { type: "needs", label: "NEEDS", amount: report.needVsWantBreakdown?.need || 0 },
            { type: "wants", label: "WANTS", amount: report.needVsWantBreakdown?.want || 0 },
          ].map(({ type, label, amount }) => {
            const percentage = totalSpending > 0 ? ((amount / totalSpending) * 100).toFixed(0) : "0";
            return (
              <div
                key={type}
                className="border border-border/50 rounded-lg p-8 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-label text-muted-foreground">{label}</div>
                  <div className="text-sm text-muted-foreground">{percentage}%</div>
                </div>
                <div className="text-4xl font-light">₹{amount.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">
                  {percentage}% of total spending
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
