import express from "express";
import cors from "cors";
import helmet from "helmet";

import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";

import v1Routes from "./routes/v1/index.js";

const app = express();


// ✅ VERY IMPORTANT — FIX FOR RENDER / PRODUCTION
app.set("trust proxy", 1);


// --------------------
// Security middlewares
// --------------------
app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend-domain.vercel.app" // add later
    ],
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
// Request logging
// --------------------
app.use(requestLogger);


// --------------------
// API routes
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
// Error handler
// --------------------
app.use(errorHandler);

export default app;
