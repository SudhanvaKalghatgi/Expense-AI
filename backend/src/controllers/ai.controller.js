import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { getPreviousMonthComparisonService } from "../services/report.service.js";
import { getMyProfileService } from "../services/profile.service.js";
import { generateMonthlyAIReviewService } from "../services/ai.service.js";

export const getMonthlyAIReview = asyncHandler(async (req, res) => {
  const { clerkUserId } = req.user;

  const month = Number(req.query.month);
  const year = Number(req.query.year);

  //  Fetch profile (needed for personalized AI suggestions)
  const userProfile = await getMyProfileService(clerkUserId);

  //  Get monthly report + previous month comparison
  const reportData = await getPreviousMonthComparisonService(
    clerkUserId,
    month,
    year
  );

  //  Generate AI review
  const aiReview = await generateMonthlyAIReviewService({
    month,
    year,
    reportData,
    userProfile,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        month,
        year,
        report: reportData,
        aiReview,
      },
      "AI monthly review generated ✅"
    )
  );
});
