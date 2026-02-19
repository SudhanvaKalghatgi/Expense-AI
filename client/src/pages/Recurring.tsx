import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Calendar, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const recurringSchema = z.object({
  vendorName: z.string().min(2, "Vendor name is required"),
  amount: z.string().min(1, "Amount is required"),
  frequency: z.enum(["monthly", "yearly", "weekly"]),
  category: z.string().min(2, "Category is required"),
  nextDueDate: z.string(),
});

type RecurringFormValues = z.infer<typeof recurringSchema>;

interface RecurringExpense {
  _id: string;
  vendorName: string;
  amount: number;
  frequency: "monthly" | "yearly" | "weekly";
  category: string;
  nextDueDate: string;
  isActive: boolean;
}

export default function Recurring() {
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      frequency: "monthly",
      nextDueDate: new Date().toISOString().split("T")[0],
    },
  });

  // Log form errors for debugging
  console.log("Form errors:", errors);

  // Fetch recurring expenses
  useEffect(() => {
    fetchRecurring();
  }, []);

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const res = await api.get("/recurring");
      if (res.data.success) {
        setRecurring(res.data.data || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch recurring expenses:", error);
      toast.error("Failed to load recurring expenses");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RecurringFormValues) => {
    console.log("Form data:", data);
    setIsSubmitting(true);

    try {
      const payload = {
        vendorName: data.vendorName,
        amount: Number(data.amount),
        frequency: data.frequency,
        category: data.category,
        nextDueDate: data.nextDueDate,
      };

      console.log("Sending payload:", payload);

      const res = await api.post("/recurring", payload);

      if (res.data.success) {
        toast.success("Recurring expense added!");
        setIsDialogOpen(false);
        reset();
        fetchRecurring();
      }
    } catch (error: any) {
      console.error("Failed to add recurring expense:", error);
      console.error("Error response:", error.response?.data);

      // Display user-friendly error message
      const errorMessage = error.response?.data?.message || "Failed to add recurring expense";
      toast.error(errorMessage, {
        duration: 5000,
        description: errorMessage.includes('nextDueDate')
          ? 'Please make sure the next billing date is not before today'
          : errorMessage.includes('vendor already exists')
            ? 'Try updating the existing subscription instead'
            : undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const res = await api.patch(`/recurring/${id}/toggle`);
      if (res.data.success) {
        toast.success("Subscription updated");
        // Update local state
        setRecurring(
          recurring.map((item) =>
            item._id === id ? { ...item, isActive: !item.isActive } : item
          )
        );
      }
    } catch (error: any) {
      console.error("Failed to toggle recurring:", error);
      toast.error(error.response?.data?.message || "Failed to update subscription");
    }
  };

  const deleteRecurring = async (id: string) => {
    try {
      const res = await api.delete(`/recurring/${id}`);
      if (res.data.success) {
        toast.success("Subscription removed");
        setRecurring(recurring.filter((item) => item._id !== id));
      }
    } catch (error: any) {
      console.error("Failed to delete recurring:", error);
      toast.error(error.response?.data?.message || "Failed to remove subscription");
    }
  };

  const totalMonthly = recurring
    .filter((item) => item.isActive && item.frequency === "monthly")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalYearly = recurring
    .filter((item) => item.isActive && item.frequency === "yearly")
    .reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full dark:border-gray-700 dark:border-t-white"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-display mb-2">Recurring Expenses</h1>
            <p className="text-sm text-muted-foreground">
              Manage your subscriptions and recurring payments
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full h-10 px-6 w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-b border-border/50 divide-y md:divide-y-0 md:divide-x divide-border/50">
          <div className="p-6 md:p-12 space-y-3">
            <div className="text-label text-muted-foreground">MONTHLY TOTAL</div>
            <div className="text-hero text-4xl md:text-[4.5rem]">₹{totalMonthly.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">
              {recurring.filter((r) => r.isActive && r.frequency === "monthly").length}{" "}
              active subscriptions
            </div>
          </div>

          <div className="p-6 md:p-12 space-y-3">
            <div className="text-label text-muted-foreground">YEARLY TOTAL</div>
            <div className="text-hero text-4xl md:text-[4.5rem]">₹{totalYearly.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">
              {recurring.filter((r) => r.isActive && r.frequency === "yearly").length}{" "}
              active subscriptions
            </div>
          </div>
        </div>

        {/* Recurring List */}
        {recurring.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No recurring expenses yet. Add your first subscription to get started!
          </div>
        ) : (
          <div className="space-y-0">
            {recurring.map((item) => (
              <div
                key={item._id}
                className="group py-6 border-b border-border/50 hover:bg-muted/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <div className="text-lg font-medium">{item.vendorName}</div>
                      <Badge
                        variant={item.isActive ? "default" : "outline"}
                        className="text-xs"
                      >
                        {item.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-mono">${item.amount.toFixed(2)}</span>
                      <span>·</span>
                      <span className="capitalize">{item.frequency}</span>
                      <span>·</span>
                      <span>{item.category}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Next payment:{" "}
                        {new Date(item.nextDueDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleActive(item._id)}
                      className="flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted transition-colors text-center"
                    >
                      {item.isActive ? "Pause" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteRecurring(item._id)}
                      className="p-2 hover:bg-destructive/10 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Recurring Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-section">Add Recurring Expense</h2>
              <button
                onClick={() => {
                  setIsDialogOpen(false);
                  reset();
                }}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-label text-muted-foreground">NAME</Label>
                <Input
                  {...register("vendorName")}
                  placeholder="Netflix, Spotify, etc."
                  className="h-12"
                />
                {errors.vendorName && (
                  <p className="text-xs text-destructive">{errors.vendorName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-label text-muted-foreground">AMOUNT</Label>
                <Input
                  {...register("amount")}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-12"
                />
                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-label text-muted-foreground">CATEGORY</Label>
                <Input
                  {...register("category")}
                  placeholder="Entertainment, Technology, etc."
                  className="h-12"
                />
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-label text-muted-foreground">FREQUENCY</Label>
                  <Select
                    value={watch("frequency")}
                    onValueChange={(value) => setValue("frequency", value as any)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-label text-muted-foreground">NEXT BILLING</Label>
                  <Input {...register("nextDueDate")} type="date" className="h-12" />
                  <p className="text-xs text-muted-foreground">
                    Must be today or a future date
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-full"
              >
                {isSubmitting ? "Adding..." : "Add Subscription"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
