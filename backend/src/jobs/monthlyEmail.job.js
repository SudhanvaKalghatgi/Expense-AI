import cron from "node-cron";
import { User } from "../models/user.model.js";
import { sendMonthlyReportEmail } from "../services/email.service.js";

import { getPreviousMonthComparisonService } from "../services/report.service.js";
import { getMyProfileService } from "../services/profile.service.js";
import { generateMonthlyAIReviewService } from "../services/ai.service.js";

const generateMonthlyReportHTML = ({ name, month, year, report, aiReview }) => {
  const categoryRows = Object.entries(report?.current?.categoryBreakdown || {})
    .map(
      ([cat, total]) =>
        `<tr><td style="padding:8px;">${cat}</td><td style="padding:8px;">₹${total}</td></tr>`
    )
    .join("");

  const highlights = (aiReview?.highlights || [])
    .map((h) => `<li>${h}</li>`)
    .join("");

  const risks = (aiReview?.risks || [])
    .map((r) => `<li>${r}</li>`)
    .join("");

  const actionPlan = (aiReview?.actionPlan || [])
    .map((a) => `<li>${a}</li>`)
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">
      <h2>📊 Monthly Expense Report - ${month}/${year}</h2>
      <p>Hello <b>${name}</b> 👋</p>

      <h3 style="margin-top: 20px;">✅ Your Summary</h3>
      <p><b>Total Spend:</b> ₹${report?.current?.totalExpense ?? 0}</p>
      <p><b>Total Transactions:</b> ${report?.current?.totalTransactions ?? 0}</p>

      <h3 style="margin-top: 20px;">📌 Category Breakdown</h3>
      <table border="1" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <thead>
          <tr>
            <th align="left" style="padding:8px;">Category</th>
            <th align="left" style="padding:8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${categoryRows || "<tr><td colspan='2' style='padding:8px;'>No expenses found</td></tr>"}
        </tbody>
      </table>

      <h3 style="margin-top: 26px;">🤖 AI Money Review</h3>
      <p style="margin: 4px 0;"><b>${aiReview?.headline || "Your AI spending insights are ready ✅"}</b></p>
      <p style="margin: 4px 0;"><b>Score:</b> ${aiReview?.score ?? 0}/10</p>
      <p style="margin-top: 10px;">${aiReview?.summary || ""}</p>

      <h4 style="margin-top: 18px;">✅ Highlights</h4>
      <ul>
        ${highlights || "<li>No highlights</li>"}
      </ul>

      <h4 style="margin-top: 18px;">⚠️ Risks</h4>
      <ul>
        ${risks || "<li>No risks</li>"}
      </ul>

      <h4 style="margin-top: 18px;">🎯 Action Plan</h4>
      <ul>
        ${actionPlan || "<li>No action plan</li>"}
      </ul>

      <hr style="margin-top: 30px;" />
      <p style="color: gray; font-size: 12px;">
        This is an automated report from <b>AI Expense Tracker</b> ✅
      </p>
    </div>
  `;
};

/**
 *  Manual trigger logic (reusable)
 * Runs for the previous month
 */
export const runMonthlyEmailAutomation = async () => {
  console.log("📩 Running monthly email automation...");

  const now = new Date();

  //  Send previous month report
  let month = now.getMonth(); // Jan=0
  let year = now.getFullYear();

  // If current month is January, previous month is Dec of last year
  if (month === 0) {
    month = 12;
    year -= 1;
  }

  // convert to 1-12 month number for our report service
  const reportMonth = month;

  const users = await User.find({ email: { $ne: null } });

  let sentCount = 0;

  for (const user of users) {
    //  Report + previous month comparison
    const reportData = await getPreviousMonthComparisonService(
      user.clerkUserId,
      reportMonth,
      year
    );

    //  Profile required for personalized AI review
    const userProfile = await getMyProfileService(user.clerkUserId);

    //  Generate AI review (Gemini)
    const aiReview = await generateMonthlyAIReviewService({
      month: reportMonth,
      year,
      reportData,
      userProfile,
    });

    //  Build HTML with report + AI review
    const html = generateMonthlyReportHTML({
      name: user.fullName || "User",
      month: reportMonth,
      year,
      report: reportData,
      aiReview,
    });

    //  Send email
    await sendMonthlyReportEmail({
      to: user.email,
      subject: `Your Monthly Expense Report + AI Review - ${reportMonth}/${year}`,
      html,
    });

    sentCount++;
  }

  console.log(`✅ Monthly email automation finished | Sent: ${sentCount}`);
  return { sentCount };
};

/**
 *  Cron scheduler (1st of month at 09:00 AM)
 */
export const startMonthlyEmailJob = () => {
  cron.schedule("0 9 1 * *", async () => {
    try {
      await runMonthlyEmailAutomation();
    } catch (error) {
      console.error("❌ Monthly email cron failed:", error.message);
    }
  });
};
