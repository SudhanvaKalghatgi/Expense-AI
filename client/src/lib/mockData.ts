// Mock data for the entire application
import { subDays, format } from "date-fns";

export interface MockExpense {
  _id: string;
  amount: number;
  category: string;
  date: string;
  paymentMode: "upi" | "cash" | "card" | "bank";
  essentialType: "need" | "want";
  note?: string;
}

export interface MockRecurring {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "yearly" | "weekly";
  category: string;
  nextDate: string;
  active: boolean;
}

// Generate realistic mock expenses
export const mockExpenses: MockExpense[] = [
  {
    _id: "1",
    amount: 45.00,
    category: "Food & Dining",
    date: format(new Date(), "yyyy-MM-dd"),
    paymentMode: "upi",
    essentialType: "need",
    note: "Lunch at The Garden Cafe"
  },
  {
    _id: "2",
    amount: 12.50,
    category: "Transportation",
    date: format(new Date(), "yyyy-MM-dd"),
    paymentMode: "card",
    essentialType: "need",
    note: "Uber to office"
  },
  {
    _id: "3",
    amount: 89.99,
    category: "Shopping",
    date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    paymentMode: "card",
    essentialType: "want",
    note: "New running shoes"
  },
  {
    _id: "4",
    amount: 15.00,
    category: "Entertainment",
    date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    paymentMode: "upi",
    essentialType: "want",
    note: "Movie tickets"
  },
  {
    _id: "5",
    amount: 125.00,
    category: "Utilities",
    date: format(subDays(new Date(), 2), "yyyy-MM-dd"),
    paymentMode: "bank",
    essentialType: "need",
    note: "Electricity bill"
  },
  {
    _id: "6",
    amount: 32.50,
    category: "Food & Dining",
    date: format(subDays(new Date(), 2), "yyyy-MM-dd"),
    paymentMode: "upi",
    essentialType: "need",
    note: "Grocery shopping"
  },
  {
    _id: "7",
    amount: 8.00,
    category: "Food & Dining",
    date: format(subDays(new Date(), 3), "yyyy-MM-dd"),
    paymentMode: "cash",
    essentialType: "need",
    note: "Morning coffee"
  },
  {
    _id: "8",
    amount: 199.00,
    category: "Shopping",
    date: format(subDays(new Date(), 4), "yyyy-MM-dd"),
    paymentMode: "card",
    essentialType: "want",
    note: "Premium headphones"
  },
  {
    _id: "9",
    amount: 22.00,
    category: "Transportation",
    date: format(subDays(new Date(), 5), "yyyy-MM-dd"),
    paymentMode: "upi",
    essentialType: "need",
    note: "Gas station"
  },
  {
    _id: "10",
    amount: 55.00,
    category: "Health & Fitness",
    date: format(subDays(new Date(), 6), "yyyy-MM-dd"),
    paymentMode: "card",
    essentialType: "need",
    note: "Gym membership"
  },
  {
    _id: "11",
    amount: 18.99,
    category: "Entertainment",
    date: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    paymentMode: "card",
    essentialType: "want",
    note: "Streaming subscription"
  },
  {
    _id: "12",
    amount: 95.00,
    category: "Food & Dining",
    date: format(subDays(new Date(), 8), "yyyy-MM-dd"),
    paymentMode: "card",
    essentialType: "want",
    note: "Dinner with friends"
  },
];

export const mockRecurring: MockRecurring[] = [
  {
    id: "r1",
    name: "Netflix",
    amount: 15.99,
    frequency: "monthly",
    category: "Entertainment",
    nextDate: format(new Date(2026, 2, 1), "yyyy-MM-dd"),
    active: true,
  },
  {
    id: "r2",
    name: "Spotify",
    amount: 9.99,
    frequency: "monthly",
    category: "Entertainment",
    nextDate: format(new Date(2026, 2, 5), "yyyy-MM-dd"),
    active: true,
  },
  {
    id: "r3",
    name: "Gym Membership",
    amount: 55.00,
    frequency: "monthly",
    category: "Health & Fitness",
    nextDate: format(new Date(2026, 2, 10), "yyyy-MM-dd"),
    active: true,
  },
  {
    id: "r4",
    name: "Cloud Storage",
    amount: 2.99,
    frequency: "monthly",
    category: "Technology",
    nextDate: format(new Date(2026, 2, 15), "yyyy-MM-dd"),
    active: true,
  },
  {
    id: "r5",
    name: "Amazon Prime",
    amount: 119.00,
    frequency: "yearly",
    category: "Shopping",
    nextDate: format(new Date(2026, 8, 1), "yyyy-MM-dd"),
    active: true,
  },
];

export const mockProfile = {
  fullName: "John Doe",
  monthlyIncome: 5000,
  budgetGoal: 3500,
  savingTarget: 1500,
};

export const mockInsights = {
  topSpendingCategory: "Food & Dining",
  averageDailySpend: 48.50,
  monthlyTrend: "up",
  savingsRate: 0.30,
  recommendations: [
    "You're spending 25% more on Food & Dining this month",
    "Great job! You're on track to meet your savings goal",
    "Consider setting a budget limit for Entertainment",
    "Your transportation costs are 15% lower than last month",
  ],
  spendingByCategory: [
    { category: "Food & Dining", amount: 456.50, percentage: 38 },
    { category: "Shopping", amount: 284.99, percentage: 24 },
    { category: "Transportation", amount: 147.50, percentage: 12 },
    { category: "Entertainment", amount: 123.99, percentage: 10 },
    { category: "Utilities", amount: 125.00, percentage: 10 },
    { category: "Health & Fitness", amount: 55.00, percentage: 6 },
  ],
};
