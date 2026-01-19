import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  createExpenseSchema,
  updateExpenseSchema,
  getExpensesQuerySchema,
} from "../../validations/expense.validation.js";

import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../../controllers/expense.controller.js";

const router = Router();

router.post("/", requireAuth, validate(createExpenseSchema), createExpense);

router.get("/", requireAuth, validate(getExpensesQuerySchema), getExpenses);

router.patch("/:id", requireAuth, validate(updateExpenseSchema), updateExpense);

router.delete("/:id", requireAuth, deleteExpense);

export default router;
