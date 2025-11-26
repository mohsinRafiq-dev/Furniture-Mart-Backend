import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import AdminUser, { IAdminUser } from "../models/AdminUser.js";
import AuditLog from "../models/AuditLog.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { rateLimitMiddleware, clearRateLimit } from "../middleware/rateLimiter.js";
import { validatePasswordStrength } from "../utils/validators.js";
import { OAuth2Client } from "google-auth-library";
import { config } from "../config/index.js";

const router = Router();

/**
 * Helper function to log audit events
 */
const logAuditEvent = async (
  action: string,
  email: string,
  status: "success" | "failed" | "blocked",
  req: Request,
  reason?: string
) => {
  try {
    await AuditLog.create({
      action,
      email,
      ipAddress: req.ip || req.socket.remoteAddress || "unknown",
      userAgent: req.get("user-agent") || "",
      status,
      reason,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("[Audit Log Error]", error);
    // Don't throw - audit logging shouldn't break authentication
  }
};

/**
 * POST /api/auth/login
 * Admin login endpoint - generates JWT tokens
 * Rate limited to 10 requests per 15 minutes
 */
router.post(
  "/login",
  rateLimitMiddleware(15 * 60 * 1000, 10), // 15 minutes, 10 attempts
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
  ],
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await logAuditEvent("login_attempt", req.body.email || "unknown", "failed", req, "Validation failed");
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await AdminUser.findOne({ email }).select("+password");

    if (!admin) {
      await logAuditEvent("login_attempt", email, "failed", req, "User not found");
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check if admin is active
    if (!admin.isActive) {
      await logAuditEvent("login_attempt", email, "blocked", req, "Account inactive");
      res.status(403).json({
        success: false,
        message: "Admin account is inactive",
      });
      return;
    }

    // Check if account is locked
    if (admin.isLocked) {
      if (admin.lockedUntil && admin.lockedUntil > new Date()) {
        const remainingTime = Math.ceil(
          (admin.lockedUntil.getTime() - new Date().getTime()) / 1000 / 60
        );
        await logAuditEvent("login_attempt", email, "blocked", req, `Account locked for ${remainingTime} minutes`);
        res.status(423).json({
          success: false,
          message: `Account is locked. Try again in ${remainingTime} minutes`,
        });
        return;
      }
      // Unlock account if lock period expired
      admin.isLocked = false;
      admin.lockedUntil = null;
      admin.loginAttempts = 0;
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      admin.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (admin.loginAttempts >= 5) {
        admin.isLocked = true;
        admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        await admin.save();
        await logAuditEvent("login_attempt", email, "blocked", req, "Account locked after 5 failed attempts");
        res.status(423).json({
          success: false,
          message: "Too many failed login attempts. Account locked for 15 minutes",
        });
        return;
      }

      await admin.save();
      await logAuditEvent("login_attempt", email, "failed", req, `Invalid password (${5 - admin.loginAttempts} attempts left)`);
      res.status(401).json({
        success: false,
        message: `Invalid email or password. ${5 - admin.loginAttempts} attempts remaining`,
      });
      return;
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lastLogin = new Date();
    await admin.save();

    // Clear rate limit on successful login
    clearRateLimit(req.ip || req.socket.remoteAddress);
    await logAuditEvent("login_success", email, "success", req, "Successful login");

    // Generate tokens
    const accessToken = generateAccessToken(
      (admin._id as any).toString(),
      admin.email,
      admin.role
    );
    const refreshToken = generateRefreshToken(
      (admin._id as any).toString(),
      admin.email,
      admin.role
    );

    // Set refresh token as HTTP-only cookie (secure in production)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  "/refresh",
  [body("refreshToken").isString()],
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      await logAuditEvent("token_refresh", "unknown", "failed", req, "Invalid refresh token");
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    // Verify admin still exists and is active
    const admin = await AdminUser.findById(decoded.adminId);

    if (!admin || !admin.isActive) {
      await logAuditEvent("token_refresh", decoded.email || "unknown", "failed", req, "Admin not found or inactive");
      res.status(403).json({
        success: false,
        message: "Admin account not found or inactive",
      });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(
      (admin._id as any).toString(),
      admin.email,
      admin.role
    );

    await logAuditEvent("token_refresh", admin.email, "success", req, "Token refreshed");

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  })
);

/**
 * POST /api/auth/logout
 * Logout endpoint (invalidates tokens on client side)
 */
router.post("/logout", asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const email = (req as any).email || "unknown";
  await logAuditEvent("logout", email, "success", req, "User logged out");
  
  // Clear refresh token cookie
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}));

/**
 * GET /api/auth/me
 * Get current admin profile (requires auth middleware)
 */
router.get("/me", asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // This route should be protected by auth middleware
  const admin = await AdminUser.findById((req as any).adminId);

  if (!admin) {
    res.status(404).json({
      success: false,
      message: "Admin not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
    },
  });
}));

/**
 * POST /api/auth/google
 * Google OAuth login endpoint
 * Rate limited to prevent abuse
 */
router.post(
  "/google",
  rateLimitMiddleware(15 * 60 * 1000, 10), // 15 minutes, 10 attempts
  [body("token").isString().notEmpty()],
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { token } = req.body;

    try {
      // Verify Google token
      const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        await logAuditEvent("google_oauth", "unknown", "failed", req, "Invalid token");
        res.status(401).json({
          success: false,
          message: "Invalid token",
        });
        return;
      }

      const { email, name, picture } = payload;

      if (!email) {
        await logAuditEvent("google_oauth", "unknown", "failed", req, "Email not available from Google");
        res.status(401).json({
          success: false,
          message: "Email not available from Google account",
        });
        return;
      }

      // Find or create admin user
      let admin = await AdminUser.findOne({ email });

      if (!admin) {
        // Create new admin from Google info
        // Only allow specific emails to register as admins (security measure)
        if (!config.ALLOWED_ADMIN_EMAILS.includes(email)) {
          await logAuditEvent("google_oauth", email, "blocked", req, "Email not in whitelist");
          res.status(403).json({
            success: false,
            message: "Email not authorized to access admin panel",
          });
          return;
        }

        admin = new AdminUser({
          name: name || "Google User",
          email,
          password: "google-oauth-" + Math.random().toString(36), // Random password for OAuth users
          role: "admin",
          isActive: true,
        });

        await admin.save();
        await logAuditEvent("google_oauth", email, "success", req, "New admin created via Google OAuth");
      }

      // Check if admin is active
      if (!admin.isActive) {
        await logAuditEvent("google_oauth", email, "blocked", req, "Account inactive");
        res.status(403).json({
          success: false,
          message: "Admin account is inactive",
        });
        return;
      }

      // Update last login
      admin.lastLogin = new Date();
      admin.loginAttempts = 0;
      await admin.save();

      // Clear rate limit on successful login
      clearRateLimit(req.ip || req.socket.remoteAddress);
      await logAuditEvent("google_oauth", email, "success", req, "Google OAuth login successful");

      // Generate tokens
      const accessToken = generateAccessToken(
        (admin._id as any).toString(),
        admin.email,
        admin.role
      );
      const refreshToken = generateRefreshToken(
        (admin._id as any).toString(),
        admin.email,
        admin.role
      );

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: "Google login successful",
        data: {
          accessToken,
          refreshToken,
          admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
        },
      });
    } catch (error) {
      console.error("[Google OAuth Error]", error);
      await logAuditEvent("google_oauth", "unknown", "failed", req, "Google authentication failed: " + (error as Error).message);
      res.status(401).json({
        success: false,
        message: "Google authentication failed",
      });
    }
  })
);

export default router;
