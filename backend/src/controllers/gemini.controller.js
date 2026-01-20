import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const listGeminiModels = asyncHandler(async (req, res) => {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new ApiError(500, "GEMINI_API_KEY is missing in environment variables");
  }

  const genAI = new GoogleGenerativeAI(key);

  // ✅ This is a simple REST call because SDK doesn't expose listModels directly in all versions
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      method: "GET",
      headers: {
        "x-goog-api-key": key,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error?.message || "Failed to fetch Gemini models"
    );
  }

  return res.status(200).json(
    new ApiResponse(200, data, "✅ Gemini models fetched successfully")
  );
});
