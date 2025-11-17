import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import AdminUser, { IAdminUser } from "../models/AdminUser.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

/**
 * POST /api/auth/login
 * Admin login endpoint - generates JWT tokens
 */
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check if admin is active
    if (!admin.isActive) {
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
        res.status(423).json({
          success: false,
          message: "Too many failed login attempts. Account locked for 15 minutes",
        });
        return;
      }

      await admin.save();
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

    // Set refresh token as HTTP-only cookie (optional but recommended)
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
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    // Verify admin still exists and is active
    const admin = await AdminUser.findById(decoded.adminId);

    if (!admin || !admin.isActive) {
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
router.post("/logout", (req: Request, res: Response) => {
  // Clear refresh token cookie
  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

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

export default router;
