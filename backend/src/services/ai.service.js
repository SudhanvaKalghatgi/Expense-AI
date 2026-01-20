import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";

const safeNumber = (n) => (typeof n === "number" && !isNaN(n) ? n : 0);

const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new ApiError(500, "GEMINI_API_KEY is missing in environment variables");
  }

  return new GoogleGenerativeAI(key);
};

/**
 * ✅ Uses only models that are available in your ListModels output ✅
 */
const getGeminiModel = (genAI) => {
  const modelCandidates = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

  return {
    candidates: modelCandidates,
    createModel: (name) => genAI.getGenerativeModel({ model: name }),
  };
};

const buildPrompt = ({ month, year, current, previous, comparison, profile }) => {
  const totalExpense = safeNumber(current?.totalExpense);
  const prevExpense = safeNumber(previous?.totalExpense);

  const categoryBreakdown = current?.categoryBreakdown || {};
  const needVsWant = current?.needVsWantBreakdown || {};
  const paymentMode = current?.paymentModeBreakdown || {};

  return `
You are a personal finance assistant for an expense tracker app.
Generate a short, friendly monthly review (practical + not judgmental).

User profile:
- Name: ${profile?.fullName || "User"}
- Type: ${profile?.userType || "unknown"}
- Monthly income: ${profile?.monthlyIncome ?? "not provided"}
- Monthly budget: ${profile?.monthlyBudget ?? "not provided"}
- Saving target: ${profile?.savingTarget ?? "not provided"}

Month: ${month}/${year}

Current month:
- Total spend: ${totalExpense}
- Transactions: ${current?.totalTransactions ?? 0}

Category breakdown:
${JSON.stringify(categoryBreakdown)}

Need vs Want breakdown:
${JSON.stringify(needVsWant)}

Payment mode breakdown:
${JSON.stringify(paymentMode)}

Previous month spend: ${prevExpense}
Comparison:
${JSON.stringify(comparison || {})}

IMPORTANT:
- If total spend is 0, encourage user to start tracking and suggest simple steps.
- Keep it short and very useful.

Return ONLY valid JSON (no markdown, no extra text):
{
  "headline": "string",
  "score": number (0-10),
  "summary": "2-3 lines",
  "highlights": ["3 bullets"],
  "risks": ["2 bullets"],
  "actionPlan": ["3 steps"]
}
`;
};

const extractJsonFromText = (text) => {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new ApiError(500, "Gemini did not return JSON");
  }

  const jsonString = text.slice(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(jsonString);
  } catch {
    throw new ApiError(500, "Gemini returned invalid JSON format");
  }
};

export const generateMonthlyAIReviewService = async ({
  month,
  year,
  reportData,
  userProfile,
}) => {
  try {
    const genAI = getGeminiClient();

    const prompt = buildPrompt({
      month,
      year,
      current: reportData.current,
      previous: reportData.previous,
      comparison: reportData.comparison,
      profile: userProfile,
    });

    const { candidates, createModel } = getGeminiModel(genAI);

    let lastError = null;

    //  Try models one-by-one until one works
    for (const modelName of candidates) {
      try {
        const model = createModel(modelName);

        const result = await model.generateContent(prompt);
        const text = result?.response?.text?.() || "";

        if (!text) {
          throw new ApiError(500, "Gemini response was empty");
        }

        const json = extractJsonFromText(text);

        json.score = safeNumber(json.score);
        if (json.score > 10) json.score = 10;
        if (json.score < 0) json.score = 0;

        json.highlights = Array.isArray(json.highlights) ? json.highlights : [];
        json.risks = Array.isArray(json.risks) ? json.risks : [];
        json.actionPlan = Array.isArray(json.actionPlan) ? json.actionPlan : [];

        return json;
      } catch (err) {
        lastError = err;
        console.log(`❌ Model failed: ${modelName} -> ${err.message}`);
        continue;
      }
    }

    throw new ApiError(
      500,
      lastError?.message || "No supported Gemini model worked for generateContent"
    );
  } catch (error) {
    console.error("❌ Gemini AI review failed:", error.message);
    throw new ApiError(500, error.message || "Failed to generate AI review");
  }
};
