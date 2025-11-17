import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3002",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "24h",

  // Database
  DB_URI: process.env.DB_URI || "mongodb://localhost:27017/furniture-mart",

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "combined",

  // Feature Flags
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

export default config;
