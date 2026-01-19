import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // clerkUserId

    amount: { type: Number, required: true },

    category: { type: String, required: true, trim: true },

    note: { type: String, trim: true, default: "" },

    paymentMode: {
      type: String,
      enum: ["upi", "cash", "card", "bank"],
      default: "upi",
    },

    essentialType: {
      type: String,
      enum: ["need", "want"],
      default: "need",
    },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Expense = mongoose.model("Expense", expenseSchema);
