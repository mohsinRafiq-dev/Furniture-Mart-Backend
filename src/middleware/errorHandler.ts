import { Request, Response, NextFunction } from "express";
import { ApiError } from "../types/index.js";
import { config } from "../config/index.js";

/**
 * Global error handling middleware
 * Catches all errors and returns appropriate responses
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error:", err);

  // Handle custom ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(config.isDevelopment && { details: err.details, stack: err.stack }),
    });
    return;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: "Validation error",
      ...(config.isDevelopment && { error: err.message }),
    });
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      ...(config.isDevelopment && { error: err.message }),
    });
    return;
  }

  // Handle generic errors
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(config.isDevelopment && {
      error: err.message,
      stack: err.stack,
    }),
  });
};

/**
 * Async error handler wrapper for route handlers
 * Catches errors thrown in async functions and passes to error handler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};
