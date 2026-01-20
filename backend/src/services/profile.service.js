import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const createOrUpdateProfileService = async (clerkUserId, payload) => {
  const {
    fullName,
    email,
    username,
    userType,
    incomeTrackingMode,
    monthlyIncome,
    monthlyBudget,
    savingTarget,
  } = payload;

  // ✅ email uniqueness check
  const emailExists = await User.findOne({
    email: email.toLowerCase(),
    clerkUserId: { $ne: clerkUserId },
  });

  if (emailExists) {
    throw new ApiError(409, "This email is already linked to another account.");
  }

  // ✅ username uniqueness check
  if (username) {
    const usernameExists = await User.findOne({
      username: username.toLowerCase(),
      clerkUserId: { $ne: clerkUserId },
    });

    if (usernameExists) {
      throw new ApiError(409, "Username already taken. Please choose another.");
    }
  }

  const finalMonthlyIncome =
    incomeTrackingMode === "fixedIncome" ? monthlyIncome ?? null : null;

  const profile = await User.findOneAndUpdate(
    { clerkUserId },
    {
      clerkUserId,
      fullName,
      email: email.toLowerCase(),
      username: username ? username.toLowerCase() : null,
      userType,
      incomeTrackingMode,
      monthlyIncome: finalMonthlyIncome,
      monthlyBudget: monthlyBudget ?? null,
      savingTarget: savingTarget ?? null,
    },
    { upsert: true, new: true }
  );

  return profile;
};


export const getMyProfileService = async (clerkUserId) => {
  const profile = await User.findOne({ clerkUserId });

  if (!profile) {
    throw new ApiError(404, "Profile not found. Please onboard first.");
  }

  return profile;
};
