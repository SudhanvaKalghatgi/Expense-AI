import express from "express";
import cors from "cors";
import helmet from "helmet";

import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";

import v1Routes from "./routes/v1/index.js";

const app = express();

// --------------------
// Security middlewares
// --------------------
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  })
);

// --------------------
// Body parsing
// --------------------
app.use(express.json({ limit: "16kb" }));

// --------------------
// Request logging (BEFORE routes)
// --------------------
app.use(requestLogger);

// --------------------
// API routes (rate-limited)
// --------------------
app.use("/api/v1", apiRateLimiter, v1Routes);

// --------------------
// Health check
// --------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Expense Tracker Backend is running ✅",
  });
});

// --------------------
// Centralized error handler (ALWAYS last)
// --------------------
app.use(errorHandler);

export default app;
