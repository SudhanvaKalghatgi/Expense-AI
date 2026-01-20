import cron from "node-cron";
import { User } from "../models/user.model.js";
import { getMonthlyReportService } from "../services/report.service.js";
import { sendMonthlyReportEmail } from "../services/email.service.js";

const generateMonthlyReportHTML = ({ name, month, year, report }) => {
  const categoryRows = Object.entries(report.categoryBreakdown || {})
    .map(([cat, total]) => `<tr><td>${cat}</td><td>₹${total}</td></tr>`)
    .join("");

  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>📊 Monthly Expense Report - ${month}/${year}</h2>
      <p>Hello <b>${name}</b>, here is your expense summary:</p>

      <h3>Total Spend: ₹${report.totalExpense}</h3>
      <p>Total Transactions: ${report.totalTransactions}</p>

      <h3>Category Breakdown</h3>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr><th>Category</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${categoryRows || "<tr><td colspan='2'>No expenses found</td></tr>"}
        </tbody>
      </table>

      <p style="margin-top: 16px;">✅ AI review will be added soon!</p>
    </div>
  `;
};

/**
 *  Manual trigger logic (reusable)
 */
export const runMonthlyEmailAutomation = async () => {
  console.log("📩 Running monthly email automation...");

  const now = new Date();

  let month = now.getMonth();
  let year = now.getFullYear();

  if (month === 0) {
    month = 12;
    year -= 1;
  }

  const reportMonth = month;

  const users = await User.find({ email: { $ne: null } });

  let sentCount = 0;

  for (const user of users) {
    const report = await getMonthlyReportService(
      user.clerkUserId,
      reportMonth,
      year
    );

    const html = generateMonthlyReportHTML({
      name: user.fullName || "User",
      month: reportMonth,
      year,
      report,
    });

    await sendMonthlyReportEmail({
      to: user.email,
      subject: `Your Monthly Expense Report - ${reportMonth}/${year}`,
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
