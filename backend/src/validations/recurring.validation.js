import { z } from "zod";

const vendorNameSchema = z
  .string()
  .min(2, "Vendor name must be at least 2 characters")
  .max(50, "Vendor name must be at most 50 characters")
  .transform((v) => v.trim());

const amountSchema = z.number().positive("Amount must be greater than 0");

const dateStringSchema = z
  .string()
  .refine((d) => !isNaN(new Date(d).getTime()), "Invalid date format");

export const createRecurringSchema = z.object({
  body: z.object({
    vendorName: vendorNameSchema,
    amount: amountSchema,

    category: z.string().min(2).max(30).optional(),
    frequency: z.enum(["monthly"]).optional(),

    startDate: dateStringSchema.optional(),
    nextDueDate: dateStringSchema.optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateRecurringSchema = z.object({
  body: z.object({
    vendorName: vendorNameSchema.optional(),
    amount: amountSchema.optional(),

    category: z.string().min(2).max(30).optional(),
    frequency: z.enum(["monthly"]).optional(),

    startDate: dateStringSchema.optional(),
    nextDueDate: dateStringSchema.optional(),
    isActive: z.boolean().optional(),
  }),
});
