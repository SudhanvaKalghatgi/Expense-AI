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
You are a friendly personal finance assistant analyzing spending data for a user.

User profile:
- Name: ${profile?.fullName || "User"}
- Type: ${profile?.userType || "individual"}
- Monthly income: $${profile?.monthlyIncome ?? "not provided"}
- Monthly budget: $${profile?.monthlyBudget ?? "not provided"}
- Saving target: $${profile?.savingTarget ?? "not provided"}

Month: ${month}/${year}

Current month spending:
- Total: $${totalExpense}
- Transactions: ${current?.totalTransactions ?? 0}
- Categories: ${JSON.stringify(categoryBreakdown)}
- Needs vs Wants: ${JSON.stringify(needVsWant)}
- Payment methods: ${JSON.stringify(paymentMode)}

Previous month: $${prevExpense}
Change: ${comparison?.changeType || "no_change"}

INSTRUCTIONS:
1. Analyze the spending patterns thoughtfully
2. If spending is $0, encourage the user to start tracking expenses
3. Compare against budget if provided
4. Be supportive and constructive, not judgmental
5. Keep language natural and conversational
6. DO NOT use markdown formatting (no **, __, [], etc.) - just plain text
7. Be specific with numbers and percentages

Return ONLY valid JSON (no markdown wrapper, no extra text):
{
  "headline": "A catchy, encouraging one-line summary (plain text, no formatting)",
  "score": number between 0-10,
  "summary": "2-3 sentence overview with specific numbers and insights",
  "highlights": ["3 positive observations about their spending", "Include specific amounts", "Be encouraging"],
  "risks": ["2 areas of concern or potential issues", "Be specific about the problem"],
  "actionPlan": ["3 concrete, actionable steps", "Be specific and practical", "Include numbers if relevant"]
}

Example good responses:
- "You spent $500 on dining, which is 40% of your budget"
- "Great job staying under budget by $200"
- "Consider reducing entertainment spending by $50 per week"

Example BAD responses (avoid these):
- "**Great job**" (no markdown)
- "You spent too much" (too vague, provide numbers)
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
