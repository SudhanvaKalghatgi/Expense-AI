import { Router } from "express";
import { ApiError } from "../../utils/ApiError.js";
import { listGeminiModels } from "../../controllers/gemini.controller.js";

const router = Router();

//  DEV ONLY
router.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    throw new ApiError(403, "Gemini DEV routes are disabled in production");
  }
  next();
});

router.get("/models", listGeminiModels);

export default router;
