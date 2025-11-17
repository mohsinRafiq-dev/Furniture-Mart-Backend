import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { ApiError, AuthPayload } from "../types/index.js";
import { verifyAccessToken, AdminAuthPayload } from "../utils/jwt.js";

/**
 * Extend Express Request to include admin authentication info
 */
declare global {
  namespace Express {
    interface Request {
      adminId?: string;
      email?: string;
      role?: "admin" | "editor" | "viewer";
      user?: AuthPayload;
    }
  }
}

/**
 * Admin Authentication Middleware
 * Verifies JWT token and attaches admin info to request
 */
export const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    // Attach admin info to request
    req.adminId = decoded.adminId;
    req.email = decoded.email;
    req.role = decoded.role;

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * Restricts access based on admin role
 */
export const authorizeRole = (
  ...allowedRoles: ("admin" | "editor" | "viewer")[]
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.role) {
      res.status(403).json({
        success: false,
        message: "Unauthorized: Admin role not found",
      });
      return;
    }

    if (!allowedRoles.includes(req.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Required role(s) ${allowedRoles.join(", ")}. Your role: ${req.role}`,
      });
      return;
    }

    next();
  };
};

/**
 * Admin-Only Middleware
 * Only allows admin role
 */
export const adminOnly = authorizeRole("admin");

/**
 * Editor+ Middleware
 * Allows admin and editor roles
 */
export const editorOrAdmin = authorizeRole("admin", "editor");

/**
 * JWT authentication middleware (legacy)
 * Verifies JWT token from Authorization header
 */
export const authenticate = (
  req: Request & { user?: AuthPayload },
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = jwt.verify(token, config.JWT_SECRET) as AuthPayload;
    req.user = decoded;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
      return;
    }

    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    if (err instanceof ApiError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * Authorization middleware (legacy)
 * Checks if user has required role
 */
export const authorize = (...roles: string[]) => {
  return (
    req: Request & { user?: AuthPayload },
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};
