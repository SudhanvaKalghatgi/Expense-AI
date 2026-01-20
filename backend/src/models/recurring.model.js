import mongoose from "mongoose";

const recurringSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // clerkUserId

    vendorName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },

    category: { type: String, trim: true, default: "Subscription" },

    frequency: {
      type: String,
      enum: ["monthly"], // keep monthly for now, can expand later
      default: "monthly",
    },

    startDate: { type: Date, default: Date.now },
    nextDueDate: { type: Date, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate vendorName for the same user
recurringSchema.index({ userId: 1, vendorName: 1 }, { unique: true });

export const RecurringPayment = mongoose.model(
  "RecurringPayment",
  recurringSchema
);
