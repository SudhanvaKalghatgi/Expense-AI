# Expense AI — AI-Driven Expense Tracking with Intelligent Insights

A production-grade expense management system with AI-powered monthly analysis, automated recurring expense tracking, and scheduled email reporting — built with a resilient multi-model AI fallback architecture.

**Live Demo:** [expense-ai-two.vercel.app](https://expense-ai-two.vercel.app)  
**Backend:** Hosted on Render | **Frontend:** Hosted on Vercel

---

## Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Gemini API, Nodemailer, Zod, express-rate-limit  
**Frontend:** React.js, Tailwind CSS, Clerk (Authentication)  
**Infrastructure:** Cron jobs

---

## Key Features

- **Authentication** — Secure user auth via Clerk with session management handled on the frontend
- **Expense Tracking** — Categorized expense management with need/want classification and payment mode tracking
- **Recurring Expenses** — Automatic materialization of recurring expenses on schedule without user intervention
- **AI Monthly Review** — Gemini-powered analysis with spending score, highlights, risks, and actionable recommendations
- **Automated Email Reports** — Monthly HTML email summaries delivered automatically to all users on the 1st of each month
- **Developer Tools** — Request logging, rate limiting, and centralized error handling across all endpoints

---

## Architecture

The backend is organized with a clear **separation of concerns** — controllers handle HTTP, services contain business logic, and utilities handle cross-cutting concerns like error handling and response formatting. All async route handlers are wrapped in a single-line `asyncHandler` utility that forwards errors to the centralized error middleware, eliminating repetitive try-catch blocks.

### AI Fallback Chain

External AI APIs are unreliable by nature — quota limits, temporary outages, and model deprecations are real production concerns. Rather than failing when the primary model is unavailable, Expense AI implements a **model fallback chain** across three Gemini model versions:

```
gemini-2.5-flash  →  gemini-2.0-flash  →  gemini-flash-latest
```

If one model fails, the system automatically retries with the next. If all fail, a clean error is propagated. This keeps the AI review feature running even during partial outages.

### Recurring Expense Engine

Users register recurring expenses with a frequency and `nextExecutionDate`. A cron job runs daily at midnight, queries all due recurring records, creates real expense documents from them, and advances the `nextExecutionDate` forward. Deterministic — no guessing, just reliable scheduled execution.

### Monthly Email Pipeline

```
Cron (1st of month)  →  Fetch all users  →  MongoDB aggregation  →  Gemini AI review  →  HTML email  →  Nodemailer delivery
```

---

## Folder Structure

```
src/
├── config/              # DB connection, environment config
├── controllers/         # ai, expense, profile, recurring, report
├── jobs/
│   ├── monthlyEmail.job.js
│   └── recurringExpense.job.js
├── middlewares/         # auth, error, rateLimit, requestLogger, validate
├── models/              # expense, recurring, user
├── routes/v1/           # Versioned route definitions
├── services/            # ai, email, expense, profile, recurring, report
├── utils/               # ApiError, ApiResponse, asyncHandler
└── validations/         # Zod schemas per domain
```

---

## API Overview

| Domain | Endpoints |
|--------|-----------|
| Expenses | CRUD + archive/unarchive |
| Recurring | CRUD + manual trigger |
| Reports | Monthly summary + AI review |
| Profile | GET + PATCH |
| AI | Generate monthly review |

20+ REST endpoints with rate limiting (100 req / 15 min per IP).

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance
- Gemini API key
- Clerk account (for frontend auth)

### Backend Setup

```bash
git clone https://github.com/SudhanvaKalghatgi/Expense-AI.git
cd Expense-AI/backend
npm install
```

Create a `.env` file in the backend root:

```env
PORT=3000
MONGO_URI=your_mongoDB_url
NODE_ENV=development
EMAIL_USER=your_email_id
EMAIL_PASS=your_email_password
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend root:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=https://expenseai-gagc.onrender.com/api/v1
```

```bash
npm run dev
```

---

## Author

**Sudhanva Kalghatgi**  
[LinkedIn](https://linkedin.com/in/sudhanvak4680) | [GitHub](https://github.com/SudhanvaKalghatgi)
