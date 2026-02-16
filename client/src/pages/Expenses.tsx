import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Plus, X } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { api } from "@/lib/api";

const expenseSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(2, "Category is required"),
  date: z.string().optional(),
  paymentMode: z.enum(["upi", "cash", "card", "bank"]).optional(),
  essentialType: z.enum(["need", "want"]).optional(),
  note: z.string().max(200).optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface Expense {
  _id: string;
  amount: number;
  category: string;
  date: string;
  paymentMode: "upi" | "cash" | "card" | "bank";
  essentialType: "need" | "want";
  note?: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      paymentMode: "upi",
      essentialType: "need",
    },
  });

  // Fetch expenses on mount and when navigating back
  useEffect(() => {
    fetchExpenses();
  }, [location.pathname]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses", {
        params: { page: 1, limit: 50 }
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

  const onSubmit = async (data: ExpenseFormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        amount: Number(data.amount),
        category: data.category,
        date: data.date || format(new Date(), "yyyy-MM-dd"),
        paymentMode: data.paymentMode || "upi",
        essentialType: data.essentialType || "need",
        note: data.note || undefined,
      };

      const res = await api.post("/expenses", payload);

      if (res.data.success) {
        toast.success("Expense added successfully!");
        setIsDialogOpen(false);
        reset();
        // Refresh expenses list
        fetchExpenses();
      }
    } catch (error: any) {
      console.error("Failed to add expense:", error);
      toast.error(error.response?.data?.message || "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const res = await api.delete(`/expenses/${id}`);
      if (res.data.success) {
        toast.success("Expense deleted");
        // Remove from local state
        setExpenses(expenses.filter(exp => exp._id !== id));
      }
    } catch (error: any) {
      console.error("Failed to delete expense:", error);
      toast.error(error.response?.data?.message || "Failed to delete expense");
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display mb-2">Expenses</h1>
            <p className="text-sm text-muted-foreground">
              {expenses.length} transactions this month
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full h-10 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Borderless Table */}
        {expenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No expenses yet. Add your first expense to get started!
          </div>
        ) : (
          <div className="space-y-0">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="group py-6 border-b border-border/50 hover:bg-muted/20 transition-colors flex items-start justify-between"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-4">
                    <div className="text-amount">
                      ₹{expense.amount.toFixed(0)}
                    </div>
                    <div className="text-sm font-medium">{expense.category}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                    {expense.paymentMode && (
                      <>
                        <span>·</span>
                        <span className="uppercase">{expense.paymentMode}</span>
                      </>
                    )}
                    {expense.essentialType && (
                      <>
                        <span>·</span>
                        <span className="capitalize">{expense.essentialType}</span>
                      </>
                    )}
                  </div>
                  {expense.note && (
                    <div className="text-sm text-muted-foreground mt-2">
                      {expense.note}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteExpense(expense._id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-md"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-Screen Add Expense Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-section">Add New Expense</h2>
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

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Amount - HUGE */}
              <div className="space-y-2">
                <Label className="text-label text-muted-foreground">AMOUNT</Label>
                <Input
                  {...register("amount")}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="text-4xl font-light h-16 border-0 border-b border-border/50 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground"
                />
                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-label text-muted-foreground">CATEGORY</Label>
                <Input
                  {...register("category")}
                  placeholder="e.g. Food, Travel, Shopping"
                  className="h-12"
                />
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-label text-muted-foreground">DATE</Label>
                <Input {...register("date")} type="date" className="h-12" />
              </div>

              {/* Payment Mode & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-label text-muted-foreground">PAYMENT</Label>
                  <Select
                    value={watch("paymentMode")}
                    onValueChange={(value) =>
                      setValue("paymentMode", value as any)
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-label text-muted-foreground">TYPE</Label>
                  <Select
                    value={watch("essentialType")}
                    onValueChange={(value) =>
                      setValue("essentialType", value as any)
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="need">Need</SelectItem>
                      <SelectItem value="want">Want</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label className="text-label text-muted-foreground">
                  NOTE (OPTIONAL)
                </Label>
                <Input
                  {...register("note")}
                  placeholder="Add a note"
                  className="h-12"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-full"
              >
                {isSubmitting ? "Adding..." : "Add Expense"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
