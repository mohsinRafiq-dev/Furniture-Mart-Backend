import dotenv from "dotenv";

dotenv.config();

// Helper function to get allowed CORS origins
const getAllowedOrigins = (): (string | RegExp)[] => {
  // Always include Vercel frontend in production and all local dev URLs
  const frontendUrls: (string | RegExp)[] = [
    // Production - Vercel and custom domains
    "https://ashraf-furnitures.vercel.app",
    "https://furniture-mart-frontend.vercel.app",
    
    // Development - all localhost variations
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
  ];
  
  // In development, allow any localhost port
  if (process.env.NODE_ENV === "development") {
    frontendUrls.push(/^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
  }
  
  return frontendUrls;
};

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  ALLOWED_ORIGINS: getAllowedOrigins(),

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
