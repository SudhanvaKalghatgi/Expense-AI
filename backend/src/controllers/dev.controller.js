import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { runRecurringExpenseAutomation } from "../jobs/recurringExpense.job.js";
import { runMonthlyEmailAutomation } from "../jobs/monthlyEmail.job.js";

export const triggerRecurringJobNow = asyncHandler(async (req, res) => {
  await runRecurringExpenseAutomation();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "✅ Recurring automation executed manually"));
});

export const triggerMonthlyEmailJobNow = asyncHandler(async (req, res) => {
  await runMonthlyEmailAutomation();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "✅ Monthly email job executed manually"));
});
