import rateLimit from "express-rate-limit";
import { ApiResponse } from "../utils/ApiResponse.js";

export const apiRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,

  handler: (req, res) => {
    return res.status(429).json({
      statusCode: 429,
      success: false,
      message: "Too many requests. Please try again after some time.",
      data: null,
    });
  },
});
