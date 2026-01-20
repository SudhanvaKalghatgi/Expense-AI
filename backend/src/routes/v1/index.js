import { Router } from "express";
import profileRoutes from "./profile.routes.js";
import expenseRoutes from "./expense.routes.js";
import recurringRoutes from "./recurring.routes.js";

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

export default router;
