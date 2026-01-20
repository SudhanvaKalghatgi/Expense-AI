import mongoose from "mongoose";
import { RecurringPayment } from "../models/recurring.model.js";
import { ApiError } from "../utils/ApiError.js";

const normalizeVendor = (name) => name.trim().toLowerCase();

export const createRecurringService = async (clerkUserId, payload) => {
  const {
    vendorName,
    amount,
    category,
    frequency,
    startDate,
    nextDueDate,
    isActive,
  } = payload;

  const normalizedVendor = normalizeVendor(vendorName);

  // ✅ Prevent duplicates (extra layer besides DB unique index)
  const alreadyExists = await RecurringPayment.findOne({
    userId: clerkUserId,
    vendorName: normalizedVendor,
  });

  if (alreadyExists) {
    throw new ApiError(
      409,
      "Recurring vendor already exists. Try updating it instead."
    );
  }

  const finalStartDate = startDate ? new Date(startDate) : new Date();
  if (isNaN(finalStartDate.getTime())) {
    throw new ApiError(400, "Invalid startDate format");
  }

  const finalNextDueDate = nextDueDate ? new Date(nextDueDate) : null;
  if (finalNextDueDate && isNaN(finalNextDueDate.getTime())) {
    throw new ApiError(400, "Invalid nextDueDate format");
  }

  //  nextDueDate should not be before startDate
  if (finalNextDueDate && finalNextDueDate < finalStartDate) {
    throw new ApiError(400, "nextDueDate cannot be before startDate");
  }

  const recurring = await RecurringPayment.create({
    userId: clerkUserId,
    vendorName: normalizedVendor,
    amount,
    category: category ?? "Subscription",
    frequency: frequency ?? "monthly",
    startDate: finalStartDate,
    nextDueDate: finalNextDueDate,
    isActive: isActive ?? true,
  });

  return recurring;
};

export const getRecurringListService = async (clerkUserId) => {
  const list = await RecurringPayment.find({ userId: clerkUserId }).sort({
    createdAt: -1,
  });

  return list;
};

export const updateRecurringService = async (clerkUserId, id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid recurring payment id");
  }

  const recurring = await RecurringPayment.findOne({
    _id: id,
    userId: clerkUserId,
  });

  if (!recurring) {
    throw new ApiError(404, "Recurring payment not found");
  }

  //  Allowlist (only update these fields)
  const allowedFields = [
    "vendorName",
    "amount",
    "category",
    "frequency",
    "startDate",
    "nextDueDate",
    "isActive",
  ];

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      if (field === "vendorName") {
        recurring.vendorName = normalizeVendor(payload.vendorName);
      } else if (field === "startDate") {
        const parsed = new Date(payload.startDate);
        if (isNaN(parsed.getTime())) throw new ApiError(400, "Invalid startDate");
        recurring.startDate = parsed;
      } else if (field === "nextDueDate") {
        const parsed = new Date(payload.nextDueDate);
        if (isNaN(parsed.getTime()))
          throw new ApiError(400, "Invalid nextDueDate");
        recurring.nextDueDate = parsed;
      } else {
        recurring[field] = payload[field];
      }
    }
  }

  //  Validate nextDueDate >= startDate after updates
  if (recurring.nextDueDate && recurring.nextDueDate < recurring.startDate) {
    throw new ApiError(400, "nextDueDate cannot be before startDate");
  }

  //  Unique vendor name per user check (if vendor changed)
  if (payload.vendorName) {
    const exists = await RecurringPayment.findOne({
      userId: clerkUserId,
      vendorName: recurring.vendorName,
      _id: { $ne: recurring._id },
    });

    if (exists) {
      throw new ApiError(409, "This vendor name already exists for this user.");
    }
  }

  await recurring.save();
  return recurring;
};

export const toggleRecurringService = async (clerkUserId, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid recurring payment id");
  }

  const recurring = await RecurringPayment.findOne({
    _id: id,
    userId: clerkUserId,
  });

  if (!recurring) {
    throw new ApiError(404, "Recurring payment not found");
  }

  recurring.isActive = !recurring.isActive;
  await recurring.save();

  return recurring;
};

export const deleteRecurringService = async (clerkUserId, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid recurring payment id");
  }

  const deleted = await RecurringPayment.findOneAndDelete({
    _id: id,
    userId: clerkUserId,
  });

  if (!deleted) {
    throw new ApiError(404, "Recurring payment not found");
  }

  return deleted;
};
