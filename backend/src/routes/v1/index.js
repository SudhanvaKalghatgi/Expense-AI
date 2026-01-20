import { Router } from "express";
import profileRoutes from "./profile.routes.js";
import expenseRoutes from "./expense.routes.js";
import recurringRoutes from "./recurring.routes.js";
import reportRoutes from "./report.routes.js";
import devRoutes from "./dev.routes.js";
import aiRoutes from "./ai.routes.js";
import geminiRoutes from "./gemini.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API v1 health is OK ✅",
  });
});

router.use("/profile", profileRoutes);
router.use("/expenses", expenseRoutes);
router.use("/recurring", recurringRoutes);
router.use("/reports", reportRoutes);
router.use("/dev", devRoutes);
router.use("/ai", aiRoutes);
router.use("/gemini", geminiRoutes);


export default router;
