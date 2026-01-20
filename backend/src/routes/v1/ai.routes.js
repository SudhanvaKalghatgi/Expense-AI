import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { monthlyReportQuerySchema } from "../../validations/report.validation.js";

import { getMonthlyAIReview } from "../../controllers/ai.controller.js";

const router = Router();

router.get(
  "/monthly-review",
  requireAuth,
  validate(monthlyReportQuerySchema),
  getMonthlyAIReview
);

export default router;
