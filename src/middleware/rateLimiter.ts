import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: { attempts: number; resetTime: number };
}

// In-memory store for rate limiting (use Redis in production)
const loginAttempts: RateLimitStore = {};

/**
 * Rate limiting middleware for login endpoints
 * Limits: 10 requests per 15 minutes per IP
 */
export const rateLimitMiddleware = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 10
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    // Clean up old entries
    if (loginAttempts[ip] && loginAttempts[ip].resetTime < now) {
      delete loginAttempts[ip];
    }

    // Initialize if first request
    if (!loginAttempts[ip]) {
      loginAttempts[ip] = {
        attempts: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Increment attempt counter
    loginAttempts[ip].attempts += 1;

    // Check if exceeded limit
    if (loginAttempts[ip].attempts > maxRequests) {
      const remainingTime = Math.ceil(
        (loginAttempts[ip].resetTime - now) / 1000 / 60
      );
      res.status(429).json({
        success: false,
        message: `Too many login attempts. Please try again in ${remainingTime} minutes`,
      });
      return;
    }

    next();
  };
};

/**
 * Clear rate limit for IP (call on successful login)
 */
export const clearRateLimit = (ip: string | undefined) => {
  if (ip && loginAttempts[ip]) {
    delete loginAttempts[ip];
  }
};
