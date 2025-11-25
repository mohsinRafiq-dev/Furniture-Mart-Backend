import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "24h",

  // Database
  DB_URI: process.env.DB_URI || "mongodb://localhost:27017/furniture-mart",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",

  // Allowed Admin Emails (comma-separated)
  ALLOWED_ADMIN_EMAILS: (process.env.ALLOWED_ADMIN_EMAILS || "admin@furniture-mart.com,editor@furniture-mart.com").split(",").map(email => email.trim()),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "combined",

  // Feature Flags
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

export default config;
