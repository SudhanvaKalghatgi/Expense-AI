import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "@/lib/api";
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
import { toast } from "sonner";
import { motion } from "framer-motion";

// Zod Schema matching backend validation
// Note: number inputs return strings, we'll convert them in onSubmit
const onboardingSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  username: z.string().optional().or(z.literal("")),
  userType: z.enum(["student", "professional", "business"]),
  incomeTrackingMode: z.enum(["fixedIncome", "expensesOnly"]),
  // Accept as strings from number inputs, convert in onSubmit
  monthlyIncome: z.string().optional(),
  monthlyBudget: z.string().optional(),
  savingTarget: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { user } = useUser();
  console.log(user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      username: (user?.username as string) || "",
      userType: "student",
      incomeTrackingMode: "expensesOnly",
      monthlyIncome: "",
      monthlyBudget: "",
      savingTarget: "",
    },
  });

  const { register, handleSubmit, watch, control, formState: { errors } } = form;
  const incomeTrackingMode = watch("incomeTrackingMode");

  // Log errors to help debug
  console.log("Form errors:", errors);

  const onSubmit = async (data: OnboardingFormValues) => {
    setLoading(true);
    try {
      // Ensure number fields are actually numbers or null
      console.log("Submitting", data);
      const payload = {
        ...data,
        username: data.username || undefined,
        monthlyIncome: data.monthlyIncome === "" || !data.monthlyIncome ? null : Number(data.monthlyIncome),
        monthlyBudget: data.monthlyBudget === "" || !data.monthlyBudget ? null : Number(data.monthlyBudget),
        savingTarget: data.savingTarget === "" || !data.savingTarget ? null : Number(data.savingTarget),
      };

      console.log("Payload being sent:", payload);

      const res = await api.post("/profile/onboard", payload);
      
      if (res.data.success) {
        toast.success("Welcome aboard! 🎉");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
      >
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome! 👋</h1>
          <p className="text-gray-300">Let's set up your profile to personalize your experience.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  {...register("fullName")}
                  placeholder="John Doe"
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  {...register("username")}
                  placeholder="johndoe"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email (Read-only)</Label>
              <Input
                {...register("email")}
                readOnly
                className="bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>I am a...</Label>
                <Controller
                  control={control}
                  name="userType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Tracking Mode</Label>
                <Controller
                  control={control}
                  name="incomeTrackingMode"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expensesOnly">Expenses Only</SelectItem>
                        <SelectItem value="fixedIncome">Fixed Income</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {incomeTrackingMode === "fixedIncome" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <Label>Monthly Income</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    {...register("monthlyIncome")}
                    className="pl-8"
                    placeholder="5000"
                  />
                </div>
                {errors.monthlyIncome && <p className="text-red-500 text-xs">{errors.monthlyIncome.message}</p>}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label>Monthly Budget Goal</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    {...register("monthlyBudget")}
                    className="pl-8"
                    placeholder="2000"
                  />
                </div>
              </div>

               <div className="space-y-2">
                <Label>Saving Target</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    {...register("savingTarget")}
                    className="pl-8"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 text-lg font-semibold cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
