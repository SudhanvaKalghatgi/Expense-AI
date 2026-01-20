import dotenv from "dotenv";
dotenv.config();


import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startRecurringExpenseJob } from "./jobs/recurringExpense.job.js";
import { startMonthlyEmailJob } from "./jobs/monthlyEmail.job.js";


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);

      //  Start cron jobs after server starts
      startRecurringExpenseJob();
      startMonthlyEmailJob();

      console.log("✅ Cron jobs started");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

