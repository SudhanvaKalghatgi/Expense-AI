import { Router } from "express";
import { ApiError } from "../../utils/ApiError.js";

import {
  triggerMonthlyEmailJobNow,
  triggerRecurringJobNow,
} from "../../controllers/dev.controller.js";

const router = Router();

/**
 *  DEV ONLY ROUTES
 * Block in production
 */
router.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    throw new ApiError(403, "DEV routes are disabled in production");
  }
  next();
});

router.post("/run-recurring-job", triggerRecurringJobNow);
router.post("/run-monthly-email-job", triggerMonthlyEmailJobNow);

export default router;
