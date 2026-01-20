import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  createRecurringSchema,
  updateRecurringSchema,
} from "../../validations/recurring.validation.js";

import {
  createRecurring,
  deleteRecurring,
  getRecurringList,
  toggleRecurring,
  updateRecurring,
} from "../../controllers/recurring.controller.js";

const router = Router();

router.post("/", requireAuth, validate(createRecurringSchema), createRecurring);

router.get("/", requireAuth, getRecurringList);

router.patch("/:id", requireAuth, validate(updateRecurringSchema), updateRecurring);

router.patch("/:id/toggle", requireAuth, toggleRecurring);

router.delete("/:id", requireAuth, deleteRecurring);

export default router;
