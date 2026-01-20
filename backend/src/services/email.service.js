import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";

export const createTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new ApiError(500, "Email service not configured (missing EMAIL_USER/EMAIL_PASS)");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

export const sendMonthlyReportEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });

  return info;
};
