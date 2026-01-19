import { z } from "zod";

  export const createExpenseSchema = z.object({
    body: z.object({
      amount: z.number().positive("Amount must be greater than 0"),
      category: z.string().min(2, "Category is required"),
      note: z.string().max(200).optional(),
      paymentMode: z.enum(["upi", "cash", "card", "bank"]).optional(),
      essentialType: z.enum(["need", "want"]).optional(),
      date: z.iso.date().optional(), // ISO date (YYYY-MM-DD)
    }),
  });
  export const updateExpenseSchema = z.object({
    body: z.object({
      amount: z.number().positive().optional(),
      category: z.string().min(2).optional(),
      note: z.string().max(200).optional(),
      paymentMode: z.enum(["upi", "cash", "card", "bank"]).optional(),
      essentialType: z.enum(["need", "want"]).optional(),
      date: z.iso.date().optional(), // ISO date (YYYY-MM-DD)
    }),
  });

const monthSchema = z
  .string()
  .regex(/^\d+$/, "Month must be a number")
  .transform(Number)
  .refine((m) => m >= 1 && m <= 12, "Month must be between 1 and 12");

const yearSchema = z
  .string()
  .regex(/^\d+$/, "Year must be a number")
  .transform(Number)
  .refine((y) => y >= 2000 && y <= 2100, "Year must be between 2000 and 2100");

export const getExpensesQuerySchema = z.object({
  query: z
    .object({
      month: monthSchema.optional(),
      year: yearSchema.optional(),
    })
    .refine(
      (q) => (q.month && q.year) || (!q.month && !q.year),
      "Both month and year must be provided together"
    ),
});

