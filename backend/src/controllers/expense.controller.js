import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  createExpenseService,
  deleteExpenseService,
  getExpensesService,
  updateExpenseService,
} from "../services/expense.service.js";

export const createExpense = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.user;

  const expense = await createExpenseService(clerkUserId, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense created successfully ✅"));
});

export const getExpenses = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.user;

  const expenses = await getExpensesService(clerkUserId, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully ✅"));
});

export const updateExpense = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.user;
  const { id } = req.params;

  const updated = await updateExpenseService(clerkUserId, id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Expense updated successfully ✅"));
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.user;
  const { id } = req.params;

  const deleted = await deleteExpenseService(clerkUserId, id);

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Expense deleted successfully ✅"));
});
