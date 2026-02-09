import express from "express";
import cors from "cors";
import helmet from "helmet";

import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";

import v1Routes from "./routes/v1/index.js";

const app = express();

// Security headers
app.use(helmet());

// Allow frontend requests
app.use(cors());

// Parse JSON body
app.use(express.json({ limit: "16kb" }));

app.use("/api", apiRateLimiter, v1Routes);

// Request logging
app.use(requestLogger);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Expense Tracker Backend is running ✅",
  });
});

// Versioned routes
app.use("/api/v1", v1Routes);

// Centralized error handler (ALWAYS at the end)
app.use(errorHandler);

export default app;
