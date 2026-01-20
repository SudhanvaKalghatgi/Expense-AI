import cron from "node-cron";
import { RecurringPayment } from "../models/recurring.model.js";
import { Expense } from "../models/expense.model.js";

const getDateKey = (date) => date.toISOString().split("T")[0];

/**
 *  This function contains the ACTUAL logic
 * Cron + manual trigger both will call this
 */
export const runRecurringExpenseAutomation = async () => {
  console.log("⏳ Running recurring expense automation...");

  const today = new Date();
  const todayKey = getDateKey(today);

  const recurringList = await RecurringPayment.find({ isActive: true });

  let createdCount = 0;
  let skippedCount = 0;

  for (const recurring of recurringList) {
    // If recurring has nextDueDate, only process when due
    if (recurring.nextDueDate) {
      const dueKey = getDateKey(recurring.nextDueDate);
      if (dueKey !== todayKey) {
        skippedCount++;
        continue;
      }
    } else {
      // If no nextDueDate, default: add on 1st day of month
      if (today.getDate() !== 1) {
        skippedCount++;
        continue;
      }
    }

    //  Prevent duplicate creation in the same month for same vendor
    const alreadyCreated = await Expense.findOne({
      userId: recurring.userId,
      note: { $regex: new RegExp(`^Recurring: ${recurring.vendorName}`, "i") },
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), 1),
        $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
      },
    });

    if (alreadyCreated) {
      skippedCount++;
      continue;
    }

    await Expense.create({
      userId: recurring.userId,
      amount: recurring.amount,
      category: recurring.category || "Subscription",
      note: `Recurring: ${recurring.vendorName}`,
      paymentMode: "upi",
      essentialType: "need",
      date: today,
    });

    //  If nextDueDate exists, set it to next month
    if (recurring.nextDueDate) {
      const next = new Date(recurring.nextDueDate);
      next.setMonth(next.getMonth() + 1);
      recurring.nextDueDate = next;
      await recurring.save();
    }

    createdCount++;
  }

  console.log(
    ` Recurring automation finished | Created: ${createdCount}, Skipped: ${skippedCount}`
  );

  return { createdCount, skippedCount };
};

/**
 *  Cron scheduler (daily at 00:05)
 */
export const startRecurringExpenseJob = () => {
  cron.schedule("5 0 * * *", async () => {
    try {
      await runRecurringExpenseAutomation();
    } catch (error) {
      console.error("❌ Recurring expense cron failed:", error.message);
    }
  });
};
