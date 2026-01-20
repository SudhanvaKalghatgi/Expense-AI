import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  createRecurringService,
  deleteRecurringService,
  getRecurringListService,
  toggleRecurringService,
  updateRecurringService,
} from "../services/recurring.service.js";

export const createRecurring = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.user;

  const recurring = await createRecurringService(clerkUserId, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, recurring, "Recurring payment created ✅"));
});

export const getRecurringList = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.user;

  const list = await getRecurringListService(clerkUserId);

  return res
    .status(200)
    .json(new ApiResponse(200, list, "Recurring payments fetched ✅"));
});

export const updateRecurring = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.user;
  const { id } = req.params;

  const updated = await updateRecurringService(clerkUserId, id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Recurring payment updated ✅"));
});

export const toggleRecurring = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.user;
  const { id } = req.params;

  const updated = await toggleRecurringService(clerkUserId, id);

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Recurring payment toggled ✅"));
});

export const deleteRecurring = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.user;
  const { id } = req.params;

  const deleted = await deleteRecurringService(clerkUserId, id);

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Recurring payment deleted ✅"));
});
